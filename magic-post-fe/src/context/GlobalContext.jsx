import React, {
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

import { SERVER_URL } from "../data";

const AppContext = React.createContext();

export const clearSessionStorage = () => {
  sessionStorage.clear();
};

export const getSessionStorage = (key) => {
  const item = sessionStorage.getItem(key);
  return item === "undefined" ? null : JSON.parse(item);
};

export const setSessionStorage = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(getSessionStorage("user") || null);

  /* if user has't registered, this will return null */
  /* if user has registered, and page get refreshed, this will return the user */
  const fetchUser = async () => {
    if (user) {
      return; // don't need to fetch again.
    }

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
      setSessionStorage("user", json["data"]["user"]);
    } catch (err) {
      setUser(null);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

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

export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppContext, AppProvider };
