import { html } from "lit-html";

function editColor(target, value, input) {
  if (!target.jscolor) {
    const picker = new jscolor(target, {
      preset: "dark large",
      format: "hex",
      value: value,
      onInput: () => input(picker.toRGBString()),
      previewElement: null,
    });
  }
  target.jscolor.show();
}

export function colorButton({ label = "Color", value, input }) {
  return html`<label class="form-control">
    <button
      class="btn icon-text color-btn"
      style="background: ${value};"
      @click=${(e) => editColor(e.target, value, input)}>
      <i class="fa-solid fa-palette"></i>
      ${label}
    </button>
  </label>`;
}
