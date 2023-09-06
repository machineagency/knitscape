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

- undo/redo

nice to have

- sim update optimization
- adjust repeat size by dragging bounds in number gutter
- some sort of tuck/slip verification - tuck always must have knit on either
  side, slip can't be more than 4/6 rows

ideas

- overlay operation chart on knit sim/make it editable
- different repeat operations: mirror, offset per repeat
- fair isle mode: specify two colors in a row, chart design switches between
  them n
