import { GLOBAL_STATE, dispatch } from "../state";
import { pan } from "./chartPanZoom";
import { editingTools } from "../charting/editingTools";
import { stitches } from "../constants";
import { Bimp } from "../lib/Bimp";

function blockPos(e, blockID) {
  let bbox = document
    .querySelector(`[data-blockid="${blockID}"]`)
    .getBoundingClientRect();
  return {
    x: Math.floor((e.clientX - bbox.left) / GLOBAL_STATE.cellWidth),
    y: Math.floor((bbox.bottom - e.clientY) / GLOBAL_STATE.cellHeight),
  };
}

export function addStitchBlock() {
  const { stitchSelect, blocks } = GLOBAL_STATE;

  let uuid = self.crypto.randomUUID();
  let [bl, tr] = stitchSelect;
  let [width, height] = [tr[0] - bl[0], tr[1] - bl[1]];

  dispatch(
    {
      stitchSelect: null,
      blocks: {
        ...blocks,
        [uuid]: {
          pos: bl,
          bitmap: Bimp.empty(width, height, 1),
          type: "stitch",
        },
      },
      editingBlock: uuid,
    },
    true
  );
}

export function removeStitchBlock(blockID) {
  const { blocks } = GLOBAL_STATE;
  const updated = { ...blocks };
  delete updated[blockID];

  dispatch(
    {
      blocks: updated,
      editingBlock: null,
    },
    true
  );
}

export function resizeBlock(e, blockID, direction) {
  const block = GLOBAL_STATE.blocks[blockID];
  const bmp = block.bitmap;
  const [x, y] = block.pos;
  let last = [0, 0];

  const startPos = { x: e.clientX, y: e.clientY };
  dispatch({ transforming: true, locked: true });

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      const { scale, cellAspect, blocks } = GLOBAL_STATE;

      let dx = Math.round((startPos.x - e.clientX) / scale);
      let dy = Math.round((startPos.y - e.clientY) / scale / cellAspect);

      if (last[0] == dx && last[1] == dy) return;

      let updatedBlocks = { ...blocks };

      if (direction == "up") {
        let newHeight = bmp.height + dy;
        if (newHeight < 1) return;

        updatedBlocks[blockID].bitmap = bmp.resize(
          bmp.width,
          newHeight,
          stitches.TRANSPARENT
        );
      } else if (direction == "right") {
        let newWidth = bmp.width - dx;
        if (newWidth < 1) return;

        updatedBlocks[blockID].bitmap = bmp.resize(
          newWidth,
          bmp.height,
          stitches.TRANSPARENT
        );
      } else if (direction == "down") {
        let newHeight = bmp.height - dy;
        if (newHeight < 1) return;

        updatedBlocks[blockID].bitmap = bmp
          .vFlip()
          .resize(bmp.width, newHeight, stitches.TRANSPARENT)
          .vFlip();
        updatedBlocks[blockID].pos = [x, y + dy];
      } else if (direction == "left") {
        let newWidth = bmp.width + dx;
        if (newWidth < 1) return;

        updatedBlocks[blockID].bitmap = bmp
          .hFlip()
          .resize(newWidth, bmp.height, stitches.TRANSPARENT)
          .hFlip();
        updatedBlocks[blockID].pos = [x - dx, y];
      }

      last = [dx, dy];

      dispatch({
        blocks: updatedBlocks,
      });
    }
  }

  function end() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointerleave", end);
    dispatch({ transforming: false, locked: false });
  }

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointerleave", end);
}

function moveBlock(e, blockID) {
  const [x, y] = GLOBAL_STATE.blocks[blockID].pos;
  let last = [0, 0];

  const startPos = { x: e.clientX, y: e.clientY };
  dispatch({ transforming: true, locked: true });

  function move(e) {
    if (e.buttons == 0) {
      end();
    } else {
      const { scale, cellAspect, blocks } = GLOBAL_STATE;

      let dx = Math.round((startPos.x - e.clientX) / scale);
      let dy = Math.round((startPos.y - e.clientY) / scale / cellAspect);

      if (last[0] == dx && last[1] == dy) return;

      let updatedBlocks = { ...blocks };

      updatedBlocks[blockID].pos = [x - dx, y + dy];

      last = [dx, dy];

      dispatch({
        blocks: updatedBlocks,
      });
    }
  }

  function end() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointerleave", end);
    dispatch({ transforming: false, locked: false });
  }

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointerleave", end);
}

function editBlock(e, blockID, tool) {
  let pos = blockPos(e, blockID);

  dispatch({ locked: true });
  let startBlock = GLOBAL_STATE.blocks[blockID];

  // tool onMove is not called unless pointer moves into another cell in the chart
  let onMove = tool(startBlock.bitmap, pos, GLOBAL_STATE.activeSymbol);
  if (!onMove) return;

  dispatch({
    blocks: {
      ...GLOBAL_STATE.blocks,
      [blockID]: { ...startBlock, bitmap: onMove(pos) },
    },
  });

  function move(moveEvent) {
    if (moveEvent.buttons == 0) {
      end();
    } else {
      let newPos = blockPos(moveEvent, blockID);

      if (newPos.x == pos.x && newPos.y == pos.y) return;
      let updated = onMove(newPos);

      dispatch({
        blocks: {
          ...GLOBAL_STATE.blocks,
          [blockID]: { ...startBlock, bitmap: updated },
        },
      });
      pos = newPos;
    }
  }

  function end() {
    dispatch({ locked: false });

    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointerleave", end);
  }

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointerleave", end);
}

export function blockPointerDown(e, blockID) {
  if (e.which == 2) {
    pan(e);
    return;
  }

  const activeTool = GLOBAL_STATE.activeBlockTool;
  if (GLOBAL_STATE.interactionMode == "hand") {
    pan(e);
  } else if (activeTool == "move") {
    moveBlock(e, blockID);
  } else if (activeTool in editingTools) {
    editBlock(e, blockID, editingTools[activeTool]);
  }
}
