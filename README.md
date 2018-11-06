# Reactdux
Simplify your React+Redux setup.

```npm install reactdux```


## Setup

```js
import React, { app } from 'reactdux';
import reducer from './reducer';
import middlewares from './middlewares';
import Component from './component';

app(<Component />, reducer, middleware);
```

## Actions

```js
import { action } from 'reactdux';

export const setAge = action(age => ({ age }));
```

## Reducers

```js
import { reducer } from 'reactdux';
import { setAge } from './actions';

export default reducer(
  { name: 'Joe', age: 25 },
  [
    [setAge, payload => ({ age: payload.age })],
  ],
);
```

## Selectors
```js
import { selector } from 'reactdux';

const selectAge = selector('age');
const selectName = selector(state => state.name);
const selectFriends = selector(
  (state) => state.friends,
  (state, age) => age,
  (friends, name) =>
    friends
      .filter(friend => friend.age >= age)
      .sort((a, b) => b.age - a.age),
);
```

## Containers
```js
import { container } from 'reactdux';
import { withAge, withName } from './hocs';
import { setAge } from './actions';
import { selectFriends } from './selectors';

export default container(
  withAge,
  withName,
  props => ({
    friends: selectFriends(65),
    retired: props.age >= 65,
    setAge,
  }),
  Component,
);
```

## Components
```js
import React, { component } from 'reactdux';

export default component({
  props: {{ name: 'Joe' },
  state: { breaths: 0 },
  lifecycle: {
    mount() {
      console.log(`hello ${this.props.name}`);
    },
    unmount() {
      console.log('goodbye');
    },
    update() {
      console.log(`breaths: ${this.state.breaths}`);
    },
  },
  onButtonClick() {
    this.setState({ breaths: this.state.breaths + 1 });
  },
  render() {
    return (
      <button onClick={this.onButtonClick}>
        breaths: {this.state.breaths}
      </button>
    );
  },
});
```

## Styles
```js
import { style } from 'reactdux';

const stylesheet = style({
  '@keyframes grow': {
    from: { transform: 'scale(0)' },
    to: { transform: 'scale(1)' },
  },
  button: {
    background: 'green',
    '&.active': {
      background: 'blue',
    },
  },
  text: {
    animation: 'grow 1s linear forwards',
    color: 'blue',
  },
});

const resetButtonStyle = style({ background: 'red' });

const Wrapper = style(
  'div',
  props => ({ opacity: props.active ? '1' : '0' }),
);

export default props => (
  <Wrapper active={props.active}>
    <p className={stylesheet.text}>Hello World!</p>
    <button className={style(stylesheet.button, props.active && 'active')}>
        Push
    </button>
  </Wrapper>
);
```
