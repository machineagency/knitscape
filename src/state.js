export let GLOBAL_STATE = {
  editing: false,
  scale: 25,
  updateSim: false,
  simWidth: 30,
  simHeight: 70,
  swatchFlipped: false,

  repeatBitmap: null,
  colorSequence: null,

  isMobile: true,
  showFileMenu: false,
  showLibrary: false,
  showSettings: false,
  showDownload: false,
};

export function loadWorkspace(workspace) {
  GLOBAL_STATE = { ...GLOBAL_STATE, ...workspace };
  GLOBAL_STATE.updateSim = true;
}

export function updateState(action) {
  GLOBAL_STATE = { ...GLOBAL_STATE, ...action };
  // if (
  //   (action.bitmap || action.palette) &&
  //   state.lastSnapshot < Date.now() - 1000
  // ) {
  //   state = {
  //     ...state,
  //     ...action,
  //     snapshots: [
  //       {
  //         bitmap: state.bitmap,
  //         palette: state.palette,
  //         width: state.width,
  //         height: state.height,
  //       },
  //       ...state.snapshots,
  //     ],
  //     lastSnapshot: Date.now(),
  //   };
  // } else {
  //   state = { ...state, ...action };
  // }
}

export function undo() {
  state = {
    ...state,
    ...state.snapshots[0],
    lastSnapshot: 0,
    snapshots: state.snapshots.slice(1),
  };
}
