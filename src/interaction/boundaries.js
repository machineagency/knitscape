import { scanlineFill } from "../charting/helpers";
import { GLOBAL_STATE, dispatch } from "../state";

export function updateFashioning(index, val) {
  const newBounds = [...GLOBAL_STATE.boundary];
  newBounds[index][2] = val;

  let chart = scanlineFill(
    newBounds,
    GLOBAL_STATE.stitchGauge,
    GLOBAL_STATE.rowGauge
  );

  dispatch({
    boundary: newBounds,
    shapingMask: chart,
    yarnSequence: Array.from({ length: chart.height }, () => [0]),
  });
}

export function addPoint(e) {
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

export function deletePoint(e) {
  const index = Number(e.target.dataset.index);

  const newBounds = [...GLOBAL_STATE.boundary];
  newBounds.splice(index, 1);

  let chart = scanlineFill(
    newBounds,
    GLOBAL_STATE.stitchGauge,
    GLOBAL_STATE.rowGauge
  );

  dispatch({
    boundary: newShape,
    shapingMask: chart,
    yarnSequence: Array.from({ length: chart.height }, () => [0]),
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
      const dx = startPos.x - e.clientX;
      const dy = startPos.y - e.clientY;
      let newBounds = [...GLOBAL_STATE.boundaries];
      newBounds[boundaryIndex][pointIndex] = [
        x - dx / GLOBAL_STATE.scale,
        y + dy / GLOBAL_STATE.scale,
      ];

      // let chart = scanlineFill(
      //   newBounds,
      //   GLOBAL_STATE.stitchGauge,
      //   GLOBAL_STATE.rowGauge
      // );

      dispatch({
        boundaries: newBounds,
        // shapingMask: chart,
        // yarnSequence: Array.from({ length: chart.height }, () => [0]),
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

      let chart = scanlineFill(
        updated,
        GLOBAL_STATE.stitchGauge,
        GLOBAL_STATE.rowGauge
      );

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
