from flask import Flask, render_template, jsonify
from data import read_data, get_geometric_center, generate_network


app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/get-network")
def get_network():
    lines = []
    for i in range(50):
        lines += read_data("2024082712", i, 0)

    centers = []
    for line in lines:
        centers.append({
            "id": f"{line['sim_id']}|{int(line['line_id'])}",
            "center": get_geometric_center(line["coords"])
        })

    return jsonify(generate_network(centers, 500))
