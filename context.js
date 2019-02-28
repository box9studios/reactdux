import React, { createContext, useState } from 'react';

export default (
  defaultState = {},
  actionsCreator = () => {},
) => {
  const setStateQueue = [];
  const Context = createContext();
  const Consumer = Context.Consumer;
  const Provider = ({ children }) => {
    const [state, setState] = useState(defaultState);
    const [rand, setRand] = useState(0);
    const actions = actionsCreator(
      state,
      (changes = {}) => setState({ ...state, ...changes }),
      (method, ...args) => {
        setStateQueue.push(`${method}`);
        setRand(rand + 1);
      },
    );
    if (setStateQueue.length) {
      while (setStateQueue.length) {
        const methodStr = setStateQueue.shift();
        Object.entries(actions).forEach(([key, value]) => {
          if (`${value}` === methodStr) {
            value();
          }
        });
      }
    }
    const value = (() => {
      try {
        return { ...state, ...actions };
      } catch (error) {
        return state;
      }
    })();
    return (
      <Context.Provider value={value}>
        {children}
      </Context.Provider>
    );
  };
  return { Context, Consumer, Provider };
};