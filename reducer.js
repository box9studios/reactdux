import { isArguments } from './utils';

const getNextState = (
  state = {},
  action = {},
  reducers = [],
) => reducers.reduce(
  (prevState, reducer) => {
    const { payload } = action;
    const changes = isArguments(payload)
      ? reducer(prevState, ...payload)
      : reducer(prevState, payload);
    return {
      ...prevState,
      ...changes,
    };
  },
  { ...state },
);

const getReducers = (action, config = []) => config.reduce(
  (result, configItem) => {
    const actions = configItem.slice(0, -1);
    const handler = configItem[configItem.length - 1];
    if (actions.find(item => item === action.type)) {
      return [...result, handler];
    }
    return result;
  },
  [],
);

export default (defaultState = {}, config = []) =>
  (state = defaultState, action = {}) => {
    const reducers = action.__reactduxAction || getReducers(action, config);
    return getNextState(state, action, reducers);
  };