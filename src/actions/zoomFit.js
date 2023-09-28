import { GLOBAL_STATE, dispatch } from "../state";
import { devicePixelBoundingBox } from "../utils";

function center() {
  const { width, height } = devicePixelBoundingBox(
    document.getElementById("layers-container")
  );
}

export function fitChart() {
  const { width, height } = devicePixelBoundingBox(
    document.getElementById("layers-container")
  );

  const scale = Math.min(
    Math.floor(width / GLOBAL_STATE.chart.width),
    Math.floor(height / GLOBAL_STATE.chart.height)
  );

  dispatch({
    scale,
    chartPan: {
      x: (width - scale * GLOBAL_STATE.chart.width) / 2 / devicePixelRatio,
      y: (height - scale * GLOBAL_STATE.chart.height) / 2 / devicePixelRatio,
    },
  });
}

export function sizeCanvasToBitmap(canvas, bitmapWidth, bitmapHeight, scale) {
  canvas.width = scale * bitmapWidth;
  canvas.height = scale * bitmapHeight;

  canvas.style.cssText = `width: ${
    (scale * bitmapWidth) / devicePixelRatio
  }px; height: ${(scale * bitmapHeight) / devicePixelRatio}px;`;
}
