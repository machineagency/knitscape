import { dispatch } from "../state";

export function closeModals() {
  document.getElementById("site").addEventListener("pointerdown", (e) => {
    // close modals if click/touch outside taskbar
    dispatch({
      showFileMenu: false,
      showLibrary: false,
      showSettings: false,
      showDownload: false,
    });
  });
}
