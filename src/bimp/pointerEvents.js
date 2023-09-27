function pointerEventsExtension({ state, dispatch }, { tools, eventTarget }) {
  state.activeTool = Object.keys(tools)[0];

  eventTarget.addEventListener("pointerdown", (e) => {
    let pos = state.pos;
    let tool = tools[state.activeTool];
    let onMove = tool(pos, state, dispatch);

    if (!onMove) return;

    let move = (moveEvent) => {
      if (moveEvent.buttons == 0) {
        eventTarget.removeEventListener("mousemove", move);
      } else {
        let newPos = state.pos;
        if (newPos.x == pos.x && newPos.y == pos.y) return;
        onMove(state.pos, state);
        pos = newPos;
      }
    };
    eventTarget.addEventListener("mousemove", move);
  });

  return {
    syncState(newState) {
      state = newState;
    },
  };
}

export function pointerEvents(options = {}) {
  return (config) => pointerEventsExtension(config, options);
}
