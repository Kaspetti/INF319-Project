import * as d3 from "d3";


interface ContingencyData {
  oldId: string;
  newId: string;
  value: number;
}


export async function getContingencyTable() {
  const rawData = await pywebview.api.get_contingency_table("2024101900", 0);

  let data: ContingencyData[] = []
  for (let i = 0; i < rawData.length; i++) {
    for (let j = 0; j < rawData[0].length; j++) { 
      const oldId = i < rawData.length - 1 ? (i-1).toString() : "-";
      const newId = j < rawData[0].length - 1 ? (j-1).toString() : "-";

      data.push({oldId: oldId, newId: newId, value: rawData[i][j]});
    }
  }

  const container = document.querySelector("#contingency-table") as HTMLDivElement;
  const rect = container.getBoundingClientRect();
  const margin = { top: 30, right: 30, bottom: 30, left: 30 };
  const width = rect.width - margin.left - margin.right;
  const height = rect.height - margin.top - margin.bottom;

  let svg = d3.select("#contingency-table")
  .append("svg")
  .attr("width", "100%")
  .attr("viewBox", [0, 0, width, height])
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

  let t0: string[] = [];
  for (let i = -1; i < rawData[0].length - 2; i++) {
    t0.push(i.toString());
  }
  t0.push("-")

  let t1: string[] = [];
  for (let i = -1; i < rawData.length - 2; i++) {
    t1.push(i.toString());
  }
  t1.push("-")

  let x = d3.scaleBand()
    .range([ 0, width ])
    .domain(t0)
    .padding(0.01);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .style("stroke", "white")
    .selectAll("path, line")
    .style("stroke", "white");

  let y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(t1)
    .padding(0.01);

  svg.append("g")
    .call(d3.axisLeft(y))
    .style("stroke", "white")
    .selectAll("path, line")
    .style("stroke", "white");

  var color = d3.scaleLinear<string>()
    .range(["yellow", "red"])
    .domain([1,100]);

  let tooltip = d3.select("#contingency-table")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute");

  let mouseover = function() {
    tooltip.style("opacity", 1)
  }
  let mousemove = function(e: MouseEvent, d: ContingencyData) {
    tooltip
      .html("The exact value of<br>this cell is: " + d.value)
      .style("left", (d3.pointer(e)[0]+70) + "px")
      .style("top", (d3.pointer(e)[1]) + "px")
  }
  let mouseleave = function() {
    tooltip.style("opacity", 0)
  }

  svg.selectAll<SVGRectElement, ContingencyData>("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.newId) || 0)
    .attr("y", d => y(d.oldId) || 0)
    .attr("width", x.bandwidth() )
    .attr("height", y.bandwidth() )
    .style("fill", function(d) { return color(d.value)} )
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
}
