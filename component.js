import { Component } from 'react';
import createContainer from './container';
import { copy, isEqual } from './utils';

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

const getDetails = (config = {}) => {
  if (typeof config === 'function') {
    return { render: config };
  }
  return config;
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

class ReactduxBaseComponent extends Component {

  data = {};
  state = {};
  _dataSetters = {};
  _methodSetters = {};
  _stateSetters = {};

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
    const callback = b ? () => b(this.state) : undefined;
    if (typeof a === 'function') {
      super.setState(a, callback);
    } else if (!isEqualState(this.state, a)) {
      super.setState(a, callback);
    }
  }
}

export default config => {
  const details = getDetails(config);

  const component = class ReactduxComponent extends ReactduxBaseComponent {

    constructor(initialProps) {
      const { data, init, props, render, state, ...rest } = details;
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

    componentDidMount = () => {
      const { componentDidMount, mount } = details;
      if (componentDidMount) {
        componentDidMount();
      }
      if (mount) {
        mount.call(this, { ...this.props, ...this.state });
      }
    };


    componentWillUnmount = () => {
      const { componentWillUnmount, unmount } = details;
      if (componentWillUnmount) {
        componentWillUnmount();
      }
      if (unmount) {
        unmount.call(this, { ...this.props, ...this.state });
      }
    };

    componentDidUpdate = (prevProps, prevState = {}) => {
      const { componentDidUpdate, state, update } = details;
      if (componentDidUpdate) {
        componentDidUpdate(prevProps, prevState);
      }
      if (update) {
        update.call(
          this,
          { ...this.props, ...this.state },
          { ...prevProps, ...prevState },
        );
      }
    };

    shouldComponentUpdate = (nextProps, nextState) => {
      const { should, shouldComponentUpdate }  = details;
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
    };

    render = () => {
      const { render } = details;
      if (!render) {
        return null;
      }
      const result = render.call(
        this,
        { ...this.props, ...this.state },
        {
          setData: this.setData.bind(this),
          setMethod: this.setMethod.bind(this),
          setState: this.setState.bind(this),
        },
      );
      if (result === undefined) {
        return null;
      }
      return result;
    };
  };

  component.defaultProps = details.props;

  return wrapComponent(component, details.container);
};