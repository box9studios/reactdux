import { PureComponent } from 'react';

export default config =>
  class extends PureComponent {
    constructor(props) {
      super({
        ...(config.props || {}),
        ...props,
      });
      this.state = config.state || {};
      Object.entries(config).forEach(([key, value]) => {
        if (
          key === 'state'
          || key === 'props'
          || key === 'constructor'
          || key === 'componentWillMount'
          || key === 'componentWillUnmount'
          || key === 'componentWillUpdate'
        ) {
          return;
        }
        if (typeof value === 'function') {
          this[key] = (...args) => value.apply(this, args);
          return;
        }
        this[key] = value;
      });
      this.componentDidMount = config.onMount || (() => {});
      this.componentWillUnmount = config.onUnmount || (() => {});
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
    }
  };