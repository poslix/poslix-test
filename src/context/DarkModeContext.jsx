/*MOHAMMED MAHER */

import { createContext, useState } from "react";

export const darkModeContext = createContext();

export const DarkModeProvider = (props) => {
  const [darkMode, setDarkMode] = useState(false);
  console.log(darkMode);
  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    localStorage.setItem("dark", isDark);
    const root = document.documentElement;
    root.classList.toggle("dark");
  };

  return (
    <darkModeContext.Provider value={{ toggleDarkMode, darkMode, setDarkMode }}>
      {props.children}
    </darkModeContext.Provider>
  );
};

/*MOHAMMED MAHER */
