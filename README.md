# knitscape

KnitScape is a design and simulation tool for knitting patterns.

- gauge
  - [x] edit overall gauge
  - [ ] re-fit chart on gauge change
- chart eval
  - [ ] evaluate chart on edit to stitch block, stitch path
- drawing
  - [x] draw operation colors
  - [ ] draw yarn colors
  - [ ] switch chart color mode: yarn color, yarn carrier color, operation color
  - [ ] draw operation symbols
- path
  - [ ] select path
  - [ ] constrain to stitch slope?
- boundary
  - [x] drag line
  - [x] remove points
  - [ ] simple constraints
  - [ ] how to add curves?
- yarn sequencer
  - [x] select range of rows
  - [ ] drag to move selection
  - [ ] ranges shouldn't overlap
  - [ ] edit base unit
- stitch blocks
  - [x] select stitch areas and add new stitch block
  - [x] select stitch block to edit
  - [x] edit stitch block with bitmap tools
  - [x] delete stitch block
  - [ ] move stitch block
  - [ ] resize stitch block
  - [ ] dim rest of chart while editing
  - [ ] show operation select when editing stitch block
  - [ ] change stitch block type: texture, fair isle, intarsia
  - [ ] update block position on boundary resize/reposition
- stitch path
  - [ ] path has "add stitch path" menu
  - [ ] secret thicker path for hover styles
- stitch block path
  - [ ] select block and path
  - [ ] create blockpath
- direct edit layer
  - [ ] edit base chart directly, overriding anything below

## ideas

- synchronized simulation/chart view mode (pan/zoom updates both views)
- different line types: short rows, cast on/bind off, waste yarn, fashioned?

## bugs, fixes

- scanline is a bit off for some reason
- In sim, shouldn't regenerate yarn topology/cancel relaxation on zoom or when
  yarn colors are changed
- flip button doesn't reverse stacking order
- edge node layout is not correct in sim

## primitives (figuring this out)

- stitch
  - individual operations
- paths
  - 2D vector elements
- boundaries
  - a closed path
- stitch blocks
  - structuring elements -> rectangular arrays, origin+width+height
  - select an area and paint with stitch pattern
- stitch paths
  - select stitch block and path to make a stitch path
  - constrain slope to whole-number stitch slopes, e.g. 3/1, 5/2 ?
- stitch region
  - a boundary filled with a stitch block
