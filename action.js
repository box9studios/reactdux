import { dispatch, isPromise } from './utils';

const define = (obj, key, value) =>
  Object.defineProperty(
    obj,
    `__reactdux${key}`,
    { enumerable: false, value },
  );

const send = (type, payload, isSpecial) => {
  const action = { payload, type };
  define(action, 'Identity', type);
  define(action, 'ActionPathValue', isSpecial);
  dispatch(action);
  return action;
};

const getCreator = method => (...args) => method(...args);

const getCreatorForPath = (...args) => () => {
  const path = args.slice(0, -1);
  const value = args[args.length - 1];
  console.log({ path, value });
  return { path, value };
};

export default (...args) => {
  const isPathAction = args[0] && typeof args[0] !== 'function';
  const target = isPathAction ? getCreatorForPath : getCreator;
  const creator = target(...args);
  const method = (...args2) => {
    const payload = creator(...args2);
    if (payload !== undefined) {
      send(method, payload, isPathAction);
    }
  };
  method.__isReactduxAction = true;
  if (isPathAction) {
    method();
  } else {
    return method;
  }
};