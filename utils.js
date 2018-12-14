let store = null;

export function copy(value) {
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
}

export function dispatch(action) {
  if (!store) {
    throw new Error('no store found');
  }
  store.dispatch(action);
}

export function isArray(value) {
  return value instanceof Array;
}

export function isArguments(value) {
  return Object.prototype.toString.call(value) === '[object Arguments]';
}

export function isEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export function isFunction(value) {
  return typeof value === 'function';
}

export function isPromise(value) {
  return value instanceof Promise;
}

export function isString(value) {
  return typeof value === 'string';
}

export function getState() {
  if (!store) {
    throw new Error('no store found');
  }
  return store.getState();
}

export function removeUndefinedKeys(obj) {
  return Object.entries(obj).reduce(
    (result, [key, value]) => {
      if (value === undefined) {
        return result;
      }
      return { ...result, [key]: value };
    },
    {},
  );
};

export function setStore(nextStore) {
  if (store) {
    throw new Error('store already created');
  }
  store = nextStore;
}