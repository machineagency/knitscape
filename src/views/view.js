import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { GLOBAL_STATE } from "../state";

import { taskbar } from "./taskbar";
import { downloadModal } from "./downloadModal";
import { libraryModal } from "./libraryModal";
import { settingsModal } from "./settingsModal";
import { debugPane } from "./debugPane";
import { pointerIcon } from "./pointerIcon";
import { toolPicker } from "./toolPicker";
import { bottomToolbar } from "./bottomToolbar";
import { symbolPicker } from "./symbolPicker";

export function view() {
  return html`
    ${taskbar()} ${when(GLOBAL_STATE.showDownload, downloadModal)}
    ${when(GLOBAL_STATE.showLibrary, libraryModal)}
    ${when(GLOBAL_STATE.showSettings, settingsModal)}

    <style>
      #chart {
        background: ${GLOBAL_STATE.chartBackground};
      }
    </style>
    <div id="site">
      <div id="edit-pane">
        <div id="tools-container"></div>
        <div id="editors-container">
          <div id="gutter-top" style="z-index: 3">${toolPicker()}</div>
          <div id="editors-inner" style="z-index: 2">
            <div id="gutter-left" style="z-index: 2">${symbolPicker()}</div>
            <div id="color-sequence-container" style="z-index: 2"></div>
            <div id="layers-container" style="z-index: 0">
              ${pointerIcon()}
              <div
                id="canvas-transform-group"
                style="transform: translate(${GLOBAL_STATE.chartPan
                  .x}px, ${GLOBAL_STATE.chartPan.y}px);">
                <canvas id="chart"></canvas>
                <!-- <canvas id="preview-symbols"></canvas>
                <canvas id="preview-needles"></canvas>
                <canvas id="repeat"></canvas> -->
                <canvas id="grid"></canvas>
                <canvas id="outline"></canvas>
              </div>
            </div>
            <!-- <div id="color-sequence-container"></div> -->
            <div id="gutter-right" style="z-index: 3"></div>
          </div>
          <div style="z-index: 3" id="gutter-bottom">${bottomToolbar()}</div>
        </div>
        <div id="palette-container"></div>
      </div>
      <div id="view-pane"></div>
    </div>
    ${when(GLOBAL_STATE.debug, debugPane)}
  `;
}
