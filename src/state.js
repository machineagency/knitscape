import { library } from "../patterns/library";

let GLOBAL_STATE = {
  editingChart: false,
  editingPalette: false,

  activeTool: "brush",
  activeColor: 0,

  scale: 25,
  pos: { x: -1, y: -1 },

  updateSim: false,
  simWidth: 30,
  simHeight: 70,
  swatchFlipped: false,

  repeatBitmap: null,
  colorSequence: null,
  needlePositions: null,
  yarnPalette: [
    "#f312ab",
    "#f51e0f",
    "#ff7b24",
    "#ffd500",
    "#f7dc97",
    "#9ef5d4",
    "#006b5f",
    "#70dbff",
    "#0f4bff",
    "#00254d",
    "#a20dd9",
    "#858480",
    "#1d1b1c",
  ],

  grid: true,

  isMobile: true,
  showFileMenu: false,
  showLibrary: false,
  showSettings: false,
  showDownload: false,
  debug: true,

  snapshots: [],
  heldKeys: new Set(),
};

function loadWorkspace(workspace) {
  GLOBAL_STATE = { ...GLOBAL_STATE, ...workspace };
  GLOBAL_STATE.updateSim = true;
}

function updateState(action) {
  GLOBAL_STATE = { ...GLOBAL_STATE, ...action };
  return GLOBAL_STATE;
  // if (
  //   (action.bitmap || action.palette) &&
  //   state.lastSnapshot < Date.now() - 1000
  // ) {
  //   state = {
  //     ...state,
  //     ...action,
  //     snapshots: [
  //       {
  //  class=${state.}       bitmap: state.bitmap,
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

function dispatch(action) {
  const changes = Object.keys(action);
  KnitScape.syncState(updateState(action), changes);
}

const KnitScape = (() => {
  const components = [];

  function syncState(state, changes) {
    components.forEach((component) => {
      component.syncState(state, changes);
    });
  }

  function register(component) {
    components.push(component({ GLOBAL_STATE, dispatch }));
  }

  return {
    register,
    syncState,
  };
})();

export { GLOBAL_STATE, dispatch, KnitScape, loadWorkspace };
