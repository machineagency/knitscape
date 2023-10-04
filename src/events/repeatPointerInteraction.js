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

function resizeRepeat(e, repeatIndex) {
  const startRepeat = GLOBAL_STATE.repeats[repeatIndex].bitmap;
  const startPos = [e.clientX, e.clientY];
  const resizeDragger = e.target;

  document.body.classList.add("grabbing");
  resizeDragger.classList.remove("grab");

  const end = () => {
    document.body.classList.remove("grabbing");

    window.removeEventListener("pointermove", onmove);
    window.removeEventListener("pointerup", end);

    resizeDragger.classList.add("grab");
  };

  const onmove = (e) => {
    let newWidth =
      startRepeat.width -
      Math.floor((startPos[0] - e.clientX) / GLOBAL_STATE.scale);

    let newHeight =
      startRepeat.height +
      Math.floor((startPos[1] - e.clientY) / GLOBAL_STATE.scale);

    if (newHeight == startRepeat.height && newWidth == startRepeat.width)
      return;

    if (newHeight < 1 || newWidth < 1) return;

    dispatch({
      repeats: [
        ...GLOBAL_STATE.repeats.slice(0, repeatIndex),
        {
          ...GLOBAL_STATE.repeats[repeatIndex],
          bitmap: startRepeat.vFlip().resize(newWidth, newHeight).vFlip(),
        },
        ...GLOBAL_STATE.repeats.slice(repeatIndex + 1),
      ],
    });
  };

  window.addEventListener("pointermove", onmove);
  window.addEventListener("pointerup", end);
}

function moveRepeat(e, repeatIndex) {
  const startRepeatPos = GLOBAL_STATE.repeats[repeatIndex].pos;
  const startPos = [e.clientX, e.clientY];
  const moveDragger = e.target;

  document.body.classList.add("grabbing");
  moveDragger.classList.remove("grab");

  const end = () => {
    document.body.classList.remove("grabbing");

    window.removeEventListener("pointermove", onmove);
    window.removeEventListener("pointerup", end);

    moveDragger.classList.add("grab");
  };

  const onmove = (e) => {
    let newX =
      startRepeatPos[0] -
      Math.floor((startPos[0] - e.clientX) / GLOBAL_STATE.scale);

    let newY =
      startRepeatPos[1] +
      Math.floor((startPos[1] - e.clientY) / GLOBAL_STATE.scale);

    newX = newX < 0 ? 0 : newX;
    newY = newY < 0 ? 0 : newY;

    dispatch({
      repeats: [
        ...GLOBAL_STATE.repeats.slice(0, repeatIndex),
        {
          ...GLOBAL_STATE.repeats[repeatIndex],
          pos: [newX, newY],
        },
        ...GLOBAL_STATE.repeats.slice(repeatIndex + 1),
      ],
    });
  };

  window.addEventListener("pointermove", onmove);
  window.addEventListener("pointerup", end);
}

export function repeatPointerInteraction(target) {
  target.addEventListener("pointerdown", (e) => {
    const repeatIndex = e.target.parentNode.dataset.repeatindex;
    console.log("EDITING REPEAT", repeatIndex);

    if (e.target.classList.contains("resize-repeat")) {
      // interacting with dragger
      resizeRepeat(e, repeatIndex);
    } else if (e.target.classList.contains("move-repeat")) {
      // interacting with dragger
      moveRepeat(e, repeatIndex);
    } else if (e.target.classList.contains("repeat-canvas")) {
      // interacting with canvas
      const activeTool = GLOBAL_STATE.activeTool;

      if (activeTool in paintTools)
        chartInteraction(e.target, paintTools[activeTool]);
      else if (activeTool in canvasTools)
        canvasInteraction(e, target, canvasTools[activeTool]);
      else {
        console.console.warn(`Uh oh, ${activeTool} is not a tool`);
      }
    }
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
