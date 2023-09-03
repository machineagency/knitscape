function stateHookExtension({ dispatch }, { check = () => true, cb }) {
  return {
    attached(state) {
      if (check(state)) {
        cb(state, dispatch);
      }
    },
    syncState(state) {
      if (check(state)) {
        cb(state, dispatch);
      }
    },
  };
}

export function stateHook(options = {}) {
  return (config) => stateHookExtension(config, options);
}
