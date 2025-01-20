import sys
import json
import os
from typing import Literal

from line_reader import Line, get_all_lines
from multiscale import multiscale
from data import generate_network, Network
from tracking import create_clustermap

import webview
from filelock import BaseFileLock, FileLock


class Api:
    # The key in this dictionary is a combination of the parameters for the lines 
    loaded_lines: dict[str, dict[int, list[Line]]]

    # The key in this dictionary is a combination of the parameters for the network
    # sim_start+time_offset+dist_threshold_required_ratio
    # eg. "2024101900+00+50+0.05" = "202410190000500.05"
    loaded_networks: dict[str, Network]

    network_lock: BaseFileLock
    lines_lock: BaseFileLock

    def __init__(self):
        """Initializes the api

        Reads the networks and lines that have been saved locally on the machine and
        initializes the loaded_networks and loaded_lines objects. Also initializes
        the locks needed in order for the files to not be accessed at the same time by 
        different threads.
        """

        if not os.path.exists("networks.json"):
            self.loaded_networks = {}
        else:
            with open("networks.json", "r") as f:
                self.loaded_networks = json.load(f)

        self.loaded_lines = {}
        
        self.network_lock = FileLock("networks.json.lock")
        self.lines_lock = FileLock("lines.json.lock")


    def get_network(self, sim_start: str, time_offset: int, dist_threshold: int, required_ratio: float, line_type: Literal["mta", "jet"]) -> Network:
        """Gets the network given its parameters

        If a network with the same parameters exist in loaded_networks then that network will be returned.
        If not the network is generated and added to loaded_networks before being returned.

        Parameters
        ----------
        sim_start : the start of the simulation
            In the following form YYYYMMDDHH
        time_offset : the time offset in hours from the simulation start
        dist_threshold : the distance in km for two lines to be considered close
            This is how close two points in two lines need to be to eachother in order
            to be considered close.
        ratio : the ratio of points in two lines which must be closer than the distance threshold
            for the lines to be considered close.
        line_type : the type of line being analyzed (jet or mta)
        """

        network_key = sim_start + str(time_offset) + str(dist_threshold) + str(required_ratio)
        if network_key in self.loaded_networks:
            return self.loaded_networks[network_key]

        lines: list[Line]
        with self.lines_lock:
            lines_key = sim_start + line_type
            if not lines_key in self.loaded_lines:
                self.loaded_lines[lines_key] = get_all_lines(sim_start, line_type)

        lines = self.loaded_lines[lines_key][time_offset]

        ico_points_ms, line_points_ms = multiscale(lines, 0)
        network = generate_network(lines, ico_points_ms, line_points_ms, dist_threshold, required_ratio)

        with self.network_lock:
            self.loaded_networks[network_key] = network
            with open("networks.json", "w+") as f:
                json.dump(self.loaded_networks, f)

        return network

    def get_lines(self, sim_start: str, time_offset: int, line_type: Literal["jet", "mta"]):
        lines: list[Line]
        lines_key = sim_start + line_type
        with self.lines_lock:
            if not lines_key in self.loaded_lines:
                self.loaded_lines[lines_key] = get_all_lines(sim_start, line_type)

        lines = self.loaded_lines[lines_key][time_offset]
        lines_dict = [line.to_dict() for line in lines]

        return lines_dict

    def get_contingency_table(self, sim_start: str, time_offset: int):
        contingency = create_clustermap(sim_start, time_offset, "jet")
        return contingency


if __name__ == '__main__':
    api = Api()
    _ = webview.create_window('INF319', 'assets/index.html', js_api=api, min_size=(1280, 720))

    debug = False
    if "debug" in sys.argv:
        debug = True

    webview.start(debug=debug)
