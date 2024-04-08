import { GLOBAL_STATE } from "../state";
import { yarnSpline, splitYarnSpline } from "./yarnSpline";

import { yarnRelaxation } from "./relaxation";

import { populateDS, followTheYarn, orderCNs } from "./topology";
import { layoutNodes, buildSegmentData } from "./yarn3d";

export function simulate(stitchPattern, scale) {
  let relaxed = false;
  let stitchHeight, stitchWidth, sim, offsetX, offsetY;

  const STITCH_ASPECT = GLOBAL_STATE.cellAspect;

  const parentEl = document.getElementById("canvas-container");
  const bbox = document.getElementById("sim-container").getBoundingClientRect();
  const width = bbox.width * scale;
  const height = bbox.height * scale;
  const canvasWidth = devicePixelRatio * width;
  const canvasHeight = devicePixelRatio * height;

  const canvasLayers = [];

  init();

  let debug = false;
  let DS, yarnPaths, debugCtx;

  // try {
  DS = populateDS(stitchPattern);

  orderCNs(DS, stitchPattern);

  yarnPaths = followTheYarn(
    DS,
    stitchPattern.yarnSequence,
    stitchPattern.carriagePasses
  );

  // console.log(yarnPaths);
  // } catch {
  //   console.error("Error generating yarn topology");
  //   return { relax: null, stopSim: null };
  // }
  const nodes = layoutNodes(
    DS,
    GLOBAL_STATE.chart,
    GLOBAL_STATE.rowMap,
    stitchWidth,
    STITCH_ASPECT
  );

  const yarnSegments = buildSegmentData(
    DS,
    yarnPaths,
    nodes,
    stitchWidth,
    STITCH_ASPECT
  );

  const numLayers = DS.maxCNStack * 4;
  canvasSetup();
  update();

  function yarnWidth() {
    return stitchWidth * GLOBAL_STATE.yarnWidth;
  }

  function yarnColor(rowNum) {
    return stitchPattern.yarnSequence[rowNum] - 1;
  }

  // CN grid position, stitch row, previous CN coords, next CN coords
  function nodeOffset([i, j], row, [x1, y1], [x2, y2]) {
    const right = stitchPattern.carriagePasses[row] == "right";
    const isLeg = j == row;

    const x = x1 - x2;
    const y = y1 - y2;

    const mag = Math.sqrt(x ** 2 + y ** 2);

    if (mag == 0) {
      return [0, 0];
    }

    const normal = right != isLeg ? [-y / mag, x / mag] : [y / mag, -x / mag];

    const [posX, posY] = getCoords([i, j]);

    // if ((right && x1 < x2 && x2 < posX) || (!right && x1 > x2 && x2 > posX)) {
    //   // Special case which happens with the intarsia tucks
    //   // TODO: find a better fix than this?
    //   // this messes up the simulation - we really need to calculate offset direction based on the position in the cn grid?
    //   return [
    //     posX - (yarnWidth() / 2) * normal[0],
    //     posY + (yarnWidth() / 2) * normal[1],
    //   ];
    // }

    return [
      posX + (yarnWidth() / 2) * normal[0],
      posY + (yarnWidth() / 2) * normal[1],
    ];
  }

  // CN grid position, stitch row, previous CN coords, next CN coords
  function selvageOffset([i, j], row) {
    const right = stitchPattern.carriagePasses[row] == "right";

    const [posX, posY] = getCoords([i, j]);

    if (right) {
      return [posX - yarnWidth() * 0.75, posY + yarnWidth() / 3];
    } else {
      return [posX + yarnWidth() * 0.75, posY + yarnWidth() / 3];
    }
  }

  function getCoords([i, j]) {
    return [nodes[i + j * DS.width].pos.x, nodes[i + j * DS.width].pos.y];
  }

  function splinePath([[p0x, p0y], [p1x, p1y], [p2x, p2y], [p3x, p3y]]) {
    return `M ${p0x} ${p0y} C${p1x} ${p1y} ${p2x} ${p2y} ${p3x} ${p3y}`;
  }

  function calculateSegmentControlPoints(yarnSegMap) {
    Object.entries(yarnSegMap).map(([yarnIndex, segmentArr]) => {
      if (segmentArr.length == 0) {
        console.warn(`Segment array for yarn ${yarnIndex} is empty`);
        return;
      }
      let p0 = [nodes[0].pos.x - stitchWidth, nodes[0].pos.y];
      let p1 = nodeOffset(
        segmentArr[0].source,
        segmentArr[0].row,
        p0,
        getCoords(segmentArr[0].target)
      );

      let p2 = nodeOffset(
        segmentArr[0].target,
        segmentArr[0].row,
        p1,
        getCoords(segmentArr[1].target)
      );

      let row = segmentArr[0].row;

      segmentArr.forEach((segment, index) => {
        let p3;
        if (index == segmentArr.length - 1) {
          let [x, y] = getCoords(segmentArr[index].target);
          let patternRow = segmentArr[index].row;

          let xPos =
            stitchPattern.carriagePasses[patternRow] == "right"
              ? x + stitchWidth
              : x - stitchWidth;

          p3 = [xPos, y];
        } else if (index == segmentArr.length - 2) {
          let [x, y] = getCoords(segmentArr[index].target);

          p3 = nodeOffset(
            segmentArr[index + 1].target,
            segmentArr[index].row,
            p2,
            [x + stitchWidth, y]
          );
        } else {
          if (segmentArr[index + 2].row != row) {
            // Special case for the selvage
            p3 = selvageOffset(
              segmentArr[index + 1].target,
              segmentArr[index].row
            );

            row = segmentArr[index + 2].row;
          } else {
            p3 = nodeOffset(
              segmentArr[index + 1].target,
              segmentArr[index].row,
              p2,
              getCoords(segmentArr[index + 2].target)
            );
          }
        }

        let n1 = getCoords(segmentArr[index].source);
        let n2 = getCoords(segmentArr[index].target);

        const currentLength = Math.abs(
          Math.hypot(n1[0] - n2[0], n1[1] - n2[1])
        );
        const tension = (1 - segment.restLength / currentLength) * 0.5;
        // console.log(tension);
        // const tension = 0.2;
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
    });
  }

  ///////////////////////
  // DRAW
  ///////////////////////

  function drawYarnSegments(yarnSegMap) {
    // yarnSegMap is an object mapping yarns to their segment paths

    Object.entries(yarnSegMap).forEach(([yarnIndex, segments]) => {
      // For each yarn
      const pathLayers = Array.from(Array(canvasLayers.length), () => []);

      segments.toReversed().forEach(({ layer, path }) => {
        if (!path) return;
        if (layer.length == 2) {
          // Draw the path across two layers
          layer.forEach((layerID, index) => {
            let layerIndex = GLOBAL_STATE.flipped
              ? numLayers - layerID
              : layerID - 1;
            pathLayers[layerIndex].push(path[index]);
          });
        } else {
          // Path is all on one layer
          let layerIndex = GLOBAL_STATE.flipped ? numLayers - layer : layer - 1;
          pathLayers[layerIndex].push(path);
        }
      });

      pathLayers.forEach((path, layerIndex) => {
        let ctx = canvasLayers[layerIndex];
        ctx.strokeStyle = GLOBAL_STATE.yarnPalette[yarnIndex - 1];
        ctx.stroke(new Path2D(path));
      });
    });
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
      (canvasHeight * 0.9) / GLOBAL_STATE.chart.height / STITCH_ASPECT
    );

    stitchHeight = stitchWidth * STITCH_ASPECT;

    offsetX =
      yarnWidth() + (canvasWidth - stitchPattern.width * stitchWidth) / 2;
    offsetY =
      -yarnWidth() +
      (canvasHeight - GLOBAL_STATE.chart.height * stitchHeight) / 2;
  }

  function canvasSetup() {
    while (parentEl.firstChild) {
      parentEl.removeChild(parentEl.firstChild);
    }
    for (let layer = 0; layer < numLayers; layer++) {
      let canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      let l = Math.floor((numLayers - 1 - layer) / 2) % DS.maxCNStack;
      let b = 0.2 / DS.maxCNStack;

      let brightness;

      if (layer < DS.maxCNStack * 2) {
        //purl layer
        brightness = layer % 2 == 0 ? 0.6 - l * b : 0.8 - l * b;
      } else {
        //knit layer
        brightness = layer % 2 == 0 ? 0.75 - l * b : 1 - l * b;
      }

      canvas.style.cssText = `width: ${width}px; height: ${height}px; z-index: ${layer}; filter: brightness(${brightness});`;
      let ctx = canvas.getContext("2d");
      ctx.translate(offsetX, offsetY);
      ctx.lineWidth = yarnWidth();
      // ctx.shadowColor = "#444";
      // ctx.shadowBlur = 3;
      canvasLayers.push(ctx);
      parentEl.appendChild(canvas);
    }

    if (debug) {
      let debugCanvas = document.createElement("canvas");
      debugCanvas.id = "debug";
      debugCanvas.width = canvasWidth;
      debugCanvas.height = canvasHeight;
      debugCanvas.style.cssText = `width: ${width}px; height: ${height}px; z-index: ${1000};`;
      debugCtx = debugCanvas.getContext("2d");
      debugCtx.translate(offsetX, offsetY);
      parentEl.appendChild(debugCanvas);
    }

    if (GLOBAL_STATE.flipped) {
      parentEl.classList.add("mirrored");
    } else {
      parentEl.classList.remove("mirrored");
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
    sim = yarnRelaxation(GLOBAL_STATE.kYarn);
    simLoop();
    relaxed = true;
  }

  function stopSim() {
    if (sim) sim.stop();
  }

  return { relax, stopSim };
}
