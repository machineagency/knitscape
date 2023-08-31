import { html, render } from "lit-html";

function numberArr({ bitmap }, gutterPos, size) {
  return Array.apply(
    null,
    Array(
      gutterPos == "bottom" || gutterPos == "top" ? bitmap.width : bitmap.height
    )
  ).map((x, i) => i + 1);
}

export function numberGutterExtension(
  { state, parent },
  { gutterPos, size, container = "workspace", gutterFunc = numberArr }
) {
  let { bitmap, pan, pos, aspectRatio, scale } = state;
  let arr = gutterFunc(state, gutterPos, size);

  let dom = document.createElement("div");
  dom.style.display = "flex";
  dom.style.gridArea = gutterPos;

  if (gutterPos == "bottom" || gutterPos == "top") {
    dom.style.height = `${size}px`;
  } else if (gutterPos == "left" || gutterPos == "right") {
    dom.style.width = `${size}px`;
  }

  parent[container].appendChild(dom);

  function checkHighlight(num) {
    if ((gutterPos == "bottom" || gutterPos == "top") && pos.x == num)
      return true;
    if ((gutterPos == "left" || gutterPos == "right") && pos.y == num)
      return true;
  }

  function updatePosition() {
    if (gutterPos == "left" || gutterPos == "right") {
      dom.style.transform = `translateY(${pan.y}px)`;
    } else if (gutterPos == "top" || gutterPos == "bottom") {
      dom.style.transform = `translateX(${pan.x}px)`;
    }
  }

  const view = () => {
    return html`<style>
        .gutter {
          background-color: black;
          font-family: monospace;
          font-size: 0.8em;
          font-weight: bold;
          color: #969696;
          user-select: none;
          position: absolute;
          display: flex;
          gap: 1px;
          outline: 1px solid black;
        }
        .left,
        .right {
          height: ${bitmap.height * aspectRatio[1] * scale}px;
          flex-direction: column;
          width: 100%;
        }

        .top,
        .bottom {
          width: ${bitmap.width * aspectRatio[0] * scale}px;
          height: 100%;
        }

        .cell {
          flex: 1 1 0;
          background-color: #2d2c2c;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }

        .gutter > .cell:nth-of-type(odd) {
          background: #3b3b3b;
        }

        .highlight {
          background-color: #00000044 !important;
          color: #fafafa !important;
        }
      </style>
      <div class="gutter ${gutterPos}">
        ${arr.map(
          (content, index) =>
            html`<div class="cell ${checkHighlight(index) ? "highlight" : ""}">
              ${content}
            </div>`
        )}
      </div>`;
  };

  return {
    syncState(state) {
      ({ bitmap, pan, pos, aspectRatio, scale } = state);
      arr = gutterFunc(state, gutterPos, size);

      updatePosition();
      render(view(), dom);
    },
  };
}

export function numberGutter(options = {}) {
  return (config) => numberGutterExtension(config, options);
}
