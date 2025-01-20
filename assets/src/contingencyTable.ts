import * as d3 from "d3";
import { debounce } from 'lodash';

interface ContingencyData {
  oldId: string;
  newId: string;
  value: number;
}

let currentData: ContingencyData[] = [];
let currentRawData: number[][] = [];

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

function renderContingencyTable() {
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

  let t0: string[] = [];
  for (let i = -1; i < currentRawData[0].length - 2; i++) {
    t0.push(i.toString());
  }
  t0.push("-");

  let t1: string[] = [];
  for (let i = -1; i < currentRawData.length - 2; i++) {
    t1.push(i.toString());
  }
  t1.push("-");

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

  var color = d3.scaleLinear<string>()
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
    .on("mouseleave", mouseleave);
}
