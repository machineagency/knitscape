# knitscape

KnitScape is a design and simulation tool for machine knitting.

- Chart
  - [x] Toggle color mode between yarn color and operation color.
  - [x] Back bed operations should be slightly dimmed in chart view.
- Box Selection
  - [x] Drag to select an area, and add new stitch block or boundary
  - [ ] Show size of selection
- Interaction
  - [ ] select multiple points in path and move them together
  - [ ] use arrow keys to translate boundaries and paths
- path
  - [x] select path
  - [x] duplicate
  - [x] change layer: raise/lower/front/back
  - [ ] attach path to boundary segment(s)
  - [ ] constrain to stitch slope?
  - [ ] group paths
  - [ ] linear pattern paths
- Boundaries/block fill
  - [x] Add and remove boundary
  - [x] Drag whole boundary, paths, and points
  - [x] Add and remove points
  - [x] Yarn and stitch fill blocks
  - [x] Move yarn and stitch fill origin
  - [x] show boundary size when selected
  - [x] change layer: raise/lower/front/back
  - [x] duplicate
  - [ ] affine transforms (reflect, scale, shear, rotate)
  - [ ] multiselect
- Free blocks
  - [x] Add, edit, remove, resize, reposition, and select block
  - [x] Toggle block edit mode between Yarn and stitch
  - [x] Dim rest of chart while editing
    - Should this be a setting? Should it be dimmed, or grayscale? Blurred?
  - [x] show operation select when editing stitch block
  - [x] evaluate chart on block edit
  - [ ] Copy and paste block
  - [ ] Select multiple blocks to move together
  - [ ] Download bitmap for block
  - [ ] download punchcard just for block
- Yarn Sequencer
  - [x] visualize active yarns in each row
  - [ ] show carriage direction

## priority fixes

- [ ] undo is currently bugged
- [ ] sim topology resets on zoom/flip
- [ ] removing a yarn from the yarn palette is bugged

## ideas

- UI
  - synchronized simulation/chart view mode (pan/zoom updates both views)
- gauge
  - edit overall gauge/stitch aspect, and fit chart on gauge change
  - how to define different gauges for different regions of the chart? is that
    even a good idea?
- errors/verification
  - highlight floats over max float distance
  - highlight unstable loops in sim
  - highlight stitch slopes?
  - how to show if loops are transferred outside bounds?
- blocks
  - You should be able to download any block as a bitmap. should be not hard to
    implement. perhaps also download any block as a punchcard.
  - As you create blocks, they get added to a library of active blocks. Any
    fill/path/free block could use an existing block in the library.
- Constraints!
  - Stitch slope
- [ ] curves?

## bugs, fixes

- polygon fill scanline is sometimes slightly off?

- simulation/yarn view
  - shouldn't regenerate yarn topology/cancel relaxation on zoom or when yarn
    colors are changed
  - edge node layout is not correct
  - currently not drawing the last few segments in a yarn.
  - add yarn entry and exit points to indicate where they start and end

## Primitive elements:

Base primitives:

- **Stitch block:** A bitmap of stitch operations.
- **Yarn block:** A bitmap of yarn operations.
- **Path:** A vector path connecting the center points of two stitches.
- **Boundary:** A series of paths enclosing a region.

Blended primitives:

- stitch paths
  - select stitch block and path to make a stitch path
  - constrain slope to whole-number stitch slopes, e.g. 3/1, 5/2 ?
- stitch region
  - a boundary filled with a stitch block
- Yarn Edge
  - A border between two yarn areas, with a yarn block assigned to each side.
  - ? How to handle boundary conditions, such as adding a tuck for intarsia? We
    can hardcode this for now, but how to define custom boundary conditions?

## Interaction Modes

- **Pan:** Pan around the chart workspace without editing anything.
- **Boundary:** Shows all of the boundaries.
  - Drag add new boundary
  - Selecting a boundary shows any attached blocks
  - Reorder boundaries (How to best visualize this?)
- **Path:**
  - Drag add new path
  - Select and drag paths.
  - Add control points.
  - Define yarn edge
  - Define block path
  - You can interact with both boundary paths and independent paths in this
    mode.
- **Block:**
  - Drag to add new block.
  - Shows all of the independent blocks
  - Toggle non-block areas to be gray?
