import { colorSequenceTools } from "../actions/colorSequenceTools";
import { GLOBAL_STATE, dispatch } from "../state";
import { colorSequencePosAtCoords } from "../utils";

function chartInteraction(target, tool) {
  // tool onMove is not called unless pointer moves into another cell in the chart
  let pos = GLOBAL_STATE.colorSequencePos;

  let onMove = tool(pos, GLOBAL_STATE, dispatch);
  if (!onMove) return;

  function move(moveEvent) {
    if (moveEvent.buttons == 0) {
      end();
    } else {
      let newPos = GLOBAL_STATE.colorSequencePos;
      if (newPos.x == pos.x && newPos.y == pos.y) return;
      onMove(GLOBAL_STATE.colorSequencePos, GLOBAL_STATE);
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

export function colorSequencePointerInteraction(target, resizeDragger) {
  target.addEventListener("pointerdown", (e) => {
    chartInteraction(target, colorSequenceTools["brush"]);
  });

  target.addEventListener("pointermove", (e) => {
    const { x, y } = colorSequencePosAtCoords(e, target);
    if (
      GLOBAL_STATE.colorSequencePos.x != x ||
      GLOBAL_STATE.colorSequencePos.y != y
    ) {
      dispatch({ colorSequencePos: { x, y } });
    }
  });

  target.addEventListener("pointerleave", (e) => {
    dispatch({ colorSequencePos: { x: -1, y: -1 } });
  });

  resizeDragger.addEventListener("pointerdown", (e) => {
    const startSequence = GLOBAL_STATE.yarnSequence;
    const start = e.clientY;

    document.body.classList.add("grabbing");
    resizeDragger.classList.remove("grab");

    const end = () => {
      document.body.classList.remove("grabbing");

      window.removeEventListener("pointermove", onmove);
      window.removeEventListener("pointerup", end);

      resizeDragger.classList.add("grab");
    };

    const onmove = (e) => {
      let newSize =
        startSequence.height +
        Math.floor((start - e.clientY) / GLOBAL_STATE.scale);

      if (newSize < 1 || newSize == GLOBAL_STATE.yarnSequence.height) return;

      dispatch({
        yarnSequence: startSequence.resize(1, newSize),
      });
    };

    window.addEventListener("pointermove", onmove);
    window.addEventListener("pointerup", end);
  });
}
