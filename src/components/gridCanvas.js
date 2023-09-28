import { sizeCanvasToBitmap } from "../actions/zoomFit";

export function gridCanvas({ canvas }) {
  return ({ state }) => {
    let { scale, chart, grid } = state;

    let width = chart.width;
    let height = chart.height;

    function draw() {
      if (!grid) return;
      const ctx = canvas.getContext("2d");
      ctx.resetTransform();

      ctx.translate(-0.5, -0.5);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        ctx.moveTo(x * scale, 0);
        ctx.lineTo(x * scale, height * scale + 1);
      }

      for (let y = 0; y < height; y++) {
        ctx.moveTo(0, y * scale);
        ctx.lineTo(width * scale + 1, y * scale);
      }

      ctx.stroke();
    }

    sizeCanvasToBitmap(canvas, width, height, scale);
    draw();

    return {
      syncState(state) {
        if (
          scale != state.scale ||
          width != state.chart.width ||
          height != state.chart.height ||
          grid != state.grid
        ) {
          width = state.chart.width;
          height = state.chart.height;
          scale = state.scale;
          grid = state.grid;

          sizeCanvasToBitmap(canvas, width, height, scale);
          draw();
        }
      },
    };
  };
}
