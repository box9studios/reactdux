# Reactdux
Orchestrate your React/Redux apps with this simple library.

```npm install reactdux```


## Setup
```js
import { createApp } from 'reactdux';
import App from './components/App'; // root component
import reducer from './reducer'; // see below

const middleware = []; // no middleware yet...

createApp(<App />, reducer, middleware);
```

## Actions
```js
import { createAction } from 'reactdux';

export const toggleStatus = createAction('TOGGLE_STATUS'); // no payload
export const setAge = createAction('SET_AGE', age => ({ age })); // arguments translated to pretty payload
```

## Reducers
```js
import { createReducer } from 'reactdux';
import { setAge } from './actions';

const defaultState = {
  name: 'Joe',
  age: 25,
  friends: [
    { name: 'Paul', age: 20 },
    { name: 'Randy', age: 34 },
  ],
};

export default createReducer(defaultState, [
  [
    setAge,
    payload => ({ age: payload.age }),
  ],
]);
```

## Nested/Combined Reducers
```js
import { createReducer } from 'reactdux';

const user = createReducer(
  {
    name: 'Joe',
    age: '31',
  },
  [
    setAge,
    (state, payload) => state.age = payload.age,
  ],
);

const heartbeats = createReducer(
  [],
  [
    addHeartbeat,
    state => [...state, 'thump'],
  ],
);

export default createReducer({ user, heartbeats });
```

## Selectors
```js
import { createSelector } from 'reactdux';

const selectText = createSelector('age'); // get state.age
const selectUserName = createSelector('user.name'); // get state.user.age
const selectUserAge = createSelector(['user', 'age']); // get state.user.age
const selectUserText = createSelector((state, userId) => state.users[userId]);
const selectText = createSelector(
  (state) => state.friends, // provides first argument below
  (state, name) => name, // provides second argument below
  // last method is only run when any previous result changes (memoization!)
  (friends, name) => friends.find(friend => friend.name === name)).age,
);
```

## Containers
```js
import { createContainer } from 'reactdux';
import withAge from './withAge';
import { setAge } from './actions';
import { selectAge } from './selectors';

const mapProps = props => ({
  age: selectAge(), // no need to pass in state!
  onEndOfYear: () => setAge(26), // no need to dispatch!
}),

export default createContainer(
  withAge,
  props => ({ isRetired: props.age >= 65 }),
  /* more HOCs or mapProps functions */
  Component,
);
```


*Made with [mrkdown.io](http://mrkdown.io)*
