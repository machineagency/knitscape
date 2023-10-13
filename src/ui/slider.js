import { html } from "lit-html";
import { styleMap } from "lit-html/directives/style-map.js";

export function slider({
  min = 1,
  max = 10,
  step = 1,
  digits = 2,
  value,
  input,
  styles = {},
}) {
  return html`<input
    style=${styleMap(styles)}
    type="range"
    min=${min}
    max=${max}
    step=${step}
    .value=${value}
    @input=${(e) =>
      input(Number(Number.parseFloat(e.target.value).toFixed(digits)), e)}
    @change=${(e) => e.currentTarget.blur()} />`;
}
