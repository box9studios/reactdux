import { dispatch, isPromise } from './utils';

const send = (type, payload, isSpecial) => {
  const action = { payload, type };
  Object.defineProperty(
    action,
    '__reactduxSpecialAction',
    { enumerable: false, value: isSpecial },
  );
  dispatch(action);
  return action;
};

const getCreator = (method = () => {}) => (...args) => method(...args);

const getCreatorForPath = (...args) => () => {
  const path = args.slice(0, -1);
  const value = args[args.length - 1];
  return { path, value };
};

export default (...args) => {
  const isPathAction = args[0] && typeof args[0] !== 'function';
  const target = isPathAction ? getCreatorForPath : getCreator;
  const creator = target(...args);
  const method = (...args2) => {
    const payload = creator(...args2);
    send(method, payload, isPathAction);
  };
  method.__isReactduxAction = true;
  if (isPathAction) {
    method();
  } else {
    return method;
  }
};