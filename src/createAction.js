export default const (type, payloadCreator) => {
  const realType = typeof type === 'string' ? type : payloadCreator;
  const realPayloadCreator = typeof type === 'function' ? type : payloadCreator;
  const wrapper = (...args) => masterStore.dispatch({
    payload: (() => {
      if (realPayloadCreator) {
        return realPayloadCreator(...args);
      }
      if (args.length <= 1) {
        return args[0];
      }
      return [...args];
    })(),
    type: realType || payloadCreator.name,
  });
  wrapper.__isReactduxAction;
  return wrapper;
};