import { Pattern } from "./Pattern";
import { yarnLinkForce } from "./YarnForce";
import * as d3 from "d3";
import { Vec2D } from "./Vec2D";
import { GLOBAL_STATE } from "../state";
import { yarnSpline } from "./yarnSpline";
import { yarnSim } from "./yarnSim";

import {
  populateDS,
  followTheYarn,
  layoutNodes,
  yarnPathToLinks,
} from "./topology";

// Number of rows to add to the top and bottom of the pattern
// (will be drawn in a different transparent color)
const Y_PADDING = 0;

const STITCH_RATIO = 5 / 3; // Row height / stitch width
const YARN_RATIO = 0.24;

const SPREAD = 0.88;

// Sim constants
const ALPHA_DECAY = 0.05;
const ALPHA_MIN = 0.2;
const ITERATIONS = 1;
const LINK_STRENGTH = 0.2;

// The target link distance when the simulation is run
const HEIGHT_SHRINK = 0.7;

const dpi = devicePixelRatio;

export function simulate(pattern, yarnSequence, palette, scale) {
  let relaxed = false;
  let stitchHeight, stitchWidth, sim;
  let yarnSet = new Set(yarnSequence);
  let yarnPalette = { ...palette, border: "#00000033" };
  performance.clearMeasures();
  performance.mark("start");

  function yarnWidth() {
    return stitchWidth * GLOBAL_STATE.yarnWidth;
  }

  function unitNormal(prev, next, flip) {
    const x = prev.pos.x - next.pos.x;
    const y = prev.pos.y - next.pos.y;

    const mag = SPREAD * Math.sqrt(x ** 2 + y ** 2);

    if (mag == 0) return [0, 0];

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

  function sortSegments() {
    const sortedSegments = {
      front: { border: [] },
      back: { border: [] },
      mid: { border: [] },
    };

    for (const color of yarnSet) {
      sortedSegments.front[color] = [];
      sortedSegments.back[color] = [];
      sortedSegments.mid[color] = [];
    }

    return sortedSegments;
  }

  ///////////////////////
  // SPLINE STUFF
  ///////////////////////

  function calculateSplineControlPoints() {
    yarnPath.forEach((controlPoint) => {
      // console.log(controlPoint.normal[1]);
      controlPoint.pt = new Vec2D(
        nodes[controlPoint.cnIndex].pos.x +
          (yarnWidth() / 2) * controlPoint.normal[0],
        nodes[controlPoint.cnIndex].pos.y +
          (yarnWidth() / 2) * controlPoint.normal[1]
      );
    });
  }

  function segmentPath({ p0, p1, p2, p3 }) {
    return `M ${p0.x} ${p0.y} C${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`;
  }

  function calculateSegmentControlPoints() {
    yarnSegments.forEach((segment, index) => {
      if (index == 0 || index > yarnSegments.length - 3) return;

      segment.ctrlPts = yarnSpline(
        yarnPath[index - 1].pt,
        yarnPath[index].pt,
        yarnPath[index + 1].pt,
        yarnPath[index + 2].pt
      );
    });
  }

  ///////////////////////
  // YARN COLOR
  ///////////////////////

  function yarnColor(rowNum) {
    if (rowNum < Y_PADDING || rowNum >= stitchPattern.height - Y_PADDING)
      return "border"; // show border rows as transparent black
    return yarnSequence[(rowNum - Y_PADDING) % yarnSequence.length];
  }

  ///////////////////////
  // DRAW
  ///////////////////////
  function drawSegmentsToLayer(context, layer) {
    context.lineWidth = yarnWidth();

    Object.entries(layer).forEach(([colorIndex, paths]) => {
      // console.log(paths);
      context.strokeStyle = yarnPalette[colorIndex];
      context.stroke(new Path2D(paths.join()));
    });
  }

  // function draw() {
  //   frontCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  //   midCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  //   backCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  //   updateNormals();

  //   const layers = sortSegments();

  //   yarnSegments.forEach((link, index) => {
  //     if (index == 0 || index > yarnSegments.length - 3) return;
  //     const colorIndex = yarnColor(link.row);
  //     layers[link.layer][colorIndex].push(yarnCurve(link, index));
  //   });

  //   drawSegmentsToLayer(backCtx, layers.back);
  //   drawSegmentsToLayer(frontCtx, layers.front);
  //   drawSegmentsToLayer(midCtx, layers.mid);
  // }

  function relax() {
    if (relaxed) return;
    sim = d3
      .forceSimulation(nodes)
      .alphaMin(ALPHA_MIN)
      .alphaDecay(ALPHA_DECAY)
      .force(
        "link",
        yarnLinkForce(yarnSegments)
          .strength(LINK_STRENGTH)
          .iterations(ITERATIONS)
          .distance((l) => {
            if (l.linkType == "FLFH" || l.linkType == "LHLL")
              return stitchHeight * HEIGHT_SHRINK;
            return Math.abs(l.source.pos.x - l.target.pos.x);
          })
      )

      .on("tick", drawYarns);
    relaxed = true;
  }

  function stopSim() {
    if (sim) sim.stop();
  }

  ///////////////////////
  // INIT CANVASES
  ///////////////////////

  const bbox = document.getElementById("sim-container").getBoundingClientRect();

  const width = bbox.width * scale;
  const height = bbox.height * scale;
  const canvasWidth = dpi * width;
  const canvasHeight = dpi * height;

  function clear() {
    [frontCtx, backCtx, midCtx].forEach((ctx) => {
      ctx.save();
      ctx.resetTransform();
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.restore();
      ctx.lineWidth = yarnWidth();
    });
  }

  function drawYarns() {
    clear();
    const yarnSet = new Set(GLOBAL_STATE.yarnSequence.pixels);
    const layers = sortSegments(yarnSet);

    yarnSegments.forEach((segment, index) => {
      if (index == 0 || index > yarnSegments.length - 3) return;
      const colorIndex = yarnColor(segment.row);
      layers[segment.layer][colorIndex].push(segmentPath(segment.ctrlPts));
    });

    drawSegmentsToLayer(backCtx, layers.back);
    drawSegmentsToLayer(frontCtx, layers.front);
    drawSegmentsToLayer(midCtx, layers.mid);
  }

  function update() {
    updateNormals();
    calculateSplineControlPoints();
    calculateSegmentControlPoints();
    drawYarns();
  }

  function getCanvases(canvasIDs) {
    return canvasIDs.map((canvasID) => {
      let canvas = document.getElementById(canvasID);
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.cssText = `width: ${width}px; height: ${height}px;`;
      return canvas;
    });
  }

  let [backCanvas, midCanvas, frontCanvas] = getCanvases([
    "back",
    "mid",
    "front",
  ]);

  const backCtx = backCanvas.getContext("2d");
  const midCtx = midCanvas.getContext("2d");
  const frontCtx = frontCanvas.getContext("2d");

  ///////////////////////
  // INIT PATTERN
  ///////////////////////

  const stitchPattern = new Pattern(pattern);

  function init() {
    // calculates the x,y values for the i,j

    stitchWidth = Math.min(
      (canvasWidth * 0.9) / stitchPattern.width,
      ((canvasHeight * 0.9) / stitchPattern.height) * STITCH_RATIO
    );

    stitchHeight = stitchWidth / STITCH_RATIO;
  }

  function yarnPathLayout(yp, DS) {
    return yp.map(([i, j, stitchRow, headOrLeg]) => {
      // [flat CN index, stitchrow, headOrLeg, angle]
      return {
        cnIndex: j * DS.width + i,
        i: i,
        j: j,
        row: stitchRow,
        cnType: headOrLeg,
        angle: null,
        normal: [0, 0],
      };
    });
  }
  init();

  const DS = populateDS(stitchPattern);
  const initialYarnPath = followTheYarn(DS, stitchPattern);
  const nodes = layoutNodes(DS, stitchWidth);
  const yarnSegments = yarnPathToLinks(DS, initialYarnPath, nodes, 50);
  const yarnPath = yarnPathLayout(initialYarnPath, DS);

  // console.log(nodes);

  update();

  return { relax, stopSim };
}
