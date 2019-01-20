const DASHES = '----------------------';

const getActionType = (action = {}, actionExports = {}) => {
  if (
    typeof action.type === 'string'
    && action.type !== 'ReactduxAction'
  ) {
    return action.type;
  }
  const method = action.type === 'ReactduxAction'
    ? action.payload.method
    : action.type;
  const entry = Object.entries(actionExports)
    .find(([key, value]) => value === method);
  return entry ? entry[0] : 'anonymous';
};

const getObjectDiff = (a = {}, b = {}) => {
  const diff = {};
  const checkPath = (c, d, ref) => {
    const dCopy = d ? { ...d } : {};
    for (const key in c) {
      const cValue = c ? c[key] : c;
      const dValue = d ? d[key] : d;
      if (cValue !== dValue) {
        if (
          cValue
          && typeof cValue === 'object'
          && dValue
          && typeof dValue === 'object'
        ) {
          ref[key] = {};
          checkPath(cValue, dValue, ref[key]);
        } else {
          ref[key] = dValue;
        }
      }
      delete dCopy[key];
    }
    for (const key in dCopy) {
      ref[key] = dCopy[key];
    }
  }
  checkPath(a, b, diff);
  return diff;
};

const log = target => {
  if (target && typeof target === 'object') {
    Object.entries(target).forEach(([key, value]) =>
      console.log(`${key}:`, value));
  } else {
    console.log(target);
  }
};

export default (actionExports = {}) =>
  store =>
    next =>
      action => {
        const before = store.getState();
        next(action);
        console.groupCollapsed(`${DASHES}\nACTION: ${getActionType(action, actionExports)}\n${DASHES}`);
        console.groupCollapsed('payload:');
        log(action.payload);
        console.groupEnd();
        console.groupCollapsed('diff:');
        log(getObjectDiff(before, store.getState()));
        console.groupEnd();
        console.groupEnd();
      };