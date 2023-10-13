import { html } from "lit-html";

export function formControl({ label, type = "column", control }) {
  return html`<label class="form-control ${type}">${label}${control}</label>`;
}
