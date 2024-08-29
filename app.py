from flask import Flask, render_template, jsonify, Response, request
from data import read_data, get_geometric_center, generate_network


app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/get-network")
def get_network():
    sim_start = request.args.get("sim-start")
    time_offset = request.args.get("time-offset")

    if not sim_start:
        return Response(
            "sim-start was empty",
            status="400"
        )

    if not time_offset:
        return Response(
            "time-offset was empty",
            status="400"
        )

    lines = []
    for i in range(50):
        lines += read_data(sim_start, i, int(time_offset))

    centers = []
    for line in lines:
        centers.append({
            "id": f"{line['sim_id']}|{int(line['line_id'])}",
            "center": get_geometric_center(line["coords"])
        })

    return jsonify(generate_network(centers, 500))
