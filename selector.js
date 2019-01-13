import {
  getState,
  isArray,
  isEqual,
  isFunction,
  isString,
} from './utils';

const getMethod = arg => {
  if (isFunction(arg)) {
    return arg;
  }
  const keys = (() => {
    if (isString(arg)) {
      return arg.split('.');
    }
    if (isArray(arg)) {
      return arg;
    }
    return [];
  })()
  return state => {
    let pointer = state;
    for (let i = 0; i < keys.length; i += 1) {
      try {
        pointer = pointer[keys[i]];
      } catch(error) {
        return undefined;
      }
    }
    return pointer;
  };
}

const makeMethod = (...args) => {
  if (args.length <= 1) {
    return getMethod(args[0]);
  }
  let prevCalculation;
  let prevCalculators = [];
  return (...args2) => {
    const nextCalculators = args
      .slice(0, -1)
      .reduce(
        (calculators, arg, index) => ([
          ...calculators,
          getMethod(arg)(...args2),
        ]),
        [],
      );
    if (isEqual(nextCalculators, prevCalculators)) {
      return prevCalculation;
    }
    const nextCalculation = args[args.length - 1](...nextCalculators);
    prevCalculators = nextCalculators;
    prevCalculation = nextCalculation;
    return nextCalculation;
  };
};

export default (...args) => {
  const method = makeMethod(...args);
  const selector = (...args2) => method(getState(), ...args2);
  selector.__isReactduxSelector = true;
  return selector;
};
