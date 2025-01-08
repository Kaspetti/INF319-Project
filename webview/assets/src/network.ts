import Sigma, { Camera } from "sigma";
import Graph from "graphology";
import { scaleLinear } from "d3-scale"
import { rgb } from "d3-color";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import { inferSettings } from "graphology-layout-forceatlas2"
import { Network } from "./types/pywebview";


let networkCache: Record<number, Network> = {}


// Initialize these here so we can use them later
let sigmaInstanceLeft: Sigma;
let sigmaInstanceRight: Sigma;

let layoutLeft: FA2Layout | null = null;
let layoutRight: FA2Layout | null = null;


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
async function _populateNetwork(
  graph: Graph,
  simStart: string,
  timeOffset: number,
  distThreshold: number,
  requriedRatio: number
): Promise<Record<string, number>> {
  // Check if network is cached
  let data: Network;
  if (timeOffset in networkCache) {
    data = networkCache[timeOffset];
  } else {
    data = await pywebview.api.get_networks(simStart, timeOffset, distThreshold, requriedRatio); 
    networkCache[timeOffset] = data;
  }
  
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

  return data.node_clusters;
}


function startLayout(side: "left" | "right") {
  const graph = side == "left" ? sigmaInstanceLeft.getGraph() : sigmaInstanceRight.getGraph();

  const sensibleSettings = inferSettings(graph);
  sensibleSettings.edgeWeightInfluence = 1;
  sensibleSettings.gravity = 1;
  const layout = new FA2Layout(graph, {settings: sensibleSettings})
  layout.start();

  if (side == "left") { 
    layoutLeft = layout;
  } else {
    layoutRight = layout;
  }
}


/**
  * Initialized the networks once pywebview is ready.
*/
export function initNetworks() {
  initializeSigmaInstances("left-network-container", "right-network-container");
}


export async function populateNetwork(side: "left" | "right", simStart: string, timeOffset: number, distThreshold: number, requiredRatio: number): Promise<Record<string, number>> {

  if (side === "left") {
    sigmaInstanceLeft.getGraph().clear();
    if (layoutLeft) { layoutLeft.kill(); }
    const nodeClustersLeft = await _populateNetwork(sigmaInstanceLeft.getGraph(), simStart, timeOffset, distThreshold, requiredRatio);
    startLayout(side);

    resetCamera(sigmaInstanceLeft.getCamera());
    sigmaInstanceLeft.refresh();

    return nodeClustersLeft;
  } else {
    sigmaInstanceRight.getGraph().clear();
    if (layoutRight) { layoutRight.kill(); }
    const nodeClustersRight = await _populateNetwork(sigmaInstanceRight.getGraph(), simStart, timeOffset, distThreshold, requiredRatio);
    startLayout(side);

    resetCamera(sigmaInstanceRight.getCamera());
    sigmaInstanceRight.refresh();

    return nodeClustersRight;
  }
}


function resetCamera(camera: Camera) {
  camera.x = 0.5;
  camera.y = 0.5;
  camera.ratio = 1;
}


export function resetCameras() {
  resetCamera(sigmaInstanceLeft.getCamera());
  resetCamera(sigmaInstanceRight.getCamera());
}


export function resetLayouts() {
  if (layoutLeft) { layoutLeft.kill() }
  if (layoutRight) { layoutRight.kill() }

  const graphLeft = sigmaInstanceLeft.getGraph();
  graphLeft.forEachNode(function(n) {
    graphLeft.setNodeAttribute(n, "x", Math.random());
    graphLeft.setNodeAttribute(n, "y", Math.random());
  })
  sigmaInstanceLeft.refresh();

  const graphRight = sigmaInstanceRight.getGraph();
  graphRight.forEachNode(function(n) {
    graphRight.setNodeAttribute(n, "x", Math.random());
    graphRight.setNodeAttribute(n, "y", Math.random());
  })
  sigmaInstanceRight.refresh();

  startLayout("left");
  startLayout("right");
}
