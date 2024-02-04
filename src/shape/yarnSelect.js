import { GLOBAL_STATE, dispatch } from "../state";

export function selectYarn(e) {
  const bbox = e.currentTarget.getBoundingClientRect();

  const startRow = Math.floor(
    ((bbox.bottom - e.clientY) / GLOBAL_STATE.scale) * GLOBAL_STATE.rowGauge
  );

  const startSelect = GLOBAL_STATE.yarnSelections;
  let lastRow = null;

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      let currentRow = Math.floor(
        ((bbox.bottom - e.clientY) / GLOBAL_STATE.scale) * GLOBAL_STATE.rowGauge
      );

      let [start, end] =
        startRow < currentRow ? [startRow, currentRow] : [currentRow, startRow];

      start = start < 0 ? 0 : start;
      end = end >= GLOBAL_STATE.yarn.length ? GLOBAL_STATE.yarn.length : end;

      if (currentRow != lastRow && end - start > 0) {
        const newSelect = startSelect.concat([[start, end]]);
        dispatch({
          yarnSelections: newSelect,
        });

        lastRow = currentRow;
      }
    }
  }

  function end() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointerleave", end);
  }

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointerleave", end);
}
