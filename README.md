# knitscape

knitscape is tool for designing pattern repeats for knit slip/tuck colorwork. It
was developed with domestic knitting machines in mind, but the charts are
suitable for hand-knitting as well.

## features

- Add and edit multiple repeats in chart view
  - Resize and position base repeat
  - Resize repeat area
  - Edit repeat can contain four operations (knit, purl, tuck slip)
- Edit color sequence
  - Edit yarn colors directly, add/remove yarns
  - shuffle color indices, randomize colors
- 2D yarn relaxation simulation
  - renders to canvas with D3 force simulation
  - flip simulation swatch (view "wrong" or "right" side)
- Importing and exporting
  - Export to JSON, PNG, and SilverKnit's TXT format
  - Import patterns from JSON and pattern library

<!-- ## todo

- sim update optimizations
- settings
  - yarn width
  - yarn spread
  - default stitch sizes
  - end-needle selection

ideas/icebox

- knitting
  - lace symbols
  - increases/decreases
  - auto-mosaic mode: draw desired mosaic result, infer stitch pattern
  - fair isle mode: specify two colors in a row, chart design switches between
    them
- save to local storage
- some sort of tuck/slip verification - tuck always must have knit on either
  side, slip can't be more than 4/6 rows
- overlay operation chart on knit sim/make it editable
- different repeat operations: mirror, offset per repeat -->
