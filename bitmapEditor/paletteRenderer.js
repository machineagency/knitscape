// import

function paletteRendererExtension({ state }, { drawFunc }) {
  state.paletteIndex = 0;

  let { aspectRatio, scale, bitmap, palette, canvas } = state;

  let lastDrawn = null;

  function draw() {
    // Draws only the pixels that have changed
    const ctx = canvas.getContext("2d");

    for (let y = 0; y < bitmap.height; y++) {
      for (let x = 0; x < bitmap.width; x++) {
        let paletteIndex = bitmap.pixel(x, y);

        // if (lastDrawn == null || lastDrawn.pixel(x, y) != paletteIndex) {
        ctx.translate(x * aspectRatio[0] * scale, y * aspectRatio[1] * scale);

        drawFunc(
          palette[paletteIndex],
          ctx,
          aspectRatio[0] * scale,
          aspectRatio[1] * scale
        );
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        // }
      }
    }
    lastDrawn = bitmap;
  }

  return {
    attached(state) {
      ({ aspectRatio, scale, bitmap, palette } = state);
      draw();
    },
    syncState(state) {
      // if (lastDrawn.pixels != state.bitmap.pixels) {
      //   ({ aspectRatio, scale, bitmap, palette } = state);
      //   draw();
      // }
      // if (
      //   state.aspectRatio[0] != aspectRatio[0] ||
      //   state.aspectRatio[1] != aspectRatio[1] ||
      //   state.scale != scale ||
      //   state.bitmap.width != bitmap.width ||
      //   state.bitmap.height != bitmap.height
      // ) {
      //   lastDrawn = null;
      // }
      lastDrawn = null;

      ({ aspectRatio, scale, bitmap, palette } = state);
      draw();
    },
  };
}

export function paletteRenderer(options = {}) {
  return (config) => paletteRendererExtension(config, options);
}