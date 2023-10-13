import { html } from "lit-html";
import { GLOBAL_STATE, dispatch } from "../state";

export function settingsModal() {
  return html` <div id="settings-modal" class="modal">
    <h2>Settings</h2>

    <div class="modal-content">
      <label class="form-control toggle">
        <input
          type="checkbox"
          name="debug"
          ?checked=${GLOBAL_STATE.reverseScroll}
          @change=${(e) => dispatch({ reverseScroll: e.target.checked })} />
        Invert Scroll
      </label>

      <label class="form-control toggle">
        <input
          type="checkbox"
          name="grid"
          ?checked=${GLOBAL_STATE.grid}
          @change=${(e) => dispatch({ grid: e.target.checked })} />
        Grid
      </label>

      <label class="form-control toggle">
        <input
          type="checkbox"
          name="debug"
          ?checked=${GLOBAL_STATE.debug}
          @change=${(e) => dispatch({ debug: e.target.checked })} />
        Debug
      </label>

      <label class="form-control range">
        Symbol Line Width
        <input
          type="range"
          name="line-width"
          min="1"
          max="10"
          .value=${String(GLOBAL_STATE.symbolLineWidth)}
          @input=${(e) =>
            dispatch({ symbolLineWidth: Number(e.target.value) })} />
      </label>
    </div>
  </div>`;
}
