import { Pattern } from "./Pattern";
import { Vec2D } from "./Vec2D";
import { GLOBAL_STATE } from "../state";
import { yarnSpline } from "./yarnSpline";

import { yarnRelaxation } from "./relaxation";

import { populateDS, followTheYarn, yarnPathToLinks } from "./topology";

import { layoutNodes, layeredYarnSegmentData } from "./yarn3d";

const STITCH_RATIO = 5 / 3; // Row height / stitch width

const SPREAD = 0.93;

const dpi = devicePixelRatio;

export function simulate(pattern, yarnSequence, palette, scale) {
  let relaxed = false;
  let stitchHeight, stitchWidth, sim, offsetX, offsetY;
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

  ///////////////////////
  // SPLINE STUFF
  ///////////////////////

  function calculateSplineControlPoints() {
    yarnPath.forEach((controlPoint) => {
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
    return yarnSequence[rowNum % yarnSequence.length];
  }

  ///////////////////////
  // DRAW
  ///////////////////////
  function drawSegmentsToLayer(layer, layerData) {
    let ctx = layers[layer].getContext("2d");
    ctx.shadowColor = "black";
    ctx.shadowBlur = 1;
    // ctx.lineCap = "round";

    Object.entries(layerData).forEach(([colorIndex, paths]) => {
      ctx.strokeStyle = yarnPalette[colorIndex];
      paths.reverse().forEach((path) => ctx.stroke(new Path2D(path)));
      // ctx.stroke(new Path2D(paths.join()));
    });
  }

  function segments(yarnSet) {
    return Object.fromEntries(
      Object.entries(layers).map(([index, canvas]) => {
        return [index, Object.fromEntries(yarnSet.map((color) => [color, []]))];
      })
    );
  }

  function drawYarns() {
    const yarnSet = new Set(GLOBAL_STATE.yarnSequence.pixels);

    const segs = segments(Array.from(yarnSet));

    yarnSegments.forEach((segment, index) => {
      if (index == 0 || index > yarnSegments.length - 3) return;
      const colorIndex = yarnColor(segment.row);
      segs[segment.layer][colorIndex].push(segmentPath(segment.ctrlPts));
    });

    Object.entries(segs).forEach(([layer, layerData]) =>
      drawSegmentsToLayer(layer, layerData)
    );
  }

  ///////////////////////
  // INIT CANVASES
  ///////////////////////

  const parentEl = document.getElementById("canvas-container");
  const bbox = document.getElementById("sim-container").getBoundingClientRect();

  const width = bbox.width * scale;
  const height = bbox.height * scale;
  const canvasWidth = dpi * width;
  const canvasHeight = dpi * height;

  const layers = {};

  function clear() {
    Object.values(layers).forEach((canvas) => {
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.resetTransform();
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.restore();
      ctx.lineWidth = yarnWidth();
    });
  }

  function update() {
    updateNormals();
    calculateSplineControlPoints();
    calculateSegmentControlPoints();
    clear();
    drawYarns();
  }

  ///////////////////////
  // INIT PATTERN
  ///////////////////////

  const stitchPattern = new Pattern(pattern, yarnSequence);

  function init() {
    stitchWidth = Math.min(
      (canvasWidth * 0.9) / stitchPattern.width,
      ((canvasHeight * 0.9) / stitchPattern.height) * STITCH_RATIO
    );

    stitchHeight = stitchWidth / STITCH_RATIO;

    offsetX =
      yarnWidth() + (canvasWidth - stitchPattern.width * stitchWidth) / 2;
    offsetY =
      -yarnWidth() + (canvasHeight - stitchPattern.height * stitchHeight) / 2;

    const TOTAL_LAYERS = 5;
    for (const canvas of parentEl.children) {
      let layer = Number(canvas.dataset.layer);
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.cssText = `width: ${width}px; height: ${height}px; z-index: ${layer}; filter: brightness(${
        0.6 + 0.4 * (layer / (TOTAL_LAYERS - 1))
      });`;
      let ctx = canvas.getContext("2d");
      ctx.translate(offsetX, offsetY);
      layers[layer] = canvas;
    }
  }

  function yarnPathLayout(yp, DS) {
    return yp.map(([i, j, stitchRow, headOrLeg]) => {
      return {
        cnIndex: j * DS.width + i,
        i: i,
        j: j,
        row: stitchRow,
        cnType: headOrLeg,
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

  // const segmentData = layeredYarnSegmentData(
  //   stitchPattern,
  //   nodes,
  //   DS,
  //   initialYarnPath
  // );
  update();

  function simLoop() {
    if (sim && sim.running()) {
      sim.tick(yarnSegments, nodes);
      update();
      requestAnimationFrame(simLoop);
    }
  }

  function relax() {
    if (relaxed) return;

    sim = yarnRelaxation();

    simLoop();

    relaxed = true;
  }

  function stopSim() {
    if (sim) sim.stop();
  }

  return { relax, stopSim };
}
