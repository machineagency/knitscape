function draw(canvas, scale, pos, color) {
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (pos.x < 0 || pos.y < 0) return;

  ctx.fillStyle = color;

  ctx.fillRect(pos.x * scale, pos.y * scale, scale, scale);
}

function highlightExtension({}, { canvas, color = "#00000044" }) {
  let lastPos = null;

  return {
    syncState(state) {
      if (state.pos != lastPos) {
        draw(canvas, state.scale, state.pos, color);
        lastPos = state.pos;
      }
    },
  };
}

export function highlightCell(options = {}) {
  return (config) => highlightExtension(config, options);
}
