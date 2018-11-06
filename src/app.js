import { createElement } from 'react';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { setStore } from './utils';

export default (
  component,
  reducer = {},
  middleware = [],
) => {
  const finalMiddleware = middleware.length
    ? applyMiddleware(...middleware)
    : undefined;
  const store = createStore(reducer, finalMiddleware);
  setStore(store);
  const element = createElement(Provider, { store }, component);
  const container = document.createElement('div');
  container.style.height = '100%';
  render(element, container);
  document.body.appendChild(container);
};
