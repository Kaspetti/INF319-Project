import Sigma from "sigma";
import Graph from "graphology";
import { scaleLinear } from "d3-scale"
import { rgb } from "d3-color";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import { inferSettings } from "graphology-layout-forceatlas2"


let sigmaInstanceLeft: Sigma;
let sigmaInstanceRight: Sigma;


function initializeSigmaInstances(leftContainerId: string, rightContainerId: string): void {
  if (!sigmaInstanceLeft) {
    const container = document.getElementById(leftContainerId);
    if (container) {
      sigmaInstanceLeft = new Sigma(new Graph(), container);
    } else {
      console.error(`Couldn't find container with id ${leftContainerId}`)
    }
  }

  if (!sigmaInstanceRight) {
    const container = document.getElementById(rightContainerId);
    if (container) {
      sigmaInstanceRight = new Sigma(new Graph(), container);
    } else {
      console.error(`Couldn't find container with id ${rightContainerId}`)
    }
  }
}


async function populateGraph(
  graph: Graph,
  simStart: string,
  timeOffset: number,
  // ensId: number,
  distThreshold: number,
  requriedRatio: number
) {
  
  const data = await pywebview.api.get_networks(simStart, timeOffset, distThreshold, requriedRatio); 

  const links = Object.values(data.clusters).flat().map(d => ({...d}));
  const nodes = data.nodes.map(d => ({...d}))
  const weights = links.map(l => l.weight)

  const colorScale = scaleLinear<string>()
    .domain([Math.min(...weights), Math.max(...weights)])
    .range(["#ff0000", "#0000ff"]);

  nodes.forEach(n => {
    graph.addNode(n.id, {size: 4, color: "orange", label: n.id, x: Math.random(), y: Math.random()});
  });

  links.forEach(l => {
    const color = rgb(colorScale(l.weight)).formatHex();

    graph.addEdge(l.source, l.target, {
      type: "line",
      label: l.weight,
      size: 1,
      color: color,
      weight: l.weight
    });
  });

  const sensibleSettings = inferSettings(graph);
  sensibleSettings.edgeWeightInfluence = 1;
  sensibleSettings.gravity = 1;
  let layout = new FA2Layout(graph, {settings: sensibleSettings})
  layout.start();
}


export function initNetworks(): void {
  window.addEventListener('pywebviewready', async function() {
    initializeSigmaInstances("left-network-container", "right-network-container");
    await populateGraph(sigmaInstanceLeft.getGraph(), "2024101900", 0, 50, 0.05);
    await populateGraph(sigmaInstanceRight.getGraph(), "2024101900", 3, 50, 0.05);
  });
}
