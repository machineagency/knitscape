import { SYMBOL_DATA, STITCH_MAP } from "../constants";

export function drawChart(
  canvas,
  chart,
  cellWidth,
  cellHeight,
  lastDrawn = null
) {
  const { width, height } = chart;

  const ctx = canvas.getContext("2d");

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let paletteIndex = chart.pixel(x, y);

      if (lastDrawn == null || lastDrawn.pixel(x, y) != paletteIndex) {
        ctx.save();
        ctx.translate(x * cellWidth, (height - y - 1) * cellHeight);
        ctx.scale(cellWidth, cellHeight);
        ctx.fillStyle = SYMBOL_DATA[STITCH_MAP[chart.pixel(x, y)]].color;
        ctx.fillRect(0, 0, 1, 1);
        ctx.restore();
      }
    }
  }
}
