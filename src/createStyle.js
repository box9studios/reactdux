import { css } from 'emotion';

export default value => Object.entries(value).reduce(
  (result, [key, value]) => ({
    ...result,
    [key]: css(value),
  }),
  {},
);