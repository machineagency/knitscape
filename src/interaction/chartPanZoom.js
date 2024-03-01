import { GLOBAL_STATE, dispatch } from "../state";

export function pan(e) {
  const startPos = { x: e.clientX, y: e.clientY };
  const startPan = GLOBAL_STATE.chartPan;

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      const dx = startPos.x - e.clientX;
      const dy = startPos.y - e.clientY;

      dispatch({
        chartPan: {
          x: Math.floor(startPan.x - dx),
          y: Math.floor(startPan.y + dy),
        },
      });
    }
  }

  function end() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointerleave", end);
  }

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointerleave", end);
}

export function fitChart(parent) {
  const { cellAspect, chart, bbox } = GLOBAL_STATE;

  const { width, height } = parent.getBoundingClientRect();

  const scale = Math.floor(
    0.9 *
      Math.min(
        Math.floor(width / chart.width),
        Math.floor(height / (chart.height * cellAspect))
      )
  );

  const xOffset = (width - scale * chart.width) / 2;
  const yOffset = (height - scale * chart.height * cellAspect) / 2;

  dispatch({
    scale,
    cellWidth: scale,
    cellHeight: scale * cellAspect,
    chartPan: {
      x: Math.round(xOffset - bbox.xMin * scale),
      y: Math.round(yOffset - bbox.yMin * scale * cellAspect),
    },
  });
}

function zoomAtPoint(pt, newScale) {
  const { chartPan, cellAspect, scale } = GLOBAL_STATE;

  const start = {
    x: (pt.x - chartPan.x) / scale,
    y: (pt.y - chartPan.y) / scale,
  };

  dispatch({
    scale: newScale,
    cellWidth: newScale,
    cellHeight: newScale * cellAspect,
    chartPan: {
      x: Math.round(pt.x - start.x * newScale),
      y: Math.round(pt.y - start.y * newScale),
    },
  });
}

export function zoom(e) {
  const bounds = e.currentTarget.getBoundingClientRect();
  let scale;

  if (Math.sign(e.deltaY) < 0) {
    scale = GLOBAL_STATE.reverseScroll
      ? GLOBAL_STATE.scale * 0.9
      : GLOBAL_STATE.scale * 1.1;
  } else {
    scale = GLOBAL_STATE.reverseScroll
      ? GLOBAL_STATE.scale * 1.1
      : GLOBAL_STATE.scale * 0.9;
  }

  zoomAtPoint(
    {
      x: e.clientX - bounds.left,
      y: bounds.height - (e.clientY - bounds.top),
    },
    Math.floor(scale)
  );
}
