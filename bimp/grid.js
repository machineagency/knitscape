function drawGrid(canvas, width, height, scale) {
  const ctx = canvas.getContext("2d");

  ctx.translate(-0.5, -0.5);

  ctx.beginPath();

  for (let x = 1; x < width; x++) {
    ctx.moveTo(x * scale, 0);
    ctx.lineTo(x * scale, height * scale);
  }

  for (let y = 1; y < height; y++) {
    ctx.moveTo(0, y * scale);
    ctx.lineTo(width * scale, y * scale);
  }

  ctx.stroke();
}

function gridExtension({}, { canvas }) {
  let previous = null;
  let prevScale = null;

  return {
    syncState({ bitmap, scale }) {
      if (
        previous == null ||
        previous.width != bitmap.width ||
        previous.height != bitmap.height ||
        scale != prevScale
      ) {
        drawGrid(canvas, bitmap.width, bitmap.height, scale);

        previous = bitmap;
        prevScale = scale;
      }
    },
  };
}

export function grid(options = {}) {
  return (config) => gridExtension(config, options);
}
