# Reactdux

A collection of javascript functions to help orchestrate react + redux applications.

```
npm install reactdux
```



## Apps

```js
createApp(<App />, reducer, middleware);
```

## Actions
```js
const setText = createAction(text => text);
```
```js
const setNameAndText = createAction((name, text) => ({ name, text }));
```

## Reducers

```js
createReducer(
  {
    name: 'Joe',
    text: 'Hello World',
  },
  [
    [
      setText,
      (name, text) => ({ name, text }),
    ]
    [
      setJoeText,
      ({ name, text }) => ({
        name,
        text,
      }),
    ],
  ],
);
```

## Containers

```js
createContainer(
  { data: selectData },
  ({ data }) => <div>{data}</div>,
);
```
```js
creatContainer(
  { data: selectData('a', 'b') },
  ({ data }) => <div>{data}</div>,
);
```
```js
createContainer(
  (props, state) => ({
   name: props.history.location.query.name,
   age: state.age,
   job: selectJob('joe'),
   height: selectHeight,
  }).
  class extends React.Component {
    render() {
      return <div>{this.props.name}</div>;
    }
  },
);
```
```js
createContainer(
  { data: selectData },
  [
    withRouter,
    withTranslation,
  ],
  () => <div>Wow</div>,
);
```

## Selectors

1. Path Selector
```js
const selectText = createSelector('todos');
```

2. Simple Selector
```js
const selectText = createSelector((state, id) => state.todos[id]);
```

3. Memoized Selector
```js
const selectText = createSelector(
  (state, id) => state.todos,
  (state, id) => id,
  (todos, id) => todos[id],
);
```


*Made with [mrkdown.io](http://mrkdown.io)*
