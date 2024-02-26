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
import { bBoxAllBoundaries } from "./charting/helpers";
import { Bimp } from "./lib/Bimp";

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
      [-1, 0],
      [-1, 15],
      [15, 15],
      [15, 0],
    ],
    // [
    //   [-1, 0],
    //   [-1, 10],
    //   [1, 10],
    //   [1, 0],
    // ],
    [
      [0, 0],
      [3, 10],
      [8, 10],
      [9, 0],
    ],
    // [
    //   [7, 0],
    //   [7, 10],
    //   [9, 10],
    //   [9, 0],
    // ],
    // [
    //   [11, 0],
    //   [11, 10],
    //   [13, 10],
    //   [13, 0],
    // ],
  ],
  regions: [
    { fillType: "stitch", stitch: stitches.KNIT, blockID: null, gap: [0, 0] },
    // { fillType: "stitch", fill: stitches.PURL },
    { fillType: "block", stitch: stitches.KNIT, blockID: "test", gap: [0, 0] },
    // { fillType: "stitch", fill: stitches.PURL },
    // { fillType: "stitch", fill: stitches.PURL },
  ],
  blocks: {
    test: {
      type: "stitch",
      pos: [3, 0],
      bitmap: new Bimp(2, 2, [1, 2, 1, 1]),
    },
  },
  cellAspect: 7 / 11,
  stitchGauge: 7, // stitches per inch
  rowGauge: 11, // rows per inch
  yarnPalette: ["#ebe9bbff", "#328cbcff", "#bc7532ff"],
};

function loadWorkspace(workspace) {
  const { boundaries, regions, blocks } = workspace;

  // Make chart by evaluating workspace
  let chart = evaluateChart(boundaries, regions, blocks);

  dispatch({
    ...workspace,
    chart,
    yarnSequence: Array.from({ length: chart.height }, () => [0]),
    bbox: bBoxAllBoundaries(boundaries),
  });
}

function init() {
  loadWorkspace(testWorkspace);

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
