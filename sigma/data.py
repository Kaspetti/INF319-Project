import xarray as xr
import numpy as np
from scipy.spatial.distance import cdist
import math


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


# TODO: Change to 3D coordinates
def get_distances(line, lines):
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

    coords = [to_xyz(coord) for coord in line["coords"]]

    dists = [
        np.min(cdist(coords, [to_xyz(coord) for coord in line2["coords"]]), axis=1)
    for line2 in lines
            ]

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


def generate_network(lines, max_dist):
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

    nodes = []
    links = []

    for i, line in enumerate(lines):
        nodes.append({"id": line["id"]})
        dists = get_distances(line, lines)

        ratios = [np.sum(dist <= max_dist) / len(dist) for dist in dists]

        for j, ratio in enumerate(ratios):
            if i == j or ratio == 0:
                continue

            links.append({
                "source": line["id"],
                "target": lines[j]["id"],
                "weight": ratio
            })

    return {"nodes": nodes, "links": links}


if __name__ == "__main__":
    lines = []
    for i in range(50):
        lines += read_data("2024082712", i, 0)

    # centers = []
    # for line in lines:
    #     centers.append({
    #         "id": f"{line['sim_id']}|{int(line['line_id'])}",
    #         "center": get_geometric_center(line["coords"])
    #     })

    generate_network(lines, 5)
