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
  const element = createElement(
    Provider,
    { store },
    component,
  );
  if (!target) {
    const container = document.createElement('div');
    render(element, container);
    document.body.appendChild(container);
  } else if (typeof target === 'string') {
    render(element, document.querySelector(target));
  } else {
    render(element, target);
  }
};
