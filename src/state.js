import { Bimp } from "./lib/Bimp";
import {
  SNAPSHOT_INTERVAL,
  DEFAULT_PATTERN_LIBRARY,
  DEFAULT_SYMBOLS,
} from "./constants";

const snapshotFields = [
  "chart",
  "yarnPalette",
  "colorSequence",
  "needlePositions",
  "repeatBitmap",
];

let GLOBAL_STATE = {
  editingChart: false,
  editingPalette: false,

  activeTool: "brush",
  activeSymbol: 0,
  activeColor: 1,

  chartBackground: "#fff",
  symbolPalette: {},
  symbolMap: DEFAULT_SYMBOLS,
  patternLibrary: DEFAULT_PATTERN_LIBRARY,

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
  lastSnapshot: 0,
  heldKeys: new Set(),
};

function loadWorkspace(workspace) {
  GLOBAL_STATE = { ...GLOBAL_STATE, ...workspace };
  GLOBAL_STATE.updateSim = true;
}

function shouldSnapshot(action) {
  if (!(GLOBAL_STATE.lastSnapshot < Date.now() - SNAPSHOT_INTERVAL))
    return false;

  for (const field of snapshotFields) {
    if (field in action) return true;
  }

  return false;
}

function snapshotUpdate(action) {
  GLOBAL_STATE = {
    ...GLOBAL_STATE,
    ...action,
    snapshots: [
      Object.fromEntries(
        snapshotFields.map((field) => [field, GLOBAL_STATE[field]])
      ),
      ...GLOBAL_STATE.snapshots,
    ],
    lastSnapshot: Date.now(),
  };

  return GLOBAL_STATE;
}

function normalUpdate(action) {
  GLOBAL_STATE = { ...GLOBAL_STATE, ...action };
  return GLOBAL_STATE;
}

function updateState(action) {
  return shouldSnapshot(action) ? snapshotUpdate(action) : normalUpdate(action);
}

function undo() {
  const changes = GLOBAL_STATE.snapshots[0];

  GLOBAL_STATE = {
    ...GLOBAL_STATE,
    ...GLOBAL_STATE.snapshots[0],
    lastSnapshot: 0,
    snapshots: GLOBAL_STATE.snapshots.slice(1),
  };

  KnitScape.syncState(GLOBAL_STATE, changes);
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

export { GLOBAL_STATE, undo, dispatch, KnitScape, loadWorkspace };
