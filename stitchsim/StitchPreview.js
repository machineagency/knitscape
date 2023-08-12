import { ProcessModel } from "./ProcessModel";
import { Pattern } from "./Pattern";
import { YarnModel } from "./YarnModel";
import * as d3 from "d3";

export function renderPreview(PARAMS, pattern, mainColor, contrastColor) {
  const pat = new Pattern(pattern);
  const ops = pat.makeOpData();
  const testModel = new ProcessModel(pat);
  const yarnGraph = new YarnModel(testModel.cn);
  const opColors = d3.scaleOrdinal(d3.schemePastel1);

  const color = [mainColor, contrastColor];
  // const color = d3.quantize(
  //   d3.interpolateHcl("#f4e153", "#362142"),
  //   pat.height
  // );
  const svg = d3.select("#swatch-preview");
  const spread = 1;
  const linkStrength = 0.6;

  function layoutNodes(yarnGraph) {
    // calculates the x,y values for the i,j
    const stitchHeight = 18;
    const stitchWidth = 12;
    yarnGraph.contactNodes.forEach((node, index) => {
      const i = index % yarnGraph.width;
      const j = (index - i) / yarnGraph.width;
      node.i = i;
      node.j = j;

      node.x = 30 + i * stitchWidth;
      node.y = (yarnGraph.height - j) * stitchHeight;
    });

    return yarnGraph.contactNodes;
  }

  // Data for simulation
  const operationContainer = svg.append("g").attr("class", "operations");

  const nodes = layoutNodes(yarnGraph);
  const yarnPath = yarnGraph.makeNice();
  const yarnPathLinks = yarnGraph.yarnPathToLinks(); //.reverse();

  const yarnsBehind = svg.append("g").attr("class", "yarns-behind");
  const yarnsFront = svg.append("g").attr("class", "yarns");
  const ui = svg.append("g").attr("class", "ui");

  const backYarns = yarnsBehind
    .attr("filter", "brightness(0.7)")
    .attr("stroke-width", PARAMS.yarnWidth)
    .attr("stroke-linecap", "round")
    .selectAll()
    .data(yarnPathLinks)
    .join("path")
    .filter(function (d) {
      return !(d.linkType == "LHLL" || d.linkType == "FLFH");
    })
    .attr("data-link", (d) => d.linkType)
    .attr("fill", "none")
    .attr("stroke", (d) => color[d.row % 4 < 2 ? 0 : 1]);

  const frontYarns = yarnsFront
    .attr("stroke-width", PARAMS.yarnWidth)
    .attr("stroke-linecap", "round")
    .selectAll()
    .data(yarnPathLinks)
    .join("path")

    .filter(function (d) {
      return d.linkType == "LHLL" || d.linkType == "FLFH";
    })
    .attr("data-link", (d) => d.linkType)
    .attr("fill", "none")
    .attr("stroke", (d) => color[d.row % 4 < 2 ? 0 : 1]);

  // operationContainer
  //   .selectAll()
  //   .data(ops)
  //   .join("polygon")
  //   .attr("fill", (d) => opColors(d.op))
  //   .attr("points", (d) =>
  //     d.cnIndices.reduce(
  //       (str, vertexID) => `${str} ${nodes[vertexID].x},${nodes[vertexID].y}`,
  //       ""
  //     )
  //   )
  //   .attr("opacity", 0.2);

  function unitNormal(prev, next, flip) {
    if (prev.index === next.index) return [0, 0];
    const x = prev.x - next.x;
    const y = prev.y - next.y;

    const mag = spread * Math.sqrt(x ** 2 + y ** 2);

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
      // console.log(yarnPath[index].row);
      let flip;
      if (yarnPath[index].cnType == "FH" || yarnPath[index].cnType == "LH") {
        // headnode
        if (yarnPath[index].row % 2 == 0) {
          // moving right
          flip = true;
        } else {
          // moving left
          flip = false;
        }
      } else {
        // legnode
        if (yarnPath[index].row % 2 == 0) {
          // moving right
          flip = false;
        } else {
          // moving left
          flip = true;
        }
      }

      yarnPath[index].normal = unitNormal(
        nodes[yarnPath[index - 1].cnIndex],
        nodes[yarnPath[index + 1].cnIndex],
        flip
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

  function draw() {
    updateNormals();
    frontYarns.attr("d", yarnCurve);
    backYarns.attr("d", yarnCurve);
  }

  draw();

  function clear() {
    svg.selectAll("*").remove();
  }

  function relax() {
    d3.forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(yarnPathLinks)
          .strength(linkStrength)
          .iterations(2)
          .distance((l) =>
            l.linkType == "LLFL" || l.linkType == "FHLH"
              ? PARAMS.hDist
              : PARAMS.vDist
          )
      )

      .on("tick", draw);
  }
  return { clear, relax };
}
