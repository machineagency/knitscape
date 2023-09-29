export const MAX_SCALE = 100;
export const MIN_SCALE = 5;

export const SNAPSHOT_INTERVAL = 1000;

export const SNAPSHOT_FIELDS = [
  "chart",
  "yarnPalette",
  "colorSequence",
  "needlePositions",
  "repeatBitmap",
];

export const DEFAULT_SYMBOLS = ["knit", "purl", "slip", "tuck"];
export const SYMBOL_DIR = "../assets/symbols";

export const DEFAULT_PATTERN_LIBRARY = import.meta.glob(
  "../assets/patterns/*.json"
);

export const tools = {
  brush: { icon: "fa-solid fa-paintbrush", hotkey: "b" },
  flood: { icon: "fa-solid fa-fill-drip fa-flip-horizontal", hotkey: "f" },
  rect: { icon: "fa-solid fa-vector-square", hotkey: "r" },
  line: { icon: "fa-solid fa-minus", hotkey: "l" },
  // eyedropper: { icon: "fa-solid fa-eyedropper", hotkey: "i" },
  pan: {
    icon: "fa-solid fa-hand",
    downIcon: "fa-solid fa-hand-back-fist",
    hotkey: "h",
  },
};
