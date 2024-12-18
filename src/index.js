import Sigma from "sigma"
import Graph from "graphology"
import FA2Layout from 'graphology-layout-forceatlas2/worker'
import { inferSettings } from "graphology-layout-forceatlas2"
import { json } from "d3-fetch"
import { scaleLinear, scaleOrdinal } from "d3-scale"
import { schemeCategory10 } from "d3-scale-chromatic"
import { rgb } from "d3-color"
import L from "leaflet"
import 'leaflet/dist/leaflet.css'


document.getElementById("show-graph-button").onclick = updateView
document.getElementById("id-search-button").onclick = highlightId
document.getElementById("clear-search-button").onclick = clearHighlight

const sigmaInstance = new Sigma(new Graph(), document.getElementById("graph-container"))

const map = L.map("map-container").setView([0, 5], 2);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
const lineLayer = L.layerGroup().addTo(map)

map.on("click", function() {
  lines.forEach(function(l) {
    l.setStyle({color: line_colormap(nodeClusters[l.options.id]), weight: 2})
  })

  sigmaInstance.graph.nodes().forEach(function(n) {
    sigmaInstance.graph.setNodeAttribute(n, "color", "orange")
    sigmaInstance.graph.setNodeAttribute(n, "size", 4)
  })
  sigmaInstance.refresh()

  selectedNode = null
  selectedLine = null
})

let layout = new FA2Layout(sigmaInstance.graph)

const timeOffsetInput = document.getElementById("time-offset-input")
const ensIdInput = document.getElementById("ens-id-input")
const distThresholdInput = document.getElementById("dist-threshold-input")
const requiredRatioInput = document.getElementById("required-ratio-input")
const showGraphButton = document.getElementById("show-graph-button")
const jetButton = document.getElementById("jet")
const mtaButton = document.getElementById("mta")
const allEnsButton = document.getElementById("all")
const oneEnsButton = document.getElementById("one")

let lines = []
let centroids = []
let selectedLine = null
let selectedNode = null

let nodeClusters = null

let line_colormap = null


async function updateView() { 
  sigmaInstance.graph.clear()
  lineLayer.clearLayers();

  const header = document.getElementById("graph-header")

  header.style.color = "red"
  header.innerText = "Generating network. Please wait..."
  timeOffsetInput.disabled = true
  ensIdInput.disabled = true
  distThresholdInput.disabled = true
  requiredRatioInput.disabled = true
  jetButton.disabled = true
  mtaButton.disabled = true
  allEnsButton.disabled = true
  oneEnsButton.disabled = true
  showGraphButton.disabled = true

  const selectedLineType = document.querySelector('input[name="line-type"]:checked').id
  const allOrOneEns = document.querySelector('input[name="one-or-all-ens"]:checked').id

  await populateGraph("2024101900", timeOffsetInput.value, ensIdInput.value, distThresholdInput.value, requiredRatioInput.value, selectedLineType, allOrOneEns)
  await populateMap("2024101900", timeOffsetInput.value, ensIdInput.value, selectedLineType, allOrOneEns)

  header.style.color = "black"
  header.innerText = `Showing network of ${selectedLineType} lines at timestep ${timeOffsetInput.value} with distance threshold ${distThresholdInput.value}km`
  timeOffsetInput.disabled = false
  ensIdInput.disabled = false
  distThresholdInput.disabled = false
  requiredRatioInput.disabled = false
  jetButton.disabled = false
  mtaButton.disabled = false
  allEnsButton.disabled = false
  oneEnsButton.disabled = false
  showGraphButton.disabled = false

  sigmaInstance.refresh()
}


async function populateGraph(simStart, timeOffset, ensId, distThreshold, requiredRatio, lineType, allOrOneEns) {
  selectedNode = null
  const graph = sigmaInstance.graph;

  const data = await json(`http://localhost:8000/get-networks?sim_start=${simStart}&time_offset=${timeOffset}&ens_id=${ensId}&dist_threshold=${distThreshold}&required_ratio=${requiredRatio}&line_type=${lineType}&all_or_one=${allOrOneEns}`) 

  const links = Object.values(data.clusters).flat().map(d => ({...d}));
  const nodes = data.nodes.map(d => ({...d}))

  nodeClusters = data.node_clusters
  line_colormap = scaleOrdinal(schemeCategory10)
    .domain([0, Math.max(...Object.values(nodeClusters))])

  const weights = links.map(l => l.weight)
  const colorScale = scaleLinear()
    .domain([Math.min(...weights), Math.max(...weights)])
    .range(["#ff0000", "#0000ff"])

  nodes.forEach(n => {
    graph.addNode(n.id, {size: 4, color: "orange", label: n.id, x: Math.random(), y: Math.random()})
  })

  links.forEach(l => {
    const color = rgb(colorScale(l.weight)).formatHex()

    graph.addEdge(l.source, l.target, {
      type: "line",
      label: l.weight,
      size: 1,
      color: color,
      weight: l.weight
    })
  })
  


  const sensibleSettings = inferSettings(graph)
  sensibleSettings.edgeWeightInfluence = 1
  sensibleSettings.gravity = 1
  layout.settings = sensibleSettings
  layout.start()

  sigmaInstance.on("downNode", e => setFocus(e.node))

  sigmaInstance.on("downStage", function() {
    sigmaInstance.graph.nodes().forEach(function(n) {
      sigmaInstance.graph.setNodeAttribute(n, "color", "orange")
      sigmaInstance.graph.setNodeAttribute(n, "size", 4)
    })
    sigmaInstance.refresh()

    lines.forEach(function(l) {
      l.setStyle({ color: line_colormap(nodeClusters[l.options.id]), weight: 1 })
    })

    selectedNode = null
    selectedLine = null
  })
}


async function populateMap(simStart, timeOffset, ensId, lineType, allOrOneEns) {
  selectedLine = null
  const ls = await json(`http://localhost:8000/get-coords?sim_start=${simStart}&time_offset=${timeOffset}&ens_id=${ensId}&line_type=${lineType}&all_or_one=${allOrOneEns}`) 
  // const cs = await json(`http://localhost:8000/get-centroids?sim_start=${simStart}&time_offset=${timeOffset}&ens_id=${ensId}&line_type=${lineType}&all_or_one=${allOrOneEns}`) 

  lines = []
  ls.forEach(function(l) {
    const min = Math.min(...l.coords.map(coord => coord.lon))
    const max = Math.max(...l.coords.map(coord => coord.lon))

    let latLons
    // If it crosses the anti meridian add 360 to the negative values
    if (max - min > 180) {
      latLons = l.coords.map(coord => [coord.lat, coord.lon < 0 ? coord.lon + 360 : coord.lon])
      
    } else {
      latLons = l.coords.map(coord => [coord.lat, coord.lon])
    }
    
    let line = L.polyline(latLons, 
      { 
        weight: 2,
        id: l.id,
        color: line_colormap(nodeClusters[l.id]),
        bubblingMouseEvents: false
      }).addTo(lineLayer)

    line.on("click", e => setFocus(e.target.options.id))

    lines.push(line)
  })

  // cs.forEach(function(c) {
  //   let circle = L.circle([c.lat, c.lon]).addTo(lineLayer)
  // })
}


function setFocus(id) {
  clearHighlight()

  lines.forEach(function(l) {
    if (l.options.id === id) {
      selectedLine = l
      l.setStyle({ color: "red", weight: 5 })
    } else {
      l.setStyle({ color: "#9995", weight: 1})
    }
  })

  if (selectedNode) {
    sigmaInstance.graph.setNodeAttribute(selectedNode, "color", "orange")
    sigmaInstance.graph.setNodeAttribute(selectedNode, "size", 4)
  } 

  selectedNode = id
  sigmaInstance.graph.setNodeAttribute(selectedNode, "color", "red")
  sigmaInstance.graph.setNodeAttribute(selectedNode, "size", 8)
  sigmaInstance.refresh()
}


async function init() {
  jetButton.checked = true
  allEnsButton.checked = true

  await updateView()
}


function highlightId() {
  const id = document.getElementById("id-search-input").value
  clearHighlight()
  if (!id) {
    return
  }

  sigmaInstance.graph.nodes().filter(n => n.split("|")[1] === id).forEach(function(n) {
    sigmaInstance.graph.setNodeAttribute(n, "color", "red")
    sigmaInstance.graph.setNodeAttribute(n, "size", 8)
  })

  lines.forEach(function(l) {
    if (l.options.id.split("|")[1] === id) {
      l.setStyle({ color: "red", weight: 5 })
    } else {
      l.setStyle({ color: "#9995", weight: 1})
    }
  })
}


function clearHighlight() {
  sigmaInstance.graph.nodes().forEach(function(n) {
    sigmaInstance.graph.setNodeAttribute(n, "color", "orange")
    sigmaInstance.graph.setNodeAttribute(n, "size", 4)
  })

  lines.forEach(function(l) {
    l.setStyle({ color: line_colormap(nodeClusters[l.options.id]), weight: 1 })
  })

  document.getElementById("id-search-input").value = ""
}


init()

