# Reactdux

Helpful functions for React applications.


## App

```js
import { app } from 'reactdux';
import Component from './component';

const state = {
  name: 'Joe',
  age: 25,
  friends: [
    { name: 'Pete', age: 26 },
    { name: 'Sam', age: 27 },
  ],
};

export default app(Component, state);
```

## Actions

```js
import { action } from 'reactdux';
import { fetcFriends } from './api';

export const addFriend = action((state, name, age) => ({
  friends: [
    ...state.friends,
    { name, age },
  ],
}));

export const getFriends = action(async state => {
  state({ loading: true });
  const friends = await fetchFriends();
  state({
    loading: false,
    friends,
  });
});
```

## Selectors
```js
import { selector } from 'reactdux';

const selectFriend = selector((state, id) =>
  state.friends.find(friend => friend.id === id));

const selectOlderFriends = selector(
  state => state.age,
  state => state.friends,
  (age, friends) => friends
    .filter(friend => friend.age >= age),
);
```

## Containers
```js
import { container } from 'reactdux';
import { withFriends } from './hocs';
import { selectFriends } from './selectors';

export default container(
  withFriends,
  {
    friends: selectFriends,
  },
  props => ({
    retired: props.age >= 65,
  }),
  Component,
);
```

## Components
```js
import React from 'react';
import { component } from 'reactdux';
import { addFriend } from './actions';

export default component({
  props: {
    age: 1,
    friends: [],
    retired: false,
  },
  state: {
    breaths: 0,
  },
  mount() {
    this.timer = setInterval(this.onBreathe, 1000);
  },
  unmount() {
    clearInterval(this.timer);
  },
  onBreathe() {
    this.setState({ breaths: this.state.breaths + 1 });
  },
  render() {
    return (
      <div>
        <p>breaths: {this.state.breaths}</p>
        <p>friends: {this.props.friends.length}</p>
        <button onClick={this.setState('breaths', 0)}>Reset</button>
        <button onClick={() => addFriend('Hank', 21)}>Befriend</button>
      </div>
    );
  },
});
```

## Context

```js
import { context } from 'reactdux';

const Person = context(
  {
    name: 'Paul',
    age: 28,
    friends: [],
  },
  (state, setState) => ({
    changeName: () => setState({ name: 'Bob' }),
    getOlder: (years = 1) => setState({ age: state.age + years }),
    makeFriends: async () => {
      const friends = fetchFriends();
      setState({ friends });
    },
  }),
);

export default () => (
  <Person.Provider>
    <div>
      <Person.Consumer>
        {({ name, age, getOlder }) => (
          <div>
            <div>{name} is {age} years old.</div>
            <button onClick={getOlder}>Age</button>
          </div>
        )}
      </Person.Consumer>
    </div>
  </Person.Provider>
);
```