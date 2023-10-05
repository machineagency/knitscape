import { GLOBAL_STATE, dispatch } from "../state";
import { posAtCoords } from "../utils";

function pan(e, target) {
  const startPos = { x: e.clientX, y: e.clientY };
  const startPan = GLOBAL_STATE.chartPan;

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      const dx = startPos.x - e.clientX;
      const dy = startPos.y - e.clientY;

      dispatch({ chartPan: { x: startPan.x - dx, y: startPan.y - dy } });
    }
  }

  function end() {
    target.removeEventListener("pointermove", move);
    target.removeEventListener("pointerup", end);
    target.removeEventListener("pointerleave", end);
  }

  target.addEventListener("pointermove", move);
  target.addEventListener("pointerup", end);
  target.addEventListener("pointerleave", end);
}

export function repeatLibraryPointerInteraction(repeatLibraryContainer) {
  repeatLibraryContainer.addEventListener("pointerdown", (e) => {
    console.log("whee");
  });

  target.addEventListener("pointermove", (e) => {
    const { x, y } = posAtCoords(e, target);
    if (GLOBAL_STATE.pos.x != x || GLOBAL_STATE.pos.y != y) {
      dispatch({ pos: { x, y } });
    }
  });

  target.addEventListener("pointerleave", (e) => {
    dispatch({ pos: { x: -1, y: -1 } });
  });
}
