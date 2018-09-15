export default (defaultState = {}, config = []) => {
  const reducer = (state = defaultState, action) => {
    const handlers = config
      .reduce(
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
        return {
          ...prevState,
          ...(typeof changes === 'object' ? changes : {}),
        };
      },
      { ...state },
    );
  };
  reducer.__isReactduxReducer = true;
  return reducer;
};