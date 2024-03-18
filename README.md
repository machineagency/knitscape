# knitscape

KnitScape is a design and simulation tool for machine knitting.

- Chart
  - [x] Toggle color mode between yarn color and operation color.
  - [ ] Back bed operations should be slightly dimmed in chart view.
- path
  - [ ] select path
  - [ ] constrain to stitch slope?
- boundary/regions
  - [x] drag boundary and points
  - [x] add and remove points
  - [x] drag region
  - [x] remove boundary/region
  - [x] change stitch fill
  - [x] add block fill
  - [x] active boundary/region
  - [ ] select multiple
  - [ ] change yarn fill
  - [ ] add boundary/region
  - [ ] copy and paste boundary
  - [ ] simple constraints
  - [ ] curves?
- yarn sequencer
  - [x] visualize active yarns in each row
  - [ ] show carriage direction
- stitch blocks
  - [x] select stitch areas and add new stitch block
  - [x] select stitch block to edit
  - [x] edit stitch block with bitmap tools
  - [x] delete stitch block
  - [x] dim rest of chart while editing
  - [x] show operation select when editing stitch block
  - [x] evaluate chart on block edit
  - [x] move stitch block
  - [x] resize stitch block
  - [x] update block position on boundary resize/reposition
  - [ ] block copy and paste
  - [ ] Download bitmap for block
- stitch path
  - [x] secret thicker path for hover styles
  - [ ] path has "add stitch path" menu
  - [ ] evaluate chart on stitch path edit
  - [ ] create blockpath
- gauge
  - [ ] edit overall gauge/stitch aspect
  - [ ] re-fit chart on gauge change

## ideas

- synchronized simulation/chart view mode (pan/zoom updates both views)
- different line types: short rows, cast on/bind off, waste yarn, fashioned?
- how to define different gauges for different regions of the chart? is that
  even a good idea?
- You should be able to download the

## bugs, fixes

- polygon fill scanline is sometimes slightly off?
- carriage direction is currently always right->left->right->left, ignoring yarn
  changes. will need to track carriage direction separately for each yarn, and
  maybe make it a controllable option in the yarn pane?

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
