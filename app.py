import sys
import json
import os

from line_reader import Line, get_all_lines
from multiscale import multiscale
from data import generate_network, Network
from tracking import create_clustermap

import webview
from filelock import BaseFileLock, FileLock


class Api:
    lines_at_time: dict[int, list[Line]]

    # The key in this dictionary is a combination of the settings for the network
    # sim_start+time_offset+dist_threshold_required_ratio
    # eg. "2024101900+00+50+0.05" = "202410190000500.05"
    loaded_networks: dict[str, Network]

    network_lock: BaseFileLock

    def __init__(self, lines_at_time: dict[int, list[Line]]):
        self.lines_at_time = lines_at_time

        if not os.path.exists("networks.json"):
            self.loaded_networks = {}
        else:
            with open("networks.json", "r") as f:
                self.loaded_networks = json.load(f)

        self.network_lock = FileLock("networks.json.lock")

    def get_networks(self, sim_start: str, time_offset: int, dist_threshold: int, required_ratio: float) -> Network:
        key = sim_start + str(time_offset) + str(dist_threshold) + str(required_ratio)
        if key in self.loaded_networks:
            return self.loaded_networks[key]

        lines = self.lines_at_time[time_offset]

        ico_points_ms, line_points_ms = multiscale(lines, 0)
        network = generate_network(lines, ico_points_ms, line_points_ms, dist_threshold, required_ratio)

        self.loaded_networks[key] = network

        with self.network_lock:
            with open("networks.json", "w+") as f:
                json.dump(self.loaded_networks, f)

        return network

    def get_lines(self, sim_start: str, time_offset: int):
        lines = self.lines_at_time[time_offset]
        lines_dict = [line.to_dict() for line in lines]

        return lines_dict

    def get_contingency_table(self, sim_start: str, time_offset: int):
        contingency = create_clustermap(sim_start, time_offset, "jet")
        return contingency


if __name__ == '__main__':
    print("Getting lines")
    lines_at_time = get_all_lines("2024101900", "jet")

    api = Api(lines_at_time)
    _ = webview.create_window('INF319', 'assets/index.html', js_api=api, min_size=(1280, 720))

    debug = False
    if "debug" in sys.argv:
        debug = True

    webview.start(debug=debug)
