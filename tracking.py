from line_reader import get_all_lines_at_time
from data import generate_network
from multiscale import multiscale
from track_lines_devel import add_length_col, track_lines

import pandas as pd
from alive_progress import alive_it
import seaborn as sns
import matplotlib.pyplot as plt


if __name__ == "__main__":
    # Generate clusters at t0
    lines_t0 = get_all_lines_at_time("2024101900", 0, "mta")
    ico_points_ms_t0, line_points_ms_t0 = multiscale(lines_t0, 2)
    network_t0 = generate_network(lines_t0, ico_points_ms_t0, line_points_ms_t0, 50, 0.05)

    rows = []
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
    lines_t1 = get_all_lines_at_time("2024101900", 3, "mta")
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

    all_matches = []
    unmatched_ids = set(df1['line_id'])
    bar = alive_it(range(50), title="Tracking lines")
    for i in bar:
        df0_i = df0[df0["line_id"].str.split('|').str[0] == str(i)]
        df1_i = df1[df1["line_id"].str.split('|').str[0] == str(i)]

        matches, _, _ = track_lines(df0_i, df1_i)
        for old_id, new_id in matches:
            if new_id in unmatched_ids:
                unmatched_ids.remove(new_id)

        all_matches += matches

    all_ids = sorted(set(
        list(network_t0["node_clusters"].values()) + 
        list(network_t1["node_clusters"].values())
    ))

    contingency = pd.DataFrame(
        0, 
        index=all_ids,
        columns=all_ids
    )    

    for match in all_matches:
        if match[0] not in network_t0["node_clusters"]:
            continue
        if match[1] not in network_t1["node_clusters"]:
            continue

        cluster_t0 = network_t0["node_clusters"][match[0]]
        cluster_t1 = network_t1["node_clusters"][match[1]]

        contingency.loc[cluster_t0, cluster_t1] += 1

    plt.figure(figsize=(12, 10))
    sns.heatmap(contingency, 
                cmap='YlOrRd',
                annot=True,
                fmt='d', 
                cbar_kws={'label': 'Cluster ids t0->t1'},
                square=True)
    
    plt.title('Cluster IDs Transitions Heatmap')
    plt.xlabel('New Cluster ID')
    plt.ylabel('Old Cluster ID')
    
    # Rotate labels if there are many IDs
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    
    # Adjust layout to prevent label cutoff
    plt.tight_layout()
    plt.show()
