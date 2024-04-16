import { GLOBAL_STATE } from "../state";
import { hexToRgb } from "../utilities/misc";
import { yarnRelaxation } from "./relaxation";

import { populateDS, followTheYarn, orderCNs } from "./topology";
import { layoutNodes, buildSegmentData } from "./yarn3d";

import { topDownRenderer } from "./renderers/topdown";
import { noodleRenderer } from "./renderers/noodle";

let renderer = noodleRenderer;

const YARN_RADIUS = 0.5;
const STITCH_WIDTH = 1;

export function simulate(stitchPattern) {
  const STITCH_ASPECT = GLOBAL_STATE.cellAspect;

  let canvas = document.getElementById("sim-canvas");
  let relaxed = false;
  let sim;

  let DS = populateDS(stitchPattern);

  orderCNs(DS, stitchPattern);

  let yarnPaths = followTheYarn(
    DS,
    stitchPattern.yarnSequence,
    stitchPattern.carriagePasses
  );

  const nodes = layoutNodes(
    DS,
    GLOBAL_STATE.chart,
    GLOBAL_STATE.rowMap,
    STITCH_WIDTH,
    STITCH_ASPECT
  );

  const yarnSegments = buildSegmentData(
    DS,
    yarnPaths,
    nodes,
    STITCH_WIDTH,
    STITCH_ASPECT
  );

  const yarnData = [];

  Object.entries(yarnSegments).forEach(([yarnIndex, segmentArr]) => {
    yarnData.push({
      segs: segmentArr,
      pts: computeSplinePoints(segmentArr, yarnIndex),
      radius: YARN_RADIUS,
      color: hexToRgb(GLOBAL_STATE.yarnPalette[yarnIndex - 1]).map(
        (colorInt) => colorInt / 255
      ),
    });
  });

  renderer.init(yarnData, canvas);
  draw();

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

    const normal = right == isLeg ? [-y / mag, x / mag] : [y / mag, -x / mag];

    const [posX, posY] = getCoords([i, j]);

    return [
      posX + (YARN_RADIUS / 3) * normal[0],
      posY + (YARN_RADIUS / 3) * normal[1],
    ];
  }

  function selvageOffset([i, j], row) {
    const right = stitchPattern.carriagePasses[row] == "right";

    const [posX, posY] = getCoords([i, j]);

    if (right) {
      return [posX - YARN_RADIUS * 0.75, posY + YARN_RADIUS / 3];
    } else {
      return [posX + YARN_RADIUS * 0.75, posY + YARN_RADIUS / 3];
    }
  }

  function getCoords([i, j]) {
    return [nodes[i + j * DS.width].pos.x, nodes[i + j * DS.width].pos.y];
  }

  function computeSplinePoints(segments) {
    if (segments.length == 0) {
      console.warn(`Segment array for yarn  is empty`);
      return;
    }

    let points = [nodes[0].pos.x - STITCH_WIDTH, nodes[0].pos.y, 0];

    for (let i = 0; i + 1 < segments.length; i++) {
      // let prevSeg = segments[i - 1];
      let currSeg = segments[i];
      let nextSeg = segments[i + 1];

      // let prev = getCoords(prevSeg.source);
      let prev = [points.at(-3), points.at(-2)];

      let p1 = nodeOffset(
        currSeg.source,
        currSeg.row,
        prev,
        getCoords(currSeg.target)
      );

      points.push(p1[0], p1[1], 0.1 * currSeg.layer[0]);

      let next;

      if (nextSeg.row != currSeg.row) {
        next = selvageOffset(nextSeg.target, currSeg.row);
      } else {
        next = getCoords(nextSeg.target);
      }

      let p2 = nodeOffset(currSeg.target, currSeg.row, p1, next);

      points.push(p2[0], p2[1], 0.1 * currSeg.layer[1]);
    }

    return points;
  }

  function draw() {
    if (sim && sim.running()) {
      sim.tick(yarnSegments, nodes);
      console.log("running!");

      for (let i = 0; i < yarnData.length; i++) {
        yarnData[i].pts = computeSplinePoints(yarnData[i].segs);
      }

      renderer.updateYarnGeometry(yarnData);
    }
    renderer.draw();
  }

  function relax() {
    if (relaxed) return;
    sim = yarnRelaxation(GLOBAL_STATE.kYarn);
    relaxed = true;
  }

  function stopSim() {
    if (sim) sim.stop();
  }

  return { relax, stopSim, draw };
}
