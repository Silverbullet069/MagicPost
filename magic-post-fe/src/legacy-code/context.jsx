import React, {
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

const AppContext = React.createContext();

export const getSessionStorage = (key) => {
  const item = sessionStorage.getItem(key);
  if (item) {
    return JSON.parse(item);
  } else {
    return null;
  }
};

export const setSessionStorage = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  /* if user has't registered, this will return null */
  /* if user has registered, and page get refreshed, this will return the user */
  const fetchUser = useCallback(async () => {
    try {
      console.log("from context"); // debug

      const url = SERVER_URL + "/api/auth/user";
      const options = {
        method: "GET",
        credentials: "include", // ! very important, don't forget
      };

      const res = await fetch(url, options);

      const json = await res.json();

      setUser(json["data"]["user"]);

      return json["data"]["user"];
    } catch (err) {
      setUser(null);
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AppContext.Provider
      value={{
        loading,
        setLoading,
        user,
        setUser,
        fetchUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// make sure use
export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppContext, AppProvider };

// const ListContext = React.createContext();

// const ListProvider = ({ children }) => {
//   return (
//     <ListContext.Provider
//       value={{
//         setItemList,
//         setDisplayItemList,
//       }}
//     >
//       {children}
//     </ListContext.Provider>
//   );
// };

// export const useListContext = () => {
//   return useContext(ListContext);
// };

// export { ListContext, ListProvider };
