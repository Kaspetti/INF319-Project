import Sigma, { Camera } from "sigma";
import Graph from "graphology";
import { scaleLinear } from "d3-scale"
import { rgb } from "d3-color";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import { inferSettings } from "graphology-layout-forceatlas2"
import { SigmaNodeEventPayload } from "sigma/dist/declarations/src/types";


// Initialize these here so we can use them later
let sigmaInstanceLeft: Sigma;
let sigmaInstanceRight: Sigma;

let layoutLeft: FA2Layout | null = null;
let layoutRight: FA2Layout | null = null;

let t0NodeClusters: Record<string, number>;
let t1NodeClusters: Record<string, number>;

/**
  * Initializes the two Sigma instances on the containers provided.
  * @param leftContainerId - The left container.
  * @param rightContainerId - The right container.
*/
function initializeSigmaInstances(leftContainerId: string, rightContainerId: string): void {
  function createTooltip(): HTMLDivElement {
    const tooltip = document.createElement("div");
    tooltip.style.opacity = "0";
    tooltip.style.backgroundColor = "white";
    tooltip.style.border = "solid";
    tooltip.style.borderWidth = "2px";
    tooltip.style.borderRadius = "5px";
    tooltip.style.padding = "5px";
    tooltip.style.position = "fixed";
    tooltip.style.zIndex = "9999";
    tooltip.style.pointerEvents = "none";

    return tooltip;
  }

  function onNodeHover(e: SigmaNodeEventPayload, tooltip: HTMLDivElement, nodeClusters: Record<string, number>) {
    const label = `Id: ${e.node}<br>Cluster: ${nodeClusters[e.node]}`
    tooltip.innerHTML = label;

    tooltip.style.opacity = "1";
    tooltip.style.left = ((e.event.original as MouseEvent).clientX + 25) + "px";
    tooltip.style.top = ((e.event.original as MouseEvent).clientY - 25) + "px";
  }

  if (!sigmaInstanceLeft) {
    const container = document.getElementById(leftContainerId);
    if (container) {
      sigmaInstanceLeft = new Sigma(new Graph(), container);
      
      const tooltip = container.appendChild(createTooltip());

      sigmaInstanceLeft.on("enterNode", e => onNodeHover(e, tooltip, t0NodeClusters))
      sigmaInstanceLeft.on("leaveNode", _ => tooltip.style.opacity = "0")
    } else {
      console.error(`Couldn't find container with id ${leftContainerId}`)
    }
  }

  if (!sigmaInstanceRight) {
    const container = document.getElementById(rightContainerId);
    if (container) {
      sigmaInstanceRight = new Sigma(new Graph(), container);

      const tooltip = container.appendChild(createTooltip());

      sigmaInstanceRight.on("enterNode", e => onNodeHover(e, tooltip, t1NodeClusters))
      sigmaInstanceRight.on("leaveNode", _ => tooltip.style.opacity = "0")
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
  requriedRatio: number,
  lineType: "jet" | "mta"
): Promise<Record<string, number>> {
  const data = await pywebview.api.get_network(simStart, timeOffset, distThreshold, requriedRatio, lineType); 
  
  const links = Object.values(data.clusters).flat().map(d => ({...d}));
  const nodes = data.nodes.map(d => ({...d}))
  const weights = links.map(l => l.weight)

  const colorScale = scaleLinear<string>()
    .domain([Math.min(...weights), Math.max(...weights)])
    .range(["#ff1a1a", "#1a1aff"]);

  nodes.forEach(n => {
    graph.addNode(n.id, {size: 3, color: "#ff9900", x: Math.random(), y: Math.random()});
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


export async function populateNetwork(
  side: "left" | "right",
  simStart: string,
  timeOffset: number,
  distThreshold: number,
  requiredRatio: number,
  lineType: "jet" | "mta"
): Promise<Record<string, number>> {

  if (side === "left") {
    sigmaInstanceLeft.getGraph().clear();
    if (layoutLeft) { layoutLeft.kill(); }
    const nodeClustersLeft = await _populateNetwork(sigmaInstanceLeft.getGraph(), simStart, timeOffset, distThreshold, requiredRatio, lineType);
    startLayout(side);

    resetCamera(sigmaInstanceLeft.getCamera());
    sigmaInstanceLeft.refresh();

    t0NodeClusters = nodeClustersLeft;
    return nodeClustersLeft;
  } else {
    console.log(timeOffset);
    sigmaInstanceRight.getGraph().clear();
    if (layoutRight) { layoutRight.kill(); }
    const nodeClustersRight = await _populateNetwork(sigmaInstanceRight.getGraph(), simStart, timeOffset, distThreshold, requiredRatio, lineType);
    startLayout(side);

    resetCamera(sigmaInstanceRight.getCamera());
    sigmaInstanceRight.refresh();

    t1NodeClusters = nodeClustersRight;
    return nodeClustersRight;
  }
}


function resetCamera(camera: Camera) {
  camera.x = 0.5;
  camera.y = 0.5;
  camera.ratio = 1;
}


export function resetNetworkView() {
  resetCamera(sigmaInstanceLeft.getCamera());
  resetCamera(sigmaInstanceRight.getCamera());

  const graphLeft = sigmaInstanceLeft.getGraph();
  graphLeft.forEachNode(function(n) {
    graphLeft.setNodeAttribute(n, "color", "orange");
    graphLeft.setNodeAttribute(n, "size", 3);
  })

  const graphRight = sigmaInstanceRight.getGraph();
  graphRight.forEachNode(function(n) {
    graphRight.setNodeAttribute(n, "color", "orange");
    graphRight.setNodeAttribute(n, "size", 3);
  })
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


export function highlightClusters(t0Id: string, t1Id: string, t0NodeClusters: Record<string, number>, t1NodeClusters: Record<string, number>) {
  const graphLeft = sigmaInstanceLeft.getGraph()
  let t0IdInt = parseInt(t0Id);
  graphLeft.forEachNode(function(n) {
    if (t0NodeClusters[n] === t0IdInt) {
      graphLeft.setNodeAttribute(n, "color", "red");
      graphLeft.setNodeAttribute(n, "size", "4");
    } else {
      graphLeft.setNodeAttribute(n, "color", "orange");
      graphLeft.setNodeAttribute(n, "size", "3");
    }
  })

  const graphRight = sigmaInstanceRight.getGraph()
  let t1IdInt = parseInt(t1Id);
  graphRight.forEachNode(function(n) {
    if (t1NodeClusters[n] === t1IdInt) {
      graphRight.setNodeAttribute(n, "color", "red");
      graphRight.setNodeAttribute(n, "size", "4");
    } else {
      graphRight.setNodeAttribute(n, "color", "orange");
      graphRight.setNodeAttribute(n, "size", "3");
    }
  })
}
