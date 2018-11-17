import { PureComponent } from 'react';

const noop = () => {};

const getConfig = config => {
  if (typeof config === 'function') {
    return {
      other: {
        render: config,
      },
    };
  }
  const {
    props: defaultProps,
    state: defaultState,
    lifecycle: lifecycleHooks,
    ...other
  } = config;
  return {
    defaultProps,
    defaultState,
    lifecycleHooks,
    other,
  };
};

const getInitialState = (defaultState = {}, props = {}) => {
  if (typeof defaultState === 'function') {
    return defaultState(props);
  }
  return defaultState;
};

class SuperComponent extends PureComponent {

  constructor(props) {
    super(props);
    this._refLookup = {};
    this._refSetters = {};
    this._stateSetters = {};
  }

  getRef(name, callback) {
    const ref = this._refLookup[name];
    if (ref) {
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
        if (callback) {
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
    let hasChanges = false;
    for (const key in changes) {
      if (changes[key] !== this.state[key]) {
        hasChanges = true;
        break;
      }
    }
    if (!hasChanges) {
      return;
    }
    super.setState(...args);
  }
}

export default config => {
  const {
    defaultProps = {},
    defaultState = {},
    lifecycleHooks = {},
    other,
  } = getConfig(config);
  const componentClass = class extends SuperComponent {
    constructor(props) {
      super(props);
      this.state = getInitialState(defaultState, this.props);
      Object.entries(lifecycleHooks).forEach(([key, value]) => {
        switch (key) {
          case 'constructor':
          case 'init':
          case 'run':
            value(this.props);
            break;
          case 'add':
          case 'attach':
          case 'append':
          case 'before':
          case 'componentDidMount':
          case 'mount':
            this.componentDidMount = value.bind(this);
            break;
          case 'after':
          case 'componentWillUnmount':
          case 'detach':
          case 'remove':
          case 'unmount':
            this.componentWillUnmount = value.bind(this);
          case 'componentDidUpdate':
          case 'update':
            this.componentDidUpdate = value.bind(this);
        }
      });
      Object.entries(other).forEach(([key, value]) => {
        if (
          key === 'state'
          || key === 'props'
          || key === 'lifecycle'
        ) {
          return;
        }
        if (typeof value === 'function') {
          if (key === 'render') {
            this[key] = () => {
              const result = value.call(this, {
                ...this.props,
                getState: this.getState.bind(this),
                setState: this.setState.bind(this),
              });
              if (result === undefined) {
                return null;
              }
              return result;
            }
            return;
          }
          this[key] = (...args) => value.call(this, ...args);
          return;
        }
        this[key] = value;
      });
      if (!this.render) {
        this.render = () => null;
      }
    }
  };
  componentClass.defaultProps = defaultProps;
  return componentClass;
};