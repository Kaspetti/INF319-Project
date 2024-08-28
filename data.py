import xarray as xr
import numpy as np
import matplotlib.pyplot as plt


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
            "id": id,
            "coords": np.column_stack(
                (line.latitude.values, line.longitude.values)
            )
        })

    return lines


def generate_network(centers, max_dist):
    '''
    Generates a network given a list of centers and a max distance
    required for two nodes to be linked

    Parameters
    ----------
    centers : a list of the centers to be individual nodes
    max_dist : the maximum distance for two nodes to be linked

    Returns
    -------
    [{ nodes, links }] : A list of nodes and links representing the network
    '''

    centers = np.array(centers)

    nodes = []
    links = []

    for i in range(len(centers)):
        nodes.append({"id": i})
        for j in range(i+1, len(centers)):
            dist = np.sum((centers[i] - centers[j])**2)
            if dist > max_dist:
                continue

            links.append({"source": i, "target": j, "dist_sqrd": float(dist)})

    return {"nodes": nodes, "links": links}


if __name__ == "__main__":
    lines = read_data("2024082712", 0, 0)
    centers = np.array([get_geometric_center(line["coords"]) for line in lines])

    print(generate_network(centers, 1000))