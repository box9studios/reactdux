import { createElement } from 'react';
import { render } from 'react-dom';
import { connect, Provider } from 'react-redux';
import { 
  createStore, 
  combineReducers as reduxCombineReducers, 
  applyMiddleware, 
  compose,
} from 'redux';

const production = process.env.NODE_ENV === 'production';
let masterStore = null;

function isArray(value) {
  return Object.prototype.toString.call(value) === '[object Array]';
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


function createMiddleware(middleware) {
  const list = [...middleware];
  if (production) {
    list.push(loggerMiddleware);
  } else {
    list.push(() => next => action => next(action));
  }
  return compose(applyMiddleware(...list));
}

function combineReducers(reducers) {
  if (!Object.keys(reducers).length) {
    reducers._ = createReducer();
  }
  return reduxCombineReducers(reducers);
}

export function createApp(component, reducer = {}, middleware = [], run = () => {}) {
  const store = createStore(
    reducer.__isBoundReducer ? reducer : combineReducers(reducer),
    createMiddleware(middleware),
  );
  masterStore = store;
  const element = document.createElement('div');
  render(
    createElement(
      Provider, 
      { store }, 
      component,
    ),
    element,
  );
  document.body.appendChild(element.children[0]);
  if (requestAnimationFrame) {
    requestAnimationFrame(() => run());
  } else {
    setTimeout(() => run());
  }
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

export function createSelector(method, state) {
  const wrapper = (...args) => {
    const curState = state || masterStore.getState();
    const result = method(curState, ...args);
    return result;
  };
  wrapper.__isBoundSelector = true;
  return wrapper;
}
