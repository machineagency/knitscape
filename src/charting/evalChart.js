import { Bimp } from "../lib/Bimp";
import { stitches } from "../constants";
import { knitScanline } from "./knitScanline";
import { bBoxAllBoundaries } from "./helpers";
import { GLOBAL_STATE } from "../state";

function evalRegions(chart, globalBbox, boundaries, regions) {
  let filledChart = chart;

  for (const [boundaryIndex, fill] of regions) {
    filledChart = knitScanline(
      filledChart,
      globalBbox,
      boundaries[boundaryIndex],
      fill
    );
  }

  return filledChart;
}

export function evaluateChart(boundaries, regions) {
  const BBOX = bBoxAllBoundaries(boundaries);

  // First, create an empty chart that is fit to the boundaries
  let chart = Bimp.empty(
    Math.ceil(GLOBAL_STATE.stitchGauge * BBOX.width),
    Math.ceil(GLOBAL_STATE.rowGauge * BBOX.height),
    stitches.EMPTY
  );
  chart = evalRegions(chart, BBOX, boundaries, regions);

  return chart;
}
