import { stitches } from "../constants";

function addSegment(segments, [x1, y1], [x2, y2]) {
  if (y1 > y2) {
    [x1, x2] = [x2, x1];
    [y1, y2] = [y2, y1];
  }

  if (y1 === y2) return; // Skip horizontal edges

  let slope = (x2 - x1) / (y2 - y1);

  segments.push({
    xMin: x1,
    yMin: y1,
    yMax: y2,
    slope,
  });
}

function tileWholeBlock(segments, offset, chart, block, ignore) {
  let changes = [];

  let blockXPos = segments[0].xMin + offset[0];
  let currentBlockRow = Math.abs(offset[1] % block.height);

  for (const segment of segments) {
    const { yMin, yMax, slope } = segment;

    let y = yMin;

    while (y < yMax) {
      let xCurrent = Math.round(blockXPos);

      for (let xBlock = 0; xBlock < block.width; xBlock++) {
        let pixel = block.pixel(xBlock, currentBlockRow);
        if (pixel == ignore) continue;

        changes.push({
          x: xCurrent + xBlock,
          y: y,
          color: pixel,
        });
      }

      currentBlockRow = (currentBlockRow + 1) % block.height;
      if (currentBlockRow == 0) {
        blockXPos += slope * block.height;
      }
      y++;
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
          stitches.TRANSPARENT
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
      ? tileWholeBlock(segments, offset, yarnChart, yarnBlock, 0)
      : tileOnStep(segments, offset, yarnChart, yarnBlock, 0);

  return { stitch: stitchChart, yarn: yarnChart };
}
