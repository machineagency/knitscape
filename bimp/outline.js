function outlineExtension(
  { state, parent },
  { outer = "#000000", inner = "#ffffff", container = "desktop" }
) {
  let { aspectRatio, scale, bitmap, pos, pan } = state;
  let cellSize = [aspectRatio[0] * scale, aspectRatio[1] * scale];

  const dom = document.createElement("canvas");
  dom.style.cssText = `image-rendering: pixelated;`;
  parent[container].appendChild(dom);

  function draw() {
    const ctx = dom.getContext("2d");
    ctx.clearRect(0, 0, dom.width, dom.height);

    ctx.strokeStyle = inner;
    ctx.strokeRect(
      pos.x * cellSize[0] + 1.5,
      pos.y * cellSize[1] + 1.5,
      cellSize[0] - 3,
      cellSize[1] - 3
    );

    ctx.strokeStyle = outer;
    ctx.strokeRect(
      pos.x * cellSize[0] + 0.5,
      pos.y * cellSize[1] + 0.5,
      cellSize[0] - 1,
      cellSize[1] - 1
    );
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
        state.pos != pos
      ) {
        ({ aspectRatio, scale, pan, bitmap, pos } = state);

        cellSize = [aspectRatio[0] * scale, aspectRatio[1] * scale];
        updateDom();
        draw();
      }
    },
  };
}

export function outline(options = {}) {
  return (config) => outlineExtension(config, options);
}
