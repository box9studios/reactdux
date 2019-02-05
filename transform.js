import {
  dehydrate,
  getObjectPathValue,
  getState,
  hydrate,
  setState,
} from './utils';

const MARKER = Math.random() * 1000000000000000000;

let isDummyTransforming = false;
let isHydratorRunning = false;
let mostRecentData = {};
let topTransfromRunning = false;

const getHydratePaths = transformer => {
  const paths = [['id']];
  const addPaths = (nextTransformer, path = []) => {
    isDummyTransforming = true;
    const nextResults = nextTransformer();
    isDummyTransforming = false;
    const result = nextResults instanceof Array ? nextResults[0] : nextResults;
    if (result && typeof result === 'object') {
      Object.entries(result).forEach(([key, value]) => {
        const nestedTransformer = value && value[MARKER];
        if (nestedTransformer) {
          paths.push([...path, key, 'id']);
          addPaths(nestedTransformer, [...path, key]);
        }
      });
    }
  }
  addPaths(transformer);
  return paths.reverse();
};

const runDehydrate = (value, transformer) => {
  const turnedOn = !topTransfromRunning;
  if (turnedOn) {
    topTransfromRunning = true;
    mostRecentData = {};
  }
  const isList = value instanceof Array;
  const list = isList ? value : [value];
  const values = list
    .map(transformer)
    .map(item => dehydrate(item, [['id']]))
    .map(dehydrateResult => {
        mostRecentData = {
          ...mostRecentData,
          ...dehydrateResult.data,
        };
        return dehydrateResult.value;
    });
  const finalValue = isList ? values : values[0];
  if (turnedOn) {
    topTransfromRunning = false;
  }
  if (!turnedOn) {
    return finalValue;
  }
  return {
    data: mostRecentData,
    value: finalValue,
  };
};

const runHydrate = (value, data, transformer) => {
  const paths = getHydratePaths(transformer);
  return hydrate(value, paths, data);
};

const setMarker = (value, transformer) => {
  Object.defineProperty(
    value,
    MARKER,
    { enumerable: false, value: transformer },
  );
  return value;
};

const transformDehydrator = (hydratedValue, transformer) => {
  isHydratorRunning = true;
  const { data, value } = transformer(hydratedValue);
  isHydratorRunning = false;
  setState(
    'ReactduxDehydrateAction',
    state => ({
      data: {
        ...state.data,
        ...data,
      },
    }),
    JSON.stringify(hydratedValue || '').substring(0, 200),
  );
  return value;
};

const transformHydrator = (dehydratedValue, transformer) => {
  const data = getState('data') || {};
  isHydratorRunning = true;
  const result = transformer(dehydratedValue, data);
  isHydratorRunning = false;
  return result;
};

const wrapTransformer = transformer => (input = {}) => {
  const get = (...args) => getObjectPathValue(input, ...args);
  try {
    return transformer(get);
  } catch (e) {
    return input;
  }
};

export default input => {
  const method = (value, data) => {
    const transformer = wrapTransformer(input);
    if (isDummyTransforming) {
      const result = transformer();
      return setMarker(result, transformer);
    }
    if (!isHydratorRunning) {
      return transformer(value);
    }
    if (data) {
      return runHydrate(value, data, transformer);
    }
    return runDehydrate(value, transformer);
  };
  method.dehydrate = value => transformDehydrator(value, method);
  method.hydrate = value => transformHydrator(value, method);
  return method;
};