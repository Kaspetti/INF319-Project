from line_reader import get_all_lines_at_time
from multiscale import multiscale
from data import generate_network, Network

import webview


class Api:
    def get_networks(self, sim_start: str, time_offset: int, dist_threshold: int, required_ratio: float) -> Network:
        lines = get_all_lines_at_time(sim_start, time_offset, "jet")

        ico_points_ms, line_points_ms = multiscale(lines, 0)
        network = generate_network(lines, ico_points_ms, line_points_ms, dist_threshold, required_ratio)

        return network

    def get_lines(self, sim_start: str, time_offset: int):
        lines = get_all_lines_at_time(sim_start, time_offset, "jet")
        lines_dict = [line.to_dict() for line in lines]

        return lines_dict


if __name__ == '__main__':
    api = Api()
    _ = webview.create_window('INF319', 'assets/index.html', js_api=api, min_size=(1280, 720))
    webview.start(debug=True)
