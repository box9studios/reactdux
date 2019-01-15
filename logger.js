import { ellipsis } from './utils';

const DASHES = '----------------------';

const log = text => console.log(ellipsis(text, 100));

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

const logStructure = target => {
  if (target === undefined) {
    return;
  }
  if (typeof target === 'string') {
    log(target, LIMIT);
  } else if (target !== null && typeof target === 'object') {
    Object.entries(target)
      .filter(([key, value]) => value !== undefined)
      .forEach(([key, value]) => {
        const output = typeof value === 'string'
          ? ellipsis(value, LIMIT)
          : value;
        log(`${key}:`, output);
      });
  } else {
    log(target);
  }
};

export default (actionExports = {}) =>
  store =>
    next =>
      action => {
        next(action);
        console.groupCollapsed(`${DASHES}\nACTION: ${getActionType(action, actionExports)}\n${DASHES}`);
        console.groupCollapsed('payload:');
        logStructure(action.payload);
        console.groupEnd();
        // console.groupCollapsed('state:');
        // logStructure(store.getState());
        // console.groupEnd();
        console.groupEnd();
      };