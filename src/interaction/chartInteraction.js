import { GLOBAL_STATE, dispatch } from "../state";
import { pan } from "./chartPanZoom";
import { computeDraftMask } from "../chart/helpers";

function addHandle(e) {
  const rect = e.currentTarget.getBoundingClientRect();

  const index = Number(e.target.dataset.index);
  const scale = GLOBAL_STATE.scale;
  const { x, y } = GLOBAL_STATE.chartPan;

  let pos = {
    x: (e.clientX - rect.left - x) / scale,
    y: (rect.height - (e.clientY - rect.top) - y) / scale,
  };

  let pt = [
    (e.clientX - rect.left - x) / scale,
    (rect.height - (e.clientY - rect.top) - y) / scale,
  ];

  const newShape = [...GLOBAL_STATE.boundary];
  newShape.splice(index + 1, 0, pt);
  dispatch({ boundary: newShape });
}

export function dragHandle(e) {
  const index = e.target.dataset.index;
  let [x, y] = GLOBAL_STATE.boundary[index];

  const startPos = { x: e.clientX, y: e.clientY };

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      const dx = startPos.x - e.clientX;
      const dy = startPos.y - e.clientY;
      let newShape = [...GLOBAL_STATE.boundary];
      newShape[index] = [
        x - dx / GLOBAL_STATE.scale,
        y + dy / GLOBAL_STATE.scale,
      ];

      let chart = computeDraftMask(newShape);

      dispatch({ boundary: newShape, shapingMask: chart });
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

export function chartPointerDown(e) {
  if (e.target.classList.contains("handle")) {
    dragHandle(e);
  } else if (e.target.classList.contains("draft-line")) {
    addHandle(e);
  } else if (GLOBAL_STATE.activeTool == "hand") {
    pan(e);
  }
}
