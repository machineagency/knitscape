import { Bimp } from "../lib/Bimp";
import { GLOBAL_STATE, dispatch } from "../state";
import { scanlineFill } from "./scanline";

export function polygonBbox(boundary) {
  let xMin = Infinity;
  let yMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;

  boundary.forEach(([x, y]) => {
    if (x < xMin) xMin = x;
    if (y < yMin) yMin = y;
    if (x > xMax) xMax = x;
    if (y > yMax) yMax = y;
  });

  return {
    width: Math.abs(xMax - xMin),
    height: Math.abs(yMax - yMin),
    xMin,
    yMin,
    xMax,
    yMax,
  };
}

export function mapCoords(number, inMin, inMax, outMin, outMax) {
  return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export function toChartCoords(pt, bbox, chart) {
  return [
    Math.round(mapCoords(pt[0], bbox.xMin, bbox.xMax, 0, chart.width - 1)),
    Math.round(mapCoords(pt[1], bbox.yMin, bbox.yMax, 0, chart.height)),
  ];
}

export function computeDraftMask(boundary) {
  const bbox = polygonBbox(boundary);

  let chart = Bimp.empty(
    Math.ceil(GLOBAL_STATE.stitchGauge * bbox.width),
    Math.ceil(GLOBAL_STATE.rowGauge * bbox.height),
    0
  );

  chart = scanlineFill(bbox, boundary, chart);

  return chart;
}
