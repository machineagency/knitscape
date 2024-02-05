import { GLOBAL_STATE, dispatch } from "../state";
import { pan } from "./chartPanZoom";
import { computeDraftMask } from "../chart/helpers";

function addPoint(e) {
  const rect = e.currentTarget.getBoundingClientRect();

  const index = Number(e.target.dataset.index);
  const scale = GLOBAL_STATE.scale;
  const { x, y } = GLOBAL_STATE.chartPan;

  let pt = [
    (e.clientX - rect.left - x) / scale,
    (rect.height - (e.clientY - rect.top) - y) / scale,
    GLOBAL_STATE.boundary[index].fashioning,
  ];

  const newShape = [...GLOBAL_STATE.boundary];
  newShape.splice(index + 1, 0, pt);
  dispatch({ boundary: newShape });
}

function deletePoint(e) {
  const index = Number(e.target.dataset.index);

  const newShape = [...GLOBAL_STATE.boundary];
  newShape.splice(index, 1);

  let chart = computeDraftMask(newShape);

  dispatch({
    boundary: newShape,
    shapingMask: chart,
    yarnSequence: Array.from({ length: chart.height }, () => [0]),
  });
}

export function dragPoint(e) {
  const index = Number(e.target.dataset.index);
  let [x, y, fashioning] = GLOBAL_STATE.boundary[index];

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
        fashioning,
      ];

      let chart = computeDraftMask(newShape);

      dispatch({
        boundary: newShape,
        shapingMask: chart,
        yarnSequence: Array.from({ length: chart.height }, () => [0]),
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

export function dragPath(e) {
  const index = Number(e.target.dataset.index);
  const pts = GLOBAL_STATE.boundary;

  let [x0, y0, f0] = pts[index];
  let [x1, y1, f1] = pts[(index + 1) % pts.length];

  const startPos = { x: e.clientX, y: e.clientY };

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      const dx = startPos.x - e.clientX;
      const dy = startPos.y - e.clientY;
      let updated = [...pts];

      updated[index] = [
        x0 - dx / GLOBAL_STATE.scale,
        y0 + dy / GLOBAL_STATE.scale,
        f0,
      ];

      updated[(index + 1) % pts.length] = [
        x1 - dx / GLOBAL_STATE.scale,
        y1 + dy / GLOBAL_STATE.scale,
        f1,
      ];

      let chart = computeDraftMask(updated);

      dispatch({
        boundary: updated,
        shapingMask: chart,
        yarnSequence: Array.from({ length: chart.height }, () => [0]),
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

export function chartPointerDown(e) {
  if (e.target.classList.contains("point")) {
    dragPoint(e);
  } else if (e.target.classList.contains("path")) {
    dragPath(e);
  } else if (GLOBAL_STATE.activeTool == "hand") {
    pan(e);
  }
}

export function chartContextMenu(e) {
  e.preventDefault();
  if (e.target.classList.contains("point")) {
    deletePoint(e);
  } else if (e.target.classList.contains("path")) {
    addPoint(e);
  }
}
