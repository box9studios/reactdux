let store = null;
let actions = [];

export const addAction = action => actions.push(action);

export const copy = value => {
  if (!value) {
    return value;
  }
  if (value instanceof Array) {
    return [...value];
  }
  if (typeof value === 'object') {
    return { ...value };
  }
  if (typeof value === 'function') {
    return (...args) => value(...args);
  }
  return value;
};

export const dehydrate = (target, paths = []) => {
  const data = {}
  const convert = (value, path) => {
    if (value === null || value === undefined) {
      return value;
    }
    if (path.length <= 1) {
      const key = path[0];
      if (value instanceof Array) {
        const ids = [];
        value.forEach(item => {
          const id = item[key];
          ids.push(id);
          data[id] = item;
        });
        return ids;
      } else {
        const id = value[key];
        data[id] = value;
        return id;
      }
    }
    const isMulti = value instanceof Array;
    const items = isMulti ? value : [value];
    const mapped = items.map(item => {
      if (!item) {
        return item;
      }
      const key = path[0];
      return {
        ...item,
        [key] : convert(item[key], path.slice(1)),
      };
    });
    return isMulti ? mapped : mapped[0];
  };
  let result = target;
  paths.forEach(path => {
    result = convert(result, path);
  });
  return { data, value: result };
};

export const dispatch = action => store.dispatch(action);

export const getAction = () => actions[0];

export const getObjectPathValue = (obj, ...path) => {
  let result = obj;
  for (const key of path) {
    if (result === null || result === undefined) {
      break;
    }
    result = result[key];
  }
  return result;
};

export const getState = key => {
  if (key !== undefined) {
    return store.getState()[key];
  }
  return store.getState();
};

export const hydrate = (target, paths = [], data = {}) => {
  const convert = (value, path) => {
    if (value === null || value === undefined) {
      return value;
    }
    if (path.length <= 1) {
      if (value instanceof Array) {
        return value.map(id => data[id]);
      }
      return data[value];
    }
    const isMulti = value instanceof Array;
    const items = isMulti ? value : [value];
    const mapped = items.map(item => {
      if (!item) {
        return item;
      }
      const key = path[0];
      return {
        ...item,
        [key] : convert(item[key], path.slice(1)),
      };
    });
    return isMulti ? mapped : mapped[0];
  };
  let result = target;
  [...paths].reverse().forEach(path => {
    result = convert(result, path);
  });
  return result;
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

export const isProduction = (() => {
  try {
    // eslint-disable-next-line no-undef
    return process.env.NODE_ENV === 'production';
  } catch (event) {
    return false;
  }
})();

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