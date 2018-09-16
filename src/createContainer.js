import { connect } from 'react-redux';
import { compose } from 'redux';
import { getState } from './utils';

const defaultObj = {};
const defaultMapper = () => defaultObj;

const createMapper = value => {
  if (!value) {
    return defaultMapper;
  }
  const mapper = typeof value === 'function'
    ? value
    : () => value;
  return connect(
    (state, props) => {
      const mapped = mapper(props, getState()) || {};
      const copy = { ...mapped };
      for (const key in copy) {
        if (
          typeof copy[key] === 'function'
          && copy[key].__isReactduxSelector
        ) {
          copy[key] = copy[key]();
        }
      }
      return copy;
    },
    defaultMapper,
  );
};

export default function createContainer(...args) {
  const component =  args[args.length - 1];
  const mapper =  args[args.length - 2];
  const hocs = args.slice(0, args.length - 2) || [];
  return compose(
    ...hocs,
    createMapper(mapper),
  )(component);
}