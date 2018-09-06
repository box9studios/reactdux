import { createElement } from 'react';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { render } from 'react-dom';
import { connect, Provider } from 'react-redux';

const emptyPayloadCreator = function() { return arguments; };
let masterStore = null;

export const createAction = (...args1) => {
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
    const payload = payloadCreator(...args2);
    const error = payload ? payload.error : undefined;
    const action = { error, payload, type };
    Object.defineProperty(
      action,
      '__reactduxIdentity',
      { value: wrapper },
    );
    masterStore.dispatch(action);
    if (effects.length) {
      effects.forEach(effect => setTimeout(() => effect(...args2)));
    }
    return action;
  };
  wrapper.__isReactduxAction = true;
  return wrapper;
};

export const createApp = (component, reducer = {}, middleware = []) => {
  const finalReducer = reducer.__isReactduxReducer ? reducer : combineReducers(reducer);
  const finalMiddleware = middleware.length ? applyMiddleware(...middleware) : undefined;
  masterStore = createStore(finalReducer, finalMiddleware);
  const element = document.createElement('div');
  render(createElement(Provider, { store: masterStore }, component ), element);
  document.body.appendChild(element.children[0]);
};

export const createContainer =(mapToProps, wrappers, component) => {
  const toProps = typeof mapToProps === 'function' ? mapToProps : () => mapToProps;
  const mapStateToProps = (state, ownProps) => {
    const result = toProps(ownProps, masterStore)
    const copy = { ...result };
    for (const i in copy) {
      if (typeof copy[i] === 'function' && copy[i].__isReactduxSelector) {
        copy[i] = copy[i]();
      }
    }
    return copy;
  };
  const mapDispatchToProps = () => ({});
  return compose(
    ...(component ? wrappers : []),
    connect(mapStateToProps, mapDispatchToProps),
  )(component || wrappers);
};

const isArguments = value =>
  Object.prototype.toString.call(value) === '[object Arguments]';

export const createReducer = (defaultState = {}, config = []) => {
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

const getPathValue = (obj, paths) => {
  let value;
  let pointer = obj;
  try {
    for (let i = 0; i < paths.length; ++i) {
      pointer = pointer[paths[i]];
      value = pointer;
    }
  } catch (e) {}
  return value;
};

export const createSelector = (...args) => {
  const firstArg = args[0];
  const method = typeof args[0] === 'function'
    ? args[0]
    : state => getPathValue(state, args);
  const wrapper = (...args2) => method(masterStore.getState(), ...args2);
  wrapper.__isReactduxSelector = true;
  return wrapper;
};
