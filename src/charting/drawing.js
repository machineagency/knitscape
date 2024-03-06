import { SYMBOL_DATA, STITCH_MAP } from "../constants";

export function drawChart(
  canvas,
  mode,
  chart,
  yarnChart,
  yarnPalette,
  cellWidth,
  cellHeight,
  lastDrawn = null
) {
  const { width, height } = chart;

  const ctx = canvas.getContext("2d");
  ctx.lineWidth = 0.03;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let stitchIndex = chart.pixel(x, y);
      let yarnIndex = yarnChart.pixel(x, y);

      if (
        lastDrawn == null ||
        (mode == "operation" && lastDrawn.pixel(x, y) != stitchIndex) ||
        (mode == "yarn" && lastDrawn.pixel(x, y) != yarnIndex)
      ) {
        ctx.save();
        ctx.translate(x * cellWidth, (height - y - 1) * cellHeight);
        ctx.scale(cellWidth, cellHeight);

        const operation = STITCH_MAP[stitchIndex];

        if (mode == "operation") {
          ctx.fillStyle = SYMBOL_DATA[operation].color;
        } else if (mode == "yarn") {
          if (yarnIndex == 0) {
            ctx.fillStyle = SYMBOL_DATA.EMPTY.color;
          } else {
            ctx.fillStyle = yarnPalette[yarnChart.pixel(x, y) - 1];
          }
        }

        ctx.fillRect(0, 0, 1, 1);

        const { path } = SYMBOL_DATA[operation];

        if (path) ctx.stroke(path);

        ctx.restore();
      }
    }
  }
}
