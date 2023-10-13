import { html } from "lit-html";
import { slider } from "./slider";
import { iconButton } from "./buttons";

export function zoom({
  min,
  max,
  step,
  value,
  zoomTo,
  zoomIn,
  zoomOut,
  digits = 2,
}) {
  return html`${iconButton({
    click: zoomOut,
    icon: "fa-solid fa-magnifying-glass-minus",
  })}
  ${slider({
    label: null,
    min,
    max,
    step,
    digits,
    value,
    input: zoomTo,
    styles: { width: "5em" },
  })}
  ${iconButton({
    click: zoomIn,
    icon: "fa-solid fa-magnifying-glass-plus",
  })}`;
}
