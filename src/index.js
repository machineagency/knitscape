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
      [0, 0],
      [0, 7],
      [7, 7],
      [7, 0],
    ],
    [
      [4, 2],
      [4, 5],
      [7, 5],
      [7, 2],
    ],
    // [
    //   [0, 0],
    //   [0, 60],
    //   [50, 60],
    //   [50, 0],
    // ],
    // [
    //   [5, 5],
    //   [5, 55],
    //   [45, 55],
    //   [45, 5],
    // ],
    // [
    //   [30, 10],
    //   [25, 40],
    //   [40, 40],
    //   [40, 10],
    // ],
    // [
    //   [10, 25],
    //   [10, 40],
    //   [25, 40],
    //   [30, 10],
    // ],
  ],
  regions: [
    { fillType: "stitch", stitch: stitches.KNIT, blockID: null, gap: [0, 0] },
    // { fillType: "block", stitch: stitches.KNIT, blockID: "test", gap: [0, 0] },
    { fillType: "stitch", stitch: stitches.KNIT, blockID: "test", gap: [0, 0] },
  ],
  yarnRegions: [
    { bitmap: new Bimp(1, 1, [0]), pos: [0, 0] },
    { bitmap: new Bimp(1, 1, [1]), pos: [0, 0] },
    // { bitmap: new Bimp(1, 1, [2]), pos: [0, 0] },
  ],
  blocks: {
    // test: {
    //   type: "stitch",
    //   pos: [5, 5],
    //   bitmap: new Bimp(4, 1, [2, 2, 1, 1]),
    // },
  },
  cellAspect: 7 / 11,
  stitchGauge: 7, // stitches per inch
  rowGauge: 11, // rows per inch
  yarnPalette: ["#ebe9bbff", "#328cbcff", "#bc7532ff"],
};

function loadWorkspace(workspace) {
  const { boundaries, regions, blocks, yarnRegions } = workspace;

  // Make chart by evaluating workspace
  let { stitchChart, yarnChart, machineChart, yarnSequence, rowMap } =
    evaluateChart(boundaries, regions, yarnRegions, blocks);
  dispatch({
    ...workspace,
    chart: stitchChart,
    yarnChart: yarnChart,
    machineChart,
    yarnSequence,
    rowMap,
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
