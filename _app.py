import json
import os
from typing import Literal

from filelock import BaseFileLock, FileLock
import pandas as pd
from pandas.compat import sys
from pydantic import BaseModel
import webview

from data import Network, generate_network
from line_reader import get_all_lines_at_time
from multiscale import multiscale
from tracking import create_clustermap


SETTINGS_PATH = "settings.json"

NETWORKS_PATH = "internal_data/networks.json"
CONTINGENCY_PATH = "internal_data/contingency.json"
TRACKINGS_PATH = "internal_data/tracking.json"


class Settings(BaseModel):
    simStart:       str                     = "2024101900"
    distThreshold:  int                     = 50
    requiredRatio:  float                   = 0.05
    lineType:       Literal["jet", "mta"]   = "jet"


class Api:
    networks: dict[str, Network]
    contingency_tables: dict[str, pd.DataFrame]
    trackings: dict[str, list[tuple[str, str]]]

    settings: Settings

    lines_lock: BaseFileLock

    def __init__(self, networks: dict[str, Network], contingency_tables: dict[str, pd.DataFrame], trackings: dict[str, list[tuple[str, str]]], settings: Settings):
        self.networks = networks
        self.contingency_tables = contingency_tables
        self.trackings = trackings
        self.settings = settings

        self.lines_lock = FileLock("lines.json.lock")

    def get_network(self, sim_start: str, time_offset: int, dist_threshold: int, required_ratio: float, line_type: Literal["mta", "jet"]) -> Network:
        key = sim_start + str(time_offset) + str(dist_threshold) + str(required_ratio) + line_type
        return self.networks[key]

    def get_lines(self, sim_start: str, time_offset: int, line_type: Literal["jet", "mta"]):
        with self.lines_lock:
            lines = get_all_lines_at_time(sim_start, time_offset, line_type)
        lines_dict = [line.to_dict() for line in lines]
        return lines_dict

    def get_contingency_table(self, sim_start: str, time_offset: int, dist_threshold: int, required_ratio: float, line_type: Literal["jet", "mta"]):
        key = sim_start + str(time_offset) + str(dist_threshold) + str(required_ratio) + line_type
        return contingency_tables[key].to_numpy().tolist()

    def get_settings(self):
        return self.settings.model_dump()


def init_files():
    if not os.path.exists(SETTINGS_PATH):
        with open(SETTINGS_PATH, "w+") as f:
            json.dump(Settings().model_dump(), f)
        print("Generated settings file...")
    
    if not os.path.exists(NETWORKS_PATH):
        with open(NETWORKS_PATH, "w+") as f:
            json.dump({}, f)
        print("Generated networks file...")

    if not os.path.exists(CONTINGENCY_PATH):
        with open(CONTINGENCY_PATH, "w+") as f:
            json.dump({}, f)
        print("Generated contingency table file...")

    if not os.path.exists(TRACKINGS_PATH):
        with open(TRACKINGS_PATH, "w+") as f:
            json.dump({}, f)
        print("Generated tracking file...")


def load_settings() -> Settings:
    """loads the settings from the json file in SETTINGS_PATH

    Returns
    -------
    s : The Settings object for the project
    """

    with open(SETTINGS_PATH, "r") as f:
        settings: dict[str, str | float | float | Literal["jet", "mta"]] = json.load(f)
        return Settings.model_validate(settings)


def save_network(network: Network, settings: Settings, timestep: int):
    key = settings.simStart + str(timestep) + str(settings.distThreshold) + str(settings.requiredRatio) + settings.lineType

    with open(NETWORKS_PATH, "r+") as f:
        content: dict[str, Network] = json.load(f)
        content[key] = network
        _ = f.seek(0)
        json.dump(content, f)
        _ = f.truncate()


def load_networks() -> dict[str, Network]:
    with open(NETWORKS_PATH, "r") as f:
        networks: dict[str, Network] = json.load(f)
        return networks


def save_contingency_table(contingency_table: pd.DataFrame, settings: Settings, timestep: int):
    key = settings.simStart + str(timestep) + str(settings.distThreshold) + str(settings.requiredRatio) + settings.lineType

    with open(CONTINGENCY_PATH, "r+") as f:
        content: dict[str, str] = json.load(f)
        content[key] = contingency_table.to_json()
        _ = f.seek(0)
        json.dump(content, f)
        _ = f.truncate()


def load_contingency_tables() -> dict[str, pd.DataFrame]:
    with open(CONTINGENCY_PATH, "r") as f:
        content_raw: dict[str, str] = json.load(f)
        content = {key: pd.read_json(value) for key, value in content_raw.items()}
        return content


def save_tracking(tracking: list[tuple[str, str]], settings: Settings, timestep: int):
    key = settings.simStart + str(timestep) + str(settings.distThreshold) + str(settings.requiredRatio) + settings.lineType

    with open(TRACKINGS_PATH, "r+") as f:
        content: dict[str, list[tuple[str, str]]] = json.load(f)
        content[key] = tracking
        _ = f.seek(0)
        json.dump(content, f)
        _ = f.truncate()


def load_tracking() -> dict[str, list[tuple[str, str]]]:
    with open(TRACKINGS_PATH, "r") as f:
        content: dict[str, list[tuple[str, str]]] = json.load(f)
        return content


def get_timestep_data(settings: Settings, networks: dict[str, Network], contingency_tables: dict[str, pd.DataFrame], trackings: dict[str, list[tuple[str, str]]], t0: int): 
    """Gets all the data for the current and next timestep

    Parameters
    ----------
    settings : The Settings object for the project
    t0 : the starting timestep to get from and next
    """

    t1 = t0 + (3 if t0 < 72 else 6)

    lines_t0 = get_all_lines_at_time(settings.simStart, t0, settings.lineType)
    lines_t1 = get_all_lines_at_time(settings.simStart, t1, settings.lineType)

    network_t0: Network
    network_key_t0 = settings.simStart + str(t0) + str(settings.distThreshold) + str(settings.requiredRatio) + settings.lineType
    if not network_key_t0 in networks:
        ico_points_t0, line_points_t0 = multiscale(lines_t0, 2)
        network_t0 = generate_network(lines_t0, ico_points_t0, line_points_t0, settings.distThreshold, settings.requiredRatio)
    else:
        network_t0 = networks[network_key_t0]

    network_t1: Network
    network_key_t1 = settings.simStart + str(t1) + str(settings.distThreshold) + str(settings.requiredRatio) + settings.lineType
    if not network_key_t1 in networks:
        ico_points_t1, line_points_t1 = multiscale(lines_t1, 2)

        network_t1 = generate_network(lines_t1, ico_points_t1, line_points_t1, settings.distThreshold, settings.requiredRatio)
    else:
        network_t1 = networks[network_key_t1]


    contingency_table: pd.DataFrame
    tracking: list[tuple[str, str]]
    if not network_key_t0 in contingency_tables or not network_key_t0 in trackings:
        contingency_table, tracking = create_clustermap(lines_t0, lines_t1, network_t0, network_t1)
    else:
        contingency_table = contingency_tables[network_key_t0]
        tracking = tracking = trackings[network_key_t0]


    # for t0_id, t1_id in tracking:
    #     network_t1["node_clusters"][t1_id] = network_t0["node_clusters"][t0_id]
    
    save_network(network_t0, settings, t0)
    save_network(network_t1, settings, t1)
    save_contingency_table(contingency_table, settings, t0)
    save_tracking(tracking, settings, t0)



if __name__ == "__main__":
    init_files()
    settings = load_settings()

    networks = load_networks()
    contingency_tables = load_contingency_tables()
    trackings = load_tracking()
    get_timestep_data(settings, networks, contingency_tables, trackings, 0)

    api = Api(networks, contingency_tables, trackings, settings)
    _ = webview.create_window('INF319', 'assets/index.html', js_api=api, min_size=(1280, 720))

    debug = False
    if "debug" in sys.argv:
        debug = True

    webview.start(debug=debug)
