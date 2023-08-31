import { html, render } from "lit-html";

function symbolPalette({ symbols, showSelect = true }, { state, dispatch }) {
  let selected = state.paletteIndex;
  let dom = document.createElement("div");
  dom.style.flexDirection = "inherit";

  function renderSelection() {
    if (!showSelect) return;
    render(
      html`<style>
          .palette-select {
            display: flex;
            flex-direction: inherit;
            gap: 3px;
            justify-content: center;
          }
          .palette-select > img {
            border: 1px solid black;
          }
          .selected {
            outline: 2px solid white;
          }
        </style>
        <div class="palette-select">
          ${symbols.map(
            ({ image, title }, index) =>
              html`<img
                class=${index == selected ? "selected" : ""}
                src=${image.src}
                title=${title}
                @click=${() => dispatch({ paletteIndex: index })} />`
          )}
        </div> `,
      dom
    );
  }

  function draw(paletteIndex, ctx, width, height) {
    ctx.drawImage(symbols[paletteIndex].image, 0, 0, width, height);
  }

  function syncState({ paletteIndex }) {
    if (selected != paletteIndex) {
      selected = paletteIndex;
      renderSelection();
    }
  }

  renderSelection();

  return {
    draw,
    dom,
    syncState,
  };
}

function hexPalette(
  { entries, showSelect = true, selectSize = "30px" },
  { state, dispatch }
) {
  let selected = state.paletteIndex;
  let dom = document.createElement("div");
  dom.style.flexDirection = "inherit";

  function renderSelection() {
    if (!showSelect) return;
    render(
      html`<style>
          .palette-select {
            display: flex;
            flex-direction: inherit;
            gap: 3px;
            padding: 3px;
          }
          .palette-select > div {
            border: 1px solid black;
            min-width: ${selectSize};
            aspect-ratio: 1;
          }
          .selected {
            outline: 1px solid white;
          }
        </style>
        <div class="palette-select">
          ${entries.map(
            (hex, index) =>
              html`<div
                class=${index == selected ? "selected" : ""}
                style="background-color: ${hex}"
                @click=${() => dispatch({ paletteIndex: index })}></div>`
          )}
        </div> `,
      dom
    );
  }

  function draw(paletteIndex, ctx, width, height) {
    ctx.fillStyle = entries[paletteIndex];
    ctx.fillRect(0, 0, width, height);
  }

  function syncState({ paletteIndex }) {
    if (selected != paletteIndex) {
      selected = paletteIndex;
      renderSelection();
    }
  }

  renderSelection();

  return {
    draw,
    dom,
    syncState,
  };
}

function pixelPalette(
  { entries, showSelect = true, selectSize = "40px" },
  { state, dispatch }
) {
  let selected = state.paletteIndex;
  let dom = document.createElement("div");

  function getRGB([r, g, b]) {
    try {
      return `rgb(${r} ${g} ${b})`;
    } catch (e) {
      console.warn("Can't destructure palette entries to RGB");
      return `rgb(0 0 0)`;
    }
  }

  function renderSelection() {
    if (!showSelect) return;
    render(
      html`<style>
          .palette-select {
            display: flex;
            flex-direction: column;
            gap: 3px;
            justify-content: center;

            padding: 3px;
          }
          .palette-select > div {
            border: 1px solid black;
            height: ${selectSize};
            aspect-ratio: 1;
          }
          .selected {
            outline: 1px solid white;
          }
        </style>
        <div class="palette-select">
          ${entries.map(
            (rgb, index) =>
              html`<div
                class=${index == selected ? "selected" : ""}
                style="background-color: ${getRGB(rgb)}"
                @click=${() => dispatch({ paletteIndex: index })}></div>`
          )}
        </div> `,
      dom
    );
  }

  function draw(paletteIndex, ctx, width, height) {
    ctx.fillStyle = getRGB(entries[paletteIndex]);
    ctx.fillRect(0, 0, width, height);
  }

  function syncState({ paletteIndex }) {
    if (selected != paletteIndex) {
      selected = paletteIndex;
      renderSelection();
    }
  }

  renderSelection();

  return {
    draw,
    dom,
    syncState,
  };
}

function buildSymbolPalette(symbols) {
  return (config) => symbolPalette(symbols, config);
}

function buildPixelPalette(entries) {
  return (config) => pixelPalette({ entries }, config);
}

function buildHexPalette(entries) {
  return (config) => hexPalette({ entries }, config);
}

export { buildPixelPalette, buildSymbolPalette, buildHexPalette };
