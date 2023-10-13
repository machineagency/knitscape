import { html } from "lit-html";
import { styleMap } from "lit-html/directives/style-map.js";
import { classMap } from "lit-html/directives/class-map.js";

function handleClick(e, func) {
  func(e);
  e.currentTarget.blur();
}

export function iconButton({
  click,
  icon = "fa-solid fa-computer-mouse",
  styles = {},
  classes = {},
}) {
  return html`<button
    class="btn icon ${classMap(classes)}"
    @click=${(e) => handleClick(e, click)}
    style=${styleMap(styles)}>
    <i class=${icon}></i>
  </button>`;
}

export function textButton({
  click,
  text = "button",
  styles = {},
  classes = {},
}) {
  return html` <button
    @click=${(e) => handleClick(e, click)}
    class="btn solid ${classMap(classes)}"
    style=${styleMap(styles)}>
    ${text}
  </button>`;
}
