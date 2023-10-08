import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { dispatch, GLOBAL_STATE } from "../state";

import { taskbar } from "./taskbar";
import { downloadModal } from "./downloadModal";
import { libraryModal } from "./libraryModal";
import { settingsModal } from "./settingsModal";
import { chartTools } from "./chartTools";
import { debugPane } from "./debugPane";
import { leftBar } from "./leftBar";
import { repeatCanvas } from "./repeatCanvas";
import { toolData } from "../constants";
import { repeatEditingTools } from "../actions/repeatEditingTools";

import { simulationView } from "../components/runSimulation";

export function view() {
  return html`
    ${when(GLOBAL_STATE.showDownload, downloadModal)}
    ${when(GLOBAL_STATE.showLibrary, libraryModal)}
    ${when(GLOBAL_STATE.showSettings, settingsModal)} ${taskbar()}

    <div id="site">
      <div id="chart-pane">
        <div id="chart-layout">
          ${leftBar()}

          <div id="desktop">
            ${when(
              GLOBAL_STATE.editingRepeat > -1,
              () => html` <div class="tool-picker">
                <span
                  >${GLOBAL_STATE.repeats[GLOBAL_STATE.editingRepeat].bitmap
                    .width}
                  x
                  ${GLOBAL_STATE.repeats[GLOBAL_STATE.editingRepeat].bitmap
                    .height}
                </span>
                ${Object.keys(repeatEditingTools).map(
                  (toolName) => html`<button
                    class="btn solid ${GLOBAL_STATE.activeTool == toolName
                      ? "current"
                      : ""}"
                    @click=${() =>
                      dispatch({
                        activeTool: toolName,
                      })}>
                    <i class=${toolData[toolName].icon}></i>
                  </button>`
                )}
                <button
                  class="btn solid move-repeat ${GLOBAL_STATE.activeTool ==
                  "move"
                    ? "current"
                    : ""}"
                  @click=${() =>
                    dispatch({
                      activeTool: "move",
                    })}>
                  <i class="fa-solid fa-hand"></i>
                </button>
              </div>`
            )}
            <div
              id="canvas-transform-group"
              style="transform: translate(${Math.floor(
                GLOBAL_STATE.chartPan.x
              )}px, ${Math.floor(GLOBAL_STATE.chartPan.y)}px);">
              <div id="yarn-sequence">
                <button id="color-dragger" class="btn solid grab">
                  <i class="fa-solid fa-grip"></i>
                </button>
                <canvas id="yarn-sequence-canvas"></canvas>
              </div>
              <canvas id="yarn-color-canvas"></canvas>
              <canvas id="symbol-canvas"></canvas>
              <canvas id="grid" class="grid-canvas"></canvas>
              <!-- <canvas id="outline" class="outline-canvas"></canvas> -->
              ${repeatCanvas()}
            </div>
          </div>
          ${chartTools()}
        </div>
      </div>
      ${simulationView()}
    </div>
    ${when(GLOBAL_STATE.debug, debugPane)}
  `;
}
