import { html } from "lit-html";
import { styleMap } from "lit-html/directives/style-map.js";

export function floatingToolbar({ contents, styles = {} }) {
  return html`
    <div style=${styleMap(styles)} class="floating-toolbar">${contents}</div>
  `;
}
