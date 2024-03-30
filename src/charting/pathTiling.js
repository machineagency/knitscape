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

// dx = abs(x1 - x0)
// sx = x0 < x1 ? 1 : -1
// dy = -abs(y1 - y0)
// sy = y0 < y1 ? 1 : -1
// error = dx + dy

// while true
//     plot(x0, y0)
//     if x0 == x1 && y0 == y1 break
//     e2 = 2 * error
//     if e2 >= dy
//         if x0 == x1 break
//         error = error + dy
//         x0 = x0 + sx
//     end if
//     if e2 <= dx
//         if y0 == y1 break
//         error = error + dx
//         y0 = y0 + sy
//     end if
// end while

function plotLine(
  [x0, y0],
  [x1, y1],
  offset,
  chart,
  tile,
  mode,
  ignore,
  avoid = undefined
) {
  let dx = Math.abs(x1 - x0);
  let sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0);
  let sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;

  let lastX = null;
  let lastY = null;
  // if (mode == "tiled") {
  //   lastX = null;
  //   lastY = null;
  // } else if (mode == "xDiff" || mode == "yDiff") {
  //   lastX = x0;
  //   lastY = y0;
  // }

  while (true) {
    if (mode == "overlap") {
      chart = chart.overlay(tile, [x0 + offset[0], y0 + offset[1]], ignore);
    } else if (mode == "tiled") {
      if (
        lastX == null ||
        lastY == null ||
        Math.abs(x0 - lastX) >= tile.width ||
        Math.abs(y0 - lastY) >= tile.height
      ) {
        chart = chart.overlay(tile, [x0 + offset[0], y0 + offset[1]], ignore);
        lastX = x0;
        lastY = y0;
      }
    } else if (mode == "xDiff") {
      if (x0 != lastX) {
        chart = chart.overlay(tile, [x0 + offset[0], y0 + offset[1]], ignore);
        lastX = x0;
        lastY = y0;
      }
    } else if (mode == "yDiff") {
      if (y0 != lastY) {
        chart = chart.overlay(tile, [x0 + offset[0], y0 + offset[1]], ignore);
        lastX = x0;
        lastY = y0;
      }
    }

    if (x0 == x1 && y0 == y1) break;
    let e2 = 2 * error;
    if (e2 >= dy) {
      if (x0 == x1) break;
      error = error + dy;
      x0 = x0 + sx;
    }
    if (e2 <= dx) {
      if (y0 == y1) break;
      error = error + dx;
      y0 = y0 + sy;
    }
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
  for (let i = 0; i < pts.length - 1; i++) {
    stitchChart = plotLine(
      pts[i],
      pts[i + 1],
      offset,
      stitchChart,
      stitchBlock,
      tileMode,
      stitches.TRANSPARENT,
      stitches.EMPTY
    );
    yarnChart = plotLine(
      pts[i],
      pts[i + 1],
      offset,
      yarnChart,
      yarnBlock,
      tileMode,
      0,
      0
    );
    // stitchChart = tileAlongSegment(
    //   pts[i],
    //   pts[i + 1],
    //   offset,
    //   stitchChart,
    //   stitchBlock,
    //   tileMode,
    //   stitches.TRANSPARENT,
    //   stitches.EMPTY
    // );

    // yarnChart = tileAlongSegment(
    //   pts[i],
    //   pts[i + 1],
    //   offset,
    //   yarnChart,
    //   yarnBlock,
    //   tileMode,
    //   0,
    //   0
    // );
  }

  return { stitch: stitchChart, yarn: yarnChart };
}
