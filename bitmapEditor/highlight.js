function highlightExtension(
  { state, parent },
  {
    cell = true,
    row = false,
    col = false,
    color = "#00000044",
    container = "desktop",
  }
) {
  let { aspectRatio, scale, bitmap, pos, pan } = state;
  let cellSize = [aspectRatio[0] * scale, aspectRatio[1] * scale];

  const dom = document.createElement("canvas");
  dom.style.cssText = `image-rendering: pixelated;`;
  parent[container].appendChild(dom);

  function draw() {
    const ctx = dom.getContext("2d");
    ctx.clearRect(0, 0, dom.width, dom.height);
    ctx.fillStyle = color;

    if (cell) {
      ctx.fillRect(
        pos.x * cellSize[0],
        pos.y * cellSize[1],
        cellSize[0],
        cellSize[1]
      );
    }
    if (row) {
      ctx.fillRect(
        0,
        pos.y * cellSize[1],
        cellSize[0] * bitmap.width,
        cellSize[1]
      );
    }
    if (col) {
      ctx.fillRect(
        pos.x * cellSize[0],
        0,
        cellSize[0],
        cellSize[1] * bitmap.height
      );
    }
  }

  function resizeCanvas(bitmap) {
    dom.width = bitmap.width * aspectRatio[0] * scale;
    dom.height = bitmap.height * aspectRatio[1] * scale;
  }

  function positionCanvas() {
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
        pos = state.pos;
        bitmap = state.bitmap;
        aspectRatio = state.aspectRatio;
        scale = state.scale;
        pan = state.pan;

        cellSize = [aspectRatio[0] * scale, aspectRatio[1] * scale];
        resizeCanvas(bitmap);
        positionCanvas();
        draw();
      }
    },
  };
}

export function highlight(options = {}) {
  return (config) => highlightExtension(config, options);
}
