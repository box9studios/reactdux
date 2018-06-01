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
const setText = createAction(); // setText('Joe', 'Goodbye World');
```
```js
const setJoeText = createAction(text => ({ name: 'Joe', text }));
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

```js
const selectText = createSelector('key');
```
```js
const selectText = createSelector('path', 'to', 'key');
```
```js
const selectText = createSelector(state => state.text);
```
```js
const selectText = createSelector((state, id) => state.data[id]);
```



*Made with [mrkdown.io](http://mrkdown.io)*
