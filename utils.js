export const exportJPG = (bitmap, palette) => {
  const canvas = bitmapToCanvas(bitmap, palette);
  return canvas.toDataURL("image/jpeg", 1.0);
};

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
  const text =
    "SilverKnit\n" +
    bitmap
      .make2d()
      .map((row) => row.join(""))
      .join("\n");
  return "data:text/plain;charset=utf-8," + encodeURIComponent(text);
};

export const exporters = {
  txt: exportTXT,
  json: exportJSON,
  png: exportPNG,
  jpg: exportJPG,
};

export async function buildImagePalette(imageNames) {
  return await Promise.all(
    imageNames.map(async (imageName) => {
      const im = new Image();
      im.src = new URL(
        `./assets/stitches/${imageName}.png`,
        import.meta.url
      ).href;

      await im.decode();
      return { image: im, title: imageName };
    })
  );
}
