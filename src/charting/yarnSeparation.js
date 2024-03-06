import { stitches } from "../constants";
import { Bimp } from "../lib/Bimp";

function processLeft(yarnRow, stitchRow) {
  let passes = [Array(yarnRow.length).fill(stitches.BM)];
  let sequence = [];
  let block = [];

  for (let i = yarnRow.length - 1; i >= 0; i--) {
    let currentYarn = yarnRow[i];
    let currentStitch = stitchRow[i];

    block.push(currentStitch);

    if (currentYarn == 0) {
      // No yarn - indicates empty stitch
      continue;
    }

    if (i == 0) {
      // if we hit the end of the row
      block.forEach((stitch, index) => {
        passes.at(-1)[i + index] = stitch;
      });
      sequence.push(currentYarn);

      block = [];
      continue;
    }

    let nextYarn = yarnRow[i - 1];

    if (nextYarn != currentYarn) {
      // if we hit a new yarn
      if (nextYarn == 0) {
        // No yarn - indicates empty stitch
        continue;
      }

      block.forEach((stitch, index) => {
        passes.at(-1)[i + index] = stitch;
      });

      passes.push(Array(yarnRow.length).fill(stitches.BM));
      sequence.push(currentYarn);

      block = [];
    }
  }

  return { passes, sequence };
}

function processRight(yarnRow, stitchRow) {
  let passes = [Array(yarnRow.length).fill(stitches.BM)];
  let sequence = [];
  let block = [];

  for (let i = 0; i < yarnRow.length; i++) {
    let currentYarn = yarnRow[i];
    let currentStitch = stitchRow[i];

    block.push(currentStitch);

    if (currentYarn == 0) {
      // No yarn - indicates empty stitch
      continue;
    }

    if (i == yarnRow.length - 1) {
      // if we hit the end of the row
      block.forEach((stitch, index) => {
        passes.at(-1)[i + 1 - block.length + index] = stitch;
      });
      sequence.push(currentYarn);

      block = [];
      continue;
    }

    let nextYarn = yarnRow[i + 1];

    if (nextYarn != currentYarn) {
      // if we hit a new yarn
      if (nextYarn == 0) {
        // No yarn - indicates empty stitch
        continue;
      }

      block.forEach((stitch, index) => {
        passes.at(-1)[i + 1 - block.length + index] = stitch;
      });

      passes.push(Array(yarnRow.length).fill(stitches.BM));
      sequence.push(currentYarn);

      block = [];
    }
  }

  return { passes, sequence };
}

export function yarnSeparation(stitchChart, yarnChart) {
  let st = stitchChart.make2d();
  let yc = yarnChart.make2d();
  let direction = "right";

  let yarnPasses = [];
  let yarnSequence = [];
  let rowMap = [];

  for (let rowIndex = 0; rowIndex < yc.length; rowIndex++) {
    let stitchRow = st[rowIndex];
    let yarnRow = yc[rowIndex];

    if (direction == "right") {
      let { passes, sequence } = processRight(yarnRow, stitchRow);
      yarnPasses = yarnPasses.concat(passes);
      yarnSequence.push(...sequence);
      rowMap.push(...Array(passes.length).fill(rowIndex));

      direction = "left";
    } else if (direction == "left") {
      let { passes, sequence } = processLeft(yarnRow, stitchRow);
      yarnPasses = yarnPasses.concat(passes);
      yarnSequence.push(...sequence);
      rowMap.push(...Array(passes.length).fill(rowIndex));

      direction = "right";
    }
  }

  const machineChart = new Bimp(
    yarnPasses[0].length,
    yarnPasses.length,
    yarnPasses.flat()
  );

  return { machineChart, yarnSequence, rowMap };
}
