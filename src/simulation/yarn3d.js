import { stitches } from "../constants";
import { Vec2 } from "../utils";

const STITCH_ASPECT = 5 / 3; // Row height / stitch width

export function layoutNodes(DS, stitchWidth = 1, stitchAspect = 0.75) {
  // calculates the x,y values for the i,j
  const HALF_STITCH = stitchWidth / 2;
  const STITCH_HEIGHT = stitchWidth * stitchAspect;

  return DS.data.map((node, index) => {
    const i = index % DS.width;
    const j = (index - i) / DS.width;
    return {
      pos: {
        x: i * HALF_STITCH,
        y: (DS.height - j - 1) * STITCH_HEIGHT,
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

function calcZ(stitchType, cnType) {
  let zs;

  if (cnType == "FL") {
    zs = [-1, 1];
  } else if (cnType == "LH") {
    zs = [-1, 1];
  } else if (cnType == "FH") {
    zs = [1, -1];
  } else if (cnType == "LL") {
    zs = [1, -1];
  }

  if (isPurl(stitchType)) zs = [-zs[0], -zs[1]];

  return zs;
}

function isHead(cnType) {
  return cnType == "FH" || cnType == "LH";
}

function isPurl(stitchType) {
  return stitchType === stitches.PURL;
}

function yarnOffset(cnType, cnPos, prev, next, ltr, stitchType, yarnData) {
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

export function linkData(
  DS,
  yarnPath,
  nodes,
  stitchWidth = 1,
  stitchAspect = 0.75
) {
  const links = [];

  for (let index = 0; index < yarnPath.length - 1; index++) {
    const [sourceI, sourceJ, sourceRow, sourceLayer] = yarnPath[index];
    const [targetI, targetJ, targetRow, targetLayer] = yarnPath[index + 1];

    let sourceIndex = sourceI + sourceJ * DS.width;
    let targetIndex = targetI + targetJ * DS.width;

    const source = DS.CN(sourceI, sourceJ);
    const target = DS.CN(targetI, targetJ);

    let sourceLegParity = source[4][1] === index;
    let targetLegParity = target[4][1] === index + 1;

    const biggestLayer = sourceLayer > targetLayer ? sourceLayer : targetLayer;
    const isLoop = sourceLegParity == targetLegParity ? "loop" : "leg";

    let st;
    if (source[0] == target[0]) {
      st = source[0] == stitches.KNIT ? "knit" : "purl";
    } else {
      st = "mid";
    }

    if (sourceRow != targetRow) {
      // literal edge case
      // console.debug("hit edge!");
    }

    const restLength = isLoop
      ? Vec2.mag(Vec2.sub(nodes[sourceIndex].pos, nodes[targetIndex].pos))
      : stitchWidth * stitchAspect;

    links.push({
      source: sourceIndex,
      target: targetIndex,
      restLength,
      row: sourceRow,
      layer: [st, isLoop, biggestLayer],
    });
  }
  return links;
}

export function layerDS(DS, pattern) {
  const layers = {
    knit: {
      loop: [],
      leg: [],
    },
    purl: {
      loop: [],
      leg: [],
    },
    mid: {
      loop: [],
      leg: [],
    },
  };

  let currZ = 0;

  for (let i = 0; i < DS.maxCNStack; i++) {
    layers.purl.leg.push(currZ);
    currZ++;
  }
  for (let i = 0; i < DS.maxCNStack; i++) {
    layers.knit.loop.push(currZ);
    currZ++;
  }

  for (let i = 0; i < DS.maxCNStack; i++) {
    layers.mid.loop.push(currZ);
    currZ++;
  }

  for (let i = 0; i < DS.maxCNStack; i++) {
    layers.mid.leg.push(currZ);
    currZ++;
  }

  for (let i = 0; i < DS.maxCNStack; i++) {
    layers.purl.loop.push(currZ);
    currZ++;
  }

  for (let i = 0; i < DS.maxCNStack; i++) {
    layers.knit.leg.push(currZ);
    currZ++;
  }

  let numLayers = currZ;
  return [layers, numLayers];
}

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
