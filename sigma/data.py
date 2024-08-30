import xarray as xr
import numpy as np
from scipy.spatial.distance import cdist


def get_geometric_center(cs):
    '''
    Gets the geometric center of the line

    Parameters
    ----------
    cs : the coordinates making up the line [[lat, lon]...]

    Returns
    -------
    [lat, lon] : the geometric center of the line
    '''

    return [np.sum(cs[:, 0]) / len(cs), np.sum(cs[:, 1]) / len(cs)]


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

    # coords = [line["coords"] for line in lines]
    temp_dists = [
        cdist(lines[0]["coords"], line["coords"])
        for line in lines
            ]
    print(temp_dists[0:2])
    raise Exception()
    # coord = line["coords"][0]
    #
    # print(coords[0])


    dists = []
    for line2 in lines:
        dist = 0
        for coord in line["coords"]:
            dist += np.min(np.sum((coord - line2["coords"])**2, axis=1))

        dists.append(dist / len(line["coords"]))

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
        for j, dist in enumerate(dists):
            if i == j or dist > max_dist:
                continue

            links.append({
                "source": line["id"],
                "target": lines[j]["id"],
                "dist_sqrd": dist
            })

    # for i in range(len(centers)):
    #     nodes.append({"id": centers[i]["id"]})
    #     for j in range(i+1, len(centers)):
    #         dist = np.sum((coords[i] - coords[j])**2)
    #         if dist > max_dist:
    #             continue
    #
    #         links.append({"source": centers[i]["id"], "target": centers[j]["id"], "dist_sqrd": float(dist)})

    return {"nodes": nodes, "links": links}


if __name__ == "__main__":
    lines = []
    for i in range(50):
        lines += read_data("2024082712", i, 0)

    get_distances(lines[0], lines)

    # centers = []
    # for line in lines:
    #     centers.append({
    #         "id": f"{line['sim_id']}|{int(line['line_id'])}",
    #         "center": get_geometric_center(line["coords"])
    #     })

    # print(generate_network(lines, 500))
