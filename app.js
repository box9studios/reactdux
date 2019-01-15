import { createElement } from 'react';
import { applyMiddleware, createStore } from 'redux';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import logger from './logger';
import reducer from './reducer';
import { setStore } from './utils';

const PRODUCTION = process && process.env && process.env.NODE_ENV === 'production';

export default (
  component,
  state = {},
  actionExports = {},
  target,
) => {
  const store = createStore(
    reducer(state),
    PRODUCTION ? undefined : applyMiddleware(logger(actionExports)),
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
