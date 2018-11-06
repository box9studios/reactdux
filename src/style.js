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

const getFirstValue = obj => {
  for (let i in obj) {
    return obj[i];
  }
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

const convertStyle = (...args) => {
  const [a, b] = args;
  if (typeof a === 'object') {
    if (typeof getFirstValue(a) === 'object') {
      return convertObjectToStyles(a, true);
    }
    return css(a);
  }
  if (typeof a === 'function') {
    return convertStyle(a());
  }
  if (
    typeof a === 'string'
    && (typeof b === 'object' || typeof b === 'function')
  ) {
    return createStyledComponent(a, b);
  }
  return classnames(...args);
};

export default convertStyle;