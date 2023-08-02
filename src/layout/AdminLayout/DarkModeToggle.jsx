import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { useContext, useEffect } from 'react';
import { darkModeContext } from '../../context/DarkModeContext.jsx';

const DarkModeToggle = () => {
  const { toggleDarkMode, darkMode, setDarkMode } = useContext(darkModeContext);
  useEffect(() => {
    const isDark = localStorage.getItem('dark') === 'true';
    setDarkMode(isDark);
  }, []);

  return (
    <button
      onClick={toggleDarkMode}
      className="btn darkmode-btn header-nav ms-4 dark_mode p-1 rounded-circle px-2">
      <style jsx>{`
        .darkmode-btn {
          position: relative;
          z-index: 999;
          width: 40px;
          height: 40px;
          border: none;
          outline: none;
          cursor: pointer;
          transition: all 0.3s ease-in-out;
          padding: 5px;
          transition: all 0.3s ease-in-out;
          background: linear-gradient(
            60deg,
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 255, 1) 20%,
            rgba(0, 0, 0, 1) 100%
          );
          background-clip: padding-box;
          background-size: 200% 100%;
          background-position: 100% 0;
          color: #fff;
        }
        :global(.dark) .darkmode-btn {
          background: linear-gradient(
            60deg,
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 1) 20%,
            rgba(255, 255, 255, 1) 100%
          );

          color: #000;
        }
      `}</style>
      <FontAwesomeIcon
        icon={darkMode ? faMoon : faSun}
        className={
          'animate-icon' +
          clsx({
            'text-light': darkMode,
            'text-dark': !darkMode,
          })
        }
      />
    </button>
  );
};

export default DarkModeToggle;
