import { SplitLayoutManager } from "./layout";
import { html, render } from "lit-html";
import { Bimp, BimpCanvas } from "./bimp/bimp";
import { repeats } from "./db/repeats";
import { pixel2 } from "./bimp/palette";

import { StitchSimPane } from "./panes/StitchSimPane";
import { DownloadPane } from "./panes/DownloadPane";
import { ColorPane } from "./panes/ColorPane";
import { EmptyPane } from "./panes/EmptyPane";
import { PreviewPane } from "./panes/PreviewPane";
import { BitmapEditorPane } from "./panes/BitmapEditorPane";
import { YarnPane } from "./panes/YarnPane";

import yarns from "./db/yarns.json";

const testLayout = {
  sizes: [30, 70],
  children: [
    { sizes: [60, 30, 10], children: ["motif0", "yarns", "download"] },
    ["preview"],
  ],
};

const viewMap = {
  yarns: "yarns",
  motif0: "motif",
  download: "download",
  simulation: "simulation",
  preview: "preview",
};

const paneTypes = {
  motif: BitmapEditorPane,
  empty: EmptyPane,
  simulation: StitchSimPane,
  color: ColorPane,
  preview: PreviewPane,
  download: DownloadPane,
  yarns: YarnPane,
};

const defaultPattern = repeats.hex_small;

const pat = new Bimp(
  defaultPattern.width,
  defaultPattern.height,
  defaultPattern.pixels
);

let GLOBAL_STATE = {
  title: "untitled",
  history: [],
  motifs: {
    motif0: {
      bitmap: pat,
      palette: pixel2,
      bimpCanvas: new BimpCanvas(pat, pixel2),
    },
  },
  yarns: yarns,
  simulation: {
    currentTarget: ["motifs", "motif0"],
    PARAMS: {
      yarnWidth: 6,
      hDist: 10,
      vDist: 12,
    },
  },
  motifCounter: 1,
  workspace: {
    rows: 20,
    cols: 20,
  },
};

// render app skeleton
render(
  html`
    <!-- <div id="sidebar"></div> -->
    <div id="container"></div>
  `,
  document.body
);

const parentNode = document.getElementById("container");
const sidebarContainer = document.getElementById("sidebar");

// Make the layout manager
const layoutManager = new SplitLayoutManager(
  testLayout,
  parentNode,
  sync,
  initPane
);

function syncPreviews(state) {
  for (const [id, motif] of Object.entries(state.motifs)) {
    const canvasEl = document.querySelector(`[data-motifid=${id}]`);

    motif.bimpCanvas.transferOffscreenToCanvas(canvasEl);
  }
}

function initPane(paneID, paneData, paneType) {
  if (!paneType) return;
  viewMap[paneData] = new paneTypes[paneType](
    document.getElementById(paneID),
    paneData,
    GLOBAL_STATE,
    dispatch
  );
}

function updateState(state, action) {
  return Object.assign({}, state, action);
}

function dispatch(action) {
  GLOBAL_STATE = updateState(GLOBAL_STATE, action);
  sync();
}

function sync() {
  // Iterate through the key-value pairs in the pane map
  Object.entries(layoutManager.paneMap).forEach(([paneID, paneData]) => {
    viewMap[paneData].sync(GLOBAL_STATE);
    viewMap[paneData].renderView(GLOBAL_STATE);
  });
}

// this should probably be a "load workspace" function
function init() {
  Object.entries(layoutManager.paneMap).forEach(([paneID, paneData]) => {
    initPane(paneID, paneData, viewMap[paneData]);
  });
  sync();
}

window.onload = init;
