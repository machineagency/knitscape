import { Pane } from "tweakpane";
import { Bimp } from "./yarn/Bimp";
import {
  layoutNodes,
  buildYarnSegmentData,
  computeSplineControlPoints,
} from "./yarn/yarn3d.js";

import { ContactGrid } from "./yarn/ContactGrid";
import { followTheYarn } from "./yarn/yarnTopology";
import { yarnSim } from "./yarn/yarnSim.js";

import { Chart } from "./yarn/Chart";

import { noodleRenderer } from "./renderers/noodle";
import { topDownRenderer } from "./renderers/topDown";

const PATTERNS = import.meta.glob("./examples/*.json");
const canvas = document.getElementById("yarn-canvas");

let settings;
let yarnFolders = [];
let chart, yarnPath, cnGrid, yarnSegments, contactNodes;
let simulation;

const renderers = {
  noodle: noodleRenderer,
  topDown: topDownRenderer,
};

const STATE = {
  renderer: topDownRenderer,
  background: { r: 0.1, g: 0.1, b: 0.1 },
  dimensions: { x: 100, y: 200 },
  stitchWidth: 1,
  stitchAspect: 0.5,
  yarns: [],

  // SIMULATION
  iterations: 5,
  velocityDecay: 0.5,
  alpha: null,
};

function loadPatternJSON(patternJSON) {
  chart = new Chart(
    Bimp.fromTile(
      STATE.dimensions.x,
      STATE.dimensions.y,
      Bimp.fromJSON(patternJSON.bitmap)
    ),
    patternJSON.yarnSequence.pixels
  );

  STATE.yarns = patternJSON.yarns;
  STATE.yarns.forEach((yarn) => {
    yarn.pts = [];
  });

  buildYarnSettings(patternJSON.yarns);
  generateYarnTopology();
  computeSplineControlPoints(chart, contactNodes, cnGrid, yarnPath, STATE);
  initRenderer();
}

function generateYarnTopology() {
  // Create yarn topology from chart
  cnGrid = new ContactGrid(chart);
  yarnPath = followTheYarn(cnGrid);

  // Initialize node and segment data
  contactNodes = layoutNodes(cnGrid, STATE);
  yarnSegments = buildYarnSegmentData(
    cnGrid,
    yarnPath,
    contactNodes,
    chart,
    STATE
  );
}

function initRenderer() {
  STATE.renderer.setup(STATE.yarns, canvas);
}

function updateGeometry() {
  STATE.yarns.forEach((yarn) => {
    yarn.pts = [];
  });

  computeSplineControlPoints(chart, contactNodes, cnGrid, yarnPath, STATE);
  STATE.renderer.updateYarnGeometry(STATE.yarns);
}

function r() {
  if (simulation && simulation.running()) {
    simulation.tick(yarnSegments, contactNodes);
    STATE.alpha = simulation.alpha();
    updateGeometry();
  }

  STATE.renderer.draw();

  requestAnimationFrame(r);
}

function init() {
  initSettingsPane();

  PATTERNS[Object.keys(PATTERNS)[0]]().then((patternJSON) => {
    loadPatternJSON(patternJSON);

    requestAnimationFrame(r);
  });
}

function initSettingsPane() {
  settings = new Pane({ title: "Settings" });

  settings
    .addBlade({
      view: "list",
      label: "Renderer",
      options: Object.keys(renderers).map((name) => {
        return {
          value: name,
          text: name,
        };
      }),
      value: Object.keys(renderers)[0],
    })
    .on("change", (e) => {
      PATTERNS[e.value]().then((patternJSON) => loadPatternJSON(patternJSON));
    });

  settings
    .addBlade({
      view: "list",
      label: "Load Pattern",
      options: Object.keys(PATTERNS).map((path) => {
        return {
          value: path,
          text: path.split("/").at(-1).split(".")[0],
        };
      }),
      value: Object.keys(PATTERNS)[0],
    })
    .on("change", (e) => {
      PATTERNS[e.value]().then((patternJSON) => loadPatternJSON(patternJSON));
    });

  settings.addBinding(STATE, "dimensions", {
    x: { step: 1, min: 5, max: 100 },
    y: { step: 1, min: 5, max: 100 },
  });

  settings.addBinding(STATE, "background", {
    color: { type: "float" },
  });

  settings
    .addButton({
      title: "Run Simulation",
    })
    .on("click", () => {
      simulation = yarnSim(STATE);
    });
}

function buildYarnSettings(yarns) {
  yarnFolders.forEach((folder) => folder.dispose());

  STATE.yarns = yarns;

  yarnFolders = yarns.map((yarn, i) => {
    const folder = settings.addFolder({ title: `Yarn ${i}` });

    folder
      .addBinding(yarn, "color", {
        color: { type: "float" },
        label: "Color",
      })
      .on("change", () => initRenderer());

    folder
      .addBinding(yarn, "radius", {
        min: 0.01,
        max: 1,
        step: 0.01,
        label: "Radius",
      })
      .on("change", () => initRenderer());

    // yarnSettings
    //   .addBinding(STATE.yarns[i], "kYarn", {
    //     min: 0.01,
    //     max: 1,
    //     step: 0.01,
    //     label: "K",
    //   })
    //   .on("change", () => {
    //     resetPositions();
    //     updateGeometry(true);
    //   });

    return folder;
  });
}

window.onload = init;
