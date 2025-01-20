from typing import Literal, TypedDict

from line_reader import get_all_lines_at_time
from data import generate_network
from multiscale import multiscale
from track_lines_devel import add_length_col, track_lines

import pandas as pd
from alive_progress import alive_it


class Row(TypedDict):
    line_id: str
    latitude: float
    longitude: float


def create_clustermap(simstart: str, time_offset: int, line_type: Literal["mta", "jet"]) -> list[list[int]]:
    # Generate clusters at t0
    lines_t0 = get_all_lines_at_time(simstart, time_offset, line_type)
    ico_points_ms_t0, line_points_ms_t0 = multiscale(lines_t0, 2)
    network_t0 = generate_network(lines_t0, ico_points_ms_t0, line_points_ms_t0, 50, 0.05)

    rows: list[Row] = []
    for line in lines_t0:
        for coord in line.coords:
            rows.append({
                "line_id": line.id,
                "latitude": coord.lat,
                "longitude": coord.lon,
            })
    df0 = pd.DataFrame(rows)
    add_length_col(df0)

    # Generate clusters at t1
    lines_t1 = get_all_lines_at_time(simstart, time_offset + (3 if time_offset < 72 else 6), line_type)
    ico_points_ms_t1, line_points_ms_t1 = multiscale(lines_t1, 2)
    network_t1 = generate_network(lines_t1, ico_points_ms_t1, line_points_ms_t1, 50, 0.05)

    rows = []
    for line in lines_t1:
        for coord in line.coords:
            rows.append({
                "line_id": line.id,
                "latitude": coord.lat,
                "longitude": coord.lon,
            })
    df1 = pd.DataFrame(rows)
    add_length_col(df1)

    all_matches: list[tuple[str, str]] = []
    unmatched_ids_t0: set[str] = set(df0["line_id"])    # type: ignore
    unmatched_ids_t1: set[str] = set(df1['line_id'])    # type: ignore
    bar = alive_it(range(50), title="Tracking lines")
    for i in bar:
        df0_i = df0[df0["line_id"].str.split('|').str[0] == str(i)]  # type: ignore
        df1_i = df1[df1["line_id"].str.split('|').str[0] == str(i)]  # type: ignore

        matches: list[tuple[str, str]] = track_lines(df0_i, df1_i)[0]
        for old_id, new_id in matches:
            if old_id in unmatched_ids_t0:
                unmatched_ids_t0.remove(old_id)
            if new_id in unmatched_ids_t1:
                unmatched_ids_t1.remove(new_id)

        all_matches += matches

    all_ids = sorted(set(
        list(network_t0["node_clusters"].values()) + 
        list(network_t1["node_clusters"].values())
    ))

    contingency = pd.DataFrame(
        0, 
        index=all_ids+["no_match"],
        columns=all_ids+["no_match"]
    )

    for match in all_matches:
        cluster_t0 = network_t0["node_clusters"][match[0]]
        cluster_t1 = network_t1["node_clusters"][match[1]]

        contingency.loc[cluster_t0, cluster_t1] += 1    # type: ignore

    for no_match in unmatched_ids_t0:
        cluster_t0 = network_t0["node_clusters"][no_match]
        contingency.loc[cluster_t0, "no_match"] += 1    # type: ignore

    for no_match in unmatched_ids_t1:
        cluster_t1 = network_t1["node_clusters"][no_match]
        contingency.loc["no_match", cluster_t1] += 1    # type: ignore

    row_totals = contingency.sum(axis=1)  # type: ignore
    col_totals = contingency.sum(axis=0)  # type: ignore

    new_index = [f"{idx} ({row_totals[idx]})" for idx in contingency.index]
    new_columns = [f"{col} ({col_totals[col]})" for col in contingency.columns]

    contingency.index = new_index   # type: ignore
    contingency.columns = new_columns

    return contingency.to_numpy().tolist();


if __name__ == "__main__":
    create_clustermap("2024101900", 0, "jet")
