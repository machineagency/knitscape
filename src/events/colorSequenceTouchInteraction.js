import { GLOBAL_STATE, dispatch } from "../state";
import { colorSequencePosAtCoords } from "../utils";

import { colorSequenceTools } from "../actions/colorSequenceTools";

function chartInteraction(target, tool) {
  // tool onMove is not called unless pointer moves into another cell in the chart

  let pos = GLOBAL_STATE.colorSequencePos;

  let onMove = tool(pos, GLOBAL_STATE, dispatch);

  if (!onMove) return;

  function end() {
    target.removeEventListener("touchmove", move);
    target.removeEventListener("touchcancel", end);
    target.removeEventListener("touchend", end);
  }

  function move() {
    let newPos = GLOBAL_STATE.colorSequencePos;
    if (newPos.x == pos.x && newPos.y == pos.y) return;
    onMove(GLOBAL_STATE.colorSequencePos, GLOBAL_STATE);
    pos = newPos;
  }
  target.addEventListener("touchmove", move);
  target.addEventListener("touchcancel", end);
  target.addEventListener("touchend", end);
}

export function colorSequenceTouchInteraction(canvas, resizeDragger) {
  canvas.addEventListener("touchstart", (e) => {
    const { x, y } = colorSequencePosAtCoords(e.touches[0], canvas);

    if (
      GLOBAL_STATE.colorSequencePos.x != x ||
      GLOBAL_STATE.colorSequencePos.y != y
    ) {
      dispatch({ colorSequencePos: { x, y } });
    }

    e.preventDefault();
    chartInteraction(canvas, colorSequenceTools["brush"]);
  });

  canvas.addEventListener("touchmove", (e) => {
    const { x, y } = colorSequencePosAtCoords(e.touches[0], canvas);
    if (
      GLOBAL_STATE.colorSequencePos.x != x ||
      GLOBAL_STATE.colorSequencePos.y != y
    ) {
      dispatch({ colorSequencePos: { x, y } });
    }
  });

  canvas.addEventListener("touchend", (e) => {
    dispatch({ colorSequencePos: { x: -1, y: -1 } });
  });

  canvas.addEventListener("touchcancel", (e) => {
    dispatch({ colorSequencePos: { x: -1, y: -1 } });
  });

  resizeDragger.addEventListener("touchstart", (e) => {
    const startSequence = GLOBAL_STATE.yarnSequence;
    const start = e.touches[0].clientY;

    const end = () => {
      document.body.classList.remove("grabbing");

      window.removeEventListener("touchmove", onmove);
      window.removeEventListener("touchend", end);
      window.removeEventListener("touchcancel", end);
    };

    const onmove = (e) => {
      let newSize =
        startSequence.height +
        Math.floor((start - e.touches[0].clientY) / GLOBAL_STATE.scale);
      if (newSize < 1 || newSize == startSequence.height) return;

      dispatch({
        yarnSequence: startSequence.resize(1, newSize),
      });
    };

    window.addEventListener("touchmove", onmove);
    window.addEventListener("touchend", end);
    window.addEventListener("touchcancel", end);
  });
}
