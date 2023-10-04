import { sizeCanvasToBitmap } from "../actions/zoomFit";

export function outlineCanvas({
  inner = "#000000",
  outer = "#ffffff",
  canvas,
}) {
  return ({ state }) => {
    let { scale, pos, chart } = state;
    let width = chart.width;
    let height = chart.height;

    function draw() {
      const ctx = canvas.getContext("2d");
      ctx.resetTransform();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (pos.x < 0 || pos.y < 0) return;
      ctx.translate(-0.5, -0.5);
      ctx.imageSmoothingEnabled = false;

      ctx.strokeStyle = outer;
      ctx.strokeRect(
        pos.x * scale + 1,
        pos.y * scale + 1,
        scale - 2,
        scale - 2
      );
      ctx.strokeStyle = inner;
      ctx.strokeRect(
        pos.x * scale + 2,
        pos.y * scale + 2,
        scale - 4,
        scale - 4
      );
    }

    sizeCanvasToBitmap(canvas, width, height);

    return {
      syncState(state) {
        if (
          scale != state.scale ||
          width != state.chart.width ||
          height != state.chart.height
        ) {
          scale = state.scale;
          width = state.chart.width;
          height = state.chart.height;

          sizeCanvasToBitmap(canvas, width, height);
        }
        if (state.pos != pos) {
          pos = state.pos;

          draw();
        }
      },
    };
  };
}
