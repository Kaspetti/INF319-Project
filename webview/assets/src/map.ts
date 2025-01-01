import * as L from "leaflet"
import 'leaflet/dist/leaflet.css'


let mapLeft: L.Map;
let lineLayerLeft: L.LayerGroup;

let mapRight: L.Map;
let lineLayerRight: L.LayerGroup;


function initMapsContainers(leftContainerId: string, rightContainerId: string): void {
  if (!mapLeft) {
    mapLeft = L.map(leftContainerId).setView([20, 0], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
      maxZoom: 15,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapLeft);
    lineLayerLeft = L.layerGroup().addTo(mapLeft);
  }
  if (!mapRight) {
    mapRight = L.map(rightContainerId).setView([20, 0], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
      maxZoom: 15,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapRight);
    lineLayerRight = L.layerGroup().addTo(mapRight);
  }
}


async function populateMap(lineLayer: L.LayerGroup, simStart: string, timeOffset: number) {
  const data = await pywebview.api.get_lines(simStart, timeOffset); 

  data.forEach(function(l) {
    const min = Math.min(...l.coords.map(coord => coord.lon))
    const max = Math.max(...l.coords.map(coord => coord.lon))

    let latLons: L.LatLngTuple[];
    // If it crosses the anti meridian add 360 to the negative values
    if (max - min > 180) {
      latLons = l.coords.map(coord => [coord.lat, coord.lon < 0 ? coord.lon + 360 : coord.lon] as L.LatLngTuple)
      
    } else {
      latLons = l.coords.map(coord => [coord.lat, coord.lon])
    }

    L.polyline(latLons, 
      { 
        weight: 2,
        color: "blue",
        bubblingMouseEvents: false
      }).addTo(lineLayer)
  })
}


export async function initMaps() {
  initMapsContainers("left-map-container", "right-map-container");
  await populateMap(lineLayerLeft, "2024101900", 0);
  await populateMap(lineLayerRight, "2024101900", 3);
}
