import { createElement } from 'react';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { render } from 'react-dom';
import { connect, Provider } from 'react-redux';

let masterStore = null;

function isArguments(value) {
  Object.prototype.toString.call(value) === '[object Arguments]';
}

function getPathValue(obj, paths) {
  let value;
  let pointer = obj;
  try {
    for (let i = 0; i < paths.length; ++i) {
      pointer = pointer[paths[i]];
      value = pointer;
    }
  } catch (e) {}
  return value;
}

export function createAction(payloadCreator) {
  const wrapper = (...args) => masterStore.dispatch({
    payload: (() => {
      if (payloadCreator) {
        return payloadCreator(...args);
      }
      if (args.length <= 1) {
        return args[0];
      }
      return [...args];
    })(),
    type: wrapper,
  });
  wrapper.__isReactduxAction;
  return wrapper;
}

export function createApp(component, reducer = {}, middleware = []) {
  const finalReducer = reducer.__isReactduxReducer ? reducer : combineReducers(reducer);
  const finalMiddleware = middleware.length ? applyMiddleware(...middleware) : undefined;
  masterStore = createStore(finalReducer, finalMiddleware);
  const element = document.createElement('div');
  render(createElement(Provider, { store: masterStore }, component ), element);
  document.body.appendChild(element.children[0]);
}

export function createContainer(mapToProps, wrappers, component) {
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
}

export function createReducer(defaultState = {}, config = []) {
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
}

export function createSelector(...args) {
  const firstArg = args[0];
  const method = typeof args[0] === 'function'
    ? args[0]
    : state => getPathValue(state, args);
  const wrapper = (...args2) => method(masterStore.getState(), ...args2);
  wrapper.__isReactduxSelector = true;
  return wrapper;
}
