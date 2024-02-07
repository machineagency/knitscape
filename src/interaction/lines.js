import { GLOBAL_STATE, dispatch } from "../state";

export function dragAnnotationPath(e) {
  const pathIndex = Number(e.target.dataset.pathindex);
  const pointIndex = Number(e.target.dataset.pointindex);
  const paths = GLOBAL_STATE.paths;

  let [x0, y0] = paths[pathIndex][pointIndex];
  let [x1, y1] = paths[pathIndex][pointIndex + 1];

  const startPos = { x: e.clientX, y: e.clientY };

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      const dx = startPos.x - e.clientX;
      const dy = startPos.y - e.clientY;
      let updated = [...paths];

      updated[pathIndex][pointIndex] = [
        x0 - dx / GLOBAL_STATE.scale,
        y0 + dy / GLOBAL_STATE.scale,
      ];

      updated[pathIndex][pointIndex + 1] = [
        x1 - dx / GLOBAL_STATE.scale,
        y1 + dy / GLOBAL_STATE.scale,
      ];

      dispatch({
        paths: updated,
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

export function dragAnnotationPoint(e) {
  const pathIndex = Number(e.target.dataset.pathindex);
  const pointIndex = Number(e.target.dataset.pointindex);
  const paths = GLOBAL_STATE.paths;

  let [x0, y0] = paths[pathIndex][pointIndex];

  const startPos = { x: e.clientX, y: e.clientY };

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      const dx = startPos.x - e.clientX;
      const dy = startPos.y - e.clientY;
      let updated = [...paths];

      updated[pathIndex][pointIndex] = [
        x0 - dx / GLOBAL_STATE.scale,
        y0 + dy / GLOBAL_STATE.scale,
      ];

      dispatch({
        paths: updated,
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

export function drawLine(e) {
  const startPos = { x: e.clientX, y: e.clientY };
  const startPt = ptAtMouse();

  dispatch({
    paths: [...GLOBAL_STATE.paths, [startPt, startPt]],
    locked: true,
  });

  function ptAtMouse() {
    let pX =
      (GLOBAL_STATE.desktopPointerPos[0] - GLOBAL_STATE.chartPan.x) /
      GLOBAL_STATE.scale;
    let pY =
      (GLOBAL_STATE.desktopPointerPos[1] - GLOBAL_STATE.chartPan.y) /
      GLOBAL_STATE.scale;

    return [pX, pY];
  }

  function move(e) {
    const dx = startPos.x - e.clientX;
    const dy = startPos.y - e.clientY;

    let paths = [...GLOBAL_STATE.paths];
    let pathIndex = paths.length - 1;
    let ptIndex = paths[pathIndex].length - 1;

    paths[pathIndex][ptIndex] = [
      startPt[0] - dx / GLOBAL_STATE.scale,
      startPt[1] + dy / GLOBAL_STATE.scale,
    ];

    dispatch({ paths });
  }

  function end() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointerleave", end);
    window.removeEventListener("click", addPoint);
    window.removeEventListener("keydown", escapePath);

    dispatch({ locked: false });
  }

  function addPoint() {
    let paths = [...GLOBAL_STATE.paths];
    let pathIndex = paths.length - 1;
    paths[pathIndex].push(ptAtMouse());

    dispatch({
      paths,
    });
  }

  function escapePath(e) {
    if (e.key == "Escape") {
      let paths = [...GLOBAL_STATE.paths];
      let pathIndex = paths.length - 1;
      paths[pathIndex].pop();

      dispatch({ paths });
      end();
    }
  }

  function checkMode(e) {
    const dx = startPos.x - e.clientX;
    const dy = startPos.y - e.clientY;

    if (dx < 10 && dy < 10) {
      // click to add points mode
      window.addEventListener("click", addPoint);
      window.removeEventListener("pointerup", checkMode);
    } else {
      window.removeEventListener("pointerup", checkMode);
      end();
    }
  }

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", checkMode);
  window.addEventListener("pointerleave", end);
  window.addEventListener("keydown", escapePath);
}
