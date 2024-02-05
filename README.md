# knitscape

KnitScape is a design and simulation tool for knitting patterns.

## features

bugs/fixes

- scanline is a bit off for some reason
- In sim, shouldn't regenerate yarn topology/cancel relaxation on zoom or when
  yarn colors are changed
- flip button doesn't reverse stacking order

todo

- global
  - edit overall gauge
- silhouette
  - different line types: short rows, cast on/bind off, waste yarn, fashioned?
  - drag line
  - remove points
  - curves
  - simple constraints
- yarn sequencer
  - [x] select range of rows
  - [ ] drag to move selection
  - [ ] sequence editor
  - [ ] ranges shouldn't overlap
- stitch painter
  - select areas
  - repeat editor
- simulation

- misc/icebox
  - synchronized simulation/chart view mode (pan/zoom updates both views)

<!-- - Add and edit multiple repeats in chart view
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
  - Import patterns from JSON and pattern library -->
