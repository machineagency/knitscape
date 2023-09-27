import { html, render } from "lit-html";

export function bottomLeft({ bitmap }, axis) {
  if (axis == "horizontal") {
    return Array.apply(null, Array(bitmap.width)).map((x, i) => i + 1);
  } else if (axis == "vertical") {
    return Array.apply(null, Array(bitmap.height))
      .map((x, i) => i + 1)
      .reverse();
  }
}

export function gutterView({ gutterFunc, container, axis }) {
  return (state, dispatch) => {
    let arr = gutterFunc(state, axis);

    function checkHighlight(num) {
      if (axis == "horizontal" && state.pos.x == num) {
        return true;
      } else if (axis == "vertical" && state.pos.y == num) {
        return true;
      } else {
        return false;
      }
    }
    render(
      html`<div class="gutter ${axis}" style="--scale:${state.scale}px;">
        ${arr.map(
          (content, index) =>
            html`<div class="cell ${checkHighlight(index) ? "highlight" : ""}">
              ${content}
            </div>`
        )}
      </div>`,
      container
    );
  };
}
