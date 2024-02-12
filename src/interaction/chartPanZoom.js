import { GLOBAL_STATE, dispatch } from "../state";
import { polygonBbox } from "../charting/helpers";

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

export function fitDraft(parent) {
  const { stitchGauge, rowGauge, boundary } = GLOBAL_STATE;

  const bbox = polygonBbox(boundary);
  const { width, height } = parent.getBoundingClientRect();
  const scale = Math.floor(
    0.9 *
      Math.min(Math.floor(width / bbox.width), Math.floor(height / bbox.height))
  );

  dispatch({
    scale,
    cellWidth: scale / stitchGauge,
    cellHeight: scale / rowGauge,
    chartPan: {
      x: Math.round((width - scale * bbox.width) / 2),
      y: Math.round((height - scale * bbox.height) / 2),
    },
  });
}

function zoomAtPoint(pt, newScale) {
  const { chartPan, stitchGauge, rowGauge, scale } = GLOBAL_STATE;

  const start = {
    x: (pt.x - chartPan.x) / scale,
    y: (pt.y - chartPan.y) / scale,
  };

  dispatch({
    scale: newScale,
    cellWidth: newScale / stitchGauge,
    cellHeight: newScale / rowGauge,
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
      y: bounds.height - e.clientY - bounds.top,
    },
    scale
  );
}
