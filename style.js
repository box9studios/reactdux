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

const convertCssKey = key => key
  .split('')
  .reduce(
    (result, letter, index) => {
      if (letter === '-') {
        return result;
      }
      if (result[index - 1] === '-') {
        return `${result}${letter.toUpperCase()}`;
      }
      return `${result}${letter}`;
    },
    '',
  );

const convertTextStylesToObject  = text =>
  (text.match(/\.[a-z0-9-][\s\S]+?\{[\s\S]+?\}/ig) || [])
    .reduce(
      (result, section) => {
        const name = section.match(/\.([a-z0-9-]+)/i)[1];
        const body = section
          .match(/\{([\s\S]*?)\}/)[1]
          .split(/[\n;]/)
          .filter(item => !!item.trim())
          .reduce(
            (result, line) => {
              const key = line.split(':')[0].trim();
              const value = line.split(':')[1].trim();
              const convertedKey = convertCssKey(key);
              return { ...result, [convertedKey]: value };
            },
            {},
          );
        return { ...result, [name]: body };
      },
      {},
    );

const isSimpleStylesObject = obj => {
  for (let key in obj) {
    if (typeof obj[key] !== 'object') {
      return true;
    }
  }
  return false;
};

const style = (...args) => {
  const [a, b] = args;
  if (typeof a === 'function') {
    return style(a());
  }
  if (typeof a === 'object') {
    if (isSimpleStylesObject(a)) {
      return css(a);
    }
    return convertObjectToStyles(a);
  }
  if (typeof a === 'string') {
    if (typeof b === 'object' || typeof b === 'function') {
      return createStyledComponent(a, b);
    }
    if (!/^[a-z0-9-]+$/i.test(a)) {
      const obj = convertTextStylesToObject(a);
      console.log("STRING convert", obj);
      return style(obj);
    }
  }
  return classnames(...args);
};

export default style;