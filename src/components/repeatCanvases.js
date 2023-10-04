import { sizeCanvasToBitmap } from "../actions/zoomFit";
import { GLOBAL_STATE } from "../state";

function clearLastDrawn(lastDrawn) {
  for (const repeat of lastDrawn) {
    repeat.bitmap = null;
  }
}

export function repeatCanvases() {
  return ({ state }) => {
    let { scale, symbolPalette, symbolMap, repeats } = state;

    let lastDrawn = repeats.map((repeat) => {
      return { bitmap: null, pos: [...repeat.pos] };
    });

    clearLastDrawn(lastDrawn);

    function draw(repeatIndex) {
      // Draws only the pixels that have changed
      const ctx = document
        .getElementById(`repeat-${repeatIndex}`)
        .getContext("2d");

      const repeat = repeats[repeatIndex].bitmap;

      for (let y = 0; y < repeat.height; y++) {
        for (let x = 0; x < repeat.width; x++) {
          let paletteIndex = repeat.pixel(x, y);

          if (
            lastDrawn[repeatIndex].bitmap == null ||
            lastDrawn[repeatIndex].bitmap.pixel(x, y) != paletteIndex
          ) {
            let im = symbolPalette[symbolMap[paletteIndex]];

            if (!im) continue;
            ctx.clearRect(x * scale, y * scale, scale, scale);
            ctx.drawImage(im, x * scale, y * scale, scale, scale);
          }
        }
      }
      lastDrawn[repeatIndex].bitmap = repeat;
    }

    function positionRepeat(repeatIndex) {
      let repeat = repeats[repeatIndex];
      let repeatCanvas = document.getElementById(`repeat-${repeatIndex}`);
      let repeatContainer = document.getElementById(
        `repeat-${repeatIndex}-container`
      );

      sizeCanvasToBitmap(
        repeatCanvas,
        repeat.bitmap.width,
        repeat.bitmap.height
      );

      repeatContainer.style.transform = `translate(${
        (repeat.pos[0] * GLOBAL_STATE.scale) / devicePixelRatio
      }px, ${
        ((GLOBAL_STATE.chart.height - repeat.bitmap.height - repeat.pos[1]) *
          GLOBAL_STATE.scale) /
        devicePixelRatio
      }px)`;
    }

    for (let repeatIndex = 0; repeatIndex < repeats.length; repeatIndex++) {
      positionRepeat(repeatIndex);
      draw(repeatIndex);
    }

    return {
      syncState(state) {
        repeats = state.repeats;

        if (symbolPalette != state.symbolPalette) {
          symbolPalette = state.symbolPalette;
          clearLastDrawn(lastDrawn);
        }

        if (scale != state.scale) {
          scale = state.scale;
          clearLastDrawn(lastDrawn);

          for (
            let repeatIndex = 0;
            repeatIndex < repeats.length;
            repeatIndex++
          ) {
            sizeCanvasToBitmap(
              document.getElementById(`repeat-${repeatIndex}`),
              repeats[repeatIndex].bitmap.width,
              repeats[repeatIndex].bitmap.height
            );
          }
        }

        for (let repeatIndex = 0; repeatIndex < repeats.length; repeatIndex++) {
          let repeat = repeats[repeatIndex];
          if (
            lastDrawn[repeatIndex].bitmap == null ||
            repeat.bitmap.width != lastDrawn[repeatIndex].bitmap.width ||
            repeat.bitmap.height != lastDrawn[repeatIndex].bitmap.height ||
            repeat.pos[0] != lastDrawn[repeatIndex].pos[0] ||
            repeat.pos[1] != lastDrawn[repeatIndex].pos[1]
          ) {
            positionRepeat(repeatIndex);
            lastDrawn[repeatIndex].pos = repeat.pos;
            lastDrawn[repeatIndex].bitmap = null;
          }

          if (lastDrawn[repeatIndex].bitmap != repeat.bitmap) {
            draw(repeatIndex);
          }
        }
      },
    };
  };
}
