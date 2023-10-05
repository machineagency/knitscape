import { GLOBAL_STATE, dispatch } from "../state";
import { posAtCoords } from "../utils";

import { paintTools } from "../actions/paintTools";
import { canvasTools } from "../actions/canvasTools";

function chartInteraction(target, tool) {
  // tool onMove is not called unless pointer moves into another cell in the chart
  let pos = GLOBAL_STATE.pos;

  let onMove = tool(pos, GLOBAL_STATE, dispatch);
  if (!onMove) return;

  function move(moveEvent) {
    if (moveEvent.buttons == 0) {
      end();
    } else {
      let newPos = GLOBAL_STATE.pos;
      if (newPos.x == pos.x && newPos.y == pos.y) return;
      onMove(GLOBAL_STATE.pos, GLOBAL_STATE);
      pos = newPos;
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

function canvasInteraction(e, target, tool) {
  // tool onMove is called on pointer move
  let pos = { x: e.clientX, y: e.clientY };
  let onMove = tool(pos, GLOBAL_STATE, dispatch);

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      onMove({ x: e.clientX, y: e.clientY }, GLOBAL_STATE);
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

export function chartPointerInteraction(target) {
  target.addEventListener("pointerdown", (e) => {
    console.log("CHART");
    dispatch({ editingRepeat: -1 });
    // const activeTool = GLOBAL_STATE.activeTool;

    // if (activeTool in paintTools)
    //   chartInteraction(target, paintTools[activeTool]);
    // else if (activeTool in canvasTools)
    //   canvasInteraction(e, target, canvasTools[activeTool]);
    // else {
    //   console.console.warn(`Uh oh, ${activeTool} is not a tool`);
    // }
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
