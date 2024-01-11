import React, { useContext } from "react";

const ListContext = React.createContext();

const ListProvider = ({ children }) => {
  return <ListContext.Provider value={{}}>{children}</ListContext.Provider>;
};

export const useListContext = () => {
  return useContext(ListContext);
};

export { ListContext, ListProvider };
