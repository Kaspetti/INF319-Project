import * as d3 from "d3";
import { debounce, max } from 'lodash';
import { CONTINGENCY_CELL_CLICK, ContingencyClickEvent } from "./event";

interface ContingencyData {
  oldId: string;
  newId: string;
  value: number;
}

let currentData: ContingencyData[] = [];
let currentRawData: number[][] = [];

let color: d3.ScaleLinear<string, string, never>;

export async function getContingencyTable(simStart: string, timeOffset: number, distThreshold: number, requiredRatio: number, lineType: "jet" | "mta") {
  const container = document.querySelector("#contingency-table") as HTMLDivElement;
  container.innerHTML = "";

  const rawData = await pywebview.api.get_contingency_table(simStart, timeOffset, distThreshold, requiredRatio, lineType);
  currentRawData = rawData;

  currentData = [];
  for (let i = 0; i < rawData.length; i++) {
    for (let j = 0; j < rawData[0].length; j++) { 
      const oldId = i < rawData.length - 1 ? (i-1).toString() : "-";
      const newId = j < rawData[0].length - 1 ? (j-1).toString() : "-";
      currentData.push({oldId: oldId, newId: newId, value: rawData[i][j]});
    }
  }

  renderContingencyTable();

  if (!window.onresize) {
    window.onresize = debounce(() => {
      renderContingencyTable();
    }, 250);
  }
}

export function renderContingencyTable() {
  if (currentData.length === 0) return;

  const container = document.querySelector("#contingency-table") as HTMLDivElement;
  container.innerHTML = "";

  const rect = container.getBoundingClientRect();
  const margin = { top: 30, right: 30, bottom: 30, left: 30 };
  const width = rect.width - margin.left - margin.right;
  const height = rect.height - margin.top - margin.bottom;

  let svg = d3.select("#contingency-table")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Get the data without -1 and "-" rows/columns
  let rawDataInner = currentRawData.slice(1, -1).map(row => row.slice(1, -1));
  let t0: string[] = ["-1"];
  let t1: string[] = [];
  for (let i = 0; i < rawDataInner.length; i++) {
    const cellsOrderedByValue = rawDataInner
      .map((r, i) => ({row: i, col: d3.maxIndex(r), value: max(r)}))
      .sort((a ,b) => {
        if (a.value === undefined || b.value === undefined) return 0;
        return b.value - a.value;
      });

    const row = cellsOrderedByValue[0].row;
    const col = cellsOrderedByValue[0].col;

    t0.push(col.toString());
    t1.push(row.toString());

    for (let c = 0; c < rawDataInner[0].length; c++) {
      rawDataInner[row][c] = -1;
    }
    for (let r = 0; r < rawDataInner[0].length; r++) {
      rawDataInner[r][col] = -1;
    }
  }
  t1.push("-1");
  t1 = t1.reverse();

  t1.push("-");
  t0.push("-");

  // let t0: string[] = [];
  // for (let i = -1; i < currentRawData[0].length - 2; i++) {
  //   t0.push(i.toString());
  // }
  // t0.push("-");
  //
  // let t1: string[] = [];
  // for (let i = -1; i < currentRawData.length - 2; i++) {
  //   t1.push(i.toString());
  // }
  // t1.push("-");
  
  let x = d3.scaleBand()
    .range([0, width])
    .domain(t0)
    .padding(0.01);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .style("stroke", "white")
    .selectAll("path, line")
    .style("stroke", "white");

  let y = d3.scaleBand()
    .range([height, 0])
    .domain(t1)
    .padding(0.01);

  svg.append("g")
    .call(d3.axisLeft(y))
    .style("stroke", "white")
    .selectAll("path, line")
    .style("stroke", "white");

  color = d3.scaleLinear<string>()
    .range(["#1F2937", "#10FF81"])
    .domain([1, 100]);

  let tooltip = d3.select("#contingency-table")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "fixed")
    .style("z-index", "9999")
    .style("pointer-events", "none");

  let mouseover = function() {
    tooltip.style("opacity", 1);
  }
  
  let mousemove = function(e: MouseEvent, d: ContingencyData) {
    const oldIdTooltip = d.oldId === "-" ? "not present" : d.oldId === "-1" ? "no cluster" : d.oldId;
    const newIdTooltip = d.newId === "-" ? "not present" : d.newId === "-1" ? "no cluster" : d.newId;

    tooltip
      .html(`Id t0: ${oldIdTooltip}<br>Id t1: ${newIdTooltip}<br>Amount: ${d.value}`)
      .style("left", (e.clientX + 50) + "px")
      .style("top", (e.clientY - 25) + "px"); 
  }
  
  let mouseleave = function() {
    tooltip.style("opacity", 0);
  }

  svg.selectAll<SVGRectElement, ContingencyData>("rect")
    .data(currentData)
    .enter()
    .append("rect")
    .attr("x", d => x(d.newId) || 0)
    .attr("y", d => y(d.oldId) || 0)
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", function(d) { return color(d.value)})
    .style("stroke", "white")
    .style("stroke-width", "0.25px")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("click", (_: MouseEvent, d: ContingencyData) => {
      svg.selectAll<SVGRectElement, ContingencyData>("rect")
        .style("fill", function(d2) {
          if (d == d2) {
            return "lime"
          } else {
            return color(d2.value)
          }
        })

      const cellEvent = new CustomEvent<ContingencyClickEvent>(CONTINGENCY_CELL_CLICK, {
        detail: {
          oldId: d.oldId,
          newId: d.newId,
          value: d.value
        },
        bubbles: true
      });
      container.dispatchEvent(cellEvent);
    });
}

export function getNewIds(oldId: string): string[] {
  return currentData.filter(d => d.oldId == oldId && d.value > 0).map(d => d.newId);
}

export function getOldIds(newId: string): string[] {
  return currentData.filter(d => d.newId == newId && d.value > 0).map(d => d.oldId);
}

export function highlightCellsOldId(oldId: string) {
  d3.select("#contingency-table svg")
    .selectAll<SVGRectElement, ContingencyData>("rect")
    .style("fill", function(d) {
      if (d.oldId == oldId && d.value > 0) {
        return "lime";
      } else {
        return color(d.value);
      }
  })
}


export function highlightCellsNewId(newId: string) {
  d3.select("#contingency-table svg")
    .selectAll<SVGRectElement, ContingencyData>("rect")
    .style("fill", function(d) {
      if (d.newId == newId && d.value > 0) {
        return "lime";
      } else {
        return color(d.value);
      }
  })
}
