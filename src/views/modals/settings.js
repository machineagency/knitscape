import { html } from "lit-html";
import { GLOBAL_STATE, dispatch, undo } from "../../state";

export function settingsModal() {
  return html` <div id="settings-modal" class="modal">
    <h2>Settings</h2>

    <div class="modal-content">
      <label class="form-control">
        Cell aspect
        <input
          class="num-input"
          type="number"
          .value=${String(GLOBAL_STATE.rowGauge)}
          @change=${(e) => dispatch({ rowGauge: Number(e.target.value) })} />
        /
        <input
          class="num-input"
          type="number"
          .value=${String(GLOBAL_STATE.stitchGauge)}
          @change=${(e) => dispatch({ stitchGauge: Number(e.target.value) })} />
      </label>
      <label class="form-control toggle">
        <input
          type="checkbox"
          ?checked=${GLOBAL_STATE.reverseScroll}
          @change=${(e) => dispatch({ reverseScroll: e.target.checked })} />
        Invert Scroll
      </label>
    </div>
  </div>`;
}
