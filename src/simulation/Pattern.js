export class Pattern {
  constructor(bitmap, yarnSequence, rowMap) {
    this.ops = bitmap.pixels;
    this.width = bitmap.width;
    this.height = bitmap.height;
    this.yarnSequence = [];
    for (let y = 0; y < bitmap.height; y++) {
      this.yarnSequence.push(yarnSequence[y % yarnSequence.length]);
    }
    this.yarns = Array.from(
      yarnSequence.filter((value, index, arr) => arr.indexOf(value) === index)
    );
    this.rowMap = rowMap;
    this.carriagePasses = rowMap.map((ogRow) =>
      ogRow % 2 == 0 ? "right" : "left"
    );
  }

  op(x, y) {
    if (x > this.width - 1 || x < 0 || y > this.height - 1 || y < 0) {
      return -1;
    }
    return this.ops.at(x + y * this.width);
  }
}

// const opTypes = {
//   T: 0,
//   K: 1,
//   S: 2,
//   p: 3,
// };

// const pixToOp = ["K", "P", "M", "T"];

// export class Pattern {
//   constructor(bitmap) {
//     // this.ops = Array.from(bitmap.pixels)

//     //   .map((val) => pixToOp[val])
//     //   .toReversed()
//     //   .filter((val, index) => {
//     //     let currX = index % bitmap.width;
//     //     if (needles[currX] == 1) return false;
//     //     return true;
//     //   });

//     // this.width = needles.filter((val) => (val == 1 ? false : true)).length;
//     // this.height = bitmap.height;

//     this.ops = Array.from(bitmap.pixels).map((val) => pixToOp[val]);
//     // .toReversed()
//     // .filter((val, index) => {
//     //   let currX = index % bitmap.width;
//     //   if (needles[currX] == 1) return false;
//     //   return true;
//     // });

//     this.width = bitmap.width;
//     this.height = bitmap.height;
//   }

//   op(x, y) {
//     if (x > this.width - 1 || x < 0 || y > this.height - 1 || y < 0) {
//       return -1;
//     }
//     return this.ops.at(x + y * this.width);
//   }

//   makeOpData() {
//     const w = this.width;
//     const h = this.height;

//     const ops = [];
//     for (let y = 0; y < h; y++) {
//       for (let x = 0; x < w; x++) {
//         const flatIndex = y * w + x;
//         const stitch = this.op(x, y);
//         // this is the polygon draw order
//         const cnIJ = [
//           [2 * x, y],
//           [2 * x + 1, y],
//           [2 * x + 1, y + 1],
//           [2 * x, y + 1],
//         ];

//         ops.push({
//           index: flatIndex,
//           stitch: stitch,
//           op: opTypes[stitch],
//           cnIndices: cnIJ.map(([i, j]) => j * 2 * w + i),
//         });
//       }
//     }

//     return ops;
//   }
// }
