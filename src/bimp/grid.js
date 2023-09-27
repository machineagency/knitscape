function drawGrid(ctx, width, height, scale) {
  ctx.imageSmoothingEnabled = false;

  ctx.beginPath();

  for (let x = 1; x < width; x++) {
    ctx.moveTo(x * scale, 0);
    ctx.lineTo(x * scale, height * scale + 1);
  }

  for (let y = 1; y < height; y++) {
    ctx.moveTo(0, y * scale);
    ctx.lineTo(width * scale + 1, y * scale);
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
        const ctx = canvas.getContext("2d");
        ctx.resetTransform();
        ctx.translate(-0.5, -0.5);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawGrid(ctx, bitmap.width, bitmap.height, scale);

        previous = bitmap;
        prevScale = scale;
      }
    },
  };
}

export function grid(options = {}) {
  return (config) => gridExtension(config, options);
}
