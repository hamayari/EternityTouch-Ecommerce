import React, { createContext, useReducer } from 'react';
import reducer, { initialState } from '../store/reducer';

const ConfigContext = createContext({
  state: initialState,
  dispatch: () => {}
});

export const ConfigProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <ConfigContext.Provider value={{ state, dispatch }}>
      {children}
    </ConfigContext.Provider>
  );
};

export { ConfigContext };
export default ConfigContext;
