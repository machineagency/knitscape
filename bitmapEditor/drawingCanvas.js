function canvasExtension(
  { state, parent, dispatch },
  {
    paletteBuilder,
    container = "desktop",
    palettePosition = "sidebarSecondary",
  }
) {
  state.paletteIndex = 0;

  let palette = paletteBuilder({ state, parent, dispatch });
  let { aspectRatio, scale, pan, bitmap } = state;

  let lastDrawn = null;

  const dom = document.createElement("canvas");
  dom.style.cssText = "outline: 1px solid black";
  parent[container].appendChild(dom);
  if (palettePosition) {
    parent[palettePosition].appendChild(palette.dom);
  }

  function draw() {
    // Draws only the pixels that have changed
    const ctx = dom.getContext("2d");

    for (let y = 0; y < bitmap.height; y++) {
      for (let x = 0; x < bitmap.width; x++) {
        let paletteIndex = bitmap.pixel(x, y);

        if (lastDrawn == null || lastDrawn.pixel(x, y) != paletteIndex) {
          ctx.translate(x * aspectRatio[0] * scale, y * aspectRatio[1] * scale);

          palette.draw(
            paletteIndex,
            ctx,
            aspectRatio[0] * scale,
            aspectRatio[1] * scale
          );
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
      }
    }
    lastDrawn = bitmap;
  }

  function updateDom() {
    dom.width = bitmap.width * aspectRatio[0] * scale;
    dom.height = bitmap.height * aspectRatio[1] * scale;
    dom.style.transform = `translate(${pan.x}px, ${pan.y}px)`;
  }

  function calcCenterFit() {
    // Caluculates the nearest whole-pixel scale multiplier that will
    // fit this bitmap at the current aspect ratio.
    // There will likely be some padding around the edges - but
    // the canvas can get blurry when dealing with sub-pixels.
    const bbox = parent[container].getBoundingClientRect();

    const availableWidth = bbox.width;
    const availableHeight = bbox.height;

    const newScale = Math.min(
      Math.floor(availableWidth / (bitmap.width * aspectRatio[0])),
      Math.floor(availableHeight / (bitmap.height * aspectRatio[1]))
    );

    const x = Math.floor(
      (availableWidth - bitmap.width * aspectRatio[0] * newScale) / 2
    );
    const y = Math.floor(
      (availableHeight - bitmap.height * aspectRatio[1] * newScale) / 2
    );
    dispatch({ scale: newScale, pan: { x, y } });
  }

  const resizeObserver = new ResizeObserver((entries) => {
    calcCenterFit();
  });

  resizeObserver.observe(parent[container]);

  return {
    attached(state) {
      ({ aspectRatio, scale, bitmap } = state);
      setTimeout(() => calcCenterFit(state.bitmap), 1);
    },
    syncState(state) {
      if (
        state.bitmap.width != bitmap.width ||
        state.bitmap.height != bitmap.height
      ) {
        bitmap = state.bitmap;
        setTimeout(() => calcCenterFit(), 1);
        return;
      }

      if (
        state.aspectRatio[0] != aspectRatio[0] ||
        state.aspectRatio[1] != aspectRatio[1] ||
        state.scale != scale ||
        state.pan.x != pan.x ||
        state.pan.y != pan.y
      ) {
        ({ aspectRatio, scale, pan, bitmap } = state);
        lastDrawn = null;
        updateDom();
      }

      if (lastDrawn != state.bitmap) {
        ({ bitmap } = state);
        draw();
      }
      palette.syncState(state);
    },
  };
}

export function drawingCanvas(options = {}) {
  return (config) => canvasExtension(config, options);
}
