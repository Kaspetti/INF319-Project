import { ScaleOrdinal, scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic"
import * as L from "leaflet"
import 'leaflet/dist/leaflet.css'

declare module 'leaflet' {
  interface PolylineOptions {
    id: string;
  }
}

let mapLeft: L.Map;
let lineLayerLeft: L.LayerGroup;
let linesLeft: L.Polyline[] = [];

let mapRight: L.Map;
let lineLayerRight: L.LayerGroup;
let linesRight: L.Polyline[] = [];

let lineColormap: ScaleOrdinal<string, string, never>;

function initMapsContainers(leftContainerId: string, rightContainerId: string): void {
  if (!mapLeft) {
    mapLeft = L.map(leftContainerId).setView([20, 0], 1);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
      maxZoom: 15,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapLeft);
    lineLayerLeft = L.layerGroup().addTo(mapLeft);
  }
  if (!mapRight) {
    mapRight = L.map(rightContainerId).setView([20, 0], 1);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
      maxZoom: 15,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapRight);
    lineLayerRight = L.layerGroup().addTo(mapRight);
  }
}


async function _populateMap(
  lineLayer: L.LayerGroup,
  linesArray: L.Polyline[],
  nodeClusters: Record<string, string>,
  simStart: string,
  timeOffset: number,
  lineType: "jet" | "mta"
) {
  const data = await pywebview.api.get_lines(simStart, timeOffset, lineType); 

  lineColormap = scaleOrdinal<string, string>(schemeCategory10)
    .domain([...Object.values(nodeClusters)])

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

    const lineColor = nodeClusters[l.id] == "-1" ? "#fff" : lineColormap(nodeClusters[l.id])
    const line = L.polyline(latLons, 
      { 
        weight: 2,
        color: lineColor,
        bubblingMouseEvents: false,
        id: l.id,
      }
    ).addTo(lineLayer);

    linesArray.push(line);
  });
}


export function initMaps() {
  initMapsContainers("left-map-container", "right-map-container");
}


export async function populateMap(side: "left" | "right", simStart: string, timeOffset: number, lineType: "jet" | "mta", nodeClusters: Record<string, string>) {
  if (side === "left") {
    lineLayerLeft.clearLayers();
    await _populateMap(lineLayerLeft, linesLeft, nodeClusters, simStart, timeOffset, lineType);
  } else {
    lineLayerRight.clearLayers();
    await _populateMap(lineLayerRight, linesRight, nodeClusters, simStart, timeOffset, lineType);
  }
}


export async function clearMaps() {
  lineLayerLeft.clearLayers();
  lineLayerRight.clearLayers();
}


export function highlightLines(t0Id: string, t1Id: string, t0NodeClusters: Record<string, string>, t1NodeClusters: Record<string, string>) {
  linesLeft.forEach((l: L.Polyline) => {
    if (t0NodeClusters[l.options.id] == t0Id) {
      l.setStyle({color: "lime", weight: 5});
    } else {
      l.setStyle({color: "grey", weight: 1});
    }
  })

  linesRight.forEach((l: L.Polyline) => {
    if (t1NodeClusters[l.options.id] == t1Id) {
      l.setStyle({color: "lime", weight: 5});
    } else {
      l.setStyle({color: "grey", weight: 1});
    }
  })
}


export function resetMapView(t0NodeClusters: Record<string, string>, t1NodeClusters: Record<string, string>) {
  linesLeft.forEach((l: L.Polyline) => {
    const lineColor = t0NodeClusters[l.options.id] == "-1" ? "#fff" : lineColormap(t0NodeClusters[l.options.id])
    l.setStyle({color: lineColor, weight: 2})
  })

  linesRight.forEach((l: L.Polyline) => {
    const lineColor = t1NodeClusters[l.options.id] == "-1" ? "#fff" : lineColormap(t1NodeClusters[l.options.id])
    l.setStyle({color: lineColor, weight: 2})
  })
}
