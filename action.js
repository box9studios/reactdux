import { dispatch, isPromise } from './utils';

const emptyPayloadCreator = function() { return arguments; };

export default (...args1) => {
  const firstArgIsString = typeof args1[0] === 'string';
  const initialType = firstArgIsString ? args1[0] : undefined;
  const payloadCreator = args1[firstArgIsString ? 1 : 0] || emptyPayloadCreator;
  const effects = args1.slice(firstArgIsString ? 2 : 1, args1.length);
  const wrapper = (...args2) => {
    const type = (() => {
      if (initialType) {
        return initialType;
      }
      if (payloadCreator && payloadCreator.name) {
        return payloadCreator.name;
      }
      return wrapper;
    })();
    const onPayload = payload => {
      const error = payload ? payload.error : undefined;
      const action = { error, payload, type };
      Object.defineProperty(
        action,
        '__reactduxIdentity',
        { value: wrapper },
      );
      dispatch(action);
      if (effects.length) {
        effects.forEach(effect => setTimeout(() => effect(payload)));
      }
      return action;
    }
    const payloadReturnValue = payloadCreator(...args2);
    if (isPromise(payloadReturnValue)) {
      return payloadReturnValue.then(onPayload);
    } else if (payloadReturnValue !== undefined) {
      return onPayload(payloadReturnValue);
    }
  };
  wrapper.__isReactduxAction = true;
  return wrapper;
};