export function hexPalette(paletteEntry, ctx, width, height) {
  // paletteEntry will be a hex code
  ctx.fillStyle = paletteEntry;
  ctx.fillRect(0, 0, width, height);
}

export function imagePalette(paletteEntry, ctx, width, height) {
  // paletteEntry will be an object with an image field
  ctx.drawImage(paletteEntry.image, 0, 0, width, height);
}
