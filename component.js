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
  _refLookup = {};
  _refSetters = {};
  _stateSetters = {};

  shouldComponentUpdate(nextProps, nextState) {
    if (
      !isEqual(this.props, nextProps)
      || !isEqual(this.state, nextState)
    ) {
      this.data = {
        ...this.data,
        ...nextProps,
        ...nextState,
      };
      return true;
    }
    return false;
  };

  getRef(name, callback) {
    const ref = this._refLookup[name];
    if (ref && callback) {
      callback(ref);
    }
    return ref;
  }

  getState(key) {
    return copy(this.state[key]);
  }

  setRef(name, callback) {
    if (!this._refSetters[name]) {
      this._refSetters[name] = ref => {
        this._refLookup[name] = ref;
        if (ref && callback) {
          callback(ref);
        }
      };
    };
    return this._refSetters[name];
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
      const {
        container,
        data,
        mount,
        props,
        render,
        setup,
        state,
        unmount,
        update,
        ...rest
      } = details;
      super(initialProps);
      this.state = getCalculatedState(state, this.props);
      this.data = {
        ...data,
        ...this.props,
        ...this.state,
      };
      Object.entries(rest).forEach(([key, value]) => {
        if (typeof value === 'function') {
          this[key] = value.bind(this);
        } else {
          this[key] = copy(value);
        }
      });
      if (setup) {
        setup.call(
          this,
          { ...this.props, ...this.state },
        );
      }
    }

    componentDidMount = () => {
      const { componentDidMount, mount } = details;
      if (componentDidMount) {
        componentDidMount.call(this);
      }
      if (mount) {
        mount.call(this, { ...this.props, ...this.state });
      }
    };


    componentWillUnmount = () => {
      const { componentWillUnmount, unmount } = details;
      if (componentWillUnmount) {
        componentWillUnmount.call(this);
      }
      if (unmount) {
        unmount.call(this, { ...this.props, ...this.state });
      }
    };

    componentDidUpdate = (prevProps, prevState = {}) => {
      const { componentDidUpdate, state, update } = details;
      if (componentDidUpdate) {
        componentDidUpdate.call(this, prevProps, prevState);
      }
      if (update) {
        update.call(
          this,
          { ...this.props, ...this.state },
          { ...prevProps, ...prevState },
        );
      }
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