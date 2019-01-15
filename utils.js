let store = null;

export const copy = value => {
  if (!value) {
    return value;
  }
  if (value.constructor === Object) {
    return { ...value };
  }
  if (value.constructor === Array) {
    return [...value];
  }
  return value;
};

export const dispatch = action => store.dispatch(action);

export const getState = () => store.getState();

export const isArray = value => value instanceof Array;

export const isArguments = value =>
  Object.prototype.toString.call(value) === '[object Arguments]';

export const isEqual = (a, b) => {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return a === b;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (typeof a !== 'object') {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }
  for (let key in a) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
};

export const isFunction = value => typeof value === 'function';

export const isPromise = value => value instanceof Promise;

export const isString = value => typeof value === 'string';

export const setStore = value => store = value;