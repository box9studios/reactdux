import React, { Component } from 'react';
import createContainer from './container';
import { copy, isEqual } from './utils';

const createStyledComponent = (Component, styles) => props => {
  const applyStyle = typeof styles === 'function'
    ? styles(props)
    : styles;
  return (
    <Component
      {...props}
      style={{
        ...applyStyle,
        ...props.style,
      }}
    />
  );
};

const getCalculatedState = (stater, props, state) => {
  if (typeof stater === 'function') {
    return stater({ ...props, ...state }, !state);
  }
  if (stater && typeof stater === 'object') {
    return stater;
  }
  return {};
};

const getChanges = (a, b) => {
  const keys = [];
  const combined = { ...a, ...b };
  for (const key in combined) {
    if (
      combined[key] !== a[key]
      || combined[key] !== b[key]
    ) {
      keys.push({
        key,
        next: b[key],
        prev: a[key],
      });
    }
  }
  return keys;
};

const getConfig = (a, b) => {
  if (b) {
    if (typeof b === 'function') {
      return {
        container: a,
        render: b,
      };
    }
    return {
      container: a,
      ...b,
    };
  }
  if (typeof a === 'function') {
    return { render: a };
  }
  return a;
};

const getSetter = (method, obj, key, value) => {
  const id = JSON.stringify({ key, value });
  if (!obj[id]) {
    if (value === undefined) {
      obj[id] = innerValue => method({ [key]: innerValue });
    } else {
      obj[id] = () => method({ [key]: value });
    }
  };
  return obj[id];
};

const isEqualState = (state, changes) => {
  for (const key in changes) {
    if (changes[key] !== state[key]) {
      return false;
    }
  }
  return true;
};

const wrapComponent = (component, providers) => {
  if (!providers) {
    return component;
  }
  return createContainer(
    ...(providers.constructor === Array ? providers : [providers]),
    component,
  );
};

class Base extends Component {
  data = {};
  state = {};
  _dataSetters = {};
  _methodSetters = {};
  _stateSetters = {};
  _unmounted = false;
  componentWillUnmount() {
    this._unmounted = true;
  }
  setData(a, b) {
    if (typeof a === 'string') {
      return getSetter(this.setData.bind(this), this._dataSetters, a, b);
    }
    this.data = {
      ...this.data,
      ...(typeof a === 'function' ? a(this.data) : a),
    };
    if (b) {
      b(this.data);
    }
  }
  setMethod(...args) {
    const memoizers = args.length === 1
      ? [`${args[0]}`]
      : args.slice(0, -1);
    const method = args[args.length - 1];
    const key = `${method}`;
    if (
      !this._methodSetters[key] ||
      !isEqual(this._methodSetters[key].memoizers, memoizers)
    ) {
      this._methodSetters[key] = { memoizers, method };
    }
    return this._methodSetters[key].method;
  }
  setState(a, b) {
    if (typeof a === 'string') {
      return getSetter(this.setState.bind(this), this._stateSetters, a, b);
    }
    if (this._unmounted) {
      return;
    }
    const callback = b ? () => b(this.state) : undefined;
    if (typeof a === 'function') {
      super.setState(
        state => {
          const changes = a(state);
          if (!isEqualState(state, change)) {
            return changes;
          }
          return {};
        },
        callback,
      );
    } else if (!isEqualState(this.state, a)) {
      super.setState(a, callback);
    }
  }
}

export default (a, b) => {
  if (b && typeof a === 'function' && a.render) {
    return createStyledComponent(a, b);
  }
  const config = getConfig(a, b);
  const component = class extends Base {
    constructor(initialProps) {
      const { data, init, props, render, state, ...rest } = config;
      super(initialProps);
      if (data !== undefined) {
        this.data = copy(data);
      }
      this.state = getCalculatedState(state, this.props);
      Object.entries(rest).forEach(([key, value]) => {
        if (typeof value === 'function') {
          this[key] = value.bind(this);
        } else {
          this[key] = copy(value);
        }
      });
      if (init) {
        init.call(
          this,
          { ...this.props, ...this.state },
        );
      }
    }
    componentDidMount() {
      const { componentDidMount, mount } = config;
      if (componentDidMount) {
        componentDidMount();
      }
      if (mount) {
        mount.call(this, { ...this.props, ...this.state });
      }
    }
    componentWillUnmount() {
      Base.prototype.componentWillUnmount.call(this);
      const { componentWillUnmount, unmount } = config;
      if (componentWillUnmount) {
        componentWillUnmount();
      }
      if (unmount) {
        unmount.call(this, { ...this.props, ...this.state });
      }
    }
    componentDidUpdate(prevProps, prevState) {
      const { componentDidUpdate, state, update } = config;
      if (componentDidUpdate) {
        componentDidUpdate(prevProps, prevState);
      }
      if (update) {
        const prevPropsState = { ...prevProps, ...prevState };
        update.call(
          this,
          prevPropsState,
          {
            getChanges: () => getChanges(
              prevPropsState,
              { ...this.props, ...this.state },
            ),
            isEqual,
          },
        );
      }
    }
    shouldComponentUpdate(nextProps, nextState) {
      const { should, shouldComponentUpdate }  = config;
      if (shouldComponentUpdate) {
        const r1 = shouldComponentUpdate(nextProps, nextState);
        if (r1 !== undefined) {
          return !!r1;
        }
      }
      if (should) {
        const prevPropsState = { ...this.props, ...this.state };
        const nextPropsState = { ...nextProps, ...nextState };
        const r2 = should(
          prevPropsState,
          nextPropsState,
          {
            getChanges: () => getChanges(prevPropsState, nextPropsState),
            isEqual,
          },
        );
        if (r2 !== undefined) {
          return !!r2;
        }
      }
      return !isEqual(this.props, nextProps)
        || !isEqual(this.state, nextState);
    }
    render() {
      const { render } = config;
      if (!render) {
        return null;
      }
      const result = render.call(
        this,
        { ...this.props, ...this.state },
        this.setState.bind(this),
      );
      if (result === undefined) {
        return null;
      }
      return result;
    }
  };
  component.defaultProps = config.props;
  return wrapComponent(component, config.container);
};