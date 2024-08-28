from flask import Flask, render_template, jsonify
from data import read_data, get_geometric_center, generate_network


app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/get-network")
def get_network():
    lines = read_data("2024082712", 0, 0)
    centers = [get_geometric_center(line["coords"]) for line in lines]

    return jsonify(generate_network(centers, 1000))
