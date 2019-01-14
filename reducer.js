import { isArguments } from './utils';

const setPathValue = (state, { path, value }) => {
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

const getActors = (config, action) => {
  const actors = config.reduce(
    (result, args) => {
      const types = [...args];
      const handler = types.pop();
      if (
        types.find(type =>
          type === action.type
          || (type && type === action.__reactduxIdentity)
        )
      ) {
        return [...result, handler];
      }
      return result;
    },
    [],
  );
  if (action.__reactduxActionPathValue) {
    return [...actors, setPathValue];
  }
  return actors;
};

export default (defaultState = {}, config = []) => {
  const reducer = (state = defaultState, action) => {
    const actors = getActors(config, action);
    return actors.reduce(
      (prevState, handler) => {
        const changes = isArguments(action.payload)
          ? handler(state, ...action.payload)
          : handler(state, action.payload);
        return {
          ...prevState,
          ...changes,
        };
      },
      { ...state },
    );
  };
  reducer.__isReactduxReducer = true;
  return reducer;
};