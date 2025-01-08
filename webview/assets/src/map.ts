import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic"
import * as L from "leaflet"
import 'leaflet/dist/leaflet.css'
import { Line } from "./types/pywebview";


let lineCache: Record<number, Line[]> = {}


let mapLeft: L.Map;
let lineLayerLeft: L.LayerGroup;

let mapRight: L.Map;
let lineLayerRight: L.LayerGroup;


function initMapsContainers(leftContainerId: string, rightContainerId: string): void {
  if (!mapLeft) {
    mapLeft = L.map(leftContainerId).setView([20, 0], 1);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
      maxZoom: 15,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapLeft);
    lineLayerLeft = L.layerGroup().addTo(mapLeft);
  }
  if (!mapRight) {
    mapRight = L.map(rightContainerId).setView([20, 0], 1);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
      maxZoom: 15,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapRight);
    lineLayerRight = L.layerGroup().addTo(mapRight);
  }
}


async function _populateMap(
  lineLayer: L.LayerGroup,
  nodeClusters: Record<string, number>,
  simStart: string,
  timeOffset: number
) {
  let data: Line[];
  if (timeOffset in lineCache) {
    data = lineCache[timeOffset];
  } else {
    data = await pywebview.api.get_lines(simStart, timeOffset); 
    lineCache[timeOffset] = data;
  }

  const lineColormap = scaleOrdinal<number, string>(schemeCategory10)
    .domain([0, Math.max(...Object.values(nodeClusters))])

  data.forEach(function(l) {
    const min = Math.min(...l.coords.map(coord => coord.lon))
    const max = Math.max(...l.coords.map(coord => coord.lon))

    let latLons: L.LatLngTuple[];
    // If it crosses the anti meridian add 360 to the negative values
    if (max - min > 180) {
      latLons = l.coords.map(coord => [coord.lat, coord.lon < 0 ? coord.lon + 360 : coord.lon])
      
    } else {
      latLons = l.coords.map(coord => [coord.lat, coord.lon])
    }

    const lineColor = nodeClusters[l.id] == -1 ? "#000" : lineColormap(nodeClusters[l.id])
    L.polyline(latLons, 
      { 
        weight: 2,
        color: lineColor,
        bubblingMouseEvents: false
      }).addTo(lineLayer)
  })
}


export function initMaps() {
  initMapsContainers("left-map-container", "right-map-container");
}


export async function populateMap(side: "left" | "right", simStart: string, timeOffset: number, nodeClusters: Record<string, number>) {
  if (side === "left") {
    lineLayerLeft.clearLayers();
    await _populateMap(lineLayerLeft, nodeClusters, simStart, timeOffset);
  } else {
    lineLayerRight.clearLayers();
    await _populateMap(lineLayerRight, nodeClusters, simStart, timeOffset);
  }
}
