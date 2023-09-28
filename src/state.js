import { Bimp } from "./lib/Bimp";

let GLOBAL_STATE = {
  editingChart: false,
  editingPalette: false,

  activeTool: "brush",
  activeSymbol: 1,
  activeColor: 1,

  scale: 15,
  pos: { x: -1, y: -1 },
  chartPan: { x: 0, y: 0 },

  updateSim: false,
  simWidth: 30,
  simHeight: 70,
  swatchFlipped: false,

  repeatBitmap: Bimp.empty(8, 12, 0),
  chart: Bimp.empty(20, 20, 0),
  colorSequence: null,
  needlePositions: null,
  yarnPalette: ["#f7dc97", "#1d1b1c"],

  grid: true,

  isMobile: true,
  showFileMenu: false,
  showLibrary: false,
  showSettings: false,
  showDownload: false,
  debug: false,

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

  function register(componentArr) {
    componentArr.forEach((component) =>
      components.push(component({ state: GLOBAL_STATE, dispatch }))
    );
  }

  return {
    register,
    syncState,
  };
})();

export { GLOBAL_STATE, dispatch, KnitScape, loadWorkspace };
