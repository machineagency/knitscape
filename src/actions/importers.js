import { GLOBAL_STATE, dispatch } from "../state";

export function loadSymbolPalette(symbols) {
  console.log("asdf");
  return symbols;
}

export function loadSymbol(symbolName, url) {
  let im = new Image();
  im.src = url;

  im.onload = () =>
    dispatch({
      symbolPalette: {
        ...GLOBAL_STATE.symbolPalette,
        [symbolName]: im,
      },
    });
}

function loadJSON(patternJSON) {
  console.log("THIS IS WHERE THE JSON WOULD BE LOADED");
  // loadWorkspace(patternJSON);
  // syncScale();
  // regenPreview();
  // repeatEditor.dispatch({ bitmap: Bimp.fromJSON(patternJSON.repeat) });
  // needleEditor.dispatch({ bitmap: Bimp.fromJSON(patternJSON.needles) });
  // colorChangeEditor.dispatch({
  //   bitmap: Bimp.fromJSON(patternJSON.yarns).vMirror(),
  // });
  // colorChangeEditor.dispatch({ palette: patternJSON.yarnPalette });
  // colorChangeEditor.dispatch({ scale });
  // needleEditor.dispatch({ scale });
  // preview.dispatch({ scale });
  // GLOBAL_STATE.updateSim = true;
}

export function loadLibraryPattern(path) {
  dispatch({ showLibrary: false });
  GLOBAL_STATE.patternLibrary[path]().then((mod) => loadJSON(mod));
}

export function uploadFile() {
  let fileInputElement = document.createElement("input");

  fileInputElement.setAttribute("type", "file");
  fileInputElement.style.display = "none";

  document.body.appendChild(fileInputElement);
  fileInputElement.click();
  fileInputElement.onchange = (e) => {
    let file = e.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(file);
    fileReader.onload = () => {
      loadJSON(JSON.parse(fileReader.result));
    };
  };
  document.body.removeChild(fileInputElement);
}
