import React, { createContext, useState } from 'react';

const isNonNullObject = value => value !== null && typeof value === 'object';

export default (defaultState = null, actionConfig = {}) => {
  const Context = createContext();
  const Consumer = Context.Consumer;
  const Provider = ({ children }) => {
    const [state, setState] = useState(defaultState);
    const stateTool = (...args) => setState(...args);
    if (isNonNullObject(state)) {
      Object.entries(state).forEach(([key, value]) => stateTool[key] = value);
    }
    const actions = Object.entries(actionConfig).reduce(
      (result, [name, method]) => ({
        ...result,
        [name]: (...args) => {
          const result = method(stateTool, ...args);
          if (result !== undefined) {
            stateTool(result);
          }
        },
      }),
      {},
    );
    const value = isNonNullObject(state) ? { ...state, ...actions } : state;
    return (
      <Context.Provider value={value}>
        {children}
      </Context.Provider>
    );
  };
  return { Context, Consumer, Provider };
};