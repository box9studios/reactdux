import {
  getState,
  isArray,
  isEqual,
  isFunction,
  isString,
} from './utils';

const containsFunction = args => {
  for (let i = 0; i < args.length; i += 1) {
    if (typeof args[i] === 'function') {
      return true;
    }
  }
  return false;
}

const getSelector = (...args) => {
  if (containsFunction(args)) {
    if (args.length === 1) {
      return args[0];
    }
    return makeMemoizedSelector(args);
  }
  return makePathSelector(args);
};

const makeMemoizedSelector = selectors => {
  let prevCalculation;
  let prevCalculators = [];
  return (...args2) => {
    const nextCalculators = selectors
      .slice(0, -1)
      .reduce(
        (calculators, arg, index) => ([
          ...calculators,
          arg(...args2),
        ]),
        [],
      );
    if (isEqual(nextCalculators, prevCalculators)) {
      return prevCalculation;
    }
    const nextCalculation = selectors[selectors.length - 1](...nextCalculators);
    prevCalculators = nextCalculators;
    prevCalculation = nextCalculation;
    return nextCalculation;
  };
};

const makePathSelector = path => state => {
  let pointer = state;
  path.forEach(key => {
    // try {
      pointer = pointer[key];
    // } catch (e) {}
  });
  return pointer;
};

export default (...args) => {
  const method = getSelector(...args);
  const selector = (...args2) => method(getState(), ...args2);
  selector.__isReactduxSelector = true;
  return selector;
};
