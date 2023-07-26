import { createListener } from "./utils.js";

export function addPanZoom(el, state) {
  const listen = createListener(el);
  console.log(el);

  let mousedown = false;

  let scale = 1;
  let pointX = 0;
  let pointY = 0;
  let dragStart = { x: 0, y: 0 };

  function setTransform(elem) {
    elem.style.transformOrigin = `0px 0px`;
    elem.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
  }

  function updateTransformGroups() {
    const transformGroups = el.querySelectorAll(":scope > .transform-group");
    for (const group of transformGroups) {
      setTransform(group);
    }
  }

  function toWorkspaceCoords({ x, y }) {
    let newX = (x - pointX) / scale;
    let newY = (y - pointY) / scale;

    return { x: newX, y: newY };
  }

  listen("pointerdown", "", (e) => {
    if (state.activeTool !== "pan") return;
    // if (state.activeTool !== "pan")
    //   if (e.shiftKey || e.button === 2) {
    //     // && e.target.id !== "canvas-container")
    //     //   return;

    //     return;
    //   }

    let currentTargetRect = e.currentTarget.getBoundingClientRect();
    const offX = e.pageX - currentTargetRect.left,
      offY = e.pageY - currentTargetRect.top;

    mousedown = true;

    dragStart = { x: offX - pointX, y: offY - pointY };
  });

  listen("pointermove", "", (e) => {
    if (!mousedown) return;

    let currentTargetRect = e.currentTarget.getBoundingClientRect();
    const offX = e.pageX - currentTargetRect.left,
      offY = e.pageY - currentTargetRect.top;

    pointX = offX - dragStart.x;
    pointY = offY - dragStart.y;

    updateTransformGroups();
  });

  listen("pointerup", "", (evt) => {
    mousedown = false;
  });

  listen("mouseleave", "#canvas-container", (e) => {
    mousedown = false;
  });

  listen(
    "wheel",
    "",
    (e) => {
      let xs = (e.offsetX - pointX) / scale;
      let ys = (e.offsetY - pointY) / scale;

      if (Math.sign(e.deltaY) < 0) scale *= 1.03;
      else scale /= 1.03;

      pointX = e.offsetX - xs * scale;
      pointY = e.offsetY - ys * scale;

      updateTransformGroups();
      e.preventDefault();
    },
    { passive: false }
  );

  function setPanZoom(pz) {
    scale = pz.scale;
    pointX = pz.x;
    pointY = pz.y;
    updateTransformGroups();
  }

  function setScaleXY(limits) {
    const workspaceBB = el.getBoundingClientRect();

    const limitsWidth = limits.x[1] - limits.x[0];
    const limitsHeight = limits.y[1] - limits.y[0];

    const xScalingFactor = workspaceBB.width / limitsWidth;
    const yScalingFactor = workspaceBB.height / limitsHeight;

    const scalingFactor = Math.min(xScalingFactor, yScalingFactor) * 0.95;

    scale = scalingFactor;

    const center = {
      x:
        ((limits.x[0] + limits.x[1]) / 2) * scalingFactor -
        workspaceBB.width / 2,
      y:
        ((limits.y[0] + limits.y[1]) / 2) * scalingFactor -
        workspaceBB.height / 2,
    };

    pointX = -center.x;
    pointY = -center.y;

    updateTransformGroups();
  }

  return {
    scale: () => scale,
    x: () => pointX,
    y: () => pointY,
    setScaleXY,
    toWorkspaceCoords,
    setPanZoom,
  };
}
