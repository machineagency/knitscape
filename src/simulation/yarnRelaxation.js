import { ProcessModel } from "./ProcessModel";
import { Pattern } from "./Pattern";
import { YarnModel } from "./YarnModel";
import { yarnLinkForce } from "./YarnForce";
import * as d3 from "d3";

import { GLOBAL_STATE } from "../state";
import { yarnSpline } from "./yarnSpline";
import { Vec2D } from "./Vec2D";

// Number of stitches to add to the left and right of the pattern
// (need to do this because tuck / slip stitches can't be on the
// end of the row)
const X_PADDING = 1;

// Number of rows to add to the top and bottom of the pattern
// (will be drawn in a different transparent color)
const Y_PADDING = 3;

// The target link distance when the simulation is run
const HEIGHT_SHRINK = 0.7;

const dpi = devicePixelRatio;

function sortSegments(yarnSet) {
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

export function simulate(pattern) {
  let relaxed = false;
  let currScale,
    currPan,
    currFlip = null;
  let stitchHeight, stitchWidth, sim;

  function yarnWidth() {
    return stitchWidth * GLOBAL_STATE.yarnWidth;
  }

  function yarnPalette() {
    return { ...GLOBAL_STATE.yarnPalette, border: "#00000033" };
  }

  ///////////////////////
  // INITIALIZE NODES
  ///////////////////////

  function layoutNodes(yarnGraph) {
    // calculates the x,y values for the i,j

    stitchWidth = Math.min(
      (canvasWidth * 0.9) / stitchPattern.width,
      ((canvasHeight * 0.9) / stitchPattern.height) * GLOBAL_STATE.stitchRatio
    );

    const halfStitch = stitchWidth / 2;
    stitchHeight = stitchWidth / GLOBAL_STATE.stitchRatio;

    const offsetX =
      (canvasWidth - stitchPattern.width * stitchWidth) / 2 + 2 * yarnWidth();
    const offsetY =
      (canvasHeight - (stitchPattern.height + 2) * stitchHeight) / 2;

    yarnGraph.contactNodes.forEach((node, index) => {
      const i = index % yarnGraph.width;
      const j = (index - i) / yarnGraph.width;
      node.i = i;
      node.j = j;
      node.x = offsetX + i * halfStitch;
      node.y = offsetY + (yarnGraph.height - j) * stitchHeight;
    });

    return yarnGraph.contactNodes;
  }

  function unitNormal(prev, next, flip) {
    if (prev.index === next.index) return [0, 0];
    const x = prev.x - next.x;
    const y = prev.y - next.y;

    const mag = GLOBAL_STATE.yarnSpread * Math.sqrt(x ** 2 + y ** 2);

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

  function segmentPath({ p0, p1, p2, p3 }) {
    return `M ${p0.x} ${p0.y} C${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`;
  }

  function calculateSplineControlPoints() {
    yarnPath.forEach((controlPoint) => {
      controlPoint.pt = new Vec2D(
        nodes[controlPoint.cnIndex].x +
          (yarnWidth() / 2) * controlPoint.normal[0],
        nodes[controlPoint.cnIndex].y +
          (yarnWidth() / 2) * controlPoint.normal[1]
      );
    });
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
    return GLOBAL_STATE.yarnSequence.pixels[
      (rowNum - Y_PADDING) % GLOBAL_STATE.yarnSequence.pixels.length
    ];
  }

  ///////////////////////
  // DRAW
  ///////////////////////
  function drawSegmentsToLayer(context, layer) {
    context.lineWidth = yarnWidth();

    Object.entries(layer).forEach(([colorIndex, paths]) => {
      context.strokeStyle = yarnPalette()[colorIndex];
      context.stroke(new Path2D(paths.join()));
    });
  }

  function setTransform() {
    if (
      currScale == GLOBAL_STATE.simScale &&
      currPan == GLOBAL_STATE.simPan &&
      currFlip == GLOBAL_STATE.flipped
    )
      return;

    let scale = GLOBAL_STATE.simScale;
    let pan = GLOBAL_STATE.simPan;

    frontCtx.resetTransform();
    midCtx.resetTransform();
    backCtx.resetTransform();

    if (GLOBAL_STATE.flipped) {
      frontCtx.translate((width / 2) * scale, 0);
      midCtx.translate((width / 2) * scale, 0);
      backCtx.translate((width / 2) * scale, 0);

      frontCtx.scale(-1, 1);
      midCtx.scale(-1, 1);
      backCtx.scale(-1, 1);

      frontCtx.translate((-width / 2) * scale - pan.x, pan.y);
      midCtx.translate((-width / 2) * scale - pan.x, pan.y);
      backCtx.translate((-width / 2) * scale - pan.x, pan.y);
    } else {
      frontCtx.translate(pan.x, pan.y);
      midCtx.translate(pan.x, pan.y);
      backCtx.translate(pan.x, pan.y);
    }

    frontCtx.scale(scale, scale);
    midCtx.scale(scale, scale);
    backCtx.scale(scale, scale);

    currScale = scale;
    currPan = pan;
    currFlip = GLOBAL_STATE.flipped;
    drawYarns();
  }

  function clear() {
    [frontCtx, backCtx, midCtx].forEach((ctx) => {
      ctx.save();
      ctx.resetTransform();
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.restore();
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

  function relax() {
    if (relaxed) return;
    sim = d3
      .forceSimulation(nodes)
      .force(
        "link",
        yarnLinkForce(yarnSegments)
          .strength(GLOBAL_STATE.linkStrength)
          .iterations(GLOBAL_STATE.iterations)
          .distance((l) => {
            if (l.linkType == "FLFH" || l.linkType == "LHLL")
              return stitchHeight * HEIGHT_SHRINK;
            return Math.abs(l.source.x - l.target.x);
          })
      )

      .on("tick", update);
    relaxed = true;
  }

  function stopSim() {
    if (sim) sim.stop();
  }

  ///////////////////////
  // INIT PATTERN
  ///////////////////////

  const stitchPattern = new Pattern(pattern.pad(X_PADDING, Y_PADDING, 0));

  ///////////////////////
  // INIT CANVASES
  ///////////////////////

  const bbox = document.getElementById("sim-container").getBoundingClientRect();

  const width = bbox.width;
  const height = bbox.height;
  const canvasWidth = dpi * width;
  const canvasHeight = dpi * height;

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
  // BUILD SIMULATION DATA
  ///////////////////////

  const testModel = new ProcessModel(stitchPattern);

  const yarnGraph = new YarnModel(testModel.cn);

  const nodes = layoutNodes(yarnGraph);

  const yarnPath = yarnGraph.makeNice();

  const yarnSegments = yarnGraph.yarnPathToLinks();

  update();
  setTransform();

  return { relax, stopSim, update, setTransform };
}
