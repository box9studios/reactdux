import { getAction } from './utils';

const DASHES = '--------------------------------------------';

const getActionType = (action = {}, actionExports = {}) => {
  const getExportAction = method => (Object.entries(actionExports)
    .find(([key, value]) => value === method) || {})[0] || '';
  const exportAction = getExportAction(action.type);
  if (exportAction) {
    return exportAction;
  }
  if (action.__reactduxAction) {
    const found = getExportAction(action.payload.method) || getExportAction(getAction());
    return `${found} (${action.type})`;
  }
  return action.type || 'AnonymousAction';
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
        console.groupCollapsed(`${DASHES}\nACTION: ${getActionType(action, actionExports)}\n${DASHES}`);
        console.groupCollapsed('payload:');
        log(action.payload);
        console.groupEnd();
        next(action);
        // console.groupCollapsed('diff:');
        // log(store.getState());
        // console.groupEnd();
        // console.groupEnd();
        // console.groupCollapsed('state:');
        // log(store.getState());
        // console.groupEnd();
        // console.groupEnd();
      };