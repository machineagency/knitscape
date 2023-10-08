# knitscape

knitscape is tool for designing pattern repeats for knit slip/tuck colorwork. It
was developed with domestic knitting machines in mind, but the charts are
suitable for hand-knitting as well.

## features

- resizable base pattern repeat
- repeat can contain four operations (knit, purl, tuck slip)
- yarn color change repeat
- 2D yarn relaxation simulation
- flip simulation swatch (view "wrong" or "right" side)
- color chooser and randomizer
- download/export to JSON, PNG, and SilverKnit's TXT format
- put needles in and out of work (creates a ladder, ideal for tuck lace)
- load patterns from JSON and pattern library

## todo

- layout rework with top toolbar
- `devicePixelRatio` fixes for better rendering
- size preview (chart and swatch) based on how large the base repeat is (don't
  overflow)
- undo history
- tool hotkeys
- sim update optimizations
- settings
  - keep swatch flipped when editing
  - yarn width
  - yarn spread
  - default stitch sizes
  - customize txt palette
  - number of border rows (top and bottom)
  - end-needle selection
- fix tool drag wraparound on chart view

ideas/icebox

- knitting
  - lace symbols
  - increases/decreases
  - auto-mosaic mode: draw desired mosaic result, infer stitch pattern
  - fair isle mode: specify two colors in a row, chart design switches between
    them
- try out canvas rendering instead of SVG, or investigate some D3 optimizations
- save to local storage
- browsable pattern library
- adjust repeat size by dragging bounds in number gutter
- some sort of tuck/slip verification - tuck always must have knit on either
  side, slip can't be more than 4/6 rows
- overlay operation chart on knit sim/make it editable
- different repeat operations: mirror, offset per repeat
