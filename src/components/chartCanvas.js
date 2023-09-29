import { sizeCanvasToBitmap } from "../actions/zoomFit";

export function imagePalette(paletteEntry, ctx, scale) {
  // paletteEntry will be an object with an image field
  ctx.imageSmoothingQuality = "high";

  ctx.clearRect(0, 0, scale, scale);
  ctx.drawImage(paletteEntry.image, 0, 0, scale, scale);
}

export function chartCanvas({ canvas }) {
  return ({ state }) => {
    let { scale, symbolPalette, symbolMap, chart } = state;

    let lastDrawn = null;
    let width = chart.width;
    let height = chart.height;

    function draw() {
      // Draws only the pixels that have changed
      const ctx = canvas.getContext("2d");

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let paletteIndex = chart.pixel(x, y);

          if (lastDrawn == null || lastDrawn.pixel(x, y) != paletteIndex) {
            ctx.translate(x * scale, y * scale);
            let im = symbolPalette[symbolMap[paletteIndex]];

            if (!im) continue;
            ctx.clearRect(0, 0, scale, scale);
            ctx.drawImage(im, 0, 0, scale, scale);

            ctx.setTransform(1, 0, 0, 1, 0, 0);
          }
        }
      }
      lastDrawn = chart;
    }

    sizeCanvasToBitmap(canvas, width, height, scale);
    lastDrawn = null;

    draw();

    return {
      syncState(state) {
        if (
          width != state.chart.width ||
          height != state.chart.height ||
          scale != state.scale
        ) {
          width = state.chart.width;
          height = state.chart.height;
          scale = state.scale;

          sizeCanvasToBitmap(canvas, width, height, scale);
          lastDrawn = null;
        }

        if (symbolPalette != state.symbolPalette) {
          symbolPalette = state.symbolPalette;
          lastDrawn = null;
        }

        if (lastDrawn != state.chart) {
          chart = state.chart;
          draw();
        }
      },
    };
  };
}
