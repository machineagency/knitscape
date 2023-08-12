import { SplitLayoutManager } from "./layout";
import { html, render } from "lit-html";
import { Bimp, BimpCanvas } from "./bimp";
import { patterns } from "./patterns";
import { pixel2 } from "./palette";
import { actions } from "./actions";

import { StitchSimPane } from "./panes/StitchSimPane";
import { DownloadPane } from "./panes/DownloadPane";
import { ColorPane } from "./panes/ColorPane";
import { EmptyPane } from "./panes/EmptyPane";
import { PreviewPane } from "./panes/PreviewPane";
import { BitmapEditorPane } from "./panes/BitmapEditorPane";

const testLayout = {
  sizes: [30, 70],
  children: [
    { sizes: [80, 20], children: ["motif0", "download"] },
    ["preview"],
  ],
};

const viewMap = {
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
};

const triangle = new Bimp(24, 20, patterns.triangle);

const GLOBAL_STATE = {
  title: "untitled",
  history: [],
  motifs: {
    motif0: {
      bitmap: triangle,
      palette: pixel2,
      bimpCanvas: new BimpCanvas(triangle, pixel2),
    },
  },
  simulation: {
    currentTarget: ["motifs", "motif0"],
    PARAMS: {
      yarnWidth: 6,
      hDist: 10,
      vDist: 12,
    },
  },
  motifCounter: 1,
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

// Function for rendering the pane options. Note how layoutManager.attachPaneDropData
// is called in the dragstart event
// function sidebar(state, dispatch) {
//   return html`${Object.entries(state.motifs).map(
//       ([key, val]) =>
//         html`<div
//           class="preview-container"
//           draggable="true"
//           @dragstart=${(e) =>
//             layoutManager.attachPaneDropData(e, key, "motif")}>
//           <canvas data-motifid=${key} class="preview-canvas"></canvas>
//         </div> `
//     )}
//     <div id="export">
//       <div class="control-header">Export</div>
//       <div class="flex-buttons">
//         <button @click=${() => dispatch("download", "txt")}>TXT</button>
//         <button @click=${() => dispatch("download", "jpg")}>JPG</button>
//         <button @click=${() => dispatch("download", "png")}>PNG</button>
//         <button @click=${() => dispatch("download", "bmp")}>BMP</button>
//         <button @click=${() => dispatch("download", "json")}>JSON</button>
//       </div>
//     </div>`;
// }

function initPane(paneID, paneData, paneType) {
  if (!paneType) return;
  viewMap[paneData] = new paneTypes[paneType](
    document.getElementById(paneID),
    paneData,
    GLOBAL_STATE,
    dispatch
  );
}

async function dispatch(action, args, cb) {
  try {
    // console.log(action);
    const { changes, postRender } = actions[action](
      GLOBAL_STATE,
      args,
      dispatch
    );

    Object.assign(GLOBAL_STATE, changes);

    sync();

    if (postRender) postRender();

    if (cb) cb(GLOBAL_STATE);
  } catch (e) {
    console.error(`Problem in action ${action}`);
    console.error(e);
  }
}

function sync() {
  // Iterate through the key-value pairs in the pane map
  Object.entries(layoutManager.paneMap).forEach(([paneID, paneData]) => {
    viewMap[paneData].sync(GLOBAL_STATE);
    viewMap[paneData].renderView(GLOBAL_STATE);
  });
  // render(sidebar(GLOBAL_STATE), sidebarContainer);
  // syncPreviews(GLOBAL_STATE);
}

// this should probably be a "load workspace" function
function init() {
  Object.entries(layoutManager.paneMap).forEach(([paneID, paneData]) => {
    initPane(paneID, paneData, viewMap[paneData]);
  });
  sync();
}

window.onload = init;
