import { GLOBAL_STATE } from "../state";
import { yarnSpline, splitYarnSpline } from "./yarnSpline";

import { yarnRelaxation } from "./relaxation";

import { populateDS, followTheYarn, orderCNs } from "./topology";
import { layoutNodes, buildSegmentData } from "./yarn3d";

const STITCH_ASPECT = 0.75; // Row height / stitch width

const SPREAD = 0.93;

const dpi = devicePixelRatio;

export function simulate(stitchPattern, scale) {
  let relaxed = false;
  let stitchHeight, stitchWidth, sim, offsetX, offsetY;

  const parentEl = document.getElementById("canvas-container");
  const bbox = document.getElementById("sim-container").getBoundingClientRect();
  const width = bbox.width * scale;
  const height = bbox.height * scale;
  const canvasWidth = dpi * width;
  const canvasHeight = dpi * height;

  const canvasLayers = [];

  init();

  const DS = populateDS(stitchPattern);
  orderCNs(DS, stitchPattern);
  const yarnPath = followTheYarn(DS, stitchPattern);
  const nodes = layoutNodes(DS, stitchWidth, STITCH_ASPECT);
  const yarnSegments = buildSegmentData(
    DS,
    yarnPath,
    nodes,
    stitchWidth,
    STITCH_ASPECT
  );

  canvasSetup(DS.maxCNStack * 6);
  update();

  function yarnWidth() {
    return stitchWidth * GLOBAL_STATE.yarnWidth;
  }

  function yarnColor(rowNum) {
    return stitchPattern.yarnSequence[
      rowNum % stitchPattern.yarnSequence.length
    ];
  }

  // CN grid position, stitch row, previous CN coords, next CN coords
  function nodeOffset([i, j], row, [x1, y1], [x2, y2]) {
    const right = row % 2 == 0;
    const isLeg = j == row;

    const x = x1 - x2;
    const y = y1 - y2;

    const mag = SPREAD * Math.sqrt(x ** 2 + y ** 2);

    if (mag == 0) {
      console.log(i, j);
      return [0, 0];
    }

    const normal = right != isLeg ? [-y / mag, x / mag] : [y / mag, -x / mag];

    const [posX, posY] = getCoords([i, j]);
    return [
      posX + (yarnWidth() / 2) * normal[0],
      posY + (yarnWidth() / 2) * normal[1],
    ];
  }

  function getCoords([i, j]) {
    return [nodes[i + j * DS.width].pos.x, nodes[i + j * DS.width].pos.y];
  }

  function splinePath([[p0x, p0y], [p1x, p1y], [p2x, p2y], [p3x, p3y]]) {
    return `M ${p0x} ${p0y} C${p1x} ${p1y} ${p2x} ${p2y} ${p3x} ${p3y}`;
  }

  function calculateSegmentControlPoints(links) {
    let p0 = [nodes[0].pos.x - stitchWidth, nodes[0].pos.y];
    let p1 = nodeOffset(
      links[0].source,
      links[0].row,
      p0,
      getCoords(links[0].target)
    );
    let p2 = nodeOffset(
      links[0].target,
      links[0].row,
      p1,
      getCoords(links[1].target)
    );

    links.forEach((segment, index) => {
      if (index > links.length - 3) return;
      let p3 = nodeOffset(
        links[index + 1].target,
        links[index].row,
        p2,
        getCoords(links[index + 2].target)
      );

      let n1 = getCoords(links[index].source);
      let n2 = getCoords(links[index].target);

      const currentLength = Math.abs(Math.hypot(n1[0] - n2[0], n1[1] - n2[1]));
      const tension = 1 - segment.restLength / currentLength;

      if (segment.layer.length == 2) {
        const splinePtsArr = splitYarnSpline(p0, p1, p2, p3, tension);
        segment.path = splinePtsArr.map((splinePts) => splinePath(splinePts));
      } else {
        const splinePts = yarnSpline(p0, p1, p2, p3, tension);
        segment.path = splinePath(splinePts);
      }
      p0 = p1;
      p1 = p2;
      p2 = p3;
    });
  }

  ///////////////////////
  // DRAW
  ///////////////////////

  function drawSegmentPathToLayer(layer, colorIndex, path) {
    if (!path) return;
    if (layer.length == 2) {
      layer.forEach((layerID, index) => {
        let ctx = canvasLayers[layerID];
        ctx.strokeStyle = GLOBAL_STATE.yarnPalette[colorIndex];
        ctx.stroke(new Path2D(path[index]));
      });
    } else {
      let ctx = canvasLayers[layer];

      // console.log(layer);
      ctx.strokeStyle = GLOBAL_STATE.yarnPalette[colorIndex];
      // ctx.lineCap = "round";

      ctx.stroke(new Path2D(path));
    }
  }

  function drawYarnSegments(segments) {
    let row;
    let currentSegment = segments.length - 1;

    while (currentSegment >= 0) {
      row = segments[currentSegment].row;
      const colorIndex = yarnColor(row);

      while (currentSegment >= 0 && segments[currentSegment].row == row) {
        const { layer, path } = segments[currentSegment];
        drawSegmentPathToLayer(layer, colorIndex, path);
        currentSegment--;
      }
    }

    // let row;
    // let currentSegment = 0;

    // while (currentSegment < segments.length) {
    //   row = segments[currentSegment].row;
    //   const colorIndex = yarnColor(row);

    //   while (
    //     currentSegment < segments.length &&
    //     segments[currentSegment].row == row
    //   ) {
    //     const { layer, path } = segments[currentSegment];
    //     drawSegmentPathToLayer(layer, colorIndex, path);
    //     currentSegment++;
    //   }
    // }
  }

  function clear() {
    canvasLayers.forEach((ctx) => {
      ctx.save();
      ctx.resetTransform();
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.restore();
    });
  }

  function update() {
    clear();
    calculateSegmentControlPoints(yarnSegments);
    drawYarnSegments(yarnSegments);
  }

  function init() {
    stitchWidth = Math.min(
      (canvasWidth * 0.9) / stitchPattern.width,
      (canvasHeight * 0.9) / stitchPattern.height / STITCH_ASPECT
    );

    stitchHeight = stitchWidth * STITCH_ASPECT;

    offsetX =
      yarnWidth() + (canvasWidth - stitchPattern.width * stitchWidth) / 2;
    offsetY =
      -yarnWidth() + (canvasHeight - stitchPattern.height * stitchHeight) / 2;
  }

  function canvasSetup(numLayers) {
    while (parentEl.firstChild) {
      parentEl.removeChild(parentEl.firstChild);
    }
    for (let layer = 0; layer < numLayers; layer++) {
      let canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      canvas.style.cssText = `width: ${width}px; height: ${height}px; z-index: ${layer}; filter: brightness(${
        0.7 + 0.4 * (layer / (numLayers - 1))
      });`;
      let ctx = canvas.getContext("2d");
      ctx.translate(offsetX, offsetY);
      ctx.lineWidth = yarnWidth();
      ctx.shadowColor = "black";
      ctx.shadowBlur = 1;
      canvasLayers.push(ctx);
      parentEl.appendChild(canvas);
    }
  }

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
