import { GLOBAL_STATE, dispatch } from "../state";
import { pan } from "./chartPanZoom";
import { editingTools } from "../charting/editingTools";

function blockPos(e, blockID) {
  let bbox = document
    .querySelector(`[data-blockid="${blockID}"]`)
    .getBoundingClientRect();
  return {
    x: Math.floor((e.clientX - bbox.left) / GLOBAL_STATE.cellWidth),
    y: Math.floor((bbox.bottom - e.clientY) / GLOBAL_STATE.cellHeight),
  };
}

function moveBlock(e, blockID) {
  const [x, y] = GLOBAL_STATE.blocks[blockID].pos;
  let last = [0, 0];

  const startPos = { x: e.clientX, y: e.clientY };
  dispatch({ transforming: true });

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
    dispatch({ transforming: false });
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
  if (GLOBAL_STATE.activeTool == "hand") {
    pan(e);
  } else if (activeTool == "move") {
    moveBlock(e, blockID);
  } else if (activeTool in editingTools) {
    editBlock(e, blockID, editingTools[activeTool]);
  }
}

// function resizeRepeat(e, repeatIndex) {
//   const startRepeat = GLOBAL_STATE.repeats[repeatIndex];
//   const startPos = [e.clientX, e.clientY];
//   const resizeDragger = e.target;
//   dispatch({ transforming: true });

//   document.body.classList.add("grabbing");
//   resizeDragger.classList.remove("grab");

//   const end = () => {
//     dispatch({ transforming: false });

//     document.body.classList.remove("grabbing");

//     window.removeEventListener("pointermove", onmove);
//     window.removeEventListener("pointerup", end);

//     resizeDragger.classList.add("grab");
//   };

//   const onmove = (e) => {
//     let newWidth =
//       startRepeat.bitmap.width -
//       Math.floor(
//         (startPos[0] - e.clientX) / (GLOBAL_STATE.scale / devicePixelRatio)
//       );

//     let newHeight =
//       startRepeat.bitmap.height +
//       Math.floor(
//         (startPos[1] - e.clientY) / (GLOBAL_STATE.scale / devicePixelRatio)
//       );

//     // console.log(newHeight, new)
//     if (newHeight < 1 || newWidth < 1) return;

//     let pos = [...startRepeat.pos];
//     if (newWidth + startRepeat.pos[0] < 1) pos[0] = -newWidth + 1;
//     if (newHeight + startRepeat.pos[1] < 1) pos[1] = -newHeight + 1;

//     let area = [
//       newWidth > startRepeat.area[0] ? newWidth : startRepeat.area[0],
//       newHeight > startRepeat.area[1] ? newHeight : startRepeat.area[1],
//     ];

//     dispatch({
//       repeats: [
//         ...GLOBAL_STATE.repeats.slice(0, repeatIndex),
//         {
//           ...GLOBAL_STATE.repeats[repeatIndex],
//           bitmap: startRepeat.bitmap
//             .vFlip()
//             .resize(newWidth, newHeight)
//             .vFlip(),
//           pos,
//           area,
//         },
//         ...GLOBAL_STATE.repeats.slice(repeatIndex + 1),
//       ],
//     });
//   };

//   window.addEventListener("pointermove", onmove);
//   window.addEventListener("pointerup", end);
// }
