export function hexPalette(paletteEntry, ctx, width, height) {
  // paletteEntry will be a hex code
  // console.log(paletteEntry);
  ctx.fillStyle = paletteEntry;
  ctx.fillRect(0, 0, width, height);
}

export function imagePalette(paletteEntry, ctx, width, height) {
  // paletteEntry will be an object with an image field
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(paletteEntry.image, 0, 0, width, height);
}
