import { bmp_lib } from "./bmp";

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
        `../assets/stitches/${imageName}.png`,
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

function leastCommonMultiple(first, second) {
  let min = first > second ? first : second;
  while (true) {
    if (min % first == 0 && min % second == 0) {
      return min;
    }
    min++;
  }
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

export function shuffle(arr) {
  return arr.sort(() => (Math.random() > 0.5 ? 1 : -1));
}

export function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function makeBMP(repeatBimp, colorRepeat, palette) {
  const height = leastCommonMultiple(repeatBimp.height, colorRepeat.length);
  const bmp2d = repeatBimp.make2d();
  const bits = [];

  for (let rowIndex = 0; rowIndex < height; rowIndex++) {
    bits.push(
      bmp2d[rowIndex % repeatBimp.height].map((bit) => {
        if (bit == 0 || bit == 1) {
          return colorRepeat[rowIndex % colorRepeat.length];
        } else {
          return palette.length;
        }
      })
    );
  }

  const rgbPalette = palette.map((hex) => hexToRgb(hex));
  rgbPalette.push([255, 255, 255]);

  const im = document.createElement("img");
  bmp_lib.render(im, bits, rgbPalette);
  return im;
}
