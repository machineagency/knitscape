import { GLOBAL_STATE, dispatch } from "../state";
import { posAtCoords } from "../utils";

function pan(e, target) {
  const startPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  const startPan = GLOBAL_STATE.chartPan;

  function move(e) {
    const dx = startPos.x - e.touches[0].clientX;
    const dy = startPos.y - e.touches[0].clientY;

    dispatch({ chartPan: { x: startPan.x - dx, y: startPan.y - dy } });
  }

  function end() {
    target.removeEventListener("touchmove", move);
    target.removeEventListener("touchcancel", end);
    target.removeEventListener("touchend", end);
  }

  target.addEventListener("touchmove", move);
  target.addEventListener("touchcancel", end);
  target.addEventListener("touchend", end);
}

export function chartTouchInteraction(chartCanvas) {
  chartCanvas.addEventListener("touchstart", (e) => {
    const { x, y } = posAtCoords(e.touches[0], chartCanvas);

    if (GLOBAL_STATE.pos.x != x || GLOBAL_STATE.pos.y != y) {
      dispatch({ pos: { x, y } });
    }

    dispatch({ editingRepeat: -1 });
    pan(e, chartCanvas);
  });

  chartCanvas.addEventListener("touchmove", (e) => {
    const { x, y } = posAtCoords(e.touches[0], chartCanvas);
    if (GLOBAL_STATE.pos.x != x || GLOBAL_STATE.pos.y != y) {
      dispatch({ pos: { x, y } });
    }
  });

  chartCanvas.addEventListener("touchend", (e) => {
    dispatch({ pos: { x: -1, y: -1 } });
  });

  chartCanvas.addEventListener("touchcancel", (e) => {
    dispatch({ pos: { x: -1, y: -1 } });
  });
}
