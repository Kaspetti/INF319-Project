from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from data import read_data, generate_network


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
    dist_sqrd: float


class Network(BaseModel):
    nodes: list[Node]
    links: list[Link]


@app.get("/get-networks", response_model=Network)
def get_network(sim_start: str = "2024082712",
                time_offset: int = 0,
                dist_threshold: int = 500):
    lines = []
    for i in range(50):
        lines += read_data(sim_start, i, time_offset)

    return generate_network(lines, dist_threshold)


@app.get("/get-coords")
def get_coords(sim_start: str = "2024082712",
               time_offset: int = 0):
    lines = []
    for i in range(50):
        ls = read_data(sim_start, i, time_offset)
        for i in range(len(ls)):
            ls[i]["coords"] = [{"lat": coord[0], "lon": coord[1]}
                               for coord in ls[i]["coords"]]

        lines.extend(ls)

    return lines
