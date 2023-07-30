

import { faCircleHalfStroke, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useContext } from 'react';
import { darkModeContext } from '../../context/DarkModeContext.jsx';


const DarkModeToggle = () => {
  const {toggleDarkMode, darkMode, setDarkMode} = useContext(darkModeContext)
  useEffect(() => {
    const isDark  = localStorage.getItem('dark') === 'true';
    setDarkMode(isDark);
  }, []);

  return (
    <button onClick={toggleDarkMode} className='btn header-nav ms-4 dark_mode p-1 rounded-circle px-2'>
      {darkMode ? <FontAwesomeIcon icon={faCircleHalfStroke}  className='text-light'/> : <FontAwesomeIcon icon={faLightbulb} />}
    </button>
  );
};

export default DarkModeToggle;