// import

function paletteRendererExtension(
  { state },
  { drawFunc, paletteOverride, bitmapOverride }
) {
  state.paletteIndex = 0;

  let { aspectRatio, scale, bitmap, palette, canvas } = state;

  function draw(state) {
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";

    if (paletteOverride) {
      palette = state[paletteOverride];
    }

    if (bitmapOverride) {
      bitmap = state[bitmapOverride];
    }

    for (let y = 0; y < bitmap.height; y++) {
      for (let x = 0; x < bitmap.width; x++) {
        let paletteIndex = bitmap.pixel(x, y);

        ctx.translate(x * aspectRatio[0] * scale, y * aspectRatio[1] * scale);

        drawFunc(
          palette[paletteIndex],
          ctx,
          aspectRatio[0] * scale,
          aspectRatio[1] * scale
        );
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    }
  }

  return {
    attached(state) {
      ({ aspectRatio, scale, bitmap, palette } = state);
      draw(state);
    },
    syncState(state) {
      ({ aspectRatio, scale, bitmap, palette } = state);
      draw(state);
    },
  };
}

export function paletteRenderer(options = {}) {
  return (config) => paletteRendererExtension(config, options);
}
