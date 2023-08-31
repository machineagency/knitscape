function makeGrid({ state }, { canvas }) {
  let { aspectRatio, scale, bitmap } = state;
  let cellSize = [aspectRatio[0] * scale, aspectRatio[1] * scale];

  function draw() {
    const ctx = canvas.getContext("2d");

    ctx.save();
    ctx.translate(-0.5, -0.5);

    ctx.beginPath();

    for (let x = 1; x < bitmap.width; x++) {
      ctx.moveTo(x * cellSize[0], 0);
      ctx.lineTo(x * cellSize[0], bitmap.height * cellSize[1]);
    }

    for (let y = 1; y < bitmap.height; y++) {
      ctx.moveTo(0, y * cellSize[1]);
      ctx.lineTo(bitmap.width * cellSize[0], y * cellSize[1]);
    }

    ctx.stroke();

    ctx.restore();
  }

  return {
    syncState(state) {
      ({ aspectRatio, scale, bitmap } = state);
      cellSize = [aspectRatio[0] * scale, aspectRatio[1] * scale];

      draw();
    },
  };
}

export function grid(options = {}) {
  return (config) => makeGrid(config, options);
}
