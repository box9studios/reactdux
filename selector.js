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
  let prevComputations = [];
  return (...args2) => {
    const computers = selectors.slice(0, -1);
    const calculator = selectors[selectors.length - 1];
    const inputs = args2.slice(1);
    const newComputations = computers.reduce(
      (calculators, arg, index) => ([
        ...calculators,
        arg(...args2),
      ]),
      [],
    );
    if (isEqual(newComputations, prevComputations)) {
      return prevCalculation;
    }
    const nextCalculation = calculator(...newComputations, ...inputs);
    prevComputations = newComputations;
    prevCalculation = nextCalculation;
    return nextCalculation;
  };
};

const makePathSelector = path => state => {
  let pointer = state;
  path.forEach(key => pointer = pointer[key])
  return pointer;
};

export default (...args) => {
  const method = getSelector(...args);
  const selector = (...args2) => method(getState(), ...args2);
  selector.__isReactduxSelector = true;
  return selector;
};
