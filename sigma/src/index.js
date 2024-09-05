import Sigma from "sigma"
import Graph from "graphology"
import FA2Layout from 'graphology-layout-forceatlas2/worker'
import { inferSettings } from "graphology-layout-forceatlas2"
import { json } from "d3-fetch"
import { scaleLinear } from "d3-scale"
import { rgb } from "d3-color"
import L from "leaflet"
import 'leaflet/dist/leaflet.css';


document.getElementById("show-graph-button").onclick = updateGraph

const sigmaInstance = new Sigma(new Graph(), document.getElementById("graph-container"))
const map = L.map("map-container").setView([0, 5], 2);

let layout = {}

const timeOffsetInput = document.getElementById("time-offset-input")
const distThresholdInput = document.getElementById("dist-threshold-input")


async function updateGraph() { 
  sigmaInstance.graph.clear()
  layout.kill()

  const header = document.getElementById("graph-header")
  header.style.color = "red"
  header.innerText = "Generating network. Please wait..."

  await populateGraph("2024082712", timeOffsetInput.value, distThresholdInput.value)

  header.style.color = "black"
  header.innerText = `Showing network for timestep ${timeOffsetInput.value} with distance threshold ${distThresholdInput.value}`

  sigmaInstance.refresh()
}


async function populateGraph(simStart, timeOffset, distThreshold) {
  const graph = sigmaInstance.graph;

  const data = await json(`http://localhost:8000/get-networks?sim_start=${simStart}&time_offset=${timeOffset}&dist_threshold=${distThreshold}`) 
  const links = data.links.map(d => ({...d}))
  const nodes = data.nodes.map(d => ({...d}))

  const weights = links.map(l => distThreshold - l.dist_sqrd)
  const colorScale = scaleLinear()
    .domain([Math.min(...weights), Math.max(...weights)])
    .range(["#ff0000", "#0000ff"])

  nodes.forEach(n => {
    graph.addNode(n.id, {size: 4, color: "orange", label: n.id, x: Math.random(), y: Math.random()})
  })

  links.forEach(l => {
    const weight = distThreshold - l.dist_sqrd
    const color = rgb(colorScale(weight)).formatHex()

    graph.addEdge(l.source, l.target, {
      type: "line",
      label: l.dist_sqrd,
      size: 1,
      color: color,
      weight: weight
    })
  })
  


  const sensibleSettings = inferSettings(graph)
  sensibleSettings.edgeWeightInfluence = 0.5
  layout = new FA2Layout(graph, {
    settings: sensibleSettings
  });
  layout.start()
}


async function initMap() {
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
}


populateGraph("2024082712", 0, 5)
initMap()
