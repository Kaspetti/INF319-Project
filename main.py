from typing import List, Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from data import generate_network
from line_reader import get_all_lines
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
                dist_threshold: int = 50):

    lines = get_all_lines(sim_start, time_offset, "jet")
    ico_points_ms, line_points_ms = multiscale(lines, 2)
    network = generate_network(lines, ico_points_ms, line_points_ms, dist_threshold)

    return network


@app.get("/get-coords")
def get_coords(sim_start: str = "2024101900",
               time_offset: int = 0):

    lines = get_all_lines(sim_start, time_offset, "jet")

    return lines
