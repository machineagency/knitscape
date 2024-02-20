import { GLOBAL_STATE, dispatch } from "../state";

export function addPoint(e) {
  const rect = e.currentTarget.getBoundingClientRect();

  const boundaryIndex = Number(e.target.dataset.boundaryindex);
  const pointIndex = Number(e.target.dataset.index);

  const scale = GLOBAL_STATE.scale;
  const { x, y } = GLOBAL_STATE.chartPan;

  let pt = [
    (e.clientX - rect.left - x) / scale,
    (rect.height - (e.clientY - rect.top) - y) / scale,
  ];

  let newBounds = [...GLOBAL_STATE.boundaries];
  newBounds[boundaryIndex].splice(pointIndex + 1, 0, pt);

  dispatch({ boundaries: newBounds });
}

export function deletePoint(e) {
  const boundaryIndex = Number(e.target.dataset.boundaryindex);
  const pointIndex = Number(e.target.dataset.index);

  let newBounds = [...GLOBAL_STATE.boundaries];

  newBounds[boundaryIndex].splice(pointIndex, 1);

  dispatch({
    boundaries: newBounds,
  });
}

export function dragPoint(e) {
  const boundaryIndex = Number(e.target.dataset.boundaryindex);
  const pointIndex = Number(e.target.dataset.index);

  let [x, y] = GLOBAL_STATE.boundaries[boundaryIndex][pointIndex];

  const startPos = { x: e.clientX, y: e.clientY };

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      let newBounds = [...GLOBAL_STATE.boundaries];
      newBounds[boundaryIndex][pointIndex] = [
        x - (startPos.x - e.clientX) / GLOBAL_STATE.scale,
        y + (startPos.y - e.clientY) / GLOBAL_STATE.scale,
      ];

      dispatch({
        boundaries: newBounds,
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
  const boundaryIndex = Number(e.target.dataset.boundaryindex);
  const pointIndex = Number(e.target.dataset.index);

  const boundary = GLOBAL_STATE.boundaries[boundaryIndex];

  let [x0, y0] = boundary[pointIndex];
  let [x1, y1] = boundary[(pointIndex + 1) % boundary.length];

  const startPos = { x: e.clientX, y: e.clientY };

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      const dx = startPos.x - e.clientX;
      const dy = startPos.y - e.clientY;
      let newBounds = [...GLOBAL_STATE.boundaries];

      newBounds[boundaryIndex][pointIndex] = [
        x0 - dx / GLOBAL_STATE.scale,
        y0 + dy / GLOBAL_STATE.scale,
      ];

      newBounds[boundaryIndex][(pointIndex + 1) % boundary.length] = [
        x1 - dx / GLOBAL_STATE.scale,
        y1 + dy / GLOBAL_STATE.scale,
      ];

      dispatch({
        boundaries: newBounds,
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
