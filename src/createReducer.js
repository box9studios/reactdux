const isArguments = value =>
  Object.prototype.toString.call(value) === '[object Arguments]';

export default const (defaultState = {}, config = []) => {
  const reducer = (state = defaultState, action) => {
    const handlers = config
      .filter(([type]) => type === action.type)
      .map(([type, handler]) => handler);
    return handlers.reduce((prevState, handler) => {
      const changes = isArguments(action.payload)
        ? handler(state, ...action.payload)
        : handler(state, action.payload);
      return {
        ...prevState,
        ...(typeof changes === 'object' ? changes : {}),
      };
    }, { ...state });
  };
  reducer.__isReactduxReducer = true;
  return reducer;
};