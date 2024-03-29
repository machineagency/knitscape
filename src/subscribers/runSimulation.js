import { GLOBAL_STATE } from "../state";

import { simulate } from "../simulation/yarnSimulation";
import { Pattern } from "../simulation/Pattern";

function debounce(callback, wait) {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
}

export function drawYarns() {
  if (GLOBAL_STATE.showTimeNeedleView) return;
  if (GLOBAL_STATE.stopSim) GLOBAL_STATE.stopSim();

  let { stopSim, relax } = simulate(
    new Pattern(
      GLOBAL_STATE.machineChart,
      GLOBAL_STATE.yarnSequence,
      GLOBAL_STATE.rowMap
    ),
    GLOBAL_STATE.simScale
  );

  GLOBAL_STATE.relax = relax;
  GLOBAL_STATE.simStop = stopSim;
}

export function runSimulation() {
  return () => {
    const debouncedRun = debounce(drawYarns, 30);

    drawYarns();

    return {
      syncState(state, changes) {
        if (!state.simLive) return;
        const found = [
          "yarnPalette",
          "yarnSequence",
          "machineChart",
          "flipped",
          "showTimeNeedleView",
        ].some((key) => changes.includes(key));

        if (found) {
          debouncedRun();
        }

        if (changes.includes("simScale")) {
          drawYarns();
        }
      },
    };
  };
}
