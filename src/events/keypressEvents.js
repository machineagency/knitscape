import { GLOBAL_STATE, dispatch } from "../state";
import { undo } from "../actions/undoRedo";

const ctrlShortcuts = {
  a: () => console.log("select all?"),
  z: () => undo(),
  s: () => dispatch({ showDownload: true }),
};

const hotkeys = {
  // Tool hotkeys
  b: () => dispatch({ activeTool: "brush" }),
  f: () => dispatch({ activeTool: "flood" }),
  l: () => dispatch({ activeTool: "line" }),
  r: () => dispatch({ activeTool: "rect" }),
  s: () => dispatch({ activeTool: "shift" }),

  // Misc
  g: () => dispatch({ grid: !GLOBAL_STATE.grid }),

  // UI
  Escape: () =>
    dispatch({
      showFileMenu: false,
      showLibrary: false,
      showSettings: false,
      showDownload: false,
    }),
};

function colorSwitch(index) {
  if (index < GLOBAL_STATE.yarnPalette.length) dispatch({ activeColor: index });
}

export function addKeypressListeners() {
  window.addEventListener("keydown", (e) => {
    // if (
    //   !(
    //     GLOBAL_STATE.showSettings ||
    //     GLOBAL_STATE.showDownload ||
    //     GLOBAL_STATE.showLibrary
    //   )
    // ) {
    if (e.ctrlKey && e.key.toLowerCase() in ctrlShortcuts) {
      e.preventDefault();
      ctrlShortcuts[e.key.toLowerCase()]();
    } else if (e.key in hotkeys) hotkeys[e.key]();
    else if (/^[0-9]$/i.test(e.key)) colorSwitch(Number(e.key));
    // }
    const newHeldKeys = new Set(GLOBAL_STATE.heldKeys);
    newHeldKeys.add(e.key);
    dispatch({ heldKeys: newHeldKeys });
  });

  window.addEventListener("keyup", (e) => {
    const newHeldKeys = new Set(GLOBAL_STATE.heldKeys);
    newHeldKeys.delete(e.key);
    dispatch({ heldKeys: newHeldKeys });
  });
}
