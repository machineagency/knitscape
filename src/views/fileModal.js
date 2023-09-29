import { html } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../state";
import { uploadFile } from "../actions/importers";
import { map } from "lit-html/directives/map.js";

const fileModalData = {
  New: {
    icon: "fa-file",
    action: () => {
      dispatch({ showFileMenu: !GLOBAL_STATE.showFileMenu });
    },
  },
  Upload: {
    icon: "fa-upload",
    action: () => {
      uploadFile();
      dispatch({ showFileMenu: !GLOBAL_STATE.showFileMenu });
    },
  },
  Download: {
    icon: "fa-download",
    action: () => {
      dispatch({ showDownload: true, showFileMenu: false });
    },
  },
};

export function fileModal() {
  return html`<div class="modal">
    <h2>Document</h2>
    <div class="modal-content">
      ${map(
        Object.entries(fileModalData),
        ([key, data]) => html`<button
          class="btn icon-text solid"
          @click=${data.action}>
          <i class="fa-solid ${data.icon}"></i>
          <span>${key}</span>
        </button>`
      )}
    </div>
  </div>`;
}
