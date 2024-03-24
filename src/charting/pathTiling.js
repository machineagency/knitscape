import { stitches } from "../constants";

function addSegment(segments, [x1, y1], [x2, y2]) {
  if (y1 > y2) {
    [x1, x2] = [x2, x1];
    [y1, y2] = [y2, y1];
  }

  segments.push({
    x: x1,
    x2: x2,
    xMin: x1,
    yMin: y1,
    yMax: y2,
    slope: y1 === y2 ? 0 : (x2 - x1) / (y2 - y1),
  });
}

function tileWholeBlock(
  segments,
  offset,
  chart,
  block,
  ignore,
  avoid = undefined
) {
  let changes = [];

  for (const segment of segments) {
    let { x, x2, xMin, yMin, yMax, slope } = segment;
    let currentBlockRow = 0;
    let blockXOffsetFromPath = offset[0];

    for (let y = yMin; y <= yMax; y++) {
      if (y == yMax && slope != 0) continue;
      let blockXInChart = Math.round(blockXOffsetFromPath + xMin);
      let extraSpace;

      if (slope < 0) {
        let xDiff = -(Math.round(x) - Math.round(x - slope));
        extraSpace = xDiff - block.width;
      } else if (slope > 0) {
        let xDiff = Math.round(x + slope) - Math.round(x);
        extraSpace = xDiff - block.width;
      } else if (slope == 0) {
        extraSpace = Math.abs(x2 - xMin) - block.width;
      }
      extraSpace = extraSpace > 0 ? extraSpace : 0;

      for (let xBlock = 0; xBlock < block.width + extraSpace; xBlock++) {
        let pixel = block.pixel(xBlock % block.width, currentBlockRow);

        let chartPixel = chart.pixel(blockXInChart + xBlock, y + offset[1]);

        if (pixel == ignore || chartPixel == avoid || chartPixel < 0) continue;

        changes.push({
          x: blockXInChart + xBlock,
          y: y + offset[1],
          color: pixel,
        });
      }
      if (currentBlockRow == 0) {
        blockXOffsetFromPath += slope * block.height;
      }
      x += slope;
      currentBlockRow = (currentBlockRow + 1) % block.height;
    }
  }

  return chart.draw(changes);
}

function tileOnStep(segments, offset, chart, block, ignore, avoid = undefined) {
  let changes = [];

  let currentBlockRow = block.height;
  let x = segments[0].xMin + offset[0];
  let xLast = x;

  for (const segment of segments) {
    const { yMin, yMax, slope } = segment;

    let y = yMin;

    while (y <= yMax) {
      let xCurrent = Math.round(x);

      if (xCurrent != xLast) {
        currentBlockRow = 0;
      }

      if (currentBlockRow < block.height) {
        for (let xBlock = 0; xBlock < block.width; xBlock++) {
          let pixel = block.pixel(xBlock, currentBlockRow);
          let chartPixel = chart.pixel(xCurrent + xBlock, y + offset[1]);
          if (pixel == ignore || chartPixel == avoid) continue;

          changes.push({
            x: xCurrent + xBlock,
            y: y + offset[1],
            color: pixel,
          });
        }
      }

      currentBlockRow = currentBlockRow + 1;

      x = x + slope;
      xLast = xCurrent;
      y++;
    }
  }

  return chart.draw(changes);
}

export function pathTiling(
  stitchChart,
  yarnChart,
  { pts, offset, yarnBlock, stitchBlock, tileMode }
) {
  let segments = [];

  for (let i = 0; i < pts.length - 1; i++) {
    addSegment(segments, pts[i], pts[i + 1]);
  }

  if (segments.length == 0) {
    return { stitch: stitchChart, yarn: yarnChart };
  }

  stitchChart =
    tileMode == "round"
      ? tileWholeBlock(
          segments,
          offset,
          stitchChart,
          stitchBlock,
          stitches.TRANSPARENT,
          stitches.EMPTY
        )
      : tileOnStep(
          segments,
          offset,
          stitchChart,
          stitchBlock,
          stitches.TRANSPARENT,
          stitches.EMPTY
        );

  yarnChart =
    tileMode == "round"
      ? tileWholeBlock(segments, offset, yarnChart, yarnBlock, 0, 0)
      : tileOnStep(segments, offset, yarnChart, yarnBlock, 0, 0);

  return { stitch: stitchChart, yarn: yarnChart };
}
