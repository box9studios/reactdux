import { css, cx } from 'emotion';
import styled, { keyframes } from 'react-emotion';
import { removeUndefinedKeys } from './utils';

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
        [key]: createCss(replaceAnimations(value, animations)),
      };
    },
    {},
  );
};

const convertStylePairs = (key, value) => {
  if (key === 'background') {
    return { backgroundColor: convertStyleValue(value) };
  }
  if (
    key === 'border'
    || key === 'borderBottom'
    || key === 'borderLeft'
    || key === 'borderRight'
    || key === 'borderTop'
  ) {
    const parts = `${value}`.split(/[ ]+/);
    return {
      [`${key}Color`]: convertStyleValue(parts.length >= 2 ? parts[parts.length - 1] : undefined),
      [`${key}Style`]: convertStyleValue(parts.length === 3 ? parts[1] : undefined),
      [`${key}Width`]: convertStyleValue(parts[0]),
    };
  }
  if (key === 'borderRadius') {
    const parts = `${value}`.split(/[ ]+/);
    if (parts.length === 1) {
      return { borderRadius: convertStyleValue(parts[0]) };
    };
    return {
      borderTopLeftRadius: convertStyleValue(parts[0]),
      borderTopRightRadius: convertStyleValue(parts.length === 2 ? parts[1] : parts[1] || parts[0]),
      borderBottomRightRadius: convertStyleValue(parts.length >= 3 ? parts[2] : parts[0]),
      borderBottomLeftRadius: convertStyleValue(parts.length === 3 ? parts[1] : parts[parts.length - 1]),
    };
  }
  if (key === 'font') {
    const parts = `${value}`.split(/[ ]+/);
    return {
      fontFamily: convertStyleValue(parts[parts.length - 1]),
      fontSize: convertStyleValue(parts[parts.length - 2]),
      fontVariant: convertStyleValue(parts[parts.length - 4]),
      fontStyle: convertStyleValue(parts[parts.length - 5]),
      fontWeight: parts[parts.length - 3],
    };
  }
  if (key === 'margin' || key === 'padding') {
    const parts = `${value}`.split(/[ ]+/);
    return {
      [`${key}Top`]: convertStyleValue(parts[0]),
      [`${key}Right`]: convertStyleValue(parts.length === 2 ? parts[1] : parts[1] || parts[0]),
      [`${key}Bottom`]: convertStyleValue(parts.length >= 3 ? parts[2] : parts[0]),
      [`${key}Left`]: convertStyleValue(parts.length === 3 ? parts[1] : parts[parts.length - 1]),
    };
  }
  if (key === 'transform' && typeof value === 'string') {
    const parts = value.split(/\)[ ]+/);
    const transform = parts.reduce(
      (result, part) => {
        const type = part.split('(')[0];
        const values = (part.split('(')[1] || '').split(')')[0].split(/,[ ]+/);
        const next = [ ...result ];
        if (/[XY]$/.test(type)) {
          next.push({ [type]: convertStyleValue(values[0]) });
        } else {
          next.push({ [`${type}X`]: convertStyleValue(values[0]) });
          if (values[1]) {
            next.push({ [`${type}X`]: convertStyleValue(values[1]) });
          }
          if (values[2]) {
            next.push({ [`${type}X`]: convertStyleValue(values[2]) });
          }
        }
        return next;
      },
      [],
    );
    return { transform };
  }
  return { [key]: convertStyleValue(value) };
};

const convertStyleValue = value => {
  if (
    typeof value === 'string'
    && (
      /p[xt]$/.test(value)
      || /^[0-9.]+$/.test(value)
    )
  ) {
    return parseInt(value);
  }
  return value;
};

const createCss = input => {
  if (window && window.document) {
    return css(input);
  }
  const transformed = Object.entries(input).reduce(
    (result, [key, value]) => {
      return {
        ...result,
        ...removeUndefinedKeys(convertStylePairs(key, value)),
      };
    },
    {},
  );
  return Object.entries(transformed).reduce(
    (result, [key, value]) => {
      if (
        key === 'borderRadius'
        || key === 'borderTopLeftRadius'
        || key === 'borderTopRightRadius'
        || key === 'borderBottomRightRadius'
        || key === 'borderBottomLeftRadius'
      ) {
        return {
          ...result,
          [key]: Math.min(
            value,
            Math.ceil(
              Math.min(
                transformed.height || 0,
                transformed.width || 0,
              ) / 2,
            )
          ),
        };
      }
      if (
        key === 'display'
        && value === 'flex'
      ) {
        return {
          ...result,
          flexDirection: 'row',
        };
      }
      return { ...result, [key]: value };
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
      return createCss(a);
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
      return createCss(a);
    }
  }
  return cx(...args);
};

export default style;
