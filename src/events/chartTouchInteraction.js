import { GLOBAL_STATE, dispatch } from "../state";
import { paintTools } from "../actions/paintTools";
import { otherTools } from "../actions/otherTools";

function chartInteraction(target, tool) {
  // tool onMove is not called unless pointer moves into another cell in the chart

  let pos = GLOBAL_STATE.pos;

  let onMove = tool(pos, GLOBAL_STATE, dispatch);

  if (!onMove) return;

  function end() {
    target.removeEventListener("touchmove", move);
    target.removeEventListener("touchcancel", end);
    target.removeEventListener("touchend", end);
  }

  function move() {
    let newPos = GLOBAL_STATE.pos;
    if (newPos.x == pos.x && newPos.y == pos.y) return;
    onMove(GLOBAL_STATE.pos, GLOBAL_STATE);
    pos = newPos;
  }
  target.addEventListener("touchmove", move);
  target.addEventListener("touchcancel", end);
  target.addEventListener("touchend", end);
}

function canvasInteraction(e, target, tool) {
  // tool onMove is called on pointer move
  let pos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  let onMove = tool(pos, GLOBAL_STATE, dispatch);

  function move(e) {
    console.log("move");
    onMove({ x: e.touches[0].clientX, y: e.touches[0].clientY }, GLOBAL_STATE);
  }

  function end() {
    target.removeEventListener("touchmove", move);
    target.removeEventListener("touchcancel", end);
    target.removeEventListener("touchend", end);
  }

  target.addEventListener("touchmove", move);
  target.addEventListener("touchcancel", end);
  target.addEventListener("touchend", end);
}

export function chartTouchInteraction({ target, desktop }) {
  target.addEventListener("touchstart", (e) => {
    const activeTool = GLOBAL_STATE.activeTool;
    e.preventDefault();

    if (activeTool in paintTools)
      chartInteraction(target, paintTools[activeTool]);
    else if (activeTool in otherTools)
      canvasInteraction(e, target, otherTools[activeTool]);
    else {
      console.console.warn(`Uh oh, ${activeTool} is not a tool`);
    }
  });
}
