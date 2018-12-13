import { createElement } from 'react';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { setStore } from './utils';

export default (
  component,
  reducer = {},
  middleware = [],
  target,
) => {
  const store = createStore(
    reducer,
    middleware.length ? applyMiddleware(...middleware) : undefined,
  );
  setStore(store);
  const element = () => createElement(
    Provider,
    { store },
    createElement(component),
  );
  if (target) {
    if (typeof target === 'string' && window && window.document) {
      render(element(), document.querySelector(target));
    } else {
      render(element(), target);
    }
  } else if (window && window.document) {
    const container = document.createElement('div');
    render(element(), container);
    document.body.appendChild(container);
  }
  return element;
};
