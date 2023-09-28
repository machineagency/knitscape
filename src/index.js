import { render } from "lit-html";
import Split from "split.js";

import { GLOBAL_STATE, KnitScape } from "./state";

import { fitChart } from "./actions/zoomFit";

import { view } from "./views/view";

import { chartCanvas } from "./components/chartCanvas";
import { gridCanvas } from "./components/gridCanvas";
import { outlineCanvas } from "./components/outlineCanvas";

import { addKeypressListeners } from "./events/keypressEvents";
import { chartPointerInteraction } from "./events/chartPointerInteraction";
import { closeModals } from "./events/closeModals";
import { trackPointer } from "./events/trackPointer";
import { addPointerIcon } from "./events/addPointerIcon";

import { isMobile } from "./utils";

function r() {
  render(view(), document.body);
  window.requestAnimationFrame(r);
}

function initKeyboard() {
  addKeypressListeners();
  trackPointer({ target: document.getElementById("outline") });
  addPointerIcon(
    document.getElementById("pointer"),
    document.getElementById("layers-container")
  );
  chartPointerInteraction({
    target: document.getElementById("outline"),
    workspace: document.getElementById("layers-container"),
  });
  closeModals();
}

function initTouch() {
  closeModals();
}

function calcSplit() {
  const portrait = screen.availHeight > screen.availWidth;
  document
    .getElementById("site")
    .style.setProperty("flex-direction", portrait ? "column" : "row");

  return portrait
    ? Split(["#edit-pane", "#view-pane"], {
        minSize: 300,
        gutterSize: 11,
        direction: "vertical",
      })
    : Split(["#edit-pane", "#view-pane"], {
        minSize: 300,
        gutterSize: 11,
      });
}

function init() {
  r();

  calcSplit();

  isMobile() ? initTouch() : initKeyboard();
  KnitScape.register([
    chartCanvas({ canvas: document.getElementById("chart") }),
    gridCanvas({ canvas: document.getElementById("grid") }),
    outlineCanvas({ canvas: document.getElementById("outline") }),
  ]);

  fitChart();
}

window.onload = init;
