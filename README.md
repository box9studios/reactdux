# Reactdux

A collection of javascript functions to help orchestrate react + redux applications.


## Create an Action

### 1) Simple Method

```js
const setText = createAction();
```

### 2) Add a Custom Payload Creator

```js
const setText = createAction((a, b) => ({ a, b }));
```

### 3) Add a Name/Label for Better Logging

```js
const setText = createAction('TEXT/SET', (a, b) => ({ a, b }));
```

## Create a Reducer

```js
const initialState = {
  name: 'Joe',
  text: 'Hello World',
};
createReducer(initialState, [
  [setText, text => ({ text })],
  [setName, (payload) => {
    return { name: payload.name };
  }],
]);
```

## Create the App

```js
createApp(<Root />, myReducer, middlewareList, initializeMethod);
```

Simply provide an entry component and a reducer. Optionally you can provide an array of middlewares to apply and an initialization method to call when the store is ready in order to dispatch actions to set any stored data.


## Create a Container

```js
createContainer(MyComponent, (ownProps, state) => ({ 
   name: state.name,
   text: state.text,
}), [WrappingContainer1, WrappingContainer2]);
```

Provide a component that will be wrapped with the result of the connecting method. Optionally you can also wrap this container by providing additional providers.


## Create a Selector

```js
  const selectText = createSelector(state => state.text);
```


*\* Made with [mrkdown.io](http://mrkdown.io)*