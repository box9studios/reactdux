import React, { createElement } from 'react';
import { render } from 'react-dom';
import { createStore, combineReducers as reduxCombineReducers, 
  applyMiddleware, compose } from 'redux';
import { connect, Provider } from 'react-redux';

let masterStore = null;

function isArray(value) {
  return Object.prototype.toString.call(value) === '[object Array]';
}

function constructAppLayout(components) {
  if (!isArray(components)) {
    return components;
  }
  const node = createElement('div', { style: { height: '100%' }}, components);
  return node;
}

function loggerMiddleware(store) {
  return next => (action) => {
    let error = null;
    try {
      next(action);
    } catch (e) {
      error = e;
    }
    const { type, payload } = action;
    const state = store.getState();
    const { __name: name = 'ACTION' } = action;
    console.groupCollapsed(name);
    console.log('payload:', payload);
    console.log('state:  ', state);
    console.groupEnd();
    if (error) {
      throw error;
    }
  };
}

function transformMiddleware(store) {
  return next => (action) => {
    next(action);
  };
}

function createMiddleware(middleware, logActions) {
  const list = [...middleware];
  if (logActions) {
    list.push(loggerMiddleware);
  } else {
    list.push(transformMiddleware);
  }
  return compose(applyMiddleware(...list));
}

function combineReducers(reducers) {
  if (!Object.keys(reducers).length) {
    reducers._ = createReducer();
  }
  return reduxCombineReducers(reducers);
}

export function createApp({
  component, 
  reducer = {}, 
  middleware = [], 
  debug = false,
}) {
  const store = createStore(
    reducer.__isBoundReducer ? reducer : combineReducers(reducer),
    createMiddleware(middleware, debug),
  );
  masterStore = store;
  const element = document.createElement('div');
  render(
    createElement(
      Provider, 
      { store }, 
      constructAppLayout(component),
    ),
    element,
  );
  document.body.appendChild(element.children[0]);
}

export function createReducer(defaultState = {}, actions = []) {
  const actionMap = new Map(actions);
  const reducer = (state = defaultState, action) => {
    const { type, payload } = action;
    const method = actionMap.get(type);
    if (method) {
      const changes = method(payload);
      return { ...state, ...changes };
    }
    return { ...state };
  }
  reducer.__isBoundReducer = true;
  return reducer;
}

export function createContainer(component, mapToProps) {
  const toProps = typeof mapToProps === 'function' ? mapToProps : () => mapToProps;
  const mapStateToProps = (state, ownProps) => {
    const result = toProps(ownProps)
    const copy = { ...result };
    for (const i in copy) {
      if (typeof copy[i] === 'function' && copy[i].__isBoundSelector) {
        copy[i] = copy[i]();
      }
    }
    return copy;
  };
  const mapDispatchToProps = () => ({});
  return connect(mapStateToProps, mapDispatchToProps)(component);
}

export function createAction(name, method) {
  const theName = typeof name === 'string' ? name : undefined;
  const theMethod = typeof method === 'function' ? method : name;
  const wrapper = (...args) => {
    const payload = theMethod(...args);
    const result = { type: wrapper, payload, __name: theName };
    masterStore.dispatch(result);
  };
  wrapper.__isBoundAction = true;
  return wrapper;
}

export function createSelector(method) {
  const wrapper = (...args) => {
    const state = masterStore.getState();
    const result = method(state, ...args);
    return result;
  };
  wrapper.__isBoundSelector = true;
  return wrapper;
}
