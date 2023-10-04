import { sizeCanvasToBitmap } from "../actions/zoomFit";

export function imagePalette(paletteEntry, ctx, scale) {
  // paletteEntry will be an object with an image field
  ctx.imageSmoothingQuality = "high";

  ctx.clearRect(0, 0, scale, scale);
  ctx.drawImage(paletteEntry.image, 0, 0, scale, scale);
}

export function chartYarnColorCanvas({ canvas }) {
  return ({ state }) => {
    let { scale, yarnPalette, yarnSequence, chart } = state;

    let lastDrawn = null;
    let chartWidth = chart.width;
    let chartHeight = chart.height;

    let yarnHeight = yarnSequence.height;

    function draw() {
      // Draws only the pixels that have changed
      const ctx = canvas.getContext("2d");

      for (let y = 0; y < chartHeight; y++) {
        for (let x = 0; x < chartWidth; x++) {
          let paletteIndex = yarnSequence.pixel(
            0,
            (chartHeight - y - 1) % yarnHeight
          );

          if (
            lastDrawn == null ||
            lastDrawn.pixel(0, (chartHeight - y - 1) % yarnHeight) !=
              paletteIndex
          ) {
            ctx.fillStyle = yarnPalette[paletteIndex];
            ctx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
      }
      lastDrawn = yarnSequence;
    }

    sizeCanvasToBitmap(canvas, chartWidth, chartHeight, scale);
    lastDrawn = null;

    draw();

    return {
      syncState(state) {
        yarnSequence = state.yarnSequence;

        if (
          chartWidth != state.chart.width ||
          chartHeight != state.chart.height ||
          yarnHeight != state.yarnSequence.height ||
          scale != state.scale
        ) {
          chartWidth = state.chart.width;
          chartHeight = state.chart.height;

          yarnHeight = state.yarnSequence.height;

          scale = state.scale;

          sizeCanvasToBitmap(canvas, chartWidth, chartHeight, scale);
          lastDrawn = null;
        }

        if (yarnPalette != state.yarnPalette) {
          yarnPalette = state.yarnPalette;
          lastDrawn = null;
        }

        if (lastDrawn != state.yarnSequence) {
          yarnSequence = state.yarnSequence;
          draw();
        }
      },
    };
  };
}
