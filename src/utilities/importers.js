import { Bimp } from "../lib/Bimp";
import { GLOBAL_STATE, dispatch } from "../state";
import { evaluateChart } from "../charting/evalChart";
import { bBoxAllBoundaries } from "../charting/helpers";
import { fitChart } from "../interaction/chartPanZoom";

function hydrateWorkspaceJSON(dryWorkspaceJSON) {
  let {
    boundaries,
    regions,
    yarnRegions,
    blocks,
    cellAspect,
    stitchGauge,
    rowGauge,
    yarnPalette,
  } = dryWorkspaceJSON;

  loadWorkspace({
    boundaries,
    regions,
    cellAspect,
    stitchGauge,
    rowGauge,
    yarnPalette,
    yarnRegions: yarnRegions.map(({ bitmap, pos }) => {
      return { bitmap: Bimp.fromJSON(bitmap), pos };
    }),
    blocks: Object.fromEntries(
      Object.entries(blocks).map(([blockID, { bitmap, pos, type }]) => {
        return [blockID, { bitmap: Bimp.fromJSON(bitmap), pos, type }];
      })
    ),
  });
}

export function uploadFile(cb) {
  let fileInputElement = document.createElement("input");
  fileInputElement.setAttribute("type", "file");
  fileInputElement.style.display = "none";
  fileInputElement.onchange = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0]);
    fileReader.onload = () => cb(fileReader.result);
  };

  document.body.appendChild(fileInputElement);
  fileInputElement.click();
  document.body.removeChild(fileInputElement);
}

export function loadWorkspace(workspace) {
  const { boundaries, regions, blocks, yarnRegions } = workspace;

  // Make chart by evaluating workspace
  let { stitchChart, yarnChart, machineChart, yarnSequence, rowMap } =
    evaluateChart(boundaries, regions, yarnRegions, blocks);
  dispatch({
    ...workspace,
    chart: stitchChart,
    yarnChart: yarnChart,
    machineChart,
    yarnSequence,
    rowMap,
    bbox: bBoxAllBoundaries(boundaries),
  });
  setTimeout(() => fitChart());
}

export function uploadWorkspace() {
  uploadFile((fileContent) => hydrateWorkspaceJSON(JSON.parse(fileContent)));
  dispatch({ showUpload: false });
}

export function loadExampleWorkspace(path) {
  dispatch({ showExampleLibrary: false });
  GLOBAL_STATE.exampleLibrary[path]().then((mod) => hydrateWorkspaceJSON(mod));
}
