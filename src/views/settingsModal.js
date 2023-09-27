import { html } from "lit-html";
import { when } from "lit-html/directives/when.js";
import { GLOBAL_STATE, dispatch } from "../state";

const styles = html`<style>
  #settings {
    min-width: 200px;
    max-width: 700px;
  }

  #settings > h3 {
    margin: 0 0 10px 0;
  }

  #settings-content {
    display: grid;
    grid-template-columns: auto auto;
  }
</style>`;

export function settingsModal() {
  return html`${styles}
    <div id="settings" class="modal">
      <h3>Settings</h3>
      <div id="settings-content">
        <label for="toggle-grid">Grid</label>
        <input
          id="toggle-grid"
          type="checkbox"
          ?checked=${GLOBAL_STATE.grid}
          @change=${(e) => dispatch({ grid: e.target.checked })} />
        <label for="toggle-debug">Debug</label>
        <input
          id="toggle-debug"
          type="checkbox"
          ?checked=${GLOBAL_STATE.debug}
          @change=${(e) => dispatch({ debug: e.target.checked })} />
      </div>
    </div>`;
}
