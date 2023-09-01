function stateHookExtension({ dispatch }, { check = () => true, cb }) {
  return {
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
