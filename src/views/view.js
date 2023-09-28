import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { GLOBAL_STATE } from "../state";

import { taskbar } from "./taskbar";
import { downloadModal } from "./downloadModal";
import { libraryModal } from "./libraryModal";
import { settingsModal } from "./settingsModal";
import { debugPane } from "./debugPane";
import { pointerIcon } from "./pointerIcon";
import { bottomToolbar } from "./bottomToolbar";

export function view() {
  return html`
    ${taskbar()} ${when(GLOBAL_STATE.showDownload, downloadModal)}
    ${when(GLOBAL_STATE.showLibrary, libraryModal)}
    ${when(GLOBAL_STATE.showSettings, settingsModal)}

    <div id="site">
      <div id="edit-pane">
        <div id="tools-container"></div>
        <div id="editors-container">
          <div id="gutter-top"></div>
          <div id="editors-inner">
            <div id="gutter-left"></div>
            <div id="color-sequence-container"></div>
            <div id="layers-container">
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
            <div id="color-sequence-container"></div>
            <div id="gutter-right"></div>
          </div>
          <div id="gutter-bottom">${bottomToolbar()}</div>
        </div>
        <div id="palette-container"></div>
      </div>
      <div id="view-pane"></div>
    </div>
    ${when(GLOBAL_STATE.debug, debugPane)}
  `;
}
