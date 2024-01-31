import { Bimp } from "./lib/Bimp";
import {
  SNAPSHOT_INTERVAL,
  // DEFAULT_PATTERN_LIBRARY,
  SNAPSHOT_FIELDS,
  stitches,
} from "./constants";

let GLOBAL_STATE = {
  editingPalette: false,
  transforming: false,

  activeTool: "brush",
  activeSymbol: 1,

  colorMode: "operation",

  // chartBackground: "#ffffff",
  // symbolPalette: {},

  symbolMap: Object.keys(stitches),
  // patternLibrary: DEFAULT_PATTERN_LIBRARY,

  chart: new Bimp(
    7,
    7,
    [
      1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 1, 2, 2, 2, 1,
      1, 1, 1, 2, 2, 2, 1, 5, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    ]
  ),

  scale: 15, // Number of pixels for each chart cell
  pos: { x: -1, y: -1 }, // Mouse position in chart
  chartPan: { x: 0, y: 0 }, // Pan value for the chart editor view

  simScale: 1,
  simPan: { x: 0, y: 0 },

  activeYarn: 0,
  yarnPalette: ["rgba(235,233,187,1)", "rgba(50, 140, 188, 1)"], // Colors of the yarns
  yarnSequence: new Bimp(1, 2, [0, 1]),

  editingRepeat: -1,
  repeatPos: [-1, -1],

  repeats: [
    // {
    //   bitmap: new Bimp(6, 1, [1, 1, 1, 2, 2, 2]),
    //   pos: [0, 0],
    //   area: [6, 6],
    // },
  ],

  // repeatLibrary: [
  //   {
  //     title: "blank",
  //     bitmap: new Bimp(2, 2, [0, 0, 0, 0]),
  //   },
  //   {
  //     title: "checks",
  //     bitmap: new Bimp(2, 2, [0, 2, 2, 0]),
  //   },
  //   {
  //     title: "stripe",
  //     bitmap: new Bimp(2, 2, [0, 2, 0, 2]),
  //   },
  // ], // Library of motifs which can be used as repeats

  reverseScroll: false,
  grid: true,
  symbolLineWidth: 3,
  flipped: false,

  // PUNCH CARD
  punchcardMode: false, // constrains repeat width to a punchcard-friendly width
  machine: "th860",
  punchVerticalRepeats: 5,
  rows: 40, //punchcard rows
  numSides: 8, //number of punch sides

  // Various UI pane states
  showLibrary: false,
  showSettings: false,
  showDownload: false,
  showRepeatLibrary: false,
  debug: false,

  snapshots: [], // Array of snapshot history
  lastSnapshot: 0, // time of last snapshot
  heldKeys: new Set(), // Keys that are currently held down

  yarnWidth: 0.24,
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