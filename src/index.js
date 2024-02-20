import Split from "split.js";
import { html, render } from "lit-html";

import { StateMonitor, dispatch } from "./state";
import { stitches } from "./constants";

import { runSimulation } from "./subscribers/runSimulation";
import {
  chartSubscriber,
  blockSubscriber,
} from "./subscribers/chartSubscriber";
import { chartEvalSubscriber } from "./subscribers/chartEvalSubscriber";

import { taskbar } from "./views/taskbar";
import { simulationView } from "./views/simulationPane";
import { chartPaneView } from "./views/chartPane";

import { globalKeydown, globalKeyup } from "./interaction/globalKeypress";
import { closeModals } from "./utilities/misc";

import { evaluateChart } from "./charting/evalChart";
import { fitChart } from "./interaction/chartPanZoom";

// function pointerIcon() {
//   return html`<div id="pointer">
//     <i class="fa-solid ${tools[GLOBAL_STATE.activeTool].icon}"></i>
//   </div>`;
// }

export function view() {
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

const testWorkspace = {
  boundaries: [
    [
      [0, 0],
      [0, 3],
      [3, 3],
      [4, 0],
    ],
    [
      [1, 1],
      [1, 2],
      [3, 2],
      [2, 1],
    ],
  ],
  regions: [
    [0, stitches.KNIT],
    [1, stitches.PURL],
  ],
};

function init() {
  // TODO: This is where we would load a default workspace
  const { boundaries, regions } = testWorkspace;

  let chart = evaluateChart(boundaries, regions);

  dispatch({
    boundaries,
    regions,
    chart,
    yarnSequence: Array.from({ length: chart.height }, () => [0]),
  });

  r();

  Split(["#chart-pane", "#sim-pane"], {
    sizes: [60, 40],
    minSize: 100,
    gutterSize: 11,
  });

  window.addEventListener("keydown", globalKeydown);
  window.addEventListener("keyup", globalKeyup);

  StateMonitor.requestRender = () => render(view(), document.body);

  StateMonitor.register([
    chartEvalSubscriber(),
    chartSubscriber(),
    blockSubscriber(),
    runSimulation(),
  ]);

  measureWindow();

  setTimeout(() => fitChart(document.getElementById("svg-layer")));
}

window.onload = init;
window.onresize = measureWindow;
