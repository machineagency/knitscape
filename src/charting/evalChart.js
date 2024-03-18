import { Bimp } from "../lib/Bimp";
import { stitches } from "../constants";
import { knitScanline } from "./knitScanline";
import { bBoxAllBoundaries } from "./helpers";
import { yarnSeparation } from "./yarnSeparation";

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

function shiftFills(bbox, fills) {
  return fills.map((fill) => {
    return {
      ...fill,
      pos: [fill.pos[0] - bbox.xMin, fill.pos[1] - bbox.yMin],
    };
  });
}

export function evaluateChart(boundaries, regions, blocks) {
  const bbox = bBoxAllBoundaries(boundaries);

  const chartWidth = bbox.xMax - bbox.xMin;
  const chartHeight = bbox.yMax - bbox.yMin;

  const shiftedBlocks = shiftBlocks(bbox, blocks);
  const shiftedFills = shiftFills(bbox, regions);

  // First, create an empty chart that is fit to the boundaries
  let stitchChart = Bimp.empty(chartWidth, chartHeight, stitches.EMPTY);
  let yarnChart = Bimp.empty(chartWidth, chartHeight, 0);

  for (const [index, { stitchBlock, yarnBlock, gap, pos }] of Object.entries(
    shiftedFills
  )) {
    let { stitch, yarn } = knitScanline(
      stitchChart,
      yarnChart,
      bbox,
      boundaries[index],
      stitchBlock,
      yarnBlock,
      gap,
      pos
    );

    stitchChart = stitch;
    yarnChart = yarn;
  }

  const { machineChart, yarnSequence, rowMap } = yarnSeparation(
    stitchChart,
    yarnChart
  );

  return { stitchChart, yarnChart, machineChart, yarnSequence, rowMap };
}
