# Reactdux

Simple React/Redux.


## App

```js
import { app } from 'reactdux';
import reducer from './reducer';
import middleware from './middleware';
import Component from './component';

app(Component, reducer, middleware);
```

## Actions

```js
import { action } from 'reactdux';

// takes a method that returns a payload
export const setAge = action(age => ({ age }));

// takes a path that immediately acts on the reducer state
export const setAge = age => action('age', age);
```

## Reducers

```js
import { reducer } from 'reactdux';
import { setAge } from './actions';

export default reducer(
  {
    name: 'Joe',
    age: 25,
    friends: [
      { name: 'Pete', age: 31 },
      { name: 'Sam', age: 37 },
    ],
  },
  [
    [setAge, payload => ({
      age: payload.age,
    })],
  ],
);
```

## Selectors
```js
import { selector } from 'reactdux';

// takes a method that selects the value
const selectName = selector(state => state.name);

// takes a path that selects the value
const selectAge = selector('age');

// takes a series of methods the last of which is
// run only when the previous results change
const selectFriendsOlderThanJoeSortedByAge = selector(
  state => state.friends,
  state => state.age,
  (friends, age) =>
    friends
      .filter(friend => friend.age >= age)
      .sort((a, b) => b.age - a.age),
);
```

## Containers
```js
import { container } from 'reactdux';
import { setAge } from './actions';
import { withAge } from './providers';
import { selectFriends } from './selectors';

export default container(
  // takes a provider or hoc
  withAge,
  // ...or an object with mapped selectors
  {
    friends: selectFriends,
    setAge,
  },
  // ...or a prop-mapper
  props => ({
    retired: props.age >= 65,
  }),
  // ...and wraps the component from top to bottom
  Component,
);
```

## Components
```js
import React from 'react';
import { component } from 'reactdux';

export default component({
  // set default props
  props: {
    age: 1,
    setAge() {},
    friends: [],
    retired: false,
  },
  // set initial state
  state: {
    breaths: 0,
    message: '',
  },
  mount() {
    this.timer = setInterval(
      () => this.setState({ breaths: this.state.breaths + 1}),
      1000,
    );
  },
  unmount() {
    clearInterval(this.timer);
  },
  update(prevProps) {
    if (this.props.age > prevProps.age) {
      console.log('You got older!');
    }
  },
  onTick() {
    this.setState({ breaths: this.state.breaths + 1 });
  },
  render() {
    return (
      <div>
        <span>{this.state.breaths}</span>
        <button onClick={this.setState('breaths', 0)}>
          Reset Breaths
        </button>
        <input
          {/* memoizes a function that sets the value of 'message' */}
          onChange={this.setState('message')}
          value={this.state.message}
        />
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