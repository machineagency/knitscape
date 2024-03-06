import { SNAPSHOT_INTERVAL, SNAPSHOT_FIELDS } from "./constants";

let GLOBAL_STATE = {
  heldKeys: new Set(), // Keys that are currently held down
  snapshots: [], // Array of snapshot history
  lastSnapshot: 0, // time of last snapshot
  colorMode: "operation",
  transforming: false, // If the pointer is being used to do something

  // GAUGE
  stitchGauge: null, // stitches per inch
  rowGauge: null, // rows per inch
  cellAspect: 11 / 7,

  pointer: [-1, -1],

  locked: false,
  activeTool: "pointer",
  activeSymbol: 1,

  paths: [],
  boundaries: [],
  regions: [],
  yarnRegions: [],

  stitchSelect: null,
  editingBoundary: null,
  selectingBlock: false,
  onBlockSelect: null,

  blocks: {},
  editingBlock: null,
  activeBlockTool: "brush",

  chart: null,

  scale: 15, // Number of pixels for each chart cell
  cellWidth: 15 / 7,
  cellHeight: 15 / 11,

  chartPan: { x: 0, y: 0 }, // Pan value for the chart editor view
  bbox: { xMin: 0, yMin: 0 },

  // SIMULATION
  simScale: 1,
  simPan: { x: 0, y: 0 },
  flipped: false,

  // YARN
  yarnPalette: null,
  yarnWidth: 0.24,

  // Various UI pane states
  showSettings: false,
  yarnExpanded: true,

  // INTERACTION
  reverseScroll: false,
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

function dispatch(action, requestRender = false) {
  const changes = Object.keys(action);

  if (requestRender) {
    updateState(action);
    StateMonitor.requestRender();
    StateMonitor.syncState(GLOBAL_STATE, changes);
  } else {
    StateMonitor.syncState(updateState(action), changes);
  }
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
      components.push(component({ state: GLOBAL_STATE }))
    );
  }

  return {
    register,
    syncState,
  };
})();

export { GLOBAL_STATE, undo, dispatch, StateMonitor, loadWorkspace };
