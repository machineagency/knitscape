export function download(dataStr, downloadName) {
  const downloadAnchorNode = document.createElement("a");

  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", downloadName);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

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

export function hexPalette(paletteEntry, ctx, scale) {
  // paletteEntry will be a hex code
  ctx.fillStyle = paletteEntry;
  ctx.fillRect(0, 0, scale, scale);
}

export function imagePalette(paletteEntry, ctx, scale) {
  // paletteEntry will be an object with an image field
  ctx.imageSmoothingQuality = "high";

  ctx.clearRect(0, 0, scale, scale);
  ctx.drawImage(paletteEntry.image, 0, 0, scale, scale);
}
