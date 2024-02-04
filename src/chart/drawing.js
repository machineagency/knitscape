import { GLOBAL_STATE, dispatch } from "../state";
const colors = ["#555", "#ddd"];

export function drawShapingMask(canvas, chart, cellX, cellY, lastDrawn = null) {
  const width = chart.width;
  const height = chart.height;

  // const cellX = GLOBAL_STATE.scale / GLOBAL_STATE.stitchGauge;
  // const cellY = GLOBAL_STATE.scale / GLOBAL_STATE.rowGauge;

  const ctx = canvas.getContext("2d");

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let paletteIndex = chart.pixel(x, y);
      if (lastDrawn == null || lastDrawn.pixel(x, y) != paletteIndex) {
        ctx.save();
        ctx.translate(x * cellX, (height - y - 1) * cellY);
        ctx.scale(cellX, cellY);
        ctx.fillStyle = colors[paletteIndex];
        ctx.fillRect(0, 0, 1, 1);
        ctx.restore();
      }
    }
  }
}
