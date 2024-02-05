import Split from "split.js";
import { html, render } from "lit-html";

import { StateMonitor } from "./state";

import { runSimulation } from "./subscribers/runSimulation";
import { shapingMaskSubscriber } from "./subscribers/shapingMaskSubscriber";

import { taskbar } from "./views/taskbar";
import { simulationView } from "./views/simulationPane";
import { chartPaneView } from "./views/chartPane";

import { globalKeydown, globalKeyup } from "./interaction/globalKeypress";
import { closeModals } from "./utilities/misc";

// function pointerIcon() {
//   return html`<div id="pointer">
//     <i class="fa-solid ${tools[GLOBAL_STATE.activeTool].icon}"></i>
//   </div>`;
// }

function view() {
  return html`
    ${taskbar()}

    <div id="site" @pointerdown=${closeModals}>
      <div id="chart-pane">${chartPaneView()}</div>
      ${simulationView()}
    </div>
  `;
}

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

  Split(["#chart-pane", "#sim-pane"], {
    sizes: [60, 40],
    minSize: 100,
    gutterSize: 11,
  });

  window.addEventListener("keydown", globalKeydown);
  window.addEventListener("keyup", globalKeyup);

  StateMonitor.register([shapingMaskSubscriber(), runSimulation()]);

  measureWindow();
}

window.onload = init;
window.onresize = measureWindow;
