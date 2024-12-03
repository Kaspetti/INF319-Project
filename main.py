from typing import List, Dict, Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from data import generate_network, get_centroids
from line_reader import get_all_lines_at_time, get_all_lines_in_ens
from multiscale import multiscale


app = FastAPI()

origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Node(BaseModel):
    id: str


class Link(BaseModel):
    source: str
    target: str
    weight: float


class Network(BaseModel):
    nodes: List[Node]
    clusters: Dict[int, List[Link]]
    node_clusters: Dict[str, int]


@app.get("/get-networks", response_model=Network)
def get_network(sim_start: str = "2024101900",
                time_offset: int = 0,
                ens_id: int = 0,
                dist_threshold: int = 50,
                required_ratio: float = 0.05,
                line_type: Literal["jet", "mta"] = "jet",
                all_or_one: Literal["all", "one"] = "all"):

    if all_or_one == "one":
        lines = get_all_lines_in_ens(sim_start, ens_id, line_type)
    else:
        lines = get_all_lines_at_time(sim_start, time_offset, line_type)

    ico_points_ms, line_points_ms = multiscale(lines, 0)
    network = generate_network(lines, ico_points_ms, line_points_ms, dist_threshold, required_ratio)

    return network


@app.get("/get-coords")
def get_coords(sim_start: str = "2024101900",
               time_offset: int = 0,
               ens_id: int = 0,
               line_type: Literal["jet", "mta"] = "jet",
               all_or_one: Literal["all", "one"] = "all"):

    if all_or_one == "one":
        lines = get_all_lines_in_ens(sim_start, ens_id, line_type)
    else:
        lines = get_all_lines_at_time(sim_start, time_offset, line_type)

    return lines


@app.get("/get-centroids")
def get_line_centroids(sim_start: str = "2024101900",
               time_offset: int = 0,
               ens_id: int = 0,
               line_type: Literal["jet", "mta"] = "jet",
               all_or_one: Literal["all", "one"] = "all"):

    if all_or_one == "one":
        lines = get_all_lines_in_ens(sim_start, ens_id, line_type)
    else:
        lines = get_all_lines_at_time(sim_start, time_offset, line_type)

    return get_centroids(lines)

