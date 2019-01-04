import { PureComponent } from 'react';
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

const isEqualState = (baseState, changes) => {
  for (const key in changes) {
    if (changes[key] !== baseState[key]) {
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

class ReactduxBaseComponent extends PureComponent {

  state = {};
  _refLookup = {};
  _refSetters = {};
  _stateSetters = {};

  getRef(name, callback) {
    const ref = this._refLookup[name];
    if (ref && callback) {
      callback(ref);
    }
    return ref;
  }

  getState(key) {
    return this.state[key];
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

  setState(...args) {
    if (typeof args[0] === 'string') {
      const [key, setter] = args;
      const setterKey = JSON.stringify({ key, setter });
      if (!this._stateSetters[setterKey]) {
        this._stateSetters[setterKey] = setter === undefined
          ? value => this.setState({ [key]: value })
          : () => this.setState({ [key]: setter });
      };
      return this._stateSetters[setterKey];
    }
    const changes = args[0];
    if (!isEqualState(this.state, changes)) {
      super.setState(...args);
    }
  }

  get(...args) {
    this.getState(...args);
  }

  set(...args) {
    this.setState(...args);
  }
}

export default config => {
  const details = getDetails(config);

  const component = class ReactduxComponent extends ReactduxBaseComponent {

    constructor(initialProps) {
      super(initialProps);
      const {
        container,
        mount,
        props,
        render,
        setup,
        state,
        unmount,
        update,
        ...rest
      } = details;
      this.state = getCalculatedState(state, this.props);
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