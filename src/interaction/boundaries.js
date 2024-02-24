import { GLOBAL_STATE, dispatch } from "../state";

export function addPoint(e) {
  const rect = e.currentTarget.getBoundingClientRect();

  const boundaryIndex = Number(e.target.dataset.boundaryindex);
  const pointIndex = Number(e.target.dataset.index);

  const {
    scale,
    cellAspect,
    boundaries,
    chartPan: { x, y },
  } = GLOBAL_STATE;

  let pt = [
    Math.round((e.clientX - rect.left - x) / scale),
    Math.round((rect.height - (e.clientY - rect.top) - y) / scale / cellAspect),
  ];

  let newBounds = [...boundaries];
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

  const [x, y] = GLOBAL_STATE.boundaries[boundaryIndex][pointIndex];
  let last = [0, 0];

  const startPos = { x: e.clientX, y: e.clientY };
  dispatch({ transforming: true });

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      const { scale, cellAspect, boundaries } = GLOBAL_STATE;

      let dx = Math.round((startPos.x - e.clientX) / scale);
      let dy = Math.round((startPos.y - e.clientY) / scale / cellAspect);

      if (last[0] == dx && last[1] == dy) return;

      let newBounds = [...boundaries];

      newBounds[boundaryIndex][pointIndex] = [x - dx, y + dy];

      last = [dx, dy];

      dispatch({
        boundaries: newBounds,
      });
    }
  }

  function end() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointerleave", end);
    dispatch({ transforming: false });
  }

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointerleave", end);
}

export function dragPath(e) {
  const boundaryIndex = Number(e.target.dataset.boundaryindex);
  const pointIndex = Number(e.target.dataset.index);

  const boundary = GLOBAL_STATE.boundaries[boundaryIndex];

  const [x0, y0] = boundary[pointIndex];
  const [x1, y1] = boundary[(pointIndex + 1) % boundary.length];
  let last = [0, 0];

  const startPos = { x: e.clientX, y: e.clientY };

  dispatch({ transforming: true });

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      const { scale, cellAspect, boundaries } = GLOBAL_STATE;

      let dx = Math.round((startPos.x - e.clientX) / scale);
      let dy = Math.round((startPos.y - e.clientY) / scale / cellAspect);

      if (last[0] == dx && last[1] == dy) return;

      let newBounds = [...boundaries];

      newBounds[boundaryIndex][pointIndex] = [x0 - dx, y0 + dy];
      newBounds[boundaryIndex][(pointIndex + 1) % boundary.length] = [
        x1 - dx,
        y1 + dy,
      ];

      last[0] = dx;
      last[1] = dy;

      dispatch({
        boundaries: newBounds,
      });
    }
  }

  function end() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointerleave", end);
    dispatch({ transforming: false });
  }

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointerleave", end);
}

export function dragBoundary(e) {
  const boundaryIndex = Number(e.target.dataset.boundaryindex);

  if (GLOBAL_STATE.editingBoundary != boundaryIndex) return;

  const startBounds = GLOBAL_STATE.boundaries[boundaryIndex];
  const startPos = { x: e.clientX, y: e.clientY };

  let last = [0, 0];
  dispatch({ transforming: true });

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      const { scale, cellAspect, boundaries } = GLOBAL_STATE;

      let dx = Math.round((startPos.x - e.clientX) / scale);
      let dy = Math.round((startPos.y - e.clientY) / scale / cellAspect);

      if (last[0] == dx && last[1] == dy) return;

      let newBounds = [...boundaries];
      newBounds[boundaryIndex] = startBounds.map(([x, y]) => [x - dx, y + dy]);
      last = [dx, dy];
      dispatch({
        boundaries: newBounds,
      });
    }
  }

  function end() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointerleave", end);
    dispatch({ transforming: false });
  }

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointerleave", end);
}

export function editBoundary(e) {
  const boundaryIndex = Number(e.target.dataset.boundaryindex);

  dispatch({ editingBoundary: boundaryIndex });
}

export function removeBoundary(index) {
  const { boundaries, regions } = GLOBAL_STATE;

  dispatch({
    boundaries: boundaries.slice(0, index).concat(boundaries.slice(index + 1)),
    regions: regions.slice(0, index).concat(regions.slice(index + 1)),
    editingBoundary: null,
  });
}
