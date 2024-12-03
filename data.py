import math
from typing import List

from coords import Coord3D, CoordGeo
from line_reader import get_all_lines_at_time, Line, get_all_lines_in_ens
from multiscale import multiscale

import xarray as xr
import numpy as np
from scipy.spatial.distance import cdist
from alive_progress import alive_it


EARTH_RADIUS = 6371


def to_xyz(v):
    '''
    Converts a [lat, lon] coordinate into 3D coordinates ([x, y ,z]) on the
    unit sphere

    Parameters
    ----------
    v : the [lat, lon] coordinate to convert

    Returns
    -------
    [x, y, z] : the coordinate represented as [x, y, z] coordinates
    on the unit sphere
    '''

    x = math.cos(math.radians(v[0])) * math.cos(math.radians(v[1]))
    y = math.cos(math.radians(v[0])) * math.sin(math.radians(v[1]))
    z = math.sin(math.radians(v[0]))

    return [x, y, z]


def distance(c1, c2):
    return math.sqrt(
        math.pow(c1.x - c2.x, 2) +
        math.pow(c1.y - c2.y, 2) +
        math.pow(c1.z - c2.z, 2)
    )


def nearby_check(coords1, coords2, max_dist):
    c1_start = coords1[0]
    c2_start = coords2[0]
    if distance(c1_start, c2_start) <= max_dist:
        return True

    c1_mid = coords1[len(coords1) // 2]
    c2_mid = coords2[len(coords2) // 2]
    if distance(c1_mid, c2_mid) <= max_dist:
        return True

    c1_end = coords1[-1]
    c2_end = coords2[-1]
    return distance(c1_end, c2_end) <= max_dist


def get_distances(line, lines, max_dist):
    '''
    Gets the distances from one line to all other lines.
    Distance is calculated by calculating the distance of each
    point in the line with the closest point in another line,
    summing these up, and taking the average.

    Parameters
    ----------
    line : the line to calculate from
    lines : all lines (including "line")

    Returns
    -------
    a list of distances between one line and all others
    '''

    coords = [coord.to_3D() for coord in line.coords]

    dists = []
    for line2 in lines:
        coords2 = []
        for coord in line2.coords:
            coords2.append(coord.to_3D())

        if not nearby_check(coords, coords2, max_dist * 3):
            dists.append([])
            continue

        coords_ndarray = np.array([coord.to_ndarray() for coord in coords])
        coords2_ndarray = np.array([coord.to_ndarray() for coord in coords2])

        dists.append(np.min(cdist(coords_ndarray, coords2_ndarray), axis=1))

    return dists


def read_data(start, sim_id, time_offset):
    '''
    Reads a NetCDF file and extracts the lines from it as a list
    of objects with id and coordinates of the lines

    Parameters
    ----------
    start : when the simulation was run (YYYYMMDDHH)
    sim_id : the id of the simulation (0-49)
    time_offset : time offset in hours from when the simulation started

    Returns
    -------
    [{ "id" : id, "coords": [lat, lon] }...] : a list of lines with
    id and coords for points
    '''

    start_time = np.datetime64(f"{start[0:4]}-{start[4:6]}-{start[6:8]}T{start[8:10]}:00:00")

    ds = xr.open_dataset(
            f"{start}/ec.ens_{sim_id:02d}.{start}.sfc.mta.nc"
        )
    date_ds = ds.where(
                ds.date == start_time + np.timedelta64(time_offset, "h"),
                drop=True
            )

    lines = []
    grouped_ds = list(date_ds.groupby("line_id"))
    for id, line in grouped_ds:
        lines.append({
            "id": f"{sim_id}|{int(id)}",
            "coords": np.column_stack(
                (line.latitude.values, line.longitude.values)
            )
        })

    return lines


def get_close_lines(line: Line, lines: List[Line], ico_points_ms, line_points_ms, threshold: float | int) -> List[Line]:
    line_coords_ms_0_idx = line_points_ms[line.id][0]
    line_coords_ms_0 = [line.coords[coord[0]].to_3D().to_ndarray() for coord in line_coords_ms_0_idx.values()]

    close_lines = []

    for line_2 in lines:
        if line_2.id == line.id:
            continue

        line_2_coords_ms_0_idx = line_points_ms[line_2.id][0]
        line_2_coords_ms_0 = [line_2.coords[coord[0]].to_3D().to_ndarray() for coord in line_2_coords_ms_0_idx.values()]
        dists = np.min(cdist(line_coords_ms_0, line_2_coords_ms_0), axis=1) * EARTH_RADIUS
        
        if np.any(dists < threshold):
            close_lines.append(line_2)

    return close_lines


def get_centroids(lines: List[Line]) -> List[CoordGeo]:
    return [line.centroid for line in lines]


def generate_network(lines: List[Line], ico_points_ms, line_points_ms, max_dist: int, required_ratio: float):
    '''
    Generates a network given a list of lines and a max distance
    required for two lines to be linked

    Parameters
    ----------
    lines : a list of the lines to be individual nodes
    max_dist : the maximum distance for two nodes to be linked

    Returns
    -------
    [{ nodes, links }] : A list of nodes and links representing the network
    '''

    cluster_amount = 0
    clusters = {}
    node_to_cluster = {}

    bar = alive_it(lines, title="Generating network")
    for line in bar:

        close_lines = get_close_lines(line, lines, ico_points_ms, line_points_ms, max_dist * 10)
        dists = get_distances(line, close_lines, max_dist)

        ratios = []
        for dist in dists:
            ratios.append(np.sum(dist <= max_dist / EARTH_RADIUS) / len(dist))

        for i, ratio in enumerate(ratios):
            if ratio < required_ratio:
                continue

            close_line = close_lines[i]
            cluster = -1
            if line.id in node_to_cluster:
                cluster = node_to_cluster[line.id]
                node_to_cluster[close_line.id] = cluster
            elif close_line.id in node_to_cluster:
                cluster = node_to_cluster[close_line.id]
                node_to_cluster[line.id] = cluster
            else:
                cluster = cluster_amount
                node_to_cluster[line.id] = cluster
                node_to_cluster[close_line.id] = cluster
                clusters[cluster] = []
                cluster_amount += 1

            clusters[cluster].append({"source": line.id, "target": close_line.id, "weight": ratio})

    nodes = [{"id": line.id} for line in lines]
    return {"nodes": nodes, "clusters": clusters, "node_clusters": node_to_cluster}


if __name__ == "__main__":
    lines = get_all_lines_in_ens("2024101900", 0, "jet")
    print(get_centroids(lines))
