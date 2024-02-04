import Split from "split.js";
import { html, render } from "lit-html";

import { StateMonitor, dispatch, GLOBAL_STATE } from "./state";

import { addKeypressListeners } from "./events";
import { runSimulation } from "./components/runSimulation";
import { shapeMonitor } from "./shape/shapeMonitor";

import { taskbar } from "./views/taskbar";

import { simulationView } from "./views/simulationPane";
import { chartPaneView } from "./views/chartPane";

import { closeModals, currentTargetPointerPos } from "./utils";

function pointerIcon() {
  return html`<div id="pointer">
    <i class="fa-solid ${tools[GLOBAL_STATE.activeTool].icon}"></i>
  </div>`;
}

function view() {
  return html`
    ${taskbar()}

    <div id="site" @pointerdown=${closeModals}>
      <div
        id="chart-pane"
        @pointermove=${(e) =>
          (GLOBAL_STATE.pointerPos = currentTargetPointerPos(e))}>
        ${chartPaneView()}
      </div>
      ${simulationView()}
    </div>
  `;
}

let simContainer;

function r() {
  render(view(), document.body);
  window.requestAnimationFrame(r);
}

function measureWindow() {
  document.documentElement.style.setProperty(
    "--vh",
    `${window.innerHeight * 0.01}px`
  );
  document.documentElement.style.setProperty(
    "--vw",
    `${window.innerWidth * 0.01}px`
  );
}

function init() {
  r();

  simContainer = document.getElementById("sim-container");

  Split(["#chart-pane", "#sim-pane"], {
    sizes: [60, 40],
    minSize: 100,
    gutterSize: 11,
  });

  addKeypressListeners();

  StateMonitor.register([shapeMonitor(), runSimulation()]);

  measureWindow();
}

window.onload = init;
window.onresize = measureWindow;
