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
    lastCalculators = args.reduce(
      (calculators, arg, index) => {
        if (index === args.length - 1) {
          if (!isEqual(calculators, lastCalculators)) {
            const method = getMethod(arg);
            lastCalulation = method(...calculators);
          }
          return lastCalculation;
        }
        const method = getMethod(arg);
        const calculator = method(...args2);
        calculators.push(calculator);
      },
      [],
    );
  };
};

export default (...args) => {
  const method = makeMethod(...args);
  const selector = (...args2) => method(getState(), ...args2);
  selector.__isReactduxSelector = true;
  return selector;
};
