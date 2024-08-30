import Sigma from "sigma"
import Graph from "graphology"
import FA2Layout from 'graphology-layout-forceatlas2/worker';
import { inferSettings } from "graphology-layout-forceatlas2";
import { json } from "d3-fetch"


document.getElementById("show-graph-button").onclick = updateGraph

const sigmaInstance = new Sigma(new Graph(), document.getElementById("container"));
let layout = {}

const timeOffsetInput = document.getElementById("time-offset-input")
const distThresholdInput = document.getElementById("dist-threshold-input")


function updateGraph() { 
  sigmaInstance.graph.clear()
  layout.kill()

  populateGraph("2024082712", timeOffsetInput.value, distThresholdInput.value)

  sigmaInstance.refresh();
}


async function populateGraph(simStart, timeOffset, distThreshold) {
  const graph = sigmaInstance.graph;

  const data = await json(`http://localhost:8000/get-networks?sim_start=${simStart}&time_offset=${timeOffset}&dist_threshold=${distThreshold}`) 
  const links = data.links.map(d => ({...d}))
  const nodes = data.nodes.map(d => ({...d}))

  nodes.forEach(n => {
    graph.addNode(n.id, {size: 2, color: "blue", label: n.id, x: Math.random(), y: Math.random()})
  })

  links.forEach(l => {
    graph.addEdge(l.source, l.target, { type: "line", label: l.dist_sqrd, size: 1, weight: distThreshold - l.dist_sqrd})
  })
  


  const sensibleSettings = inferSettings(graph);
  sensibleSettings.edgeWeightInfluence = 0.5
  layout = new FA2Layout(graph, {
    settings: sensibleSettings
  });
  layout.start()
}


populateGraph("2024082712", 0, 500)

