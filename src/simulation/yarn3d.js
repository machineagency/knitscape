import { stitches } from "../constants";
import { Vec2 } from "../lib/Vec2";

export function layoutNodes(
  DS,
  stitchChart,
  rowMap,
  stitchWidth = 1,
  stitchAspect = 0.75
) {
  // calculates the x,y values for the i,j
  const HALF_STITCH = stitchWidth / 2;
  const STITCH_HEIGHT = stitchWidth * stitchAspect;
  console.log(rowMap);
  return DS.data.map((node, index) => {
    const i = index % DS.width;
    const j = (index - i) / DS.width;
    return {
      pos: {
        x: i * HALF_STITCH,
        y: (stitchChart.height - rowMap[j] - 1) * STITCH_HEIGHT,
      },
      f: {
        x: 0,
        y: 0,
      },
      v: {
        x: 0,
        y: 0,
      },
    };
  });
}

export function buildSegmentData(
  DS,
  yarnPath,
  nodes,
  stitchWidth = 1,
  stitchAspect = 0.75
) {
  const links = [];
  const maxStack = DS.maxCNStack;

  // console.log("max CN stack:", maxStack);

  for (let index = 0; index < yarnPath.length - 1; index++) {
    const [sourceI, sourceJ, sourceRow, sourceLayer] = yarnPath[index];
    const [targetI, targetJ, targetRow, targetLayer] = yarnPath[index + 1];

    let sourceIndex = sourceI + sourceJ * DS.width;
    let targetIndex = targetI + targetJ * DS.width;

    const source = DS.CN(sourceI, sourceJ);
    const target = DS.CN(targetI, targetJ);

    let sourceLeg = source[4][1] === index;
    let targetLeg = target[4][1] === index + 1;

    const loop = sourceLeg == targetLeg;
    const leg = sourceLeg != targetLeg;

    const sourceOddity = sourceI % 2 != 0;
    const targetOddity = targetI % 2 != 0;

    const paritiesEqual = sourceOddity == targetOddity;

    let layer;
    let startLayer, endLayer;

    if (source[0] == stitches.KNIT) {
      if (paritiesEqual) {
        // treat as knit leg
        startLayer = sourceLeg ? 4 * maxStack : 4 * maxStack - 2 * sourceLayer;
      } else {
        // treat as knit loop
        startLayer = sourceLeg
          ? 2 * maxStack + 1
          : 4 * maxStack - 2 * sourceLayer - 1;
      }
    } else if (source[0] == stitches.PURL) {
      if (paritiesEqual || (leg && !paritiesEqual)) {
        // treat as purl leg
        startLayer = sourceLeg ? 1 : 2 * maxStack - 2 * sourceLayer - 1;
      } else {
        // treat as purl loop
        startLayer = sourceLeg ? 2 * maxStack : 2 * maxStack - 2 * sourceLayer;
      }
    }

    if (target[0] == stitches.KNIT) {
      if (paritiesEqual) {
        // treat as knit leg
        endLayer = targetLeg ? 4 * maxStack : 4 * maxStack - 2 * targetLayer;
      } else {
        // treat as knit loop
        endLayer = targetLeg
          ? 2 * maxStack + 1
          : 4 * maxStack - 2 * targetLayer - 1;
      }
    } else if (target[0] == stitches.PURL) {
      if (paritiesEqual || (leg && !paritiesEqual)) {
        // treat as purl leg
        endLayer = targetLeg ? 1 : 2 * maxStack - 2 * targetLayer - 1;
      } else {
        // treat as purl loop
        endLayer = targetLeg ? 2 * maxStack : 2 * maxStack - 2 * targetLayer;
      }
    }

    if (startLayer == endLayer) {
      layer = startLayer;
    } else if (startLayer == undefined || endLayer == undefined) {
      layer = startLayer != undefined ? startLayer : endLayer;
    } else {
      layer = [startLayer, endLayer];
    }

    // console.log(layer, sourceLayer, targetLayer, index);
    if (layer == undefined) layer = 1;

    // console.log([startLayer, endLayer]);
    // console.log(layer);

    links.push({
      source: [sourceI, sourceJ],
      target: [targetI, targetJ],
      sourceIndex,
      targetIndex,
      restLength: loop
        ? Vec2.mag(Vec2.sub(nodes[sourceIndex].pos, nodes[targetIndex].pos))
        : stitchWidth * stitchAspect,
      row: targetRow,
      layer,
      path: null,
    });
  }
  return links;
}

// function calcZ(stitchType, cnType) {
//   let zs;

//   if (cnType == "FL") {
//     zs = [-1, 1];
//   } else if (cnType == "LH") {
//     zs = [-1, 1];
//   } else if (cnType == "FH") {
//     zs = [1, -1];
//   } else if (cnType == "LL") {
//     zs = [1, -1];
//   }

//   if (isPurl(stitchType)) zs = [-zs[0], -zs[1]];

//   return zs;
// }

// function isHead(cnType) {
//   return cnType == "FH" || cnType == "LH";
// }

// function isPurl(stitchType) {
//   return stitchType === stitches.PURL;
// }

// function yarnOffset(cnType, cnPos, prev, next, ltr, stitchType, yarnData) {
//   const dist = yarnData.radius;
//   const dx = prev.x - next.x;
//   const dy = prev.y - next.y;

//   const [zFirst, zLast] = calcZ(stitchType, cnType);

//   let yarnSide = cnType == "FH" || cnType == "LL" ? ltr : !ltr;

//   const alpha = yarnSide
//     ? Math.atan2(dy * STITCH_ASPECT, -dx)
//     : Math.atan2(-dy * STITCH_ASPECT, dx);

//   const beta = Math.PI / 4;

//   const signAlpha = ltr ? -1 : 1;
//   const signBeta = isHead(cnType) ? 1 : -1;
//   const signPurl = isPurl(stitchType) ? -1 : 1;

//   return [
//     cnPos.x + signAlpha * dist * Math.cos(alpha),
//     cnPos.y +
//       signAlpha * dist * Math.sin(alpha) -
//       signBeta * signPurl * zFirst * dist * Math.sin(beta),
//     dist * Math.sin(zFirst * beta),
//     cnPos.x + signAlpha * dist * Math.cos(alpha),
//     cnPos.y +
//       signAlpha * dist * Math.sin(alpha) -
//       signBeta * signPurl * zLast * dist * Math.sin(beta),
//     dist * Math.sin(zLast * beta),
//   ];
// }

// export function calculateYarnPoints(chart, nodes, cnGrid, yarnPath, PARAMS) {
//   yarnPath.forEach(([i, j, row, cnType], index) => {
//     const currentPos = nodes[cnGrid.flatIndex(i, j)].pos;
//     const prev = yarnPath[index - 1];
//     const next = yarnPath[index + 1];

//     const yarnData = PARAMS.yarns[chart.yarnSequence[row]];

//     if (!prev || !next) {
//       // it's the first or last CN
//       yarnData.pts.push(currentPos.x, currentPos.y, 0);
//       return;
//     }

//     const prevCNPos = nodes[cnGrid.flatIndex(...prev)].pos;
//     const nextCNPos = nodes[cnGrid.flatIndex(...next)].pos;

//     const yarn2D = yarnOffset(
//       PARAMS,
//       cnType,
//       currentPos,
//       prevCNPos,
//       nextCNPos,
//       row % 2 == 0, //moving left or right
//       cnGrid.getST(i, j),
//       yarnData
//     );

//     yarnData.pts.push(...yarn2D);
//   });
// }
