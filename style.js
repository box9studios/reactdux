import classnames from 'classnames';
import { css } from 'emotion';
import styled, { keyframes } from 'react-emotion';

const addAnimation = (lookup, key, steps) => {
  const name = key.split(/^@keyframes /)[1] || '';
  lookup[name] = keyframes(steps);
};

const convertObjectToStyles = (inputObject) => {
  const animations = {};
  return Object.entries(inputObject).reduce(
    (result, [key, value]) => {
      if (/^@keyframes .+/.test(key)) {
        addAnimation(animations, key, value);
        return;
      }
      return {
        ...result,
        [key]: css(replaceAnimations(value, animations)),
      };
    },
    {},
  );
};

const createStyledComponent = (tag, creator) => {
  const fnCreator = typeof creator === 'function'
    ? creator
    : () => creator;
  return styled(tag)(props => fnCreator(props));
};

const isSimpleStylesObject = obj => {
  for (let key in obj) {
    if (typeof obj[key] !== 'object') {
      return true;
    }
  }
  return false;
};

const isValidClassName = value => {
  if (typeof value !== 'string') {
    return false;
  }
  if (!value) {
    return true;
  }
  return /^[a-z0-9 -]+$/i.test(value);
};

const replaceAnimations = (input, animations) => Object.entries(input).reduce(
  (result, [key, value]) => ({
    ...result,
    [key]: (() => {
      if (typeof value === 'object') {
        return replaceAnimations(value, animations);
      }
      if (key === 'animation-name' || key === 'animationName') {
        return animations[value] || value;
      }
      if (key === 'animation') {
        const name = (value.match(/^([^ ]+)/) || [])[0] || '';
        return value.replace(name, animations[name] || name);
      }
      return value;
    })(),
  }),
  {},
);

const style = (...args) => {
  const [a, b] = args;
  if (typeof a === 'function') {
    return style('div', a);
  }
  if (typeof a === 'object') {
    if (isSimpleStylesObject(a)) {
      return css(a);
    }
    return convertObjectToStyles(a);
  }
  if (typeof a === 'string') {
    if (
      typeof b === 'object'
      || typeof b === 'function'
      || (typeof b === 'string' && !isValidClassName(b))
    ) {
      return createStyledComponent(a, b);
    }
    if (!isValidClassName(a)) {
      return css(a);
    }
  }
  return classnames(...args);
};

export default style;
