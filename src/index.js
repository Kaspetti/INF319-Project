import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import Sigma from 'sigma';
import { json } from 'd3-fetch';
import EventEmitter from 'events';
import {inherits} from 'util';

let graph = new Graph();

async function initGraph() {
  const data = await json('/api/get-network?sim-start=2024082712&time-offset=0');
  const links = data.links.map(d => ({...d}));
  const nodes = data.nodes.map(d => ({...d}));

  nodes.forEach(n => {
    graph.addNode(n.id, {size: 5, label: n.id});
  });

  links.forEach(l => {
    graph.addEdge(l.source, l.target, { type: "line", label: l.dist_sqrd, size: 5});
  });

  // Apply ForceAtlas2 layout
  const settings = {
    iterations: 100,
    linLogMode: false,
    adjustSizes: false,
    gravity: 1,
    slowDown: 1
  };

  forceAtlas2.assign(graph, settings);

  // Instantiate sigma.js and render the graph
  const container = document.getElementById('graph');
  const sigmaInstance = new Sigma(graph, container);
}

// Expose the initGraph function to the global scope
window.initGraph = initGraph;
