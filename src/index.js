import { render } from "lit-html";
import Split from "split.js";

import { StateMonitor } from "./state";

import { fitChart } from "./actions/zoomFit";

import { view } from "./views/view";

import { DEFAULT_SYMBOLS, SYMBOL_DIR } from "./constants";

import { yarnSequenceCanvas } from "./components/yarnSequenceCanvas";
import { chartSymbolCanvas } from "./components/chartSymbolCanvas";
import { chartYarnColorCanvas } from "./components/chartYarnColorCanvas";
import { gridCanvas } from "./components/gridCanvas";
import { outlineCanvas } from "./components/outlineCanvas";
import { repeatCanvases } from "./components/repeatCanvases";

import { addKeypressListeners } from "./events/keypressEvents";
import { wheelInteraction } from "./events/wheelInteraction";

import { addPointerIcon } from "./events/addPointerIcon";

import { chartPointerInteraction } from "./events/chartPointerInteraction";
import { colorSequencePointerInteraction } from "./events/colorSequencePointerInteraction";
import { repeatPointerInteraction } from "./events/repeatPointerInteraction";

import { chartTouchInteraction } from "./events/chartTouchInteraction";
import { colorSequenceTouchInteraction } from "./events/colorSequenceTouchInteraction";

import { closeModals } from "./events/closeModals";

import { loadSymbol } from "./actions/importers";

import { isMobile } from "./utils";

function r() {
  render(view(), document.body);
  window.requestAnimationFrame(r);
}

function initKeyboard() {
  addKeypressListeners();
  addPointerIcon(
    document.getElementById("pointer"),
    document.getElementById("chart")
  );
  repeatPointerInteraction(document.getElementById("repeat-container"));
  chartPointerInteraction(document.getElementById("chart"));
  wheelInteraction(document.getElementById("desktop"));
  colorSequencePointerInteraction(
    document.getElementById("yarn-sequence-canvas"),
    document.getElementById("color-dragger")
  );
  closeModals();
}

function initTouch() {
  document.body.style.setProperty("--font-size", "1.2rem");
  chartTouchInteraction(document.getElementById("outline"));
  colorSequenceTouchInteraction(
    document.getElementById("yarn-sequence-canvas"),
    document.getElementById("color-dragger")
  );
  closeModals();
}

function calcSplit() {
  const portrait = screen.availHeight > screen.availWidth;
  document
    .getElementById("site")
    .style.setProperty("flex-direction", portrait ? "column" : "row");

  return portrait
    ? Split(["#chart-pane", "#sim-pane"], {
        sizes: [90, 10],
        minSize: 100,
        gutterSize: 11,
        direction: "vertical",
      })
    : Split(["#chart-pane", "#sim-pane"], {
        sizes: [90, 10],
        minSize: 100,
        gutterSize: 11,
      });
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
  DEFAULT_SYMBOLS.forEach((symbolName) =>
    loadSymbol(symbolName, `${SYMBOL_DIR}/${symbolName}.png`)
  );

  r();

  calcSplit();

  isMobile() ? initTouch() : initKeyboard();

  StateMonitor.register([
    yarnSequenceCanvas({
      canvas: document.getElementById("yarn-sequence-canvas"),
    }),
    chartSymbolCanvas({ canvas: document.getElementById("chart") }),
    chartYarnColorCanvas({
      canvas: document.getElementById("yarn-color-canvas"),
    }),
    gridCanvas({ canvas: document.getElementById("grid") }),
    outlineCanvas({ canvas: document.getElementById("outline") }),
    repeatCanvases(),
  ]);

  measureWindow();
  fitChart();
}

window.onload = init;
window.onresize = measureWindow;
