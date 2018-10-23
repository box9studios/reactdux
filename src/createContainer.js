import { connect } from 'react-redux';
import { compose } from 'redux';
import { isArray } from './utils';

const defaultObj = {};
const defaultMapper = () => defaultObj;

const createMapper = (value, comp) => {
  if (!value) {
    return defaultMapper;
  }
  const mapper = typeof value === 'function'
    ? value
    : () => value;
  return connect(
    (state, props) => {
      const mapped = mapper(props, state, comp) || defaultObj;
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
  const component = args[args.length - 1];
  const mappers = [];
  const hocs = [];
  args
    .slice(0, args.length - 1)
    .forEach(arg => {
      if (isArray(arg)) {
        arg.forEach(a => hocs.push(a));
      } else {
        mappers.push(arg);
      }
    });
  return compose(
    ...mappers.map(mapper => createMapper(mapper, component)),
    ...hocs,
  )(component);
}