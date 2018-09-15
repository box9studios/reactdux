let store = null;

export const dispatch = action => {
  if (!store) {
    throw new Error('no store found');
  }
  store.dispatch(action);
};

export const isArguments = value =>
  Object.prototype.toString.call(value) === '[object Arguments]';

export const isPromise = value => value instanceof Promise;

export const isEqual = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

export const getState = () => {
  if (!store) {
    throw new Error('no store found');
  }
  return store.getState();
};

export const setStore = nextStore => {
  if (store) {
    throw new Error('store already created');
  }
  store = nextStore;
};