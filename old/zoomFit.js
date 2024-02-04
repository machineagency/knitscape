import { GLOBAL_STATE, dispatch } from "../state";
import { devicePixelBoundingBox } from "../utils";
import { MIN_SCALE, MAX_SCALE } from "../constants";

export function centerZoom(scale) {
  let bbox = document.getElementById("desktop").getBoundingClientRect();

  zoomAtPoint({ x: bbox.width / 2, y: bbox.height / 2 }, scale);
}

export function centerZoomSimulation(scale) {
  let bbox = document.getElementById("sim-container").getBoundingClientRect();

  zoomSimulationAtPoint({ x: bbox.width / 2, y: bbox.height / 2 }, scale);
}

export function zoomAtPoint(pt, scale) {
  if (scale < MIN_SCALE || scale > MAX_SCALE) return;

  const start = {
    x: (pt.x - GLOBAL_STATE.chartPan.x) / GLOBAL_STATE.scale,
    y: (pt.y - GLOBAL_STATE.chartPan.y) / GLOBAL_STATE.scale,
  };

  dispatch({
    scale,
    chartPan: {
      x: pt.x - start.x * scale,
      y: pt.y - start.y * scale,
    },
  });
}

export function fitChart() {
  const { width, height } = devicePixelBoundingBox(
    document.getElementById("chart-pane")
  );

  const scale = Math.floor(
    0.9 *
      Math.min(
        Math.floor(width / GLOBAL_STATE.chart.width),
        Math.floor(height / GLOBAL_STATE.chart.height)
      )
  );

  dispatch({
    scale,
    chartPan: {
      x: (width - scale * GLOBAL_STATE.chart.width) / 2 / devicePixelRatio,
      y: (height - scale * GLOBAL_STATE.chart.height) / 2 / devicePixelRatio,
    },
  });
}

export function sizeCanvasToBitmap(canvas, bitmapWidth, bitmapHeight) {
  canvas.width = GLOBAL_STATE.scale * bitmapWidth;
  canvas.height = GLOBAL_STATE.scale * bitmapHeight;
  canvas.style.width = `${
    (GLOBAL_STATE.scale * bitmapWidth) / devicePixelRatio
  }px`;

  canvas.style.height = `${
    (GLOBAL_STATE.scale * bitmapHeight) / devicePixelRatio
  }px`;
}
