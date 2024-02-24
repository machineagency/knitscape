import { Bimp } from "../lib/Bimp";
import { stitches } from "../constants";
import { knitScanline } from "./knitScanline";
import { bBoxAllBoundaries } from "./helpers";

function evalRegions(chart, boundaries, bbox, regions) {
  let filledChart = chart;

  for (const [index, data] of Object.entries(regions)) {
    filledChart = knitScanline(filledChart, bbox, boundaries[index], data.fill);
  }

  return filledChart;
}

export function evaluateChart(boundaries, regions) {
  const bbox = bBoxAllBoundaries(boundaries);

  const chartWidth = bbox.xMax - bbox.xMin;
  const chartHeight = bbox.yMax - bbox.yMin;

  // First, create an empty chart that is fit to the boundaries
  let chart = Bimp.empty(chartWidth, chartHeight, stitches.EMPTY);

  chart = evalRegions(chart, boundaries, bbox, regions);

  return chart;
}
