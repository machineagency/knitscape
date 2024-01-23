export const MAX_SCALE = 100;
export const MIN_SCALE = 5;

export const MAX_SIM_SCALE = 6;
export const MIN_SIM_SCALE = 0.6;

export const SNAPSHOT_INTERVAL = 1000;

export const SNAPSHOT_FIELDS = ["yarnPalette", "yarnSequence", "repeats"];

export const LAYERS = ["chart", "repeats", "yarn"];

// Paths made in https://yqnn.github.io/svg-path-editor/
export const SYMBOL_PATHS = {
  KNIT: new Path2D(
    "M 0 0.5 L 0.4 0.5 C 0.7 0.5 0.7 0.2 0.5 0.2 C 0.3 0.2 0.3 0.5 0.6 0.5 L 1 0.5"
  ),
  PURL: new Path2D(
    "M 1 0.5 L 0.6 0.5 C 0.3 0.5 0.3 0.8 0.5 0.8 C 0.7 0.8 0.7 0.5 0.4 0.5 L 0 0.5"
  ),
  FM: new Path2D("M 0 0.5 L 1 0.5"),
  BM: new Path2D("M 0 0.5 L 1 0.5"),

  FT: new Path2D(
    "M 0 0.5 L 0.2 0.5 C 0.3 0.5 0.35 0.5 0.4 0.45 C 0.45 0.4 0.4 0.2 0.5 0.2 C 0.6 0.2 0.55 0.4 0.6 0.45 C 0.65 0.5 0.7 0.5 0.8 0.5 L 1 0.5"
  ),
  BT: new Path2D(
    "M 0 0.5 L 0.2 0.5 C 0.3 0.5 0.35 0.5 0.4 0.45 C 0.45 0.4 0.4 0.2 0.5 0.2 C 0.6 0.2 0.55 0.4 0.6 0.45 C 0.65 0.5 0.7 0.5 0.8 0.5 L 1 0.5"
  ),

  FXL1: new Path2D("M 0.5 0.5 L 0.2 0.9 Z M 0.2 0.1 L 0.8 0.9"),
  FXR1: new Path2D("M 0.5 0.5 L 0.8 0.9 Z M 0.2 0.9 L 0.8 0.1"),
};

export const SYMBOL_BITS = {
  KNIT: false,
  PURL: false,
  FM: true,
  BM: true,
  FT: true,
  BT: true,
};

export const DEFAULT_SYMBOLS = ["knit", "purl", "slip", "tuck"];

export const DEFAULT_PATTERN_LIBRARY = import.meta.glob("../examples/*.json");

export const toolData = {
  brush: { icon: "fa-solid fa-paintbrush", hotkey: "b" },
  flood: { icon: "fa-solid fa-fill-drip fa-flip-horizontal", hotkey: "f" },
  rect: { icon: "fa-solid fa-vector-square", hotkey: "r" },
  line: { icon: "fa-solid fa-minus", hotkey: "l" },
  shift: { icon: "fa-solid fa-right-left", hotkey: "s" },
  move: { hotkey: "h" },
};

export const stitches = {
  EMPTY: 0,
  KNIT: 1,
  PURL: 2,
  FM: 3, // Front miss
  BM: 4, // Back miss
  FT: 5, // Front tuck
  BT: 6, // Back tuck
  FXR1: 7, // Front right transfers
  FXR2: 8,
  FXR3: 9,
  FXL1: 10, // Front Left transfers
  FXL2: 11,
  FXL3: 12,
  BXR1: 13, // Back right transfers
  BXR2: 14,
  BXR3: 15,
  BXL1: 16, // Back left transfers
  BXL2: 17,
  BXL3: 18,
};

export const cnStates = {
  ECN: 0, // Empty
  PCN: 1, // Potential
  ACN: 2, // Actualized
  UACN: 3, // Unanchored
};

export const MAX_H_SHIFT = 6; // maximum horizontal shift for CNs (2x the number of stitches)
export const MAX_V_SHIFT = 6; // maximum vertical shift for CNs
