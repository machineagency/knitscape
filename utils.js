// import { CanvasToBMP } from "./lib/canvasToBmp";

const trigger = (e) => e.composedPath()[0];
const matchesTrigger = (e, selectorString) =>
  trigger(e).matches(selectorString);

export const createListener =
  (target) => (eventName, selectorString, event, args) => {
    target.addEventListener(
      eventName,
      (e) => {
        e.trigger = trigger(e);
        if (selectorString === "" || matchesTrigger(e, selectorString))
          event(e);
      },
      args ?? {}
    );
  };

export const bitmapToCanvas = (bitmap, palette) => {
  const canvas = document.createElement("canvas");

  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d");
  const imageData = bitmap.toImageData(palette);

  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

export const exportJPG = (bitmap, palette) => {
  const canvas = bitmapToCanvas(bitmap, palette);
  return canvas.toDataURL("image/jpeg", 1.0);
};

// export const exportBMP = (bitmap, palette) => {
//   const canvas = bitmapToCanvas(bitmap, palette);
//   return CanvasToBMP.toDataURL(canvas);
// };

export const exportPNG = (bitmap, palette) => {
  const canvas = bitmapToCanvas(bitmap, palette);
  return canvas.toDataURL("image/png");
};

export const exportJSON = (bitmap, palette) => {
  const jsonObj = {
    pixels: bitmap.pixels,
    width: bitmap.width,
    height: bitmap.height,
    palette: palette,
  };

  return (
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(jsonObj))
  );
};

export const exportTXT = (bitmap, palette) => {
  const text = bitmap
    .make2d()
    .map((row) => row.join(""))
    .join("\n");
  return "data:text/plain;charset=utf-8," + encodeURIComponent(text);
};

export const exporters = {
  txt: exportTXT,
  // bmp: exportBMP,
  json: exportJSON,
  png: exportPNG,
  jpg: exportJPG,
};
