import { ProcessModel } from "./ProcessModel";
import { Pattern } from "./Pattern";
import { YarnModel } from "./YarnModel";
import * as d3 from "d3";

// const pWidth = 20;
// const pHeight = 20;

// const TEST = ["K", "K", "K", "K"];
// const TEST2 = ["K", "K", "K", "K", "K", "M", "M", "K", "K", "K", "K", "K"];
// const TEST3 = Array(pWidth * pHeight).fill("K");

// const pat = [
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["T", "K", "K", "T", "T", "K", "K", "T", "T", "K", "K", "T"],
//   ["T", "K", "K", "T", "T", "K", "K", "T", "T", "K", "K", "T"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "T", "T", "K", "K", "T", "T", "K", "K", "T", "T", "K"],
//   ["K", "T", "T", "K", "K", "T", "T", "K", "K", "T", "T", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["T", "K", "K", "T", "T", "K", "K", "T", "T", "K", "K", "T"],
//   ["T", "K", "K", "T", "T", "K", "K", "T", "T", "K", "K", "T"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "T", "T", "K", "K", "T", "T", "K", "K", "T", "T", "K"],
//   ["K", "T", "T", "K", "K", "T", "T", "K", "K", "T", "T", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["T", "K", "K", "T", "T", "K", "K", "T", "T", "K", "K", "T"],
//   ["T", "K", "K", "T", "T", "K", "K", "T", "T", "K", "K", "T"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "T", "T", "K", "K", "T", "T", "K", "K", "T", "T", "K"],
//   ["K", "T", "T", "K", "K", "T", "T", "K", "K", "T", "T", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["T", "K", "K", "T", "T", "K", "K", "T", "T", "K", "K", "T"],
//   ["T", "K", "K", "T", "T", "K", "K", "T", "T", "K", "K", "T"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "T", "T", "K", "K", "T", "T", "K", "K", "T", "T", "K"],
//   ["K", "T", "T", "K", "K", "T", "T", "K", "K", "T", "T", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
// ];

// const slipPat = [
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "K", "K", "K", "K", "M", "M", "K", "K", "K", "K", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
//   ["K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K", "K"],
// ];

const triangle = [
  ["K", "K", "K", "K", "K", "K", "K"],
  ["K", "K", "K", "T", "K", "K", "K"],
  ["K", "K", "T", "T", "T", "K", "K"],
  ["K", "T", "T", "T", "T", "T", "K"],
  ["K", "K", "K", "K", "K", "K", "K"],
  ["K", "K", "K", "K", "K", "K", "K"],
];

// const testPat = [];
// pat.forEach((pat) => {
//   testPat.push(pat);
//   testPat.push(pat);
// });

// const testPattern = new Pattern(testPat.flat(), 24);

// const testModel = new ProcessModel(testPattern);
// const yarnGraph = new YarnModel(testModel.cn);

export function runSimulation(PARAMS, pattern, mainColor, contrastColor) {
  // const testPattern = new Pattern(triangle.flat(), 7);
  const testPattern = new Pattern(pattern);
  const testModel = new ProcessModel(testPattern);
  const yarnGraph = new YarnModel(testModel.cn);

  // console.log(nodes);
  // console.log(yarnPath);
  // console.log(yarnPathLinks);

  // D3 Simulation begins here
  // const color = d3.scaleOrdinal(d3.schemeCategory10);

  const color = [mainColor, contrastColor];

  const svg = d3
    .select(".simcontainer")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

  function layoutNodes(yarnGraph) {
    // calculates the x,y pixel values for the i,j nodes based on current window size
    var bbox = d3.select(".simcontainer").node().getBoundingClientRect();

    const w = bbox.width;
    const h = bbox.height;

    // const dist =
    //   0.8 * Math.min(w / (yarnGraph.width - 1), h / (yarnGraph.height - 1));
    const dist = PARAMS.vDist;

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
  const yarnPath = yarnGraph.makeNice();
  const yarnPathLinks = yarnGraph.yarnPathToLinks();

  const yarnsBehind = svg.append("g").attr("class", "yarns-behind");
  const yarnsFront = svg.append("g").attr("class", "yarns");

  const backYarns = yarnsBehind
    .attr("filter", "brightness(0.7)")
    .attr("stroke-width", PARAMS.yarnWidth)
    .attr("stroke-linecap", "round")
    .selectAll()
    .data(yarnPathLinks)
    .join("path")
    .filter(function (d) {
      return !(d.linkType == "FLFH" || d.linkType == "LHLL");
    })

    .attr("fill", "none")
    .attr("stroke", (d) => color[d.row % 4 < 2 ? 0 : 1]);

  const frontYarns = yarnsFront
    // .attr("class", "shadow")
    .attr("stroke-width", PARAMS.yarnWidth)
    .attr("stroke-linecap", "round")
    .selectAll()
    .data(yarnPathLinks)
    .join("path")
    .filter(function (d) {
      return d.linkType == "FLFH" || d.linkType == "LHLL";
    })
    .attr("fill", "none")
    .attr("stroke", (d) => color[d.row % 4 < 2 ? 0 : 1]);

  // backYarns.call(
  //   d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
  // );

  // frontYarns.call(
  //   d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
  // );

  function unitNormal(prev, next, flip) {
    if (prev.index === next.index) return [0, 0];
    const x = prev.x - next.x;
    const y = prev.y - next.y;

    const mag = Math.sqrt(x ** 2 + y ** 2);
    if (flip) {
      return [-y / mag, x / mag];
    } else {
      return [y / mag, -x / mag];
    }
  }

  function updateNormals() {
    yarnPath[0].normal = unitNormal(
      nodes[yarnPath[0].cnIndex],
      nodes[yarnPath[1].cnIndex],
      true
    );
    for (let index = 1; index < yarnPath.length - 1; index++) {
      yarnPath[index].normal = unitNormal(
        nodes[yarnPath[index - 1].cnIndex],
        nodes[yarnPath[index + 1].cnIndex],
        yarnPath[index].j % 2 != 0
      );
    }

    yarnPath.at(-1).normal = unitNormal(
      nodes[yarnPath.at(-2).cnIndex],
      nodes[yarnPath.at(-1).cnIndex],
      true
    );
  }

  const openYarnCurve = d3
    .line()
    .x((d) => nodes[d.cnIndex].x + (PARAMS.yarnWidth / 2) * d.normal[0])
    .y((d) => nodes[d.cnIndex].y + (PARAMS.yarnWidth / 2) * d.normal[1])
    .curve(d3.curveCatmullRomOpen);

  function yarnCurve(yarnLink) {
    const index = yarnLink.index;

    if (index == 0 || index > yarnPathLinks.length - 3) {
      // if is the first or last link, just draw a line
      return `M ${yarnLink.source.x} ${yarnLink.source.y} ${yarnLink.target.x} ${yarnLink.target.y}`;
    }

    const linkData = [
      yarnPath[index - 1],
      yarnPath[index],
      yarnPath[index + 1],
      yarnPath[index + 2],
    ];

    return openYarnCurve(linkData);
  }

  function ticked() {
    updateNormals();
    frontYarns.attr("d", yarnCurve);
    backYarns.attr("d", yarnCurve);
  }

  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.9).restart();
    event.subject.source.fx = event.subject.source.x;
    event.subject.source.fy = event.subject.source.y;
    event.subject.target.fx = event.subject.target.x;
    event.subject.target.fy = event.subject.target.y;
  }

  function dragged(event) {
    event.subject.source.fx += event.dx;
    event.subject.source.fy += event.dy;
    event.subject.target.fx += event.dx;
    event.subject.target.fy += event.dy;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.source.fx = null;
    event.subject.source.fy = null;
    event.subject.target.fx = null;
    event.subject.target.fy = null;
  }

  const simulation = d3
    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-40).distanceMax(40))
    .force(
      "link",
      d3
        .forceLink(yarnPathLinks)
        .strength(2)
        .distance((l) =>
          l.linkType == "LLFL" || l.linkType == "FHLH"
            ? PARAMS.hDist
            : PARAMS.vDist
        )
        .iterations(2)
    )

    .on("tick", ticked);

  function endSimulation() {
    simulation.stop();
    frontYarns.on("mousedown.drag", null);
    backYarns.on("mousedown.drag", null);
    svg.remove();
  }
  return endSimulation;
}
