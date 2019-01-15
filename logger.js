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
        next(action);
        console.groupCollapsed(`${DASHES}\nACTION: ${getActionType(action, actionExports)}\n${DASHES}`);
        console.groupCollapsed('payload:');
        log(action.payload);
        console.groupEnd();
        // console.groupCollapsed('state:');
        // log(store.getState());
        // console.groupEnd();
        console.groupEnd();
      };