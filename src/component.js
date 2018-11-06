import { PureComponent } from 'react';

const noop = () => {};

const translateConfig = ({
  props,
  state,
  lifecycle,
  ...other
}) => ({
  defaultProps: props || {},
  defaultState: typeof state === 'function' ? state : () => state,
  lifecycleHooks: {
    init: (lifecycle || {}).init || noop,
    mount: (lifecycle || {}).mount || noop,
    unmount: (lifecycle || {}).unmount || noop,
    update: (lifecycle || {}).update || noop,
  },
  other,
});

export default config => {
  const {
    defaultProps,
    defaultState,
    lifecycleHooks,
    other,
  } = translateConfig(config);
  return class extends PureComponent {
    constructor(props) {
      const initialProps = { ...defaultProps, ...props };
      super(initialProps);
      this.state = { ...defaultState(initialProps) };
      const stateSetters = {};
      this.setState = (...args) => {
        if (!args.length) {
          return;
        }
        if (typeof args[0] === 'string') {
          const key = args[0];
          if (!stateSetters[key]) {
            stateSetters[key] = value => super.setState({ [key]: value });
          };
          return stateSetters[key];
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
      };
      const refSetters = {};
      this.refs = {};
      this.setRef = (name, callback = noop) => {
        if (!refSetters[name]) {
          refSetters[name] = ref => {
            this.refs[name] = ref;
            callback(ref);
          };
        };
        return refSetters[name];
      };
      this.getRef = (name, callback = noop) => {
        const ref = this.refs[name];
        if (ref) {
          callback(ref);
        }
        return ref;
      };
      Object.entries(lifecycleHooks)
        .forEach(([key, value]) => {
          switch (key) {
            case 'init':
              value(initialProps);
              break;
            case 'mount':
              this.componentDidMount = value.bind(this);
              break;
            case 'unmount':
              this.componentWillUnmount = value.bind(this);
            case 'update':
              this.componentDidUpdate = value.bind(this);
          }
        });
      if (typeof other === 'function') {
        this.render = () => {
          const result = other(this.props);
          return result === undefined ? null : result;
        };
      } else {
        Object.entries(other).forEach(([key, value]) => {
          if (
            key === 'state'
            || key === 'props'
            || key === 'lifecycle'
          ) {
            return;
          }
          if (typeof value === 'function') {
            this[key] = (...args) => value.apply(this, args);
            return;
          }
          this[key] = value;
        });
        if (!this.render) {
          this.render = () => null;
        }
      }
    }
  };
};