import { stitches } from "../constants";
import { Bimp } from "../lib/Bimp";

// export function bbox(boundary) {
//   let xMin = Infinity;
//   let yMin = Infinity;
//   let xMax = -Infinity;
//   let yMax = -Infinity;

//   boundary.forEach(([x, y]) => {
//     if (x < xMin) xMin = x;
//     if (y < yMin) yMin = y;
//     if (x > xMax) xMax = x;
//     if (y > yMax) yMax = y;
//   });

//   return {
//     width: Math.abs(xMax - xMin),
//     height: Math.abs(yMax - yMin),
//     xMin,
//     yMin,
//     xMax,
//     yMax,
//   };
// }

export function bBoxAllBoundaries(boundaries) {
  let xMin = Infinity;
  let yMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;

  for (const boundary of boundaries) {
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
