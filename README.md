# Reactdux

Simple React/Redux.


## App

```js
import { app } from 'reactdux';
import Component from './component';

const state = {
  name: 'Joe',
  age: 25,
  friends: [
    { name: 'Pete', age: 31 },
    { name: 'Sam', age: 37 },
  ],
};

export default app(Component, state);
```

## Actions

```js
import { action } from 'reactdux';
import { getFriendsApiCall } from './api';

// takes a reducer
export const addFriend = action((state, age) => ({
  friends: [
    ...state.friends,
    { name: 'John', age: 40 },
  ],
}));

// ...or a path that generates a key/value setter
export const setAge = action('age');

// ...or an asynchronus method that fetches data
export const fetchFriends = action(async state => {
  state('loading', true);
  const friends = await getFriendsApiCall();
  state('loading', false);
  state('friends', friends);
});
```

## Selectors
```js
import { selector } from 'reactdux';

// takes a method that selects the value
const selectName = selector(state => state.name);

// ...or a path that selects the value
const selectAge = selector('age');

// ...or a series of methods the last of which is
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