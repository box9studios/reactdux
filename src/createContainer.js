import { connect } from 'react-redux';
import { compose } from 'redux';
import { getStore } from './utils';

export default function createContainer(mapToProps, wrappers, component) {
  const toProps = typeof mapToProps === 'function'
    ? mapToProps
    : () => mapToProps;
  const mapStateToProps = (state, ownProps) => {
    const result = toProps(ownProps, getStore())
    const copy = { ...result };
    for (const i in copy) {
      if (
        typeof copy[i] === 'function'
        && copy[i].__isReactduxSelector
      ) {
        copy[i] = copy[i]();
      }
    }
    return copy;
  };
  const mapDispatchToProps = () => ({});
  return compose(
    ...(component ? wrappers : []),
    connect(mapStateToProps, mapDispatchToProps),
  )(component || wrappers);
}