export function hexPalette(paletteEntry, ctx, scale) {
  // paletteEntry will be a hex code
  // console.log(paletteEntry);
  ctx.fillStyle = paletteEntry;
  ctx.fillRect(0, 0, scale, scale);
}

export function imagePalette(paletteEntry, ctx, scale) {
  // paletteEntry will be an object with an image field
  ctx.clearRect(0, 0, scale, scale);
  ctx.drawImage(paletteEntry.image, 0, 0, scale, scale);
}
