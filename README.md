# Reactdux

Simple React/Redux.


## App

```js
import { app } from 'reactdux';
import reducer from './reducer';
import middlewares from './middlewares';
import Component from './component';

app(Component, reducer, middleware);
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
import { withAge } from './providers';
import { selectFriends } from './selectors';

export default container(
  withAge,
  { friends: selectFriends },
  props => ({ retired: props.age >= 65 }),
  Component,
);
```

## Components
```js
import React from 'react';
import { component } from 'reactdux';

export default component({
  props: {
    name: 'Joe',
  },
  state: {
    ticks: 0,
  },
  mount() {
    this.timer = setInterval(this.onTick, 1000);
  },
  unmount() {
    clearInterval(this.timer);
  },
  update() {
   console.log(`ticks: ${this.state.ticks}`);
  },
  onTick() {
    this.setState({ ticks: this.state.ticks + 1 });
  },
  render() {
    return (
      <div>
        <span>{this.state.ticks}</span>
        <button onClick={this.setState('ticks', 0)}>Reset</button>
      </div>
    );
  },
});
```

## Shorthand Components
```js
export default component(({ name = 'Joe',  ticks = 0 }, setState) => (
  <div>
    <span>{name}: {ticks}</span>
    <button onClick={() => setState({ ticks: ticks + 1 })}>Tick</button>
    <button onClick={setState('ticks', 0)}>Reset</button>
  </div>
);
```