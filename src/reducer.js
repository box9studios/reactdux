import { isArguments } from './utils';
import { combineReducers } from 'redux';

export default (defaultState = {}, config = []) => {
  if (!config.length) {
    return combineReducers(defaultState);
  }
  const reducer = (state = defaultState, action) => {
    const handlers = config.reduce(
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
    return handlers.reduce(
      (prevState, handler) => {
        const changes = isArguments(action.payload)
          ? handler(state, ...action.payload)
          : handler(state, action.payload);
        try {
          return { ...prevState, ...changes };
        } catch (error) {
          return prevState;
        }
      },
      { ...state },
    );
  };
  reducer.__isReactduxReducer = true;
  return reducer;
};