export const MAX_SCALE = 100;
export const MIN_SCALE = 5;

export const MAX_SIM_SCALE = 6;
export const MIN_SIM_SCALE = 0.6;

export const SNAPSHOT_INTERVAL = 1000;

export const SNAPSHOT_FIELDS = ["yarnPalette", "yarnSequence", "repeats"];

export const LAYERS = ["chart", "repeats", "yarn"];

// Paths made in https://yqnn.github.io/svg-path-editor/
export const SYMBOL_DATA = {
  EMPTY: {
    path: new Path2D("M 0.25 0.25 L 0.75 0.75 M 0.25 0.75 L 0.75 0.25"),
    color: "#000000",
    stroke: "#ffffff",
    yarnModeColor: "#000000",
  },
  KNIT: {
    path: new Path2D(
      "M 1 0.5 L 0.6 0.5 C 0.3 0.5 0.3 0.8 0.5 0.8 C 0.7 0.8 0.7 0.5 0.4 0.5 L 0 0.5"
    ),
    color: "#08ccab",
  },
  PURL: {
    path: new Path2D(
      "M 0 0.5 L 0.4 0.5 C 0.7 0.5 0.7 0.2 0.5 0.2 C 0.3 0.2 0.3 0.5 0.6 0.5 L 1 0.5"
    ),
    color: "#079e85",
  },
  FM: {
    path: new Path2D("M 0 0.5 L 1 0.5"),
    color: "#fbacda",
    yarnModeColor: "#FFFFFF",
  },
  BM: {
    path: new Path2D("M 0 0.5 L 1 0.5"),
    color: "#de75b2",
    yarnModeColor: "#FFFFFF",
  },
  FT: {
    path: new Path2D(
      "M 1 0.5 L 0.8 0.5 C 0.7 0.5 0.65 0.5 0.6 0.55 C 0.55 0.6 0.6 0.8 0.5 0.8 C 0.4 0.8 0.45 0.6 0.4 0.55 C 0.35 0.5 0.3 0.5 0.2 0.5 L 0 0.5"
    ),
    color: "#eb4034",
    yarnModeColor: "#FFFFFF",
  },
  BT: {
    path: new Path2D(
      "M 0 0.5 L 0.2 0.5 C 0.3 0.5 0.35 0.5 0.4 0.45 C 0.45 0.4 0.4 0.2 0.5 0.2 C 0.6 0.2 0.55 0.4 0.6 0.45 C 0.65 0.5 0.7 0.5 0.8 0.5 L 1 0.5"
    ),
    color: "#b03027",
    yarnModeColor: "#FFFFFF",
  },
  FXR1: {
    path: new Path2D(
      "M 1 0.5 L 0.6 0.5 C 0.3 0.5 0.621 0.869 0.771 0.867 C 0.932 0.869 0.7 0.5 0.4 0.5 L 0 0.5 M 0.18 0.65 L 0.25 0.57 V 0.85 M 0.18 0.85 H 0.32"
    ),
    color: "#9557b4",
  },
  FXR2: {
    path: new Path2D(
      "M 1 0.5 L 0.6 0.5 C 0.3 0.5 0.621 0.869 0.771 0.867 C 0.932 0.869 0.7 0.5 0.4 0.5 L 0 0.5 M 0.176 0.69 c 0.028 -0.136 0.186 -0.041 0.127 0.023 l -0.124 0.129 h 0.141"
    ),
    color: "#9557b4",
  },
  FXR3: {
    path: new Path2D(
      "M 1 0.5 L 0.6 0.5 C 0.3 0.5 0.621 0.869 0.771 0.867 C 0.932 0.869 0.7 0.5 0.4 0.5 L 0 0.5 M 0.187 0.61 c 0.112 -0.071 0.151 0.108 0.034 0.106 c 0.116 0.003 0.099 0.175 -0.03 0.122"
    ),
    color: "#9557b4",
  },
  FXL1: {
    path: new Path2D(
      "M 0 0.5 L 0.4 0.5 C 0.7 0.5 0.379 0.869 0.229 0.867 C 0.068 0.869 0.3 0.5 0.6 0.5 L 1 0.5 M 0.68 0.65 L 0.75 0.57 V 0.85 M 0.68 0.85 H 0.82"
    ),
    color: "#de9321",
  },
  FXL2: {
    path: new Path2D(
      "M 0 0.5 L 0.4 0.5 C 0.7 0.5 0.379 0.869 0.229 0.867 C 0.068 0.869 0.3 0.5 0.6 0.5 L 1 0.5 M 0.661 0.687 c 0.028 -0.136 0.186 -0.041 0.127 0.023 l -0.124 0.129 h 0.141"
    ),
    color: "#de9321",
  },
  FXL3: {
    path: new Path2D(
      "M 0 0.5 L 0.4 0.5 C 0.7 0.5 0.379 0.869 0.229 0.867 C 0.068 0.869 0.3 0.5 0.6 0.5 L 1 0.5 M 0.708 0.612 c 0.112 -0.071 0.151 0.108 0.034 0.106 c 0.116 0.003 0.099 0.175 -0.03 0.122"
    ),
    color: "#de9321",
  },
  BXR1: {
    path: new Path2D(
      "M 1 0.5 L 0.6 0.5 C 0.3 0.5 0.621 0.131 0.771 0.133 C 0.932 0.131 0.7 0.5 0.4 0.5 L 0 0.5 M 0.18 0.2 L 0.25 0.12 V 0.4 M 0.18 0.4 H 0.32"
    ),
    color: "#74448d",
  },
  BXR2: {
    path: new Path2D(
      "M 1 0.5 L 0.6 0.5 C 0.3 0.5 0.621 0.131 0.771 0.133 C 0.932 0.131 0.7 0.5 0.4 0.5 L 0 0.5 M 0.156 0.213 c 0.028 -0.136 0.186 -0.041 0.127 0.023 l -0.124 0.129 h 0.141"
    ),
    color: "#74448d",
  },
  BXR3: {
    path: new Path2D(
      "M 1 0.5 L 0.6 0.5 C 0.3 0.5 0.621 0.131 0.771 0.133 C 0.932 0.131 0.7 0.5 0.4 0.5 L 0 0.5 M 0.198 0.158 c 0.112 -0.071 0.151 0.108 0.034 0.106 c 0.116 0.003 0.099 0.175 -0.03 0.122"
    ),
    color: "#74448d",
  },
  BXL1: {
    path: new Path2D(
      "M 0 0.5 L 0.4 0.5 C 0.7 0.5 0.379 0.131 0.229 0.133 C 0.068 0.131 0.3 0.5 0.6 0.5 L 1 0.5 M 0.68 0.2 L 0.75 0.12 V 0.4 M 0.68 0.4 H 0.82"
    ),
    color: "#b47619",
  },
  BXL2: {
    path: new Path2D(
      "M 0 0.5 L 0.4 0.5 C 0.7 0.5 0.379 0.131 0.229 0.133 C 0.068 0.131 0.3 0.5 0.6 0.5 L 1 0.5 M 0.666 0.212 c 0.028 -0.136 0.186 -0.041 0.127 0.023 l -0.124 0.129 h 0.141"
    ),
    color: "#b47619",
  },
  BXL3: {
    path: new Path2D(
      "M 0 0.5 L 0.4 0.5 C 0.7 0.5 0.379 0.131 0.229 0.133 C 0.068 0.131 0.3 0.5 0.6 0.5 L 1 0.5 M 0.711 0.144 c 0.112 -0.071 0.151 0.108 0.034 0.106 c 0.116 0.003 0.099 0.175 -0.03 0.122"
    ),
    color: "#b47619",
  },
};

// export const SYMBOL_BITS = {
//   KNIT: false,
//   PURL: false,
//   FM: true,
//   BM: true,
//   FT: true,
//   BT: true,
// };

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
