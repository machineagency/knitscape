import { ProcessModel } from "./ProcessModel";
import { Pattern } from "../pattern/pattern";
import { YarnModel } from "./YarnModel";
import * as d3 from "d3";

// Draws the yarn path through the contact neighborhoods

const PARAMS = {
  linkWidth: 7,
};

const pWidth = 4;
const pHeight = 10;

const ROW1 = ["K", "K", "K", "K"];
const ROW2 = ["K", "K", "K", "K", "K", "T", "T", "K"];
const ROW3 = ["K", "K", "K", "K", "K", "T", "T", "K", "K", "T", "K", "K"];
const ROW4 = [
  "K",
  "K",
  "K",
  "K",
  "K",
  "T",
  "T",
  "K",
  "K",
  "T",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
  "K",
];

const TEST3 = Array(pWidth * pHeight).fill("K");

const testPattern = new Pattern(ROW4, pWidth);
const testModel = new ProcessModel(testPattern);
const yarnGraph = new YarnModel(testModel.cn);

function layoutNodes(yarnGraph) {
  // calculates the x,y pixel values for the i,j nodes based on current window size
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dist =
    0.8 * Math.min(w / (yarnGraph.width - 1), h / (yarnGraph.height - 1));
  yarnGraph.width;
  yarnGraph.contactNodes.forEach((node, index) => {
    const i = index % yarnGraph.width;
    const j = (index - i) / yarnGraph.width;
    node.i = i;
    node.j = j;

    node.x = w / 2 - (dist * (yarnGraph.width - 1)) / 2 + i * dist;
    node.y = h / 2 + (dist * (yarnGraph.height - 1)) / 2 - j * dist;
  });

  return yarnGraph.contactNodes;
}

// Data for simulation
const nodes = layoutNodes(yarnGraph);
const links = yarnGraph.yarnPathToLinks();
const ops = testPattern.makeOpData();

function stitchX(stitch) {
  const inds = stitch.cnIndices;
  return (
    inds.reduce((sum, vertexID) => sum + nodes[vertexID].x, 0) / inds.length
  );
}

function stitchY(stitch) {
  const inds = stitch.cnIndices;
  return (
    inds.reduce((sum, vertexID) => sum + nodes[vertexID].y, 0) / inds.length
  );
}

const opColors = d3.scaleOrdinal(d3.schemePastel1);

const directionColors = ["#e91e63", "#03a9f4"];
const cnColors = {
  ACN: "#000",
  PCN: "#56c34a",
  UACN: "#00f",
  ECN: "#f00",
};

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%");

svg
  .append("svg:defs")
  .selectAll("marker")
  .data(["end"])
  .enter()
  .append("svg:marker")
  .attr("id", "arrow")
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 13)
  .attr("refY", 0)
  .attr("markerWidth", 2)
  .attr("markerHeight", 2)
  .attr("orient", "auto-start-reverse")
  .append("svg:path")
  .attr("d", "M0,-5L10,0L0,5");

const operationContainer = svg.append("g").attr("class", "operations");
const yarnsBehindContainer = svg.append("g").attr("class", "yarns-behind");
const yarnsFrontContainer = svg.append("g").attr("class", "yarns-front");
const labelsContainer = svg.append("g").attr("class", "labels");
const cnNodeContainer = svg.append("g").attr("class", "contact-nodes");

const backYarns = yarnsBehindContainer
  .attr("filter", "brightness(0.7)")
  .attr("stroke-width", PARAMS.linkWidth)
  .attr("stroke-linecap", "round")
  .selectAll("line")
  .data(links)
  .join("line")
  .filter(function (d) {
    return d.linkType == "LLFL" || d.linkType == "FHLH";
  })
  .attr("x1", (d) => nodes[d.source].x)
  .attr("y1", (d) => nodes[d.source].y)
  .attr("x2", (d) => nodes[d.target].x)
  .attr("y2", (d) => nodes[d.target].y)
  .attr("marker-end", "url(#arrow)")
  .attr("stroke", (d) => directionColors[d.row % 2]);

const frontYarns = yarnsFrontContainer
  .attr("stroke-width", PARAMS.linkWidth)
  .attr("stroke-linecap", "round")
  .selectAll("line")
  .data(links)
  .join("line")
  .filter(function (d) {
    return !(d.linkType == "LLFL" || d.linkType == "FHLH");
  })
  .attr("marker-end", "url(#arrow)")
  .attr("stroke", (d) => directionColors[d.row % 2])
  .attr("x1", (d) => nodes[d.source].x)
  .attr("y1", (d) => nodes[d.source].y)
  .attr("x2", (d) => nodes[d.target].x)
  .attr("y2", (d) => nodes[d.target].y);

const cns = cnNodeContainer
  .selectAll()
  .data(nodes)
  .join("circle")
  .attr("r", PARAMS.linkWidth / 2 + 2)
  .attr("cx", (d) => d.x)
  .attr("cy", (d) => d.y)
  .attr("fill", (d) => cnColors[d.cn]);

const operations = operationContainer
  .selectAll()
  .data(ops)
  .join("polygon")
  .attr("fill", (d) => opColors(d.op))
  .attr("points", (d) =>
    d.cnIndices.reduce(
      (str, vertexID) => `${str} ${nodes[vertexID].x},${nodes[vertexID].y}`,
      ""
    )
  );

const opLabels = labelsContainer
  .attr("text-anchor", "middle")
  .attr("font-size", "24")
  .selectAll()
  .data(ops)
  .join("text")
  .text((d) => d.stitch)
  .attr("x", (d) => stitchX(d))
  .attr("y", (d) => stitchY(d))
  .attr("alignment-baseline", "middle");
