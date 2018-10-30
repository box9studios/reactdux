import classnames from 'classnames';
import { css } from 'emotion';
import { keyframes } from 'react-emotion';

const addAnimation = (lookup, key, steps) => {
  const name = key.split(/^@keyframes /)[1] || '';
  lookup[name] = keyframes(steps);
};

const convertObjectToStyles = value => {
  const animations = {};
  return Object.entries(value).reduce(
    (result, [key, value]) => {
      if (/^@keyframes .+/.test(key)) {
        addAnimation(animations, key, value);
      } else {
        return {
          ...result,
          [key]: css(replaceAnimations(value, animations)),
        };
      }
    },
    {},
  );
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

export default (...args) => typeof args[0] === 'object'
  ? convertObjectToStyles(args[0])
  : classnames(...args);