function draw(canvas, drawFunc, bitmap, palette, scale, previous, prevScale) {
  if (
    previous == null ||
    previous.width != bitmap.width ||
    previous.height != bitmap.height ||
    scale != prevScale
  ) {
    previous = null;
  }

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";

  for (let y = 0; y < bitmap.height; y++) {
    for (let x = 0; x < bitmap.width; x++) {
      let paletteIndex = bitmap.pixel(x, y);

      if (previous == null || previous.pixel(x, y) != paletteIndex) {
        ctx.translate(x * scale, y * scale);

        drawFunc(palette[paletteIndex], ctx, scale, scale);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    }
  }
}

function paletteRendererExtension(
  { state },
  { drawFunc, paletteOverride = "palette", bitmapOverride = "bitmap", canvas }
) {
  state.paletteIndex = 0;
  let previous = null;
  let prevScale = null;

  return {
    syncState(state) {
      draw(
        canvas,
        drawFunc,
        state[bitmapOverride],
        state[paletteOverride],
        state.scale,
        previous,
        prevScale
      );
      previous = state[bitmapOverride];
      prevScale = state.scale;
    },
  };
}

export function paletteRenderer(options = {}) {
  return (config) => paletteRendererExtension(config, options);
}
