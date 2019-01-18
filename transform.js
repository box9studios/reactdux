import {
  dehydrate,
  dispatch,
  clone,
  getState,
  hydrate,
  setState,
} from './utils';

const MARKER = `_${Math.ceil(Math.random() * 100000000)}`;

let cachedMapperKeys = new Map();
let isDummyTransforming = false;
let isHydratorRunning = false;
let mostRecentData = {};
let topTransfromRunning = false;

const getMarker = value => !!value && !!value[MARKER];

const getPathValue = (obj, ...path) => {
  let result = obj;
  for (const key of path) {
    if (result === null || result === undefined) {
      break;
    }
    result = result[key];
  }
  return result;
};

const getTransformerMappers = transformer => {
  const cached = cachedMapperKeys.get(transformer);
  if (cached) {
    return cached;
  }
  isDummyTransforming = true;
  const dummy = transform(transformer)();
  isDummyTransforming = false;
  const mappers = [];
  for (const key in dummy) {
    const value = dummy[key];
    if (getMarker(value)) {
      mappers.push(key);
    }
  }
  cachedMapperKeys.set(transformer, mappers);
  return mappers;
};

const getWrappedTransformer = transformer => input => {
  const get = (...args) => getPathValue(input, ...args);
  try {
    return transformer(get);
  } catch (e) {
    return input;
  }
};

const setMarker = value => {
  Object.defineProperty(
    value,
    MARKER,
    { enumerable: false, value: 1 },
  );
  return value;
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
    .map(item => dehydrate(item, ['id']))
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
  const hydrated = hydrate(value, ['id'], data);
  if (!hydrated) {
    return value;
  }
  const mappers = getTransformerMappers(transformer);
  mappers.forEach(key => {
    if (hydrated instanceof Array) {
      hydrated.forEach(item => {
        const val = item[key];
        if (val instanceof Array) {
          item[key] = val.map(id => clone(data[id]))
        } else {
          item[key] = clone(data[val])
        }
      });
    } else  {
      const val = hydrated[key];
      if (val instanceof Array) {
        hydrated[key] = val.map(id => clone(data[id]))
      } else {
        hydrated[key] = clone(data[val]);
      }
    }
  });
  return hydrated;
};

export const transform = transformer => (value, data) => {
  const wrappedTransformer = getWrappedTransformer(transformer);
  if (isDummyTransforming) {
    const result = wrappedTransformer({});
    return setMarker(result);
  }
  if (!isHydratorRunning) {
    return wrappedTransformer(value);
  }
  if (data) {
    return runHydrate(value, data, wrappedTransformer);
  }
  return runDehydrate(value, wrappedTransformer);
};

export const hydrater = (dehydratedValue, transformer) => {
  const data = getState('data') || {};
  isHydratorRunning = true;
  const result = transformer(dehydratedValue, data);
  isHydratorRunning = false;
  return result;
};

export const dehydrater = (hydratedValue, transformer) => {
  isHydratorRunning = true;
  const { data, value } = transformer(hydratedValue);
  isHydratorRunning = false;
  setState(
    'ReactduxDehydrateSetData',
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

export default transform;