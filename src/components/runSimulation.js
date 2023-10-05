import { simulate } from "../simulation/yarnSimulation";
import { Bimp } from "../lib/Bimp";
import { GLOBAL_STATE } from "../state";
import { html } from "lit-html";

let clear, relax, flip, timeout;

export function simulationView() {
  return html`<div id="sim-pane">
    <div id="sim-controls">
      <button @click=${relax} class="btn solid">relax</button>
      <button @click=${flip} class="btn solid">flip</button>
    </div>
    <div id="sim-container">
      <canvas id="back"></canvas>
      <canvas id="mid"></canvas>
      <canvas id="front"></canvas>
      <!-- <svg
        id="simulation"
        style="transform: translate(${GLOBAL_STATE.simPan.x}px, ${GLOBAL_STATE
        .simPan
        .y}px) scale(${GLOBAL_STATE.simScale},${GLOBAL_STATE.simScale});"></svg> -->
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

export function runSimulation() {
  return ({ state }) => {
    let { scale, chart } = state;
    let queueSim = false;

    function run() {
      console.log("RUNNING SIMULATION");
      queueSim = false;

      if (clear) clear();

      ({ clear, relax, flip } = simulate(
        Bimp.fromTile(
          chart.width,
          chart.height,
          GLOBAL_STATE.repeats[0].bitmap
        ),
        GLOBAL_STATE.yarnSequence.vFlip().pixels,
        [0],
        GLOBAL_STATE.yarnPalette
      ));
    }

    const debouncedRun = debounce(run, 70);

    run();

    return {
      syncState(state, changes) {
        const found = ["repeats", "yarnPalette", "yarnSequence", "chart"].some(
          (key) => changes.includes(key)
        );

        if (found) {
          debouncedRun();

          // queueSim = true;
        }

        // if (changes.includes("transforming") && !state.transforming) {
        //   debouncedRun();
        // }
      },
    };
  };
}
