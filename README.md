# knitscape

KnitScape is a design and simulation tool for knitting patterns.

## features

-

## todo

- global
  - edit overall gauge
- silhouette
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
  - drawn in real-world dimensions
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
