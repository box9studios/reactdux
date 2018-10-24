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


*Made with [mrkdown.io](http://mrkdown.io)*
