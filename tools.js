export function brush(pos, motifID, state, dispatch, color) {
  let currentPos = pos;

  function brushPixel(newPos, state, first = false) {
    if (!first) {
      if (newPos.pX == currentPos.pX && newPos.pY == currentPos.pY) return;
    }
    const updated = state.motifs[motifID].bitmap.line(
      { x: currentPos.pX, y: currentPos.pY },
      { x: newPos.pX, y: newPos.pY },
      color
    );

    currentPos = newPos;

    dispatch("editMotif", {
      motifID: motifID,
      bitmap: updated,
    });
  }

  brushPixel(pos, state, true);
  return brushPixel;
}

export function flood(pos, motifID, state, dispatch, color) {
  let currentPos = pos;

  function floodArea(newPos, state, first = false) {
    if (!first) {
      if (newPos.pX == currentPos.pX && newPos.pY == currentPos.pY) return;
    }
    currentPos = newPos;

    dispatch("editMotif", {
      motifID: motifID,
      bitmap: state.motifs[motifID].bitmap.flood(
        { x: currentPos.pX, y: currentPos.pY },
        color
      ),
    });
  }

  floodArea(pos, state, true);
  return floodArea;
}

export function rect(start, motifID, state, dispatch, color) {
  // When we start to draw a rectangle, we save the currently active bitmap
  // so our changes will only be completely overriden when we stop dragging
  const bimp = state.motifs[motifID].bitmap;
  let currentPos = start;

  function drawRectangle(newPos, first = false) {
    if (!first) {
      if (newPos.pX == currentPos.pX && newPos.pY == currentPos.pY) return;
    }
    currentPos = newPos;

    dispatch("editMotif", {
      bitmap: bimp.rect(
        { x: start.pX, y: start.pY },
        { x: currentPos.pX, y: currentPos.pY },
        color
      ),
      motifID: motifID,
    });
  }
  drawRectangle(start, true);
  return drawRectangle;
}

export function line(start, motifID, state, dispatch, color) {
  const bimp = state.motifs[motifID].bitmap;
  let currentPos = start;

  function drawLine(newPos, first = false) {
    if (!first) {
      if (newPos.pX == currentPos.pX && newPos.pY == currentPos.pY) return;
    }
    currentPos = newPos;

    dispatch("editMotif", {
      bitmap: bimp.line(
        { x: start.pX, y: start.pY },
        { x: currentPos.pX, y: currentPos.pY },
        color
      ),
      motifID: motifID,
    });
  }
  drawLine(start, true);
  return drawLine;
}

export function pan(pos, state, dispatch) {
  function doPan(coords, state) {
    console.log(coords);
    // here we will want to dispatch "update pan" or something
  }

  doPan(pos);
  return doPan;
}

export const tools = {
  line,
  brush,
  flood,
  rect,
};

// export function line(start, state, dispatch) {
//   function drawRectangle(pos) {
//     dispatch({
//       bitmap: state.bitmap.rect(start, pos, state.currentPaletteIndex),
//     });
//   }
//   drawRectangle(start);
//   return drawRectangle;
// }

// export function pick(pos, state, dispatch) {
//   dispatch({ currentPaletteIndex: state.bitmap.pixel(pos.x, pos.y) });
// }
