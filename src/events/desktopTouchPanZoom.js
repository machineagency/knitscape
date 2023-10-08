import { GLOBAL_STATE, dispatch } from "../state";
import { posAtCoords } from "../utils";
import { zoomAtPoint } from "../actions/zoomFit";

export function desktopTouchPanZoom(desktop) {
  const evCache = [];
  let prevDiff = -1;

  function removeEvent(ev) {
    // Remove this event from the target's cache
    const index = evCache.findIndex(
      (cachedEv) => cachedEv.pointerId === ev.pointerId
    );
    evCache.splice(index, 1);
  }

  function endPointer(e) {
    dispatch({ pos: { x: -1, y: -1 } });

    removeEvent(e);

    if (evCache.length < 2) {
      prevDiff = -1;
    }
  }

  function pan(e, target) {
    const startPos = { x: e.clientX, y: e.clientY };
    const startPan = GLOBAL_STATE.chartPan;

    function move(e) {
      const dx = startPos.x - e.clientX;
      const dy = startPos.y - e.clientY;

      dispatch({ chartPan: { x: startPan.x - dx, y: startPan.y - dy } });
    }

    function end() {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointercancel", end);
      target.removeEventListener("pointerleave", end);
      target.removeEventListener("pointerout", end);
    }

    target.addEventListener("pointermove", move);
    target.addEventListener("pointercancel", end);
    target.addEventListener("pointerleave", end);
    target.addEventListener("pointerout", end);
  }

  desktop.addEventListener("pointerdown", (e) => {
    const { x, y } = posAtCoords(e, desktop);
    evCache.push(e);

    if (GLOBAL_STATE.pos.x != x || GLOBAL_STATE.pos.y != y) {
      dispatch({ pos: { x, y } });
    }

    if (e.target == desktop || e.target.id == "symbol-canvas") {
      dispatch({ editingRepeat: -1 });
      pan(e, desktop);
    }
  });

  desktop.addEventListener("pointermove", (e) => {
    const { x, y } = posAtCoords(e, desktop);

    if (GLOBAL_STATE.pos.x != x || GLOBAL_STATE.pos.y != y) {
      dispatch({ pos: { x, y } });
    }

    const index = evCache.findIndex(
      (cachedEv) => cachedEv.pointerId === e.pointerId
    );

    evCache[index] = e;

    console.log(evCache);

    if (evCache.length === 2) {
      console.log("zoom");
      // Calculate the distance between the two pointers
      const curDiff = Math.sqrt(
        Math.pow(evCache[0].clientX - evCache[1].clientX, 2) +
          Math.pow(evCache[0].clientY - evCache[1].clientY, 2)
      );
      let scale;

      if (prevDiff > 0) {
        if (curDiff > prevDiff) {
          // The distance between the two pointers has increased
          scale = GLOBAL_STATE.scale - 1;
        }
        if (curDiff < prevDiff) {
          // The distance between the two pointers has decreased
          scale = GLOBAL_STATE.scale + 1;
        }
      }

      zoomAtPoint({
        x: evCache[0].clientX + evCache[0].clientX - evCache[1].clientX,
        y: evCache[0].clientY + evCache[0].clientY - evCache[1].clientY,
        scale,
      });

      // Cache the distance for the next move event
      prevDiff = curDiff;
    }
  });

  desktop.addEventListener("pointerup", (e) => {
    endPointer(e);
  });

  desktop.addEventListener("pointercancel", (e) => {
    endPointer(e);
  });

  desktop.addEventListener("pointerleave", (e) => {
    endPointer(e);
  });

  desktop.addEventListener("pointerout", (e) => {
    endPointer(e);
  });
}
