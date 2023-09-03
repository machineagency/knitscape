function highlightExtension(
  { state },
  { cell = true, row = false, col = false, color = "#00000044" }
) {
  let { aspectRatio, scale, bitmap, pos, pan, canvas } = state;
  let cellSize = [aspectRatio[0] * scale, aspectRatio[1] * scale];

  function draw() {
    if (pos.x < 0 || pos.y < 0) return;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = color;

    if (cell) {
      ctx.fillRect(
        pos.x * cellSize[0],
        pos.y * cellSize[1],
        cellSize[0],
        cellSize[1]
      );
    }
    if (row) {
      ctx.fillRect(
        0,
        pos.y * cellSize[1],
        cellSize[0] * bitmap.width,
        cellSize[1]
      );
    }
    if (col) {
      ctx.fillRect(
        pos.x * cellSize[0],
        0,
        cellSize[0],
        cellSize[1] * bitmap.height
      );
    }
  }

  return {
    syncState(state) {
      if (
        state.bitmap.width != bitmap.width ||
        state.bitmap.height != bitmap.height ||
        state.aspectRatio[0] != aspectRatio[0] ||
        state.aspectRatio[1] != aspectRatio[1] ||
        state.scale != scale ||
        state.pos != pos
      ) {
        pos = state.pos;
        bitmap = state.bitmap;
        aspectRatio = state.aspectRatio;
        scale = state.scale;
        pan = state.pan;

        cellSize = [aspectRatio[0] * scale, aspectRatio[1] * scale];

        draw();
      }
    },
  };
}

export function highlight(options = {}) {
  return (config) => highlightExtension(config, options);
}
