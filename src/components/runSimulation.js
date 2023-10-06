import { simulate } from "../simulation/yarnSimulation";
import { Bimp } from "../lib/Bimp";
import { GLOBAL_STATE, dispatch } from "../state";
import { html } from "lit-html";

let stopSim, relax;

export function simulationView() {
  return html`<div id="sim-pane">
    <div id="sim-controls">
      <button @click=${relax} class="btn solid">relax</button>
      <button
        @click=${() => dispatch({ flipped: !GLOBAL_STATE.flipped })}
        class="btn solid">
        flip
      </button>
      <button
        @click=${() => dispatch({ simPan: { x: 0, y: 0 }, simScale: 1 })}
        class="btn solid">
        center
      </button>
    </div>
    <div id="sim-container">
      <div
        style="transform: translate(${GLOBAL_STATE.simPan.x}px, ${GLOBAL_STATE
          .simPan.y}px)"
        class=${GLOBAL_STATE.flipped ? "mirrored" : ""}>
        <canvas
          id="back"
          class=${GLOBAL_STATE.flipped ? "top" : "bottom"}></canvas>
        <canvas id="mid" class="mid"></canvas>
        <canvas
          id="front"
          class=${GLOBAL_STATE.flipped ? "bottom" : "top"}></canvas>
      </div>
    </div>
  </div>`;
}

const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
};

export function stopSimulation() {
  if (stopSim) stopSim();
}

export function runSimulation() {
  return ({ state }) => {
    let queueSim = false;

    function run() {
      queueSim = false;

      if (stopSim) stopSim();

      ({ stopSim, relax } = simulate(
        GLOBAL_STATE.chart,
        GLOBAL_STATE.yarnSequence.pixels,
        [0],
        GLOBAL_STATE.yarnPalette,
        GLOBAL_STATE.simScale
      ));
    }

    const debouncedRun = debounce(run, 30);

    run();

    return {
      syncState(state, changes) {
        const found = ["repeats", "yarnPalette", "yarnSequence", "chart"].some(
          (key) => changes.includes(key)
        );

        if (found) {
          debouncedRun();
        }

        if (changes.includes("simScale")) {
          run();
        }
      },
    };
  };
}
