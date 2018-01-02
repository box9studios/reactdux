import { createElement } from 'react';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { render } from 'react-dom';
import { connect, Provider } from 'react-redux';

let masterStore = null;

export function createApp(component, reducer = {}, middleware, run) {
  masterStore = createStore(
    reducer.__isBoundReducer ? reducer : combineReducers(reducer),
    !middleware ? undefined : applyMiddleware(middleware),
  );
  const element = document.createElement('div');
  render(createElement(Provider, { store: masterStore }, component ), element);
  document.body.appendChild(element.children[0]);
  if (run) {
    setTimeout(() => run());
  }
}

export function createReducer(defaultState = {}, actions = []) {
  const actionMap = new Map(actions);
  const reducer = (state = defaultState, action) => {
    const method = actionMap.get(action.type);
    if (!method) {
      return state;
    }
    const changes = method(action.payload, state);
    if (changes === undefined) {
      return state;
    }
    return { ...state, ...changes };
  };
  reducer.__isBoundReducer = true;
  return reducer;
}

export function createContainer(component, mapToProps, wrappers = []) {
  const toProps = typeof mapToProps === 'function' ? mapToProps : () => mapToProps;
  const mapStateToProps = (state, ownProps) => {
    const result = toProps(ownProps, masterStore)
    const copy = { ...result };
    for (const i in copy) {
      if (typeof copy[i] === 'function' && copy[i].__isBoundSelector) {
        copy[i] = copy[i]();
      }
    }
    return copy;
  };
  const mapDispatchToProps = () => ({});
  if (wrappers.length) {
    const connector = connect(mapStateToProps, mapDispatchToProps);
    return compose(...wrappers, connector)(component);
  }
  return connect(mapStateToProps, mapDispatchToProps)(component);
}

export function createAction(name, method) {
  const theName = typeof name === 'string' ? name : undefined;
  const theMethod = typeof name === 'function' ? name : method;
  const wrapper = (...args) => {
    const payload = (() => {
      if (theMethod) {
        return theMethod(...args);
      }
      if (!args.length) {
        return undefined;
      }
      if (args.length === 1) {
        return args[0];
      }
      return args;
    })();
    const result = { type: wrapper, payload, __name: theName };
    masterStore.dispatch(result);
  };
  wrapper.__isBoundAction = true;
  return wrapper;
}

export function createSelector(method) {
  const wrapper = (...args) => method(masterStore.getState(), ...args);
  wrapper.__isBoundSelector = true;
  return wrapper;
}
