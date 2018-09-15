let store = null;

export function dispatch(action) {
  if (!store) {
    throw new Error('no store found');
  }
  store.dispatch(action);
}

export function isArguments(value) {
  return Object.prototype.toString.call(value) === '[object Arguments]';
}

export function isPromise(value) {
  return value instanceof Promise;
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

export function getState() {
  if (!store) {
    throw new Error('no store found');
  }
  return store.getState();
}

export function getStore() {
  return store;
}

export function setStore(nextStore) {
  if (store) {
    throw new Error('store already created');
  }
  store = nextStore;
}