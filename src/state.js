import { Bimp } from "./lib/Bimp";
import { SNAPSHOT_INTERVAL, SNAPSHOT_FIELDS } from "./constants";

let GLOBAL_STATE = {
  heldKeys: new Set(), // Keys that are currently held down
  snapshots: [], // Array of snapshot history
  lastSnapshot: 0, // time of last snapshot

  // GAUGE
  stitchGauge: 7, // stitches per inch
  rowGauge: 11, // rows per inch

  desktopPointerPos: [0, 0],

  locked: false,
  activeTool: "pointer",
  activeSymbol: 1,

  boundary: [
    [0, 0, 1],
    [1, 4, 0],
    [4, 4, 1],
    [5, 0, 0],
  ],

  stitchSelect: null,

  regions: [],
  paths: [],

  blocks: [],

  shapingMask: Bimp.empty(10, 10, 1),

  scale: 15, // Number of pixels for each chart cell
  chartPan: { x: 0, y: 0 }, // Pan value for the chart editor view

  // SIMULATION
  simScale: 1,
  simPan: { x: 0, y: 0 },
  flipped: false,

  // YARN
  yarnPalette: ["#ebe9bbff", "#328cbcff", "#bc7532ff"], // Colors of the yarns
  yarnWidth: 0.24,
  yarnExpanded: false,
  yarnSequence: null,
  yarnSelections: [],

  reverseScroll: false,
  symbolLineWidth: 3,

  // Various UI pane states
  showLibrary: false,
  showSettings: false,
  showDownload: false,

  // PUNCH CARD
  // punchcardMode: false, // constrains repeat width to a punchcard-friendly width
  // machine: "th860",
  // punchVerticalRepeats: 5,
  // rows: 40, //punchcard rows
  // numSides: 8, //number of punch sides
};

function loadWorkspace(workspace) {
  GLOBAL_STATE = { ...GLOBAL_STATE, ...workspace };
  GLOBAL_STATE.updateSim = true;
}

function shouldSnapshot(action) {
  if (!(GLOBAL_STATE.lastSnapshot < Date.now() - SNAPSHOT_INTERVAL))
    return false;

  for (const field of SNAPSHOT_FIELDS) {
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
        SNAPSHOT_FIELDS.map((field) => [field, GLOBAL_STATE[field]])
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
  if (GLOBAL_STATE.snapshots.length < 1) return;
  const changes = Object.keys(GLOBAL_STATE.snapshots[0]);

  GLOBAL_STATE = {
    ...GLOBAL_STATE,
    ...GLOBAL_STATE.snapshots[0],
    lastSnapshot: 0,
    snapshots: GLOBAL_STATE.snapshots.slice(1),
  };

  StateMonitor.syncState(GLOBAL_STATE, changes);
}

function dispatch(action) {
  const changes = Object.keys(action);
  StateMonitor.syncState(updateState(action), changes);
}

const StateMonitor = (() => {
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

export { GLOBAL_STATE, undo, dispatch, StateMonitor, loadWorkspace };
