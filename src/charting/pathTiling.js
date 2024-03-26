import { stitches } from "../constants";

function plotLow(
  [x0, y0],
  [x1, y1],
  offset,
  chart,
  tile,
  mode = "overlap",
  ignore,
  avoid = undefined
) {
  // Plots a tile for slopes between -1 and 1

  let dx = x1 - x0;
  let dy = y1 - y0;
  let yi = 1;

  if (dy < 0) {
    yi = -1;
    dy = -dy;
  }

  let sx = x0 < x1 ? 1 : -1;
  let D = 2 * dy - dx;
  let y = y0;
  let x = x0;

  let lastX, lastY;
  if (mode == "tiled") {
    lastX = null;
    lastY = null;
  } else if (mode == "xDiff" || mode == "yDiff") {
    lastX = x;
    lastY = y;
  }

  while (x != x1) {
    if (mode == "overlap") {
      chart = chart.overlay(tile, [x + offset[0], y + offset[1]], ignore);
    } else if (mode == "tiled") {
      if (
        lastX == null ||
        lastY == null ||
        Math.abs(x - lastX) >= tile.width ||
        Math.abs(y - lastY) >= tile.height
      ) {
        chart = chart.overlay(tile, [x + offset[0], y + offset[1]], ignore);
        lastX = x;
        lastY = y;
        console.log(x);
      }
    } else if (mode == "xDiff") {
      if (x != lastX) {
        chart = chart.overlay(tile, [x + offset[0], y + offset[1]], ignore);
        lastX = x;
        lastY = y;
        console.log(x);
      }
    } else if (mode == "yDiff") {
      if (y != lastY) {
        chart = chart.overlay(tile, [x + offset[0], y + offset[1]], ignore);
        lastX = x;
        lastY = y;
      }
    }
    if (D > 0) {
      y = y + yi;
      D = D + 2 * (dy - dx);
    } else {
      D = D + 2 * dy;
    }

    x = x + sx;
  }
  return chart;
}

function plotHigh(
  [x0, y0],
  [x1, y1],
  offset,
  chart,
  tile,
  mode = "overlap",
  ignore,
  avoid = undefined
) {
  // Plots a tile for slopes above 1 and below -1
  let dx = x1 - x0;
  let dy = y1 - y0;
  let xi = 1;

  if (dx < 0) {
    xi = -1;
    dx = -dx;
  }

  let sy = y0 < y1 ? 1 : -1;
  let D = 2 * dx - dy;

  let x = x0;
  let y = y0;

  let lastX, lastY;
  if (mode == "tiled") {
    lastX = null;
    lastY = null;
  } else if (mode == "xDiff" || mode == "yDiff") {
    lastX = x;
    lastY = y;
  }

  while (y != y1) {
    if (mode == "overlap") {
      chart = chart.overlay(tile, [x + offset[0], y + offset[1]], ignore);
    } else if (mode == "tiled") {
      if (
        lastX == null ||
        lastY == null ||
        Math.abs(x - lastX) >= tile.width ||
        Math.abs(y - lastY) >= tile.height
      ) {
        chart = chart.overlay(tile, [x + offset[0], y + offset[1]], ignore);
        lastX = x;
        lastY = y;
      }
    } else if (mode == "xDiff") {
      if (x != lastX) {
        chart = chart.overlay(tile, [x + offset[0], y + offset[1]], ignore);
        lastX = x;
        lastY = y;
      }
    } else if (mode == "yDiff") {
      if (y != lastY) {
        chart = chart.overlay(tile, [x + offset[0], y + offset[1]], ignore);
        lastX = x;
        lastY = y;
      }
    }

    if (D > 0) {
      x = x + xi;
      D = D + 2 * (dx - dy);
    } else {
      D = D + 2 * dx;
    }

    y = y + sy;
  }
  return chart;
}
function tileAlongSegment(
  [x0, y0],
  [x1, y1],
  offset,
  chart,
  tile,
  mode,
  ignore,
  avoid = undefined
) {
  if (Math.abs(y1 - y0) < Math.abs(x1 - x0)) {
    if (x0 > x1) {
      chart = plotLow(
        [x1, y1],
        [x0, y0],
        offset,
        chart,
        tile,
        mode,
        ignore,
        avoid
      );
    } else {
      chart = plotLow(
        [x0, y0],
        [x1, y1],
        offset,
        chart,
        tile,
        mode,
        ignore,
        avoid
      );
    }
  } else {
    if (y0 > y1) {
      chart = plotHigh(
        [x1, y1],
        [x0, y0],
        offset,
        chart,
        tile,
        mode,
        ignore,
        avoid
      );
    } else {
      chart = plotHigh(
        [x0, y0],
        [x1, y1],
        offset,
        chart,
        tile,
        mode,
        ignore,
        avoid
      );
    }
  }

  return chart;
}

export function pathTiling(
  stitchChart,
  yarnChart,
  { pts, offset, yarnBlock, stitchBlock, tileMode }
) {
  // let segments = [];

  // for (let i = 0; i < pts.length - 1; i++) {
  //   addSegment(segments, pts[i], pts[i + 1]);
  // }

  // if (segments.length == 0) {
  //   return { stitch: stitchChart, yarn: yarnChart };
  // }

  // let mode = tileMode == "round" ? "overlap" : "step";

  const mode = "xDiff";

  for (let i = 0; i < pts.length - 1; i++) {
    stitchChart = tileAlongSegment(
      pts[i],
      pts[i + 1],
      offset,
      stitchChart,
      stitchBlock,
      tileMode,
      stitches.TRANSPARENT,
      stitches.EMPTY
    );

    yarnChart = tileAlongSegment(
      pts[i],
      pts[i + 1],
      offset,
      yarnChart,
      yarnBlock,
      tileMode,
      0,
      0
    );
  }

  return { stitch: stitchChart, yarn: yarnChart };
  // stitchChart = tileAlongPath(
  //   pts,
  //   offset,
  //   stitchChart,
  //   stitchBlock,
  //   mode,
  //   stitches.TRANSPARENT,
  //   stitches.EMPTY
  // );
  // tileMode == "round"
  //   ? tileAlongPath(
  //       pts,
  //       offset,
  //       stitchChart,
  //       stitchBlock,
  //       mode,
  //       stitches.TRANSPARENT,
  //       stitches.EMPTY
  //     )
  //   : tileOnStep(
  //       segments,
  //       offset,
  //       stitchChart,
  //       stitchBlock,
  //       stitches.TRANSPARENT,
  //       stitches.EMPTY
  //     );

  // yarnChart =
  //   tileMode == "round"
  //     ? tileAlongPath(pts, offset, yarnChart, yarnBlock, 0, 0)
  //     : tileOnStep(segments, offset, yarnChart, yarnBlock, 0, 0);
}

// function tileAlongSegment(
//   [x1, y1],
//   [x2, y2],
//   offset,
//   chart,
//   tile,
//   ignore,
//   avoid = undefined
// ) {
//   if (y1 > y2) {
//     [x1, x2] = [x2, x1];
//     [y1, y2] = [y2, y1];
//   }
//   const slope = (y2 - y1) / (x2 - x1);

//   let x = x1;
//   let y = y1;

//   console.log("SEGMENT");
//   console.log(slope);
//   console.log("p1", x1, y1, "p2", x2, y2);

//   while (y < y2) {
//     let xNext = Math.round(x + tile.height / slope);

//     let xCurrent = Math.round(x);
//     console.log(xNext);

//     while (xCurrent < xNext) {
//       chart = chart.overlay(
//         tile,
//         [xCurrent + offset[0], y + offset[1]],
//         ignore
//       );
//       xCurrent += tile.width;
//     }

//     y += tile.height;
//     x += tile.height / slope;
//   }

//   return chart;
// }
// function tileAlongPath(pts, offset, chart, tile, ignore, avoid = undefined) {
//   for (let i = 0; i < pts.length - 1; i++) {
//     chart = tileAlongSegment(
//       pts[i],
//       pts[i + 1],
//       offset,
//       chart,
//       tile,
//       ignore,
//       avoid
//     );
//   }

//   return chart;
// }

// function tileWholeBlock(
//   segments,
//   offset,
//   chart,
//   block,
//   ignore,
//   avoid = undefined
// ) {
//   let changes = [];

//   for (const segment of segments) {
//     let { x, x2, xMin, yMin, yMax, slope } = segment;
//     let currentBlockRow = 0;
//     let blockXOffsetFromPath = offset[0];

//     for (let y = yMin; y <= yMax; y++) {
//       if (y == yMax && slope != 0) continue;
//       let blockXInChart = Math.round(blockXOffsetFromPath + xMin);
//       let extraSpace;

//       if (slope < 0) {
//         let xDiff = -(Math.round(x) - Math.round(x - slope));
//         extraSpace = xDiff - block.width;
//       } else if (slope > 0) {
//         let xDiff = Math.round(x + slope) - Math.round(x);
//         extraSpace = xDiff - block.width;
//       } else if (slope == 0) {
//         extraSpace = Math.abs(x2 - xMin) - block.width;
//       }
//       extraSpace = extraSpace > 0 ? extraSpace : 0;

//       for (let xBlock = 0; xBlock < block.width + extraSpace; xBlock++) {
//         let pixel = block.pixel(xBlock % block.width, currentBlockRow);

//         let chartPixel = chart.pixel(blockXInChart + xBlock, y + offset[1]);

//         if (pixel == ignore || chartPixel == avoid || chartPixel < 0) continue;

//         changes.push({
//           x: blockXInChart + xBlock,
//           y: y + offset[1],
//           color: pixel,
//         });
//       }
//       if (currentBlockRow == 0) {
//         blockXOffsetFromPath += slope * block.height;
//       }
//       x += slope;
//       currentBlockRow = (currentBlockRow + 1) % block.height;
//     }
//   }

//   return chart.draw(changes);
// }

// function tileOnStep(segments, offset, chart, block, ignore, avoid = undefined) {
//   let changes = [];

//   let currentBlockRow = block.height;
//   let x = segments[0].xMin + offset[0];
//   let xLast = x;

//   for (const segment of segments) {
//     const { yMin, yMax, slope } = segment;

//     let y = yMin;

//     while (y <= yMax) {
//       let xCurrent = Math.round(x);

//       if (xCurrent != xLast) {
//         currentBlockRow = 0;
//       }

//       if (currentBlockRow < block.height) {
//         for (let xBlock = 0; xBlock < block.width; xBlock++) {
//           let pixel = block.pixel(xBlock, currentBlockRow);
//           let chartPixel = chart.pixel(xCurrent + xBlock, y + offset[1]);
//           if (pixel == ignore || chartPixel == avoid) continue;

//           changes.push({
//             x: xCurrent + xBlock,
//             y: y + offset[1],
//             color: pixel,
//           });
//         }
//       }

//       currentBlockRow = currentBlockRow + 1;

//       x = x + slope;
//       xLast = xCurrent;
//       y++;
//     }
//   }

//   return chart.draw(changes);
// }
// function addSegment(segments, [x1, y1], [x2, y2]) {
//   if (y1 > y2) {
//     [x1, x2] = [x2, x1];
//     [y1, y2] = [y2, y1];
//   }

//   segments.push({
//     x: x1,
//     x2: x2,
//     xMin: x1,
//     yMin: y1,
//     yMax: y2,
//     slope: y1 === y2 ? 0 : (x2 - x1) / (y2 - y1),
//   });
// }
