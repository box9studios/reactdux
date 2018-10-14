import { getState, isEqual } from './utils';

const getMethod = value =>
  typeof value === 'function'
    ? value
    : state => state[value];

const makeMethod = (...args) => {
  if (args.length <= 1) {
    return getMethod(...args);
  }
  let lastCalculation;
  let lastCalculators = [];
  return (...args2) => {
    const nextCalculators = args
      .slice(0, args.length - 1)
      .reduce(
        (calculators, arg, index) => ([
          ...calculators,
          getMethod(arg)(...args2),
        ]),
        [],
      );
    if (isEqual(nextCalculators, lastCalculators)) {
      return lastCalculation;
    }
    const nextCalculation = args[args.length - 1](...nextCalculators);
    lastCalculation = nextCalculation;
    return nextCalculation;
  };
};

export default function createSelector(...args) {
  const method = makeMethod(...args);
  const selector = (...args2) => method(getState(), ...args2);
  selector.__isReactduxSelector = true;
  return selector;
}
