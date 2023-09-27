function outlineExtension({ state }, { outer = "#000000", inner = "#ffffff" }) {
  let { aspectRatio, scale, bitmap, pos, pan, canvas } = state;
  let cellSize = [aspectRatio[0] * scale, aspectRatio[1] * scale];

  function draw() {
    if (pos.x < 0 || pos.y < 0) return;
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = inner;
    ctx.strokeRect(
      pos.x * cellSize[0] + 1.5,
      pos.y * cellSize[1] + 1.5,
      cellSize[0] - 3,
      cellSize[1] - 3
    );

    ctx.strokeStyle = outer;
    ctx.strokeRect(
      pos.x * cellSize[0] + 0.5,
      pos.y * cellSize[1] + 0.5,
      cellSize[0] - 1,
      cellSize[1] - 1
    );
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

export function outline(options = {}) {
  return (config) => outlineExtension(config, options);
}
