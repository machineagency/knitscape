function makeGrid({ state, parent }, { container = "desktop" }) {
  let { aspectRatio, scale, bitmap, pan } = state;
  let cellSize = [aspectRatio[0] * scale, aspectRatio[1] * scale];

  const dom = document.createElement("canvas");
  dom.style.cssText = `image-rendering: pixelated;`;
  parent[container].appendChild(dom);

  function draw() {
    const ctx = dom.getContext("2d");
    ctx.translate(-0.5, -0.5);

    ctx.clearRect(0, 0, dom.width, dom.height);

    ctx.beginPath();

    for (let x = 1; x < bitmap.width; x++) {
      ctx.moveTo(x * cellSize[0], 0);
      ctx.lineTo(x * cellSize[0], bitmap.height * cellSize[1]);
    }

    for (let y = 1; y < bitmap.height; y++) {
      ctx.moveTo(0, y * cellSize[1]);
      ctx.lineTo(bitmap.width * cellSize[0], y * cellSize[1]);
    }

    ctx.stroke();
  }

  function updateDom() {
    dom.width = bitmap.width * aspectRatio[0] * scale;
    dom.height = bitmap.height * aspectRatio[1] * scale;
    dom.style.transform = `translate(${pan.x}px, ${pan.y}px)`;
  }

  return {
    syncState(state) {
      if (
        state.bitmap.width != bitmap.width ||
        state.bitmap.height != bitmap.height ||
        state.aspectRatio[0] != aspectRatio[0] ||
        state.aspectRatio[1] != aspectRatio[1] ||
        state.scale != scale ||
        state.pan.x != pan.x ||
        state.pan.y != pan.y
      ) {
        ({ aspectRatio, scale, pan, bitmap } = state);

        cellSize = [aspectRatio[0] * scale, aspectRatio[1] * scale];
        updateDom();
        draw();
      }
    },
  };
}

export function grid(options = {}) {
  return (config) => makeGrid(config, options);
}
