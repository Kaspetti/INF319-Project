let graph = {}

async function initGraph() {
  graph = new graphology.Graph();

  const data = await d3.json(`/api/get-network?sim-start=2024082712&time-offset=0`) 
  const links = data.links.map(d => ({...d}))
  const nodes = data.nodes.map(d => ({...d}))

  nodes.forEach(n => {
    graph.addNode(n.id, {size: 5, label: n.id})
  })

  links.forEach(l => {
    graph.addEdge(l.source, l.target, { type: "line", label: l.dist_sqrd, size: 5})
  })

  graph.nodes().forEach((node, i) => {
    const angle = (i * 2 * Math.PI) / graph.order;
    graph.setNodeAttribute(node, "x", 100 * Math.cos(angle));
    graph.setNodeAttribute(node, "y", 100 * Math.sin(angle));
  });

  // Instantiate sigma.js and render the graph
  const sigmaInstance = new Sigma(graph, document.getElementById("graph"));
}


initGraph()
