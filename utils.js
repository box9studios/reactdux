let store = null;
let actions = [];

export const addAction = action => actions.push(action);

export const clone = obj => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  return JSON.parse(JSON.stringify(obj));
};

const convertPaths = (paths = [], reverse = false) => {
  const fullPaths = paths.map(item => {
    if (
      typeof item === 'number'
      || typeof item === 'string'
    ) {
      return [item];
    }
    if (item instanceof Array) {
      return item;
    }
    return [];
  });
  if (reverse) {
    return [...fullPaths].reverse();
  }
  return fullPaths;
};

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

export const dehydrate = (target = {}, paths = []) => {
  let copy = clone(target);
  const source = {};
  convertPaths(paths).forEach(path => {
    if (path.length === 1) {
      const key = path[0];
      const id = copy[key];
      source[id] = copy;
      copy = id;
    } else {
      let ref = copy;
      path.forEach((key, index) => {
        if (index === path.length - 2) {
          const idKey = path[path.length - 1];
          const pathValue = ref[key];
          if (pathValue instanceof Array) {
            const ids = pathValue.map(pathValueItem => pathValueItem[idKey]);
            pathValue.forEach(pathValueItem => {
              const id = pathValueItem[idKey];
              source[id] = pathValueItem;
            });
            ref[key] = ids;
          } else {
            const id = pathValue[idKey];
            source[id] = pathValue;
            ref[key] = id;
          }
        } else if (index < path.length - 2) {
          ref = ref[key];
        }
      });
    }
  });
  return { value: copy, data: source };
};

export const dispatch = action => store.dispatch(action);

export const getAction = () => actions[0];

export const getState = key => {
  if (key !== undefined) {
    return store.getState()[key];
  }
  return store.getState();
};

export const hydrate = (target, paths = [], source = {}) => {
  if (!target || typeof target !== 'object') {
    return clone(source[target]);
  }
  let copy = clone(target);
  convertPaths(paths, true).forEach(path => {
    if (path.length === 1) {
      const id = copy;
      if (id instanceof Array) {
        copy = id.map(item => clone(source[item]));
      } else {
        copy = clone(source[id]);
      }
    } else {
      let ref = copy;
      path.forEach((key, index) => {
        if (index === path.length - 2) {
          const id = ref[key];
          if (id instanceof Array) {
            ref[key] = id.map(item => clone(source[item]));
          } else {
            ref[key] = clone(source[id]);
          }
        } else if (index < path.length - 2) {
          ref = ref[key];
        }
      });
    }
  });
  return copy;
};

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

export const removeAction = () => actions.shift();

export const setState = (type, reducers = [], ...args) => {
  const reducerArray = typeof reducers === 'function'
    ? [reducers]
    : reducers;
  const action = {
    payload: args,
    type,
  };
  Object.defineProperty(
    action,
    '__reactduxAction',
    { enumerable: false, value: reducerArray },
  );
  dispatch(action);
};

export const setStore = value => store = value;