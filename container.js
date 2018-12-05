import { connect as reactReduxConnect } from 'react-redux';
import { compose } from 'redux';
import { getState, isFunction } from './utils';

const connect = mapper =>
  reactReduxConnect((state, props) => mapper(props, state));

const convert = obj => Object.entries(obj).reduce(
  (result, [key, value]) => {
    if (value && value.__isReactduxSelector) {
      try {
        return { ...result, [key]: value() };
      } catch(e2) {}
    }
    return { ...result, [key]: value };
  },
  {},
);

const create = value => {
  if (isFunction(value)) {
    try {
      const result = value();
      if (isFunction(result)) {
        return value;
      }
    } catch (e) {}
    return connect((...args) => convert(value(...args)));
  }
  return connect(() => convert(value));
};

const extend = (props, mapper) => {
  const overrides = (() => {
    try {
      return mapper(props, getState());
    } catch (e) {
      return {};
    }
  })();
  return { ...props, ...overrides };
};

export default (...args) => {
  const component = args[args.length - 1];
  const hocs = args
    .slice(0, args.length - 1)
    .map(create);
  return compose(...hocs)(component);
};