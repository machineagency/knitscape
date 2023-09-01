export function fieldMonitor(field) {
  let monitored;
  return (state) => {
    if (state[field] != monitored) {
      monitored = state[field];
      return true;
    }
    return false;
  };
}
