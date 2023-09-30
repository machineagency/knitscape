import { sizeCanvasToBitmap } from "../actions/zoomFit";

export function yarnCanvas({ canvas }) {
  return ({ state }) => {
    let { scale, yarnLayer, yarnPalette } = state;

    let width = yarnLayer.width;
    let height = yarnLayer.height;
    let lastDrawn = null;

    function draw() {
      const ctx = canvas.getContext("2d");

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let paletteIndex = yarnLayer.pixel(x, y);

          if (lastDrawn == null || lastDrawn.pixel(x, y) != paletteIndex) {
            ctx.translate(x * scale, y * scale);

            ctx.fillStyle = yarnPalette[paletteIndex];

            ctx.clearRect(0, 0, scale, scale);
            ctx.fillRect(0, 0, scale, scale);

            ctx.setTransform(1, 0, 0, 1, 0, 0);
          }
        }
      }
      lastDrawn = yarnLayer;
    }

    sizeCanvasToBitmap(canvas, width, height, scale);
    draw();

    return {
      syncState(state) {
        if (yarnPalette != state.yarnPalette) {
          yarnPalette = state.yarnPalette;
          lastDrawn = null;
        }

        if (
          scale != state.scale ||
          width != state.yarnLayer.width ||
          height != state.yarnLayer.height
        ) {
          width = state.yarnLayer.width;
          height = state.yarnLayer.height;
          scale = state.scale;

          sizeCanvasToBitmap(canvas, width, height, scale);
          lastDrawn = null;

          draw();
        }
      },
    };
  };
}
