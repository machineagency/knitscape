export function repeatCanvas({ canvas }) {
  return ({ state }) => {
    let { scale, palette, bitmap } = state;

    let lastDrawn = null;
    let width = null;
    let height = null;

    function sizeCanvas() {
      width = bitmap.width;
      height = bitmap.height;
      const canvasWidth = scale * width;
      const canvasHeight = scale * height;

      const cssWidth = canvasWidth / devicePixelRatio - devicePixelRatio;
      const cssHeight = canvasHeight / devicePixelRatio - devicePixelRatio;

      canvas.width = canvasWidth - 1;
      canvas.height = canvasHeight - 1;

      canvas.style.cssText = `width: ${cssWidth}px; height: ${cssHeight}`;

      lastDrawn = null;
    }

    function draw() {
      // Draws only the pixels that have changed
      const ctx = canvas.getContext("2d");

      for (let y = 0; y < bitmap.height; y++) {
        for (let x = 0; x < bitmap.width; x++) {
          let paletteIndex = bitmap.pixel(x, y);

          if (lastDrawn == null || lastDrawn.pixel(x, y) != paletteIndex) {
            ctx.translate(x * scale, y * scale);

            ctx.fillStyle = palette[paletteIndex];
            ctx.clearRect(0, 0, scale, scale);
            ctx.fillRect(0, 0, scale, scale);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
          }
        }
      }
      lastDrawn = bitmap;
    }

    sizeCanvas();
    draw();

    return {
      syncState(state) {
        if (width != state.bitmap.width || height != state.bitmap.height) {
          sizeCanvas();
        }

        if (palette != state.palette) {
          palette = state.palette;
          lastDrawn = null;
        }

        if (scale != state.scale) {
          scale = state.scale;
          sizeCanvas();
        }

        if (lastDrawn != state.bitmap) {
          bitmap = state.bitmap;
          draw();
        }
      },
    };
  };
}
