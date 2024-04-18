import { GLOBAL_STATE } from "../state";
import { hexToRgb } from "../utilities/misc";
import { yarnRelaxation } from "./relaxation";

import { populateDS, followTheYarn, orderCNs } from "./topology";
import { layoutNodes, buildSegmentData } from "./yarn3d";

import { topDownRenderer } from "./renderers/topdown";
import { noodleRenderer } from "./renderers/noodle";
import { threeToonRenderer } from "./renderers/threeToon";

let renderer = topDownRenderer;

const YARN_RADIUS = 0.25;
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
  function nodeOffset([i, j], row, prevCN, nextCN) {
    const right = stitchPattern.carriagePasses[row] == "right";
    const isLeg = j == row;

    // const x = prevCN[0] - nextCN[0];
    // const y = prevCN[1] - nextCN[1];

    const tangent = [prevCN[0] - nextCN[0], prevCN[1] - nextCN[1]];
    const normal =
      right == isLeg ? [-tangent[1], tangent[0]] : [tangent[1], -tangent[0]];

    const dist = Math.sqrt(tangent[0] ** 2 + tangent[1] ** 2);
    const [posX, posY] = getCoords([i, j]);

    if (dist == 0) {
      // console.warn("degenerate?");
      return [posX, posY];
    }

    // const n = right == isLeg ? [-y / mag, x / mag] : [y / mag, -x / mag];

    // const mag = YARN_RADIUS / 2 / dist;

    return [
      posX + ((YARN_RADIUS / 2) * normal[0]) / dist,
      posY + ((YARN_RADIUS / 2) * normal[1]) / dist,
    ];

    return [posX + mag * normal[0], posY + mag * normal[1]];
  }

  function oldOffset(cnType, cnPos, prev, next, ltr, stitchType, yarnData) {
    const dist = yarnData.radius;
    const dx = prev.x - next.x;
    const dy = prev.y - next.y;

    const [zFirst, zLast] = calcZ(stitchType, cnType);

    let yarnSide = cnType == "FH" || cnType == "LL" ? ltr : !ltr;

    const alpha = yarnSide
      ? Math.atan2(dy * STITCH_ASPECT, -dx)
      : Math.atan2(-dy * STITCH_ASPECT, dx);

    const beta = Math.PI / 4;

    const signAlpha = ltr ? -1 : 1;
    const signBeta = isHead(cnType) ? 1 : -1;
    const signPurl = isPurl(stitchType) ? -1 : 1;

    return [
      cnPos.x + signAlpha * dist * Math.cos(alpha),
      cnPos.y +
        signAlpha * dist * Math.sin(alpha) -
        signBeta * signPurl * zFirst * dist * Math.sin(beta),
      dist * Math.sin(zFirst * beta),
      cnPos.x + signAlpha * dist * Math.cos(alpha),
      cnPos.y +
        signAlpha * dist * Math.sin(alpha) -
        signBeta * signPurl * zLast * dist * Math.sin(beta),
      dist * Math.sin(zLast * beta),
    ];
  }

  function selvageOffset([i, j], row) {
    const right = stitchPattern.carriagePasses[row] == "right";

    const [posX, posY] = getCoords([i, j]);

    if (right) {
      return [posX - YARN_RADIUS * 0.75, posY + YARN_RADIUS / 2];
    } else {
      return [posX + YARN_RADIUS * 0.75, posY + YARN_RADIUS / 2];
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
    // console.log(segments);

    let points = [nodes[0].pos.x - STITCH_WIDTH, nodes[0].pos.y, 0];

    for (let i = 1; i + 1 < segments.length; i++) {
      let prevSeg = segments[i - 1];
      let currSeg = segments[i];
      let nextSeg = segments[i + 1];

      // let prev = getCoords(prevSeg.source);
      // let prev = [points.at(-3), points.at(-2)];

      let p1 = nodeOffset(
        currSeg.source,
        currSeg.row,
        getCoords(prevSeg.source),
        getCoords(currSeg.target)
      );

      points.push(p1[0], p1[1], YARN_RADIUS * currSeg.layer[0]);

      let next;

      if (nextSeg.row != currSeg.row) {
        next = selvageOffset(nextSeg.target, currSeg.row);
      } else {
        next = getCoords(nextSeg.target);
      }

      let p2 = nodeOffset(currSeg.target, currSeg.row, p1, next);

      points.push(p2[0], p2[1], YARN_RADIUS * currSeg.layer[1]);
    }

    return points;
  }

  function draw() {
    if (sim && sim.running()) {
      sim.tick(yarnSegments, nodes);
      // console.log("running!");

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
