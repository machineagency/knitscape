import { GLOBAL_STATE, dispatch } from "../state";
import { posAtCoords } from "../utils";

import { chartEditingTools } from "../actions/chartEditingTools";

export function chartCoords(event, target) {
  const bounds = target.getBoundingClientRect();

  const x = Math.floor(
    ((event.clientX - bounds.x) / GLOBAL_STATE.scale) * devicePixelRatio
  );
  const y =
    GLOBAL_STATE.chart.height -
    Math.floor(
      ((event.clientY - bounds.y) / GLOBAL_STATE.scale) * devicePixelRatio
    ) -
    1;

  return { x, y };
}

function editChart(canvas, tool) {
  // tool onMove is not called unless pointer moves into another cell in the chart
  let pos = GLOBAL_STATE.pos;
  dispatch({ transforming: true });

  let onMove = tool(pos);
  if (!onMove) return;

  function move(moveEvent) {
    if (moveEvent.buttons == 0) {
      end();
    } else {
      let newPos = GLOBAL_STATE.pos;

      if (newPos.x == pos.x && newPos.y == pos.y) return;
      onMove(newPos);
      pos = newPos;
    }
  }

  function end() {
    dispatch({ transforming: false });

    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerup", end);
    canvas.removeEventListener("pointerleave", end);
  }

  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointerleave", end);
}

export function chartInteraction(chart) {
  chart.addEventListener("pointerdown", (e) => {
    const activeTool = GLOBAL_STATE.activeTool;

    if (activeTool in chartEditingTools) {
      editChart(e.target, chartEditingTools[activeTool]);
    } else {
      console.warn(`Uh oh, ${activeTool} is not a tool`);
    }
  });

  chart.addEventListener("pointermove", (e) => {
    const { x, y } = chartCoords(e, chart);

    if (GLOBAL_STATE.pos.x != x || GLOBAL_STATE.pos.y != y) {
      dispatch({ pos: { x, y } });
    }
  });

  chart.addEventListener("pointerleave", (e) => {
    dispatch({ pos: { x: -1, y: -1 } });
  });
}
