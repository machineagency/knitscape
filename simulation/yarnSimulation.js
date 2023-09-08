import { ProcessModel } from "./ProcessModel";
import { Pattern } from "./Pattern";
import { YarnModel } from "./YarnModel";
import { yarnLinkForce } from "./YarnForce";
import * as d3 from "d3";

// Number of iterations for relaxation
const ITERATIONS = 2;

// Number of stitches to add to the left and right of the pattern
// (need to do this because tuck / slip stitches can't be on the
// end of the row)
const X_PADDING = 1;

// Number of rows to add to the top and bottom of the pattern
// (will be drawn in a different transparent color)
const Y_PADDING = 4;

// Distance vertically between CNs
const STITCH_HEIGHT = 12;

// Distance horizontally between CNs (will be half of the stitch width)
const HALF_STITCH_WIDTH = 12;

const SPREAD = 0.9;
const LINK_STRENGTH = 0.15;

const YARN_WIDTH = 6;

// The target link distance when the simulation is run
const H_SHRINK = 1;
const V_DIST = 8;

export function simulate(pattern, yarnChanges, needles, color) {
  let rightSide = true;
  let relaxed = false;

  let needleArr = Array.from(
    Array(pattern.width),
    (val, index) => needles[index % needles.length]
  ).toReversed();

  for (let i = 0; i < X_PADDING; i++) {
    needleArr.unshift(0);
    needleArr.push(0);
  }

  const pat = new Pattern(pattern.pad(X_PADDING, Y_PADDING, 0), needleArr);

  const testModel = new ProcessModel(pat);
  const yarnGraph = new YarnModel(testModel.cn);

  const svg = d3.select("#simulation");
  svg.attr(
    "viewBox",
    `-10 -10 ${HALF_STITCH_WIDTH * (needleArr.length + 1) * 2} ${
      STITCH_HEIGHT * (pat.height + 2)
    }`
  );

  const yarns = yarnChanges.toReversed();

  function yarnColor(rowNum) {
    if (rowNum < Y_PADDING || rowNum >= pat.height - Y_PADDING)
      return "#00000055";
    return color[yarns[(rowNum - Y_PADDING) % yarns.length]];
  }

  function layoutNodes(yarnGraph) {
    // calculates the x,y values for the i,j

    let offsetArr = Array.from(
      Array(yarnGraph.width),
      (val, index) => index * HALF_STITCH_WIDTH
    );

    let needlesSeen = 0;
    // for each needle in the needle array
    for (let needle = 0; needle < needleArr.length; needle++) {
      // if the needle is out of work
      if (needleArr[needle] == 1) {
        // add a full stitch width to all offsets
        for (
          let offsetIndex = needlesSeen * 2;
          offsetIndex < yarnGraph.width;
          offsetIndex++
        ) {
          offsetArr[offsetIndex] += 2 * HALF_STITCH_WIDTH;
        }
      } else {
        needlesSeen++;
      }
    }

    yarnGraph.contactNodes.forEach((node, index) => {
      const i = index % yarnGraph.width;
      const j = (index - i) / yarnGraph.width;
      node.i = i;
      node.j = j;
      // node.x = OFFSET_X + i * HALF_STITCH_WIDTH;
      node.x = offsetArr[i];

      node.y = (yarnGraph.height - j) * STITCH_HEIGHT;
    });

    return yarnGraph.contactNodes;
  }

  // Data for simulation

  const nodes = layoutNodes(yarnGraph);
  const yarnPath = yarnGraph.makeNice();
  const yarnPathLinks = yarnGraph.yarnPathToLinks();

  const yarnsBehind = svg.append("g");
  const yarnsMid = svg.append("g");
  const yarnsFront = svg.append("g");

  function calcLayer(link) {
    if (nodes[link.source].st == "K" && nodes[link.target].st == "K") {
      if (link.linkType == "LHLL" || link.linkType == "FLFH") return "front";
      else return "back";
    } else if (nodes[link.source].st == "P" && nodes[link.target].st == "P") {
      if (link.linkType == "LHLL" || link.linkType == "FLFH") return "back";
      else return "front";
    } else return "mid";
  }

  const backYarns = yarnsBehind
    .attr("stroke-width", YARN_WIDTH)
    .attr("stroke-linecap", "round")
    .selectAll()
    .data(yarnPathLinks)
    .join("path")
    .filter((d) => calcLayer(d) == "back")
    .attr("data-link", (d) => d.linkType)
    .attr("fill", "none")
    .attr("stroke", (d) => yarnColor(d.row));

  const midYarns = yarnsMid
    .attr("filter", "brightness(0.9)")
    .attr("stroke-width", YARN_WIDTH)
    .attr("stroke-linecap", "round")
    .selectAll()
    .data(yarnPathLinks)
    .join("path")
    .filter((d) => calcLayer(d) == "mid")
    .attr("data-link", (d) => d.linkType)
    .attr("fill", "none")
    .attr("stroke", (d) => yarnColor(d.row));

  const frontYarns = yarnsFront
    .attr("stroke-width", YARN_WIDTH)
    .attr("stroke-linecap", "round")
    .selectAll()
    .data(yarnPathLinks)
    .join("path")
    .filter((d) => calcLayer(d) == "front")
    .attr("data-link", (d) => d.linkType)
    .attr("fill", "none")
    .attr("stroke", (d) => yarnColor(d.row));

  function unitNormal(prev, next, flip) {
    if (prev.index === next.index) return [0, 0];
    const x = prev.x - next.x;
    const y = prev.y - next.y;

    const mag = SPREAD * Math.sqrt(x ** 2 + y ** 2);

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
    .x((d) => nodes[d.cnIndex].x + (YARN_WIDTH / 2) * d.normal[0])
    .y((d) => nodes[d.cnIndex].y + (YARN_WIDTH / 2) * d.normal[1])
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
    midYarns.attr("d", yarnCurve);
    backYarns.attr("d", yarnCurve);
  }

  draw();
  viewRightSide();

  function clear() {
    svg.selectAll("*").remove();
  }

  function relax() {
    if (relaxed) return;
    d3.forceSimulation(nodes)
      .force(
        "link",
        yarnLinkForce(yarnPathLinks)
          .strength(LINK_STRENGTH)
          .iterations(ITERATIONS)
          .distance((l) => {
            if (l.linkType == "FLFH" || l.linkType == "LHLL") return V_DIST;
            return Math.abs(l.source.x - l.target.x) * H_SHRINK;
          })
      )

      .on("tick", draw);
    relaxed = true;
  }

  function viewRightSide() {
    yarnsMid.raise();
    yarnsFront.raise();
    yarnsBehind.attr("filter", "brightness(0.7)");
    yarnsFront.attr("filter", "none");
    svg.attr("transform", "scale(-1,1)");
  }

  function viewWrongSide() {
    yarnsMid.raise();
    yarnsBehind.raise();
    yarnsFront.attr("filter", "brightness(0.7)");
    yarnsBehind.attr("filter", "none");

    svg.attr("transform", null);
  }

  function flip() {
    // Reorders the front and back yarn groups and re-applies the filter
    rightSide = !rightSide;
    rightSide ? viewRightSide() : viewWrongSide();
  }
  return { clear, relax, flip };
}
