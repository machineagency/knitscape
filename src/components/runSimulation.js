import { simulate } from "../simulation/yarnRelaxation";
import { GLOBAL_STATE, dispatch } from "../state";
import { html } from "lit-html";
import { MIN_SIM_SCALE, MAX_SIM_SCALE } from "../constants";
import { centerZoomSimulation } from "../actions/zoomFit";

import { formControl } from "../ui/formControl";
import { slider } from "../ui/slider";
import { colorButton } from "../ui/colorButton";
import { zoom } from "../ui/zoom";
import { iconButton, textButton } from "../ui/buttons";
import { floatingToolbar } from "../ui/floatingToolbar";

let stopSim, relax, update, setTransform;

function simInputs() {
  return [
    formControl({
      label: "Stitch Ratio",
      control: slider({
        min: 1.0,
        max: 3.0,
        step: 0.01,
        value: GLOBAL_STATE.stitchRatio,
        input: (num) => dispatch({ stitchRatio: num }),
      }),
    }),
    formControl({
      label: "Yarn Width",
      control: slider({
        min: 0.1,
        max: 0.4,
        step: 0.01,
        value: GLOBAL_STATE.yarnWidth,
        input: (num) => dispatch({ yarnWidth: num }),
      }),
    }),
    formControl({
      label: "Yarn Spread",
      control: slider({
        min: 0.3,
        max: 1.0,
        step: 0.01,
        value: GLOBAL_STATE.yarnSpread,
        input: (num) => dispatch({ yarnSpread: num }),
      }),
    }),
    formControl({
      label: "Link Strength",
      control: slider({
        min: 0.01,
        max: 5.0,
        step: 0.01,
        value: GLOBAL_STATE.linkStrength,
        input: (num) => dispatch({ linkStrength: num }),
      }),
    }),
    formControl({
      label: "Iterations",
      control: slider({
        min: 1,
        max: 9,
        step: 1,
        value: GLOBAL_STATE.iterations,
        input: (num) => dispatch({ iterations: num }),
      }),
    }),
    colorButton({
      label: "Sim Background",
      input: (hex) => dispatch({ simBackground: hex }),
      value: GLOBAL_STATE.simBackground,
    }),
  ];
}

function simControls() {
  return [
    iconButton({
      click: () => dispatch({ showSimSettings: !GLOBAL_STATE.showSimSettings }),
      icon: "fa-solid fa-sliders",
      classes: { highlight: GLOBAL_STATE.showSimSettings },
    }),
    textButton({
      click: () => relax(),
      text: "relax",
    }),
    textButton({
      click: () => dispatch({ flipped: !GLOBAL_STATE.flipped }),
      text: "flip",
    }),
    zoom({
      min: MIN_SIM_SCALE,
      max: MAX_SIM_SCALE,
      digits: 2,
      step: 0.01,
      value: GLOBAL_STATE.simScale,
      zoomTo: (num) => centerZoomSimulation(num),
      zoomOut: () => centerZoomSimulation(GLOBAL_STATE.simScale * 0.9),
      zoomIn: () => centerZoomSimulation(GLOBAL_STATE.simScale * 1.1),
    }),
    iconButton({
      click: () => dispatch({ simPan: { x: 0, y: 0 }, simScale: 1 }),
      icon: "fa-solid fa-expand",
    }),
  ];
}

function simSettings() {
  return html`<div
    class="modal"
    style="display: ${GLOBAL_STATE.showSimSettings ? "block" : "none"}">
    <h2><i class="fa-solid fa-sliders"></i> Sim Controls</h2>
    <div class="modal-content">${simInputs()}</div>
  </div>`;
}

export function simulationView() {
  return html`<div id="sim-pane">
    ${simSettings()}
    <div
      id="sim-container"
      style="background-color:${GLOBAL_STATE.simBackground}">
      <div class="${GLOBAL_STATE.flipped ? "mirrored" : ""}">
        <canvas
          id="back"
          class="sim-canvas ${GLOBAL_STATE.flipped
            ? "top"
            : "bottom"}"></canvas>
        <canvas id="mid" class="mid sim-canvas"></canvas>
        <canvas
          id="front"
          class="sim-canvas ${GLOBAL_STATE.flipped
            ? "bottom"
            : "top"}"></canvas>
      </div>
    </div>
    ${floatingToolbar({
      contents: simControls(),
      styles: { bottom: "10px", right: "10px" },
    })}
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
  return () => {
    function run() {
      stopSimulation();
      ({ stopSim, relax, update, setTransform } = simulate(GLOBAL_STATE.chart));
    }

    const debouncedRun = debounce(() => {
      run();
    }, 10);

    return {
      syncState(state, changes) {
        const regen = [
          "chart",
          "iterations",
          "linkStrength",
          "stitchRatio",
        ].some((key) => changes.includes(key));

        const redraw = [
          "yarnPalette",
          "yarnWidth",
          "yarnSequence",
          "yarnSpread",
        ].some((key) => changes.includes(key));

        const updateTransform = ["simScale", "simPan", "flipped"].some((key) =>
          changes.includes(key)
        );

        if (regen) {
          debouncedRun();
        } else if (redraw) {
          update();
        } else if (updateTransform) {
          console.log("transform");
          if (setTransform) setTransform();
        }
      },
    };
  };
}
