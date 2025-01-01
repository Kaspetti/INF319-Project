import Sigma from "sigma";
import Graph from "graphology";
import { scaleLinear } from "d3-scale"
import { rgb } from "d3-color";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import { inferSettings } from "graphology-layout-forceatlas2"


// Initialize these here so we can use them later
let sigmaInstanceLeft: Sigma;
let sigmaInstanceRight: Sigma;


/**
  * Initializes the two Sigma instances on the containers provided.
  * @param leftContainerId - The left container.
  * @param rightContainerId - The right container.
*/
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


/**
  * Populates the provided graph with the network corresponding to the
  * parameters provided.
  * @param graph - The graph instance to populate.
  * @param simStart - The start time of the simulation (YYYYMMDDHH).
  * @param timeOffset - The hour offset from the sim start.
  * @param distThreshold - The distance threshold required for two points to be considered close.
  * @param requriedRatio - The required ratio of points to be within the distance threshold.
*/
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
    graph.addNode(n.id, {size: 3, color: "orange", label: n.id, x: Math.random(), y: Math.random()});
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
  const layout = new FA2Layout(graph, {settings: sensibleSettings})
  layout.start();
}


/**
  * Initialized the networks once pywebview is ready.
*/
export async function initNetworks() {
  initializeSigmaInstances("left-network-container", "right-network-container");
  await populateGraph(sigmaInstanceLeft.getGraph(), "2024101900", 0, 50, 0.05);
  await populateGraph(sigmaInstanceRight.getGraph(), "2024101900", 3, 50, 0.05);
}
