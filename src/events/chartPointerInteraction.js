import { GLOBAL_STATE, dispatch } from "../state";
import { paintTools } from "../actions/paintTools";
import { otherTools } from "../actions/otherTools";

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

export function chartPointerInteraction({ target, workspace }) {
  target.addEventListener("pointerdown", (e) => {
    const activeTool = GLOBAL_STATE.activeTool;

    if (activeTool in paintTools)
      chartInteraction(target, paintTools[activeTool]);
    else if (activeTool in otherTools)
      canvasInteraction(e, target, otherTools[activeTool]);
    else {
      console.console.warn(`Uh oh, ${activeTool} is not a tool`);
    }
  });

  workspace.addEventListener("wheel", (e) => {
    const currentScale = GLOBAL_STATE.scale;
    const pan = GLOBAL_STATE.chartPan;

    let bounds = workspace.getBoundingClientRect();
    const startX = (e.clientX - bounds.left - pan.x) / currentScale;
    const startY = (e.clientY - bounds.top - pan.y) / currentScale;

    let newScale;

    if (Math.sign(e.deltaY) < 0 && currentScale > 6)
      newScale = currentScale - 1;
    else if (Math.sign(e.deltaY) > 0 && currentScale < 100)
      newScale = currentScale + 1;
    else return;

    dispatch({
      scale: newScale,
      chartPan: {
        x: e.clientX - bounds.left - startX * newScale,
        y: e.clientY - bounds.top - startY * newScale,
      },
    });
  });
}
