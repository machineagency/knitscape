import { Bimp } from "../lib/Bimp";
import { stitches } from "../constants";

export function bBoxAllBoundaries(boundaries) {
  let xMin = Infinity;
  let yMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;

  for (const [id, boundary] of Object.entries(boundaries)) {
    boundary.forEach(([x, y]) => {
      if (x < xMin) xMin = x;
      if (y < yMin) yMin = y;
      if (x > xMax) xMax = x;
      if (y > yMax) yMax = y;
    });
  }

  return {
    width: Math.abs(xMax - xMin),
    height: Math.abs(yMax - yMin),
    xMin,
    yMin,
    xMax,
    yMax,
  };
}

export function evaluateChart(boundaries, regions) {
  let bbox = bBoxAllBoundaries(boundaries);

  let chart = Bimp.empty(bbox.width, bbox.height, stitches.EMPTY);
}
