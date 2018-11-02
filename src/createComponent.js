import { PureComponent } from 'react';

const translateArgs = (...args) => {
  if (args.length === 1) {
    if (typeof args[0] === 'function') {
      return { other: args[0] };
    }
    const {
      props: defaultProps,
      state: defaultState,
      mount,
      should,
      unmount,
      update,
      ...other
    } = args[0];
    return {
      defaultProps,
      defaultState,
      lifecycleHooks: {
        mount,
        should,
        unmount,
        update,
      },
      other,
    };
  }
  if (args.length === 2) {
    return {
      lifecycleHooks: args[0],
      other: args[1],
    };
  }
  if (args.length === 3) {
    return {
      defaultProps: args[0],
      defaultState: args[1],
      other: args[2],
    };
  }
  return {
    defaultProps: args[0],
    defaultState: args[1],
    lifecycleHooks: args[2],
    other: args[3],
  };
};

export default (...args) => {
  const {
    defaultProps = {},
    defaultState = {},
    lifecycleHooks = {},
    other = {},
  } = translateArgs(...args);
  return class extends PureComponent {
    constructor(props) {
      super({
        ...(defaultProps || {}),
        ...props,
      });
      this.state = { ...(defaultState || {}) };
      this.setState = (changes = {}) => {
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
        super.setState(changes);
      };
      Object.entries(lifecycleHooks)
        .filter(([key, value]) => !!value)
        .forEach(([key, value]) => {
          switch (key) {
            case 'mount':
              this.componentDidMount = value.bind(this);
              break;
            case 'should':
              this.componentShouldUpdate = value.bind(this);
            case 'unmount':
              this.componentWillUnmount = value.bind(this);
            case 'update':
              this.componentDidUpdate = value.bind(this);
          }
        });
      if (typeof other === 'function') {
        this.render = () => other(this.props);
      } else {
        Object.entries(other).forEach(([key, value]) => {
          if (
            key === 'state'
            || key === 'props'
            || key === 'constructor'
            || key === 'componentWillMount'
            || key === 'componentWillUpdate'
            || key === 'componentShouldUpdate'
            || key === 'componentWillUnmount'
          ) {
            return;
          }
          if (typeof value === 'function') {
            this[key] = (...args) => value.apply(this, args);
            return;
          }
          this[key] = value;
        });
      }
      if (!this.render) {
        this.render = () => null;
      }
    }
  };
};