function editMotif(state, bitmap, motifID) {
  const newMotifs = { ...state.motifs };
  const motif = newMotifs[motifID];

  motif.bitmap = bitmap;
  motif.bimpCanvas.updateOffscreenCanvas(motif.bitmap, motif.palette);
  return newMotifs;
}

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

    dispatch({ motifs: editMotif(state, updated, motifID) });
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

    const updated = state.motifs[motifID].bitmap.flood(
      { x: currentPos.pX, y: currentPos.pY },
      color
    );

    dispatch({ motifs: editMotif(state, updated, motifID) });
  }

  floodArea(pos, state, true);
  return floodArea;
}

export function rect(start, motifID, state, dispatch, color) {
  // When we start to draw a rectangle, we save the currently active bitmap
  // so our changes will only be completely overriden when we stop dragging
  const bimp = state.motifs[motifID].bitmap;
  let currentPos = start;

  function drawRectangle(newPos, _, first = false) {
    if (!first) {
      if (newPos.pX == currentPos.pX && newPos.pY == currentPos.pY) return;
    }
    currentPos = newPos;
    const updated = bimp.rect(
      { x: start.pX, y: start.pY },
      { x: currentPos.pX, y: currentPos.pY },
      color
    );

    dispatch({ motifs: editMotif(state, updated, motifID) });
  }
  drawRectangle(start, true);
  return drawRectangle;
}

export function line(start, motifID, state, dispatch, color) {
  const bimp = state.motifs[motifID].bitmap;
  let currentPos = start;

  function drawLine(newPos, _, first = false) {
    if (!first) {
      if (newPos.pX == currentPos.pX && newPos.pY == currentPos.pY) return;
    }
    currentPos = newPos;

    const updated = bimp.line(
      { x: start.pX, y: start.pY },
      { x: currentPos.pX, y: currentPos.pY },
      color
    );

    dispatch({ motifs: editMotif(state, updated, motifID) });
  }
  drawLine(start, true);
  return drawLine;
}

export function shift(start, motifID, state, dispatch, color) {
  let currentPos = start;

  function doShift(newPos, state, first = false) {
    if (!first) {
      if (newPos.pX == currentPos.pX && newPos.pY == currentPos.pY) return;
    }
    currentPos = newPos;

    const updated = state.motifs[motifID].bitmap.shift(
      start.pX - newPos.pX,
      start.pY - newPos.pY
    );

    dispatch({ motifs: editMotif(state, updated, motifID) });
  }
  doShift(start, true);
  return doShift;
}

export const tools = {
  line,
  brush,
  flood,
  rect,
  shift,
};
