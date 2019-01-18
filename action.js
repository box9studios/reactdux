import { addAction, getState, isPromise, removeAction, setState } from './utils';

const getActor = (...args) => {
  if (typeof args[0] === 'function') {
    return args[0];
  }
  return (state, ...args2) => state(...args, ...args2);
};

const getTool = reducers => {
  const method = (...args) => {
    if (args.length < 1) {
      return;
    }
    const path = args.slice(0, -1);
    const value = args[args.length - 1];
    reducers.push(state => setStatePathValue(state, path, value));
  };
  const state = getState();
  Object.entries(state).forEach(([key, value]) => method[key] = value);
  return method;
};

const setStatePathValue = (state, path, value) => {
  let copy = {};
  let ref;
  path.forEach((key, index) => {
    if (index === 0) {
      copy[key] = { ...state[key] };
      if (path.length == 1) {
        ref = copy;
      } else {
        ref = copy[key];
      }
    } else if (index < path.length - 1) {
      ref[key] = { ...ref[key] };
      ref = ref[key];
    }
  });
  if (value === undefined) {
    delete ref[path[path.length - 1]];
  } else if (typeof value === 'function') {
    ref[path[path.length - 1]] = value(ref[path[path.length - 1]]);
  } else {
    ref[path[path.length - 1]] = value;
  }
  return copy;
};

export default (...args) => {
  const method = async (...args2) => {
    addAction(method);
    const reducers = [];
    const actor = getActor(...args);
    const changes = await actor(getTool(reducers), ...args2);
    if (
      !reducers.length
      && changes
      && typeof changes === 'object'
    ) {
      reducers.push(() => changes);
    }
    try {
      setState('ReactduxActionSetState', reducers, ...args2);
      removeAction(method);
    } catch (error) {
      removeAction(method);
    }
  };
  return method;
};