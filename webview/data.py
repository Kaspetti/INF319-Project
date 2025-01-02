import math
from typing import Literal, NamedTuple, TypedDict
from dataclasses import dataclass
import cProfile

from numpy._typing import NDArray

from coords import Coord3D, CoordGeo
from line_reader import Line, get_all_lines_in_ens

import numpy as np
from scipy.spatial.distance import cdist
from alive_progress import alive_it # type: ignore
import networkx as nx

from multiscale import IcoPoint, multiscale


@dataclass(frozen=True)
class Connection:
    source: str
    target: str
    weight: float


class TypedConnection(TypedDict):
    source: str
    target: str
    weight: float


class Node(TypedDict):
    id: str


class Network(TypedDict):
    nodes: list[Node]
    clusters: dict[int, list[TypedConnection]]
    node_clusters: dict[str, int]


EARTH_RADIUS = 6371


def to_xyz(v: list[float]):
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


def distance(c1: Coord3D, c2: Coord3D):
    return math.sqrt(
        math.pow(c1.x - c2.x, 2) +
        math.pow(c1.y - c2.y, 2) +
        math.pow(c1.z - c2.z, 2)
    )


def nearby_check(coords1: list[Coord3D], coords2: list[Coord3D], max_dist: float) -> bool:
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


def get_distances(line: Line, lines: list[Line], max_dist: float) -> NDArray[np.float32]:
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
    dists: list[list[float]] = []

    for line2 in lines:
        coords2: list[Coord3D] = []
        for coord in line2.coords:
            coords2.append(coord.to_3D())

        if not nearby_check(coords, coords2, max_dist * 3):
            dists.append([])
            continue

        coords_ndarray = np.array([coord.to_ndarray() for coord in coords])
        coords2_ndarray = np.array([coord.to_ndarray() for coord in coords2])

        dists.append(np.min(cdist(coords_ndarray, coords2_ndarray), axis=1))

    return np.array(dists)

    # ico_points_ms = {}
    # subdivided_edges: dict[tuple[int, int], int] = {}
    # line_points_ms: dict[str, dict[int, dict[int, tuple[int, float]]]] = {}

def get_close_lines(
        line: Line,
        lines: list[Line],
        ico_points_ms: dict[int, IcoPoint],
        line_points_ms: dict[str, dict[int, dict[int, tuple[int, float]]]],
        threshold: float | int
) -> list[Line]:
    line_coords_ms_0_idx = line_points_ms[line.id][0]
    line_coords_ms_0 = [line.coords[coord[0]].to_3D().to_ndarray() for coord in line_coords_ms_0_idx.values()]

    close_lines: list[Line] = []

    for line_2 in lines:
        if line_2.id == line.id:
            continue

        line_2_coords_ms_0_idx = line_points_ms[line_2.id][0]
        line_2_coords_ms_0 = [line_2.coords[coord[0]].to_3D().to_ndarray() for coord in line_2_coords_ms_0_idx.values()]
        dists = np.min(cdist(line_coords_ms_0, line_2_coords_ms_0), axis=1) * EARTH_RADIUS
        
        if np.any(dists < threshold):
            close_lines.append(line_2)

    return close_lines


def get_centroids(lines: list[Line]) -> list[CoordGeo]:
    return [line.centroid for line in lines]


def generate_network(
        lines: list[Line],
        ico_points_ms: dict[int, IcoPoint],
        line_points_ms: dict[str, dict[int, dict[int, tuple[int, float]]]],
        max_dist: int,
        required_ratio: float,
) -> Network:
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

    connections: set[Connection] = set()

    bar = alive_it(lines, title="Generating network")
    for line in bar:

        close_lines = get_close_lines(line, lines, ico_points_ms, line_points_ms, max_dist * 10)
        dists = get_distances(line, close_lines, max_dist)

        ratios: list[float] = []
        for dist in dists:
            ratios.append(np.sum(dist <= max_dist / EARTH_RADIUS) / len(dist))

        # NODES WITH NO CONNECTIONS ARENT ADDED
        for i, ratio in enumerate(ratios):
            if ratio < required_ratio:
                continue

            connections.add(Connection(source=line.id,
                                       target=close_lines[i].id,
                                       weight=ratio))

    clusters: dict[int, list[TypedConnection]] = {}
    node_to_cluster: dict[str, int] = {}

    G: nx.Graph[str] = nx.Graph()
    for conn in connections:
        G.add_edge(conn.source, conn.target, weight=conn.weight)    # type: ignore

    # communities = list(nx.connected_components(G))   # type: ignore
    # Attempts the same cluster ids for each run
    communities = sorted(nx.connected_components(G), key=lambda x: min(x), reverse=True)

    for i, cluster in enumerate(communities):   # type: ignore
        sub_graph = G.subgraph(cluster)
        clusters[i] = []

        added_ens_members = {}
        for edge in sub_graph.edges(data=True):
            ens_id0, line_id0 = edge[0].split("|")
            ens_id1, line_id1 = edge[1].split("|")
            if (ens_id0 not in added_ens_members or added_ens_members[ens_id0] == line_id0) and (ens_id1 not in added_ens_members or added_ens_members[ens_id1] == line_id1):
                clusters[i].append(TypedConnection(source=edge[0], target=edge[1], weight=edge[2]["weight"]))
                added_ens_members[ens_id0] = line_id0
                added_ens_members[ens_id1] = line_id1

        # clusters[i] = [TypedConnection(source=edge[0], target=edge[1], weight=edge[2]["weight"]) for edge in sub_graph.edges(data=True)]
        for node in cluster:
            ens_id, line_id = node.split("|")
            if ens_id in added_ens_members and added_ens_members[ens_id] == line_id:
                node_to_cluster[node] = i
            else:
                node_to_cluster[node] = -1

    nodes: list[Node] = []
    for line in lines:
        if line.id not in node_to_cluster:
            node_to_cluster[line.id] = -1
        nodes.append({"id": line.id})

    return {"nodes": nodes, "clusters": clusters, "node_clusters": node_to_cluster}


if __name__ == "__main__":
    lines = get_all_lines_in_ens("2024101900", 0, "jet")
    ico_points_ms, line_points_ms = multiscale(lines, 2)
    # generate_network(lines, ico_points_ms, line_points_ms, 50, 0.05)
    cProfile.run("generate_network(lines, ico_points_ms, line_points_ms, 50, 0.05)")
