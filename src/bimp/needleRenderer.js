function draw(canvas, bitmap, needles, scale) {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  ctx.clearRect(0, 0, bitmap.width * scale, bitmap.height * scale);
  ctx.fillStyle = "#2d2c2c";

  for (let x = 0; x < bitmap.width; x++) {
    if (needles[x % needles.length] == 1) {
      ctx.fillRect(x * scale, 0, scale, bitmap.height * scale);
    }
  }
}

function needleRendererExtension({}, { canvas }) {
  let previous = null;
  let prevScale = null;

  return {
    syncState(state) {
      if (previous != state.needles || prevScale != state.scale) {
        draw(canvas, state.bitmap, state.needles, state.scale);
      }
      previous = state.needles;
      prevScale = state.scale;
    },
  };
}

export function needleRenderer(options = {}) {
  return (config) => needleRendererExtension(config, options);
}
