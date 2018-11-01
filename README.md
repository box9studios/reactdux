# Reactdux
Simplify your React+Redux setup.

## Install

```npm install reactdux```


## Setup

```js
import { createApp } from 'reactdux';
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

const initialState = {
  name: 'Joe',
  age: 25,
  friends: [
    { name: 'Paul', age: 20 },
    { name: 'Randy', age: 34 },
  ],
};

export default createReducer(initialState, [
  [
    setAge,
    payload => ({ age: payload.age }),
  ],
]);
```

## Selectors
```js
import { createSelector } from 'reactdux';

const selectText = createSelector('age');
const selectUserName = createSelector('user.name');
const selectUserAge = createSelector(['user', 'age']);
const selectUserText = createSelector((state, userId) => state.users[userId]);
const selectText = createSelector(
  (state) => state.friends,
  (state, name) => name,
  (friends, name) => friends.find(friend => friend.name === name)).age,
);
```

## Containers
```js
import { createContainer } from 'reactdux';
import withAge from './withAge';
import { setAge } from './actions';
import { selectAge, selectName } from './selectors';

export default createContainer(
  withAge,
  props => ({
    isRetired: props.age >= 65,
    name: selectName(),
  }),
  { setAge },
  Component,
);
```

## Components
```js
import { createComponent } from 'reactdux';

export default createComponent({
  props: { name: 'Joe' },
  state: { count: 0 },
  onMount() {
    console.log(`My name is ${this.props.name}`);
  },
  onUnmount() {
    console.log('Unmounting');
  },
  onButtonClick() {
    this.setState({ count: Math.min(this.state.count + 1, 3) });
  },
  render() {
    return (
      <button onClick={this.onButtonClick}>
        count is {this.state.count}
      </button>
    );
  },
});
```

## Styles
```js
import React from 'react';
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


*Made with [mrkdown.io](http://mrkdown.io)*
