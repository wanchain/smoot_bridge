import React, { useState, useEffect } from "react";

const LocalStorageContext = React.createContext(undefined);

LocalStorageContext.displayName = "LocalStorageContext";

const THEME_INITIAL_STATE = "light";

export const LocalStorageProvider = ({ children }) => {
  const [theme, setTheme] =
    useState(window.localStorage.theme || THEME_INITIAL_STATE);
  const [leftBarDirection, setLeftBarDirection] = useState('left');

  useEffect(() => {
    if (!!window.localStorage.theme) {
      setTheme(window.localStorage.theme);
    } else {
      setTheme(theme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!!window.localStorage.leftBarDirection) {
      setLeftBarDirection(window.localStorage.leftBarDirection);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.localStorage.setItem('leftBarDirection', leftBarDirection);
  }, [leftBarDirection]);

  return (
    <LocalStorageContext.Provider
      children={children}
      value={{
        theme,
        setTheme,
        leftBarDirection,
        setLeftBarDirection
      }}
    />
  );
};

export const useLocalStorage = () => {
  const context = React.useContext(LocalStorageContext);
  if (!context) {
    throw new Error("useLocalStorage必须在WalletProvider中使用");
  }
  return context;
};
