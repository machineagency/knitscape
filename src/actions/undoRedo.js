import { GLOBAL_STATE, dispatch } from "../state";

export function undo() {
  dispatch({
    ...GLOBAL_STATE,
    ...GLOBAL_STATE.snapshots[0],
    lastSnapshot: 0,
    snapshots: GLOBAL_STATE.snapshots.slice(1),
  });
}
