import { GLOBAL_STATE, dispatch } from "../state";

export function drawLine(e) {
  const startPos = { x: e.clientX, y: e.clientY };
  const startPt = ptAtMouse();

  dispatch({
    paths: [...GLOBAL_STATE.paths, [startPt, startPt]],
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
    if (e.buttons == 0) {
      end();
    } else {
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
  }

  function end() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointerleave", end);

    window.removeEventListener("keydown", end);
  }

  function addPoint() {
    let paths = [...GLOBAL_STATE.paths];
    let pathIndex = paths.length - 1;
    paths[pathIndex].push([ptAtMouse(), ptAtMouse()]);

    dispatch({
      paths,
    });
  }

  function checkMode(e) {
    const dx = startPos.x - e.clientX;
    const dy = startPos.y - e.clientY;

    if (dx < 10 && dy < 10) {
      // click to add points mode
      window.addEventListener("click", addPoint);
    } else {
      window.removeEventListener("pointerup", checkMode);
      end();
    }
  }

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", checkMode);
  window.addEventListener("pointerleave", end);
  window.addEventListener("keydown", end);
}
