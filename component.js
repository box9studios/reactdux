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
  _stateSetters = {};

  getState(key) {
    return copy(this.state[key]);
  }

  setState(a, b, c) {
    if (typeof a === 'string') {
      const id = JSON.stringify({ a, b });
      if (!this._stateSetters[id]) {
        if (b === undefined) {
          this._stateSetters[id] = value =>
            this.setState({ [a]: value });
        } else {
          this._stateSetters[id] = () =>
            this.setState({ [a]: b });
        }
      };
      return this._stateSetters[id];
    }
    if (typeof a === 'function') {
      this.setState(a(this.state), b);
    } else if (!isEqualState(this.state, a)) {
      const callback = b ? () => b(this.state) : undefined;
      super.setState(a, callback);
    }
  }

  get = this.getState;
  set = this.setState;
}

export default config => {
  const details = getDetails(config);

  const component = class ReactduxComponent extends ReactduxBaseComponent {

    constructor(initialProps) {
      const { init, props, render, state, ...rest } = details;
      super(initialProps);
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
        this.setState.bind(this),
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