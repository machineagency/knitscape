import { populateDS, followTheYarn, orderCNs } from "./topology";
import { Vec2 } from "./utils/Vec2";
import { Vec3 } from "./utils/Vec3";

import { stitches } from "../constants";

export function generateTopology(stitchPattern) {
  const DS = populateDS(stitchPattern);

  orderCNs(DS, stitchPattern);

  let yarnPath = followTheYarn(DS, stitchPattern.carriagePasses);

  return { DS, yarnPath };
}

export function computeYarnPathSpline(
  DS,
  yarnPath,
  stitchPattern,
  nodes,
  { ASPECT = 0.75, YARN_RADIUS = 0.2, STITCH_WIDTH = 1 }
) {
  const yarnSplines = {};
  const links = {};

  for (let ypIndex = 0; ypIndex < yarnPath.length; ypIndex++) {
    let [i, j, row] = yarnPath[ypIndex];

    let layer, legNode;
    let cnStack = DS.CNO(i, j);
    let currIndex = i + j * DS.width;

    for (const [index, [ii, jj]] of cnStack.entries()) {
      let visitedIndices = DS.YPI(ii, jj);
      if (visitedIndices[1] == ypIndex) {
        // If this is a leg node, nothing will stack in front of it
        layer = 1;
        legNode = true;
        break;
      } else if (visitedIndices[0] == ypIndex) {
        layer = cnStack.length - index;
        legNode = false;
        break;
      }
    }

    let currentYarn = stitchPattern.yarnSequence[row];

    if (!(currentYarn in yarnSplines)) {
      yarnSplines[currentYarn] = [];
      links[currentYarn] = [
        {
          source: currIndex,
          sourceOffset: [0, 0, 0],
          leg: [true, undefined],
          target: undefined,
          targetOffset: undefined,
          restLength: undefined,
        },
      ];
    }

    const isKnit = DS.ST(i, j) == stitches.KNIT;
    const evenI = i % 2 == 0;

    const movingRight = stitchPattern.carriagePasses[row] == "right";

    const sign = evenI ? 1 : -1;

    let xyBasis = legNode
      ? Vec2.normalize([sign * ASPECT * 2, -1 / ASPECT])
      : Vec2.normalize([sign * -ASPECT * 2, 1 / ASPECT]);

    xyBasis = Vec2.scale(xyBasis, YARN_RADIUS);

    const stackHeight = DS.CNO(i, j).length;

    /////////////////////////////
    //  X OFFSET
    /////////////////////////////
    let dxFront, dxBack;
    let base = xyBasis[0] * ASPECT;

    if (legNode) {
      dxFront = base;
      dxBack = base;
    } else {
      dxFront = base * (stackHeight - layer + 1);
      dxBack = base;
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

    let curr = links[currentYarn];
    let prev = curr.at(-1);
    prev.target = currIndex;
    prev.leg[1] = legNode;

    let next = {
      source: currIndex,
      sourceOffset: undefined,
      target: undefined,
      targetOffset: undefined,
      restLength: undefined,
      leg: [legNode, undefined],
    };
    curr.push(next);

    if (movingRight == evenI) {
      // First leg or head node of a loop
      if (legNode == isKnit) {
        // Back to front
        prev.targetOffset = [dxBack, dyBack, dzBack];
        next.sourceOffset = [dxFront, dyFront, dzFront];
      } else {
        // Front to back
        prev.targetOffset = [dxFront, dyFront, dzFront];
        next.sourceOffset = [dxBack, dyBack, dzBack];
      }
    } else {
      // last leg or head node of a loop
      if (legNode == isKnit) {
        // Front to back
        prev.targetOffset = [dxFront, dyFront, dzFront];
        next.sourceOffset = [dxBack, dyBack, dzBack];
      } else {
        // Back to front
        prev.targetOffset = [dxBack, dyBack, dzBack];
        next.sourceOffset = [dxFront, dyFront, dzFront];
      }
    }

    let dist = Vec3.magnitude(
      Vec3.subtract(nodes[prev.target].pos, nodes[prev.source].pos)
    );

    let loop = prev.leg[0] == prev.leg[1];

    // prev.restLength = loop ? dist * ASPECT * 0.7 : dist * 0.7;
    prev.restLength = loop ? STITCH_WIDTH * ASPECT * 0.7 : STITCH_WIDTH * 0.7;
  }

  Object.entries(links).forEach(([yarnIndex, linkArr]) => {
    const lastLink = linkArr.at(-1);

    lastLink.target = lastLink.source;
    lastLink.targetOffset = [0, 0, 0];

    let isLoop = lastLink.leg[0] == lastLink.leg[1];
    let dist = Vec3.magnitude(
      Vec3.subtract(nodes[lastLink.target].pos, nodes[lastLink.source].pos)
    );
    lastLink.restLength = isLoop ? dist * ASPECT * 0.7 : dist * 0.7;
  });
  return links;
}

export function layoutNodes(
  DS,
  stitchPattern,
  { STITCH_WIDTH = 1, ASPECT = 0.75, BED_OFFSET = 0.2 }
) {
  // calculates the x,y values for the i,j
  const HALF_STITCH = STITCH_WIDTH / 2;
  const STITCH_HEIGHT = STITCH_WIDTH * ASPECT;

  return DS.data.map((node, index) => {
    const i = index % DS.width;
    const j = (index - i) / DS.width;

    const chartRow =
      j < stitchPattern.rowMap.length ? stitchPattern.rowMap[j] : DS.height - 1;

    let z = 0;
    if (node[0] == stitches.KNIT) {
      z = BED_OFFSET;
    }
    if (node[0] == stitches.PURL) {
      z = -BED_OFFSET;
    }

    return {
      pos: [i * HALF_STITCH, chartRow * STITCH_HEIGHT, z],
      f: [0, 0, 0],
      v: [0, 0, 0],
    };
  });
}

export function segmentsToPoints(segmentArr, nodes) {
  let controlPoints = [];
  for (const { source, sourceOffset, target, targetOffset } of segmentArr) {
    const sourcePos = nodes[source].pos;

    controlPoints.push(...Vec3.add(sourcePos, sourceOffset));

    const targetPos = nodes[target].pos;

    controlPoints.push(...Vec3.add(targetPos, targetOffset));
  }
  return controlPoints;
}
