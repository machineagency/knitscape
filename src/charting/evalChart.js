import { Bimp } from "../lib/Bimp";
import { stitches } from "../constants";
import { knitScanline } from "./knitScanline";
import { bBoxAllBoundaries } from "./helpers";

function shiftBlocks(bbox, blocks) {
  return Object.fromEntries(
    Object.entries(blocks).map(([blockID, block]) => {
      return [
        blockID,
        {
          ...block,
          pos: [block.pos[0] - bbox.xMin, block.pos[1] - bbox.yMin],
        },
      ];
    })
  );
}

export function evaluateChart(boundaries, regions, blocks) {
  const bbox = bBoxAllBoundaries(boundaries);

  const chartWidth = bbox.xMax - bbox.xMin;
  const chartHeight = bbox.yMax - bbox.yMin;

  const shiftedBlocks = shiftBlocks(bbox, blocks);

  // First, create an empty chart that is fit to the boundaries
  let chart = Bimp.empty(chartWidth, chartHeight, stitches.EMPTY);

  for (const [index, data] of Object.entries(regions)) {
    chart = knitScanline(chart, bbox, boundaries[index], shiftedBlocks, data);
  }

  return chart;
}
