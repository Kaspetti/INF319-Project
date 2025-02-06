import { ScaleOrdinal, scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic"
import * as L from "leaflet"
import 'leaflet/dist/leaflet.css'
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { highlightClusters } from "./network";
import { getNewIds, getOldIds, highlightCellsNewId, highlightCellsOldId } from "./contingencyTable";

declare module 'leaflet' {
  interface PolylineOptions {
    id: string;
  }
}

let mapLeft: L.Map;
let lineLayerLeft: L.LayerGroup;
let linesLeft: L.Polyline[] = [];
let t0NodeClusters: Record<string, string>;

let mapRight: L.Map;
let lineLayerRight: L.LayerGroup;
let linesRight: L.Polyline[] = [];
let t1NodeClusters: Record<string, string>;

let lineColormap: ScaleOrdinal<string, string, never> = scaleOrdinal<string, string>(schemeCategory10)
                                                          .domain(Array.from({length: 50}, (_, i) => i.toString()))

function initMapsContainers(leftContainerId: string, rightContainerId: string): void {

  if (!mapLeft) {
    mapLeft = L.map(leftContainerId).setView([20, 0], 1);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
      maxZoom: 15,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(mapLeft);
    lineLayerLeft = L.layerGroup().addTo(mapLeft);

    let drawnItems = new L.FeatureGroup();
    mapLeft.addLayer(drawnItems);
    let drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
        },
        polyline: false,
        circle: false,
        rectangle: false,
        circlemarker: false,
        marker: false
      }
    });
    mapLeft.addControl(drawControl);

    mapLeft.on("draw:created", e => {
      const polygonLatLngs: L.LatLng[] = e.layer._latlngs[0];
      const closedPolygon = [...polygonLatLngs, polygonLatLngs[0]]; 
      const polygonPoints = closedPolygon.map(p => mapLeft.latLngToContainerPoint(p));

      const lineClusters: string[] = [];

      linesLeft.forEach(l => {
        const points = (l.getLatLngs() as L.LatLng[]).map(p => mapLeft.latLngToContainerPoint(p));
        
        if (points.some(p => pointInPolygon(p, polygonPoints))) {
          l.setStyle({color: "lime", weight: 2});

          const clusterId = t0NodeClusters[l.options.id];
          lineClusters.push(clusterId)
        } else {
          l.setStyle({color: "grey", weight: 1});
        }
      })

      highlightClusters(lineClusters, 0)
      const allNewIds: string[] = []
      lineClusters.forEach(clusterId => {
        highlightCellsOldId(clusterId);

        const newIds = getNewIds(clusterId);
        allNewIds.push(...newIds);
      });

      highlightClusters(allNewIds, 1);
      highlightLines(allNewIds, 1);
    });
  }
  if (!mapRight) {
    mapRight = L.map(rightContainerId).setView([20, 0], 1);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
      maxZoom: 15,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(mapRight);
    lineLayerRight = L.layerGroup().addTo(mapRight);

    let drawnItems = new L.FeatureGroup();
    mapRight.addLayer(drawnItems);
    let drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
        },
        polyline: false,
        circle: false,
        rectangle: false,
        circlemarker: false,
        marker: false
      }
    });
    mapRight.addControl(drawControl);

    mapRight.on("draw:created", e => {
      const polygonLatLngs: L.LatLng[] = e.layer._latlngs[0];
      const closedPolygon = [...polygonLatLngs, polygonLatLngs[0]]; 
      const polygonPoints = closedPolygon.map(p => mapRight.latLngToContainerPoint(p));

      const lineClusters: string[] = [];

      linesRight.forEach(l => {
        const points = (l.getLatLngs() as L.LatLng[]).map(p => mapRight.latLngToContainerPoint(p));
        
        if (points.some(p => pointInPolygon(p, polygonPoints))) {
          l.setStyle({color: "lime", weight: 2});

          const clusterId = t1NodeClusters[l.options.id];
          lineClusters.push(clusterId)
        } else {
          l.setStyle({color: "grey", weight: 1});
        }
      })

      highlightClusters(lineClusters, 1)
      const allOldIds: string[] = []
      lineClusters.forEach(clusterId => {
        highlightCellsNewId(clusterId);

        const oldIds = getOldIds(clusterId);
        allOldIds.push(...oldIds);
      });

      highlightClusters(allOldIds, 0);
      highlightLines(allOldIds, 0);
    });
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

    if (l.id === "0|1" || l.id === "0|2") {
      console.log(nodeClusters[l.id], lineColor)
    }

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
    t0NodeClusters = nodeClusters;
    await _populateMap(lineLayerLeft, linesLeft, nodeClusters, simStart, timeOffset, lineType);
  } else {
    lineLayerRight.clearLayers();
    t1NodeClusters = nodeClusters;
    await _populateMap(lineLayerRight, linesRight, nodeClusters, simStart, timeOffset, lineType);
  }
}


export async function clearMaps() {
  lineLayerLeft.clearLayers();
  lineLayerRight.clearLayers();
}


export function highlightLines(clusterIds: string[], t: 0 | 1) {
  const lines = t == 0 ? linesLeft : linesRight;
  const nodeClusters = t == 0 ? t0NodeClusters : t1NodeClusters;
  clusterIds = clusterIds.map(d => d.toString());

  lines.forEach((l: L.Polyline) => {
    if (clusterIds.includes(nodeClusters[l.options.id].toString())) {
      l.setStyle({color: "lime", weight: 2});
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

  mapLeft.setView([20, 0], 1);
  mapRight.setView([20, 0], 1);
}


function pointInPolygon(point: L.Point, polygon: L.Point[]): boolean {
  let odd = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; i++) {
    if (((polygon[i].y > point.y) !== (polygon[j].y > point.y))
        && (point.x < ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x))) {
      odd = !odd;
    }
    j = i;
  }

  return odd;
}
