### Reactdux

A collection of javascript functions to help orchestrate react/redux applications.


### createApp(component, reducer, middleware, run);

```javascript
createApp(
  <div>Hi</div>,     // any react element/component
  { text: 'Hello' }, // a reducer or result from createReducer
  [a, b, c],         // an array of middlwares
  run,               // code to run as soon as the app is rendered
);
```


### createContainer(component, mapToProps, wrappingComponents)

```javascript
createContainer(
  MyComponent,
  (ownProps, store) => ({ text: 'hello' }),
  [WrappingContainer1, WrappingContainer2],
);
```


### createSelector(method, state)

```javascript
  const selectText = createSelector((state) => state.text);
```

Or, to use a state other than the current state, pass one in:
```javascript
  const selectText = createSelector((state) => state.text, state);
```


### createAction(name, method)
```javascript
const setText = createAction(text => ({ text }));
```

Or, add a text string to identify your action when logging:
```javascript
const setText = createAction('setText', text => ({ text }));
```


### createReducer(defaultState, actions)

```javascript
createReducer(
  { id: 1, name: 'Me' } // the default state
  [
    [firstAction, payload => ({ text: 'hello' })],
    [lastAction, payload => ({ text: 'goodbye' })],
  ]
);
```

*\* Made with [mrkdown.io](http://mrkdown.io)*