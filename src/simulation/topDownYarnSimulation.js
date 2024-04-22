import { GLOBAL_STATE } from "../state";
import { hexToRgb } from "../utilities/misc";
import { yarnRelaxation } from "./relaxation";

import { populateDS, followTheYarn, orderCNs } from "./topology";
import { layoutNodes, buildSegmentData } from "./yarn3d";

import { topDownRenderer } from "./renderers/topdown";
import { noodleRenderer } from "./renderers/noodle";
import { centerlineRenderer } from "./renderers/centerline";
import { threeTubeRenderer } from "./renderers/threeTube";

import { Vec2D } from "../lib/Vec2";
import { stitches } from "../constants";

const renderers = {
  Noodle: noodleRenderer,
  "2D": topDownRenderer,
  Centerline: centerlineRenderer,
  Tube: threeTubeRenderer,
};

let renderer = renderers["Noodle"];

const YARN_RADIUS = 0.25;
const STITCH_WIDTH = 1;
const DEBUG = true;

export function simulate(stitchPattern) {
  const STITCH_ASPECT = GLOBAL_STATE.cellAspect;

  let canvas = document.getElementById("sim-canvas");
  let relaxed = false;
  let sim;

  let DS = populateDS(stitchPattern);

  orderCNs(DS, stitchPattern);

  let { yarnPath, yarnPaths } = followTheYarn(
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

  // TODO: only generate segment data when relaxation is requested.
  // const yarnSegments = buildSegmentData(
  //   DS,
  //   yarnPaths,
  //   nodes,
  //   STITCH_WIDTH,
  //   STITCH_ASPECT
  // );

  const yarnData = [];
  const splineData = computeYarnPathSpline(yarnPath);

  Object.entries(splineData.yarnSplines).forEach(
    ([yarnIndex, controlPoints]) => {
      yarnData.push({
        yarnIndex: yarnIndex,
        pts: controlPoints,
        radius: YARN_RADIUS,
        color: hexToRgb(GLOBAL_STATE.yarnPalette[yarnIndex - 1]).map(
          (colorInt) => colorInt / 255
        ),
      });
    }
  );

  renderer.init(yarnData, canvas);

  function draw() {
    if (sim && sim.running()) {
      sim.tick(yarnSegments, nodes);
      // console.log("running!");
      // console.log(yarnPaths);
      for (let i = 0; i < yarnData.length; i++) {
        yarnData[i].pts = computeYarnPathSpline(
          yarnPaths[yarnData[i].yarnIndex]
        );
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

  function getCoords([i, j]) {
    return [nodes[i + j * DS.width].pos.x, nodes[i + j * DS.width].pos.y];
  }

  function computeYarnPathSpline(yarnPath) {
    let points = [];
    let normals = [];
    let cnPoints = [];

    let [x, y] = getCoords([yarnPath[0][0], yarnPath[0][1]]);
    points.push(x - STITCH_WIDTH / 2, y, 0);

    const yarnSplines = {};

    for (let index = 1; index < yarnPath.length - 2; index++) {
      let [i, j, row, layer] = yarnPath[index];
      let currentYarn = stitchPattern.yarnSequence[row];

      if (!(currentYarn in yarnSplines)) {
        yarnSplines[currentYarn] = [];
      }

      const isKnit = DS.ST(i, j) == stitches.KNIT;
      const evenI = i % 2 == 0;

      const movingRight = stitchPattern.carriagePasses[row] == "right";
      // the zeroth element in YPI is always a head and the first is always a leg.
      const legNode = DS.YPI(i, j)[1] == index;
      const { x, y, z } = nodes[i + j * DS.width].pos;

      const sign = evenI ? 1 : -1;

      let xyBasis = legNode
        ? Vec2D.normalize([sign * STITCH_ASPECT * 2, -1 / STITCH_ASPECT])
        : Vec2D.normalize([sign * -STITCH_ASPECT * 2, 1 / STITCH_ASPECT]);
      xyBasis = Vec2D.scale(xyBasis, YARN_RADIUS);

      if (DEBUG == true) {
        normals.push(x, y, z);
        normals.push(
          x + xyBasis[0] * YARN_RADIUS,
          y + xyBasis[1] * YARN_RADIUS,
          z
        );
        cnPoints.push(x, y, z);
      }

      const stackHeight = DS.CNO(i, j).length;

      /////////////////////////////
      //  X OFFSET
      /////////////////////////////
      let dxFront, dxBack;
      let base = xyBasis[0] * STITCH_ASPECT;
      if (legNode) {
        dxFront = base;
        dxBack = base;
      } else {
        dxFront = base * (stackHeight - layer + 1);
        dxBack = xyBasis[0] * STITCH_ASPECT;
      }

      /////////////////////////////
      //  Y OFFSET
      /////////////////////////////

      let dyFront, dyBack;

      if (legNode) {
        const beta = Math.PI / 4;
        let yLayer = Math.sin(beta * layer) * (stackHeight - layer + 1);

        dyFront = -xyBasis[1] * yLayer;
        dyBack = xyBasis[1];
      } else {
        const beta = Math.PI / 8;
        let yLayer = Math.sin(beta * layer) * (stackHeight - layer + 1);
        dyFront = -xyBasis[1] * yLayer;
        dyBack = xyBasis[1] * yLayer;
      }

      /////////////////////////////
      //  ZOFFSET
      /////////////////////////////
      let dzFront, dzBack;

      if (legNode) {
        dzFront = (layer / 2) * YARN_RADIUS + YARN_RADIUS / 2;
        dzBack = -YARN_RADIUS / 2;
      } else {
        dzFront = (layer * YARN_RADIUS) / 2;
        dzBack = (-(stackHeight - layer) * YARN_RADIUS) / 2;
      }

      /////////////////////////////
      //  SWAP
      /////////////////////////////
      if (DS.ST(i, j) != stitches.KNIT) {
        let temp = dyBack;
        dyBack = dyFront;
        dyFront = temp;

        let tempX = dxBack;
        dxBack = dxFront;
        dxFront = tempX;
      }

      if (movingRight == evenI) {
        // First leg or head node of a loop
        if (legNode == isKnit) {
          // Back to front
          yarnSplines[currentYarn].push(x + dxBack, y + dyBack, z + dzBack);
          yarnSplines[currentYarn].push(x + dxFront, y + dyFront, z + dzFront);
        } else {
          // Front to back
          yarnSplines[currentYarn].push(x + dxFront, y + dyFront, z + dzFront);
          yarnSplines[currentYarn].push(x + dxBack, y + dyBack, z + dzBack);
        }
      } else {
        // last leg or head node of a loop
        if (legNode == isKnit) {
          // Front to back
          yarnSplines[currentYarn].push(x + dxFront, y + dyFront, z + dzFront);
          yarnSplines[currentYarn].push(x + dxBack, y + dyBack, z + dzBack);
        } else {
          // Back to front
          yarnSplines[currentYarn].push(x + dxBack, y + dyBack, z + dzBack);
          yarnSplines[currentYarn].push(x + dxFront, y + dyFront, z + dzFront);
        }
      }
    }

    return { yarnSplines, points, normals, cnPoints };
  }

  // function computeSplinePoints(segments) {
  //   if (segments.length == 0) {
  //     console.warn(`Segment array for yarn  is empty`);
  //     return;
  //   }
  //   // console.log(segments);

  //   let points = [nodes[0].pos.x - STITCH_WIDTH, nodes[0].pos.y, 0];

  //   for (let i = 1; i + 1 < segments.length; i++) {
  //     let prevSeg = segments[i - 1];
  //     let currSeg = segments[i];
  //     let nextSeg = segments[i + 1];

  //     // let prev = getCoords(prevSeg.source);
  //     // let prev = [points.at(-3), points.at(-2)];

  //     let p1 = nodeOffset(
  //       currSeg.source,
  //       currSeg.row,
  //       getCoords(prevSeg.source),
  //       getCoords(currSeg.target)
  //     );

  //     points.push(p1[0], p1[1], YARN_RADIUS * currSeg.layer[0]);

  //     let next;

  //     if (nextSeg.row != currSeg.row) {
  //       next = selvageOffset(nextSeg.target, currSeg.row);
  //     } else {
  //       next = getCoords(nextSeg.target);
  //     }

  //     let p2 = nodeOffset(currSeg.target, currSeg.row, p1, next);

  //     points.push(p2[0], p2[1], YARN_RADIUS * currSeg.layer[1]);
  //   }

  //   return points;
  // }

  // CN grid position, stitch row, previous CN coords, next CN coords
  // function nodeOffset([i, j], row, prevCN, nextCN) {
  //   const right = stitchPattern.carriagePasses[row] == "right";
  //   const isLeg = j == row;

  //   // const x = prevCN[0] - nextCN[0];
  //   // const y = prevCN[1] - nextCN[1];

  //   const tangent = [prevCN[0] - nextCN[0], prevCN[1] - nextCN[1]];
  //   const normal =
  //     right == isLeg ? [-tangent[1], tangent[0]] : [tangent[1], -tangent[0]];

  //   const dist = Math.sqrt(tangent[0] ** 2 + tangent[1] ** 2);
  //   const [posX, posY] = getCoords([i, j]);

  //   if (dist == 0) {
  //     // console.warn("degenerate?");
  //     return [posX, posY];
  //   }

  //   // const n = right == isLeg ? [-y / mag, x / mag] : [y / mag, -x / mag];

  //   // const mag = YARN_RADIUS / 2 / dist;

  //   return [
  //     posX + ((YARN_RADIUS / 2) * normal[0]) / dist,
  //     posY + ((YARN_RADIUS / 2) * normal[1]) / dist,
  //   ];

  //   return [posX + mag * normal[0], posY + mag * normal[1]];
  // }

  // function selvageOffset([i, j], row) {
  //   const right = stitchPattern.carriagePasses[row] == "right";

  //   const [posX, posY] = getCoords([i, j]);

  //   if (right) {
  //     return [posX - YARN_RADIUS * 0.75, posY + YARN_RADIUS / 2];
  //   } else {
  //     return [posX + YARN_RADIUS * 0.75, posY + YARN_RADIUS / 2];
  //   }
  // }

  return { relax, stopSim, draw };
}
