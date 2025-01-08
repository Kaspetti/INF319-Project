import sys

from line_reader import Line, get_all_lines
from multiscale import multiscale
from data import generate_network, Network

import webview


class Api:
    lines_at_time: dict[int, list[Line]]

    def __init__(self, lines_at_time: dict[int, list[Line]]):
        self.lines_at_time = lines_at_time

    def get_networks(self, sim_start: str, time_offset: int, dist_threshold: int, required_ratio: float) -> Network:
        lines = lines_at_time[time_offset]

        ico_points_ms, line_points_ms = multiscale(lines, 0)
        network = generate_network(lines, ico_points_ms, line_points_ms, dist_threshold, required_ratio)
        print(f"Generated network for {time_offset}")

        return network

    def get_lines(self, sim_start: str, time_offset: int):
        lines = lines_at_time[time_offset]
        lines_dict = [line.to_dict() for line in lines]

        return lines_dict


if __name__ == '__main__':
    print("Getting lines")
    lines_at_time = get_all_lines("2024101900", "jet")

    api = Api(lines_at_time)
    _ = webview.create_window('INF319', 'assets/index.html', js_api=api, min_size=(1280, 720))

    debug = False
    if "debug" in sys.argv:
        debug = True

    webview.start(debug=debug)
