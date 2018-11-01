# Reactdux
Simplify your React+Redux setup.

```npm install reactdux```


## Setup

```js
import React, { createApp } from 'reactdux';
import reducer from './reducer';
import middlewares from './middlewares';
import Component from './component';

createApp(<Component />, reducer, middleware);
```

## Actions

```js
import { createAction } from 'reactdux';

export const incAge = createAction('INC_AGE');
export const setAge = createAction('SET_AGE', age => ({ age }));
```

## Reducers

```js
import { createReducer } from 'reactdux';
import { setAge } from './actions';

export default createReducer(
  { name: 'Joe', age: 25 },
  [
    [
      setAge,
      payload => ({ age: payload.age }),
    ],
  ],
);
```

## Selectors
```js
import { createSelector } from 'reactdux';

const selectAge = createSelector('age');
const selectName = createSelector(state => state.name);
const selectFriends = createSelector(
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
import { createContainer } from 'reactdux';
import { withAge, withName } from './hocs';
import { setAge } from './actions';
import { selectFriends } from './selectors';

export default createContainer(
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
import React, { createComponent } from 'reactdux';

export default createComponent(
  { name: 'Joe' },
  { breaths: 0 },
  {
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
  {
    onButtonClick() {
      this.setState({ breaths: this.state.breaths + 1 });
    },
    render() {
      return (
        <button onClick={this.onButtonClick}>
          breaths: {this.state.count}
        </button>
      );
    },
  }
);
```

## Styles
```js
import { createStyle } from 'reactdux';

const style = createStyle({
  '@keyframes grow': {
    from: { transform: 'scale(0)' },
    to: { transform: 'scale(1)' },
  },
  button: {
    background: 'red',
    borderRadius: '50%',
    height: '50px',
    width: '50px',
  },
  text: {
    animation: 'grow 1s linear forwards',
    color: 'blue',
  },
});

export default () => (
  <div>
    <p className={style.text}>Hello World!</p>
    <button
      className={createStyle(
        style.button,
        active && 'active',
      )}
    >
      Push
    </button>
  </div>
);
```
