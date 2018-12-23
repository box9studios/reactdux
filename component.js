import { PureComponent } from 'react';
import { copy } from './utils';

const defaultRender = () => null;

const getCalculatedState = (stater, props) => {
  if (typeof stater === 'function') {
    return stater(props);
  }
  return stater;
};

const getConfig = config => {
  if (typeof config === 'function') {
    return {
      defaultProps: {},
      defaultState: {},
      other: {
        render: config,
      },
    };
  }
  const {
    props: defaultProps,
    state: defaultState,
    ...other
  } = config;
  return {
    defaultProps: defaultProps || {},
    defaultState: defaultState || {},
    other,
  };
};

const isEqualState = (baseState, changes) => {
  for (const key in changes) {
    if (changes[key] !== baseState[key]) {
      return false;
    }
  }
  return true;
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
  const { defaultProps, defaultState, other } = getConfig(config);
  const ReactduxComponent = class extends ReactduxBaseComponent {
    constructor(props) {
      super(props);
      this.state = getCalculatedState(defaultState, this.props);
      Object.entries(other).forEach(([key, value]) => {
        if (key === 'constructor') {
          value.call(this, props);
        } else if (key === 'componentDidMount') {
          this.componentDidMount = value.bind(this);
        } else if (key === 'componentDidUpdate') {
          this.componentDidUpdate = value.bind(this);
        } else if (key === 'componentWillUnmount') {
          this.componentWillUnmount = value.bind(this);
        } else if (key === 'initialize') {
          value.call(this, { ...this.props, ...this.state });
        } else if (key === 'mount') {
          this.componentDidMount = () =>
            value.call(this, { ...this.props, ...this.state });
        } else if (key === 'unmount') {
          this.componentWillUnmount = () =>
            value.call(this, { ...this.props, ...this.state });
        } else if (key === 'update') {
          this.componentDidUpdate = (prevProps, prevState) => value.call(
            this,
            { ...this.props, ...this.state },
            { ...prevProps, ...prevState },
          );
        } else if (key !== 'props' && key !== 'state') {
          if (typeof value === 'function') {
            if (key === 'render') {
              this[key] = () => {
                const result = value.call(
                  this,
                  {
                    ...this.props,
                    ...this.state,
                  },
                  (...args) => this.setState(...args),
                );
                if (result === undefined) {
                  return null;
                }
                return result;
              };
            } else {
              this[key] = (...args) => value.call(this, ...args);
            }
          } else {
            this[key] = copy(value);
          }
        }
      });
      if (!this.render) {
        this.render = defaultRender;
      }
    }
  };
  ReactduxComponent.defaultProps = defaultProps;
  ReactduxComponent.displayName = 'AnonymousComponent';
  return ReactduxComponent;
};