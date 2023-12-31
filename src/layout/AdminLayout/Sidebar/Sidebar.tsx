import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState, useContext } from 'react';
import classNames from 'classnames';
import { Button } from 'react-bootstrap';
import { SidebarNav, OwnerSidebarNav } from './SidebarNav';

/*MOHAMMED MAHER */
import { darkModeContext } from '../../../context/DarkModeContext';

export default function Sidebar(props: {
  isShow: boolean;
  isShowMd: boolean;
  isOwner: boolean;
  shopId: number;
}) {
  const { isShow, isShowMd, isOwner, shopId } = props;
  const [isNarrow, setIsNarrow] = useState(false);

  const { darkMode } = useContext(darkModeContext);

  const toggleIsNarrow = () => {
    const newValue = !isNarrow;
    localStorage.setItem('isNarrow', newValue ? 'true' : 'false');
    setIsNarrow(newValue);
  };

  // On first time load only
  useEffect(() => {
    if (localStorage.getItem('isNarrow')) {
      setIsNarrow(localStorage.getItem('isNarrow') === 'true');
    }
  }, [setIsNarrow]);

  return (
    <div
      className={classNames(
        `sidebar d-flex flex-column position-fixed h-100 ${
          darkMode ? 'dark-mode-body' : 'light-mode-body'
        }`,
        {
          'sidebar-narrow': isNarrow,
          show: isShow,
          'md-hide': !isShowMd,
        }
      )}
      id="sidebar">
      <div className="sidebar-brand d-none d-md-flex align-items-center justify-content-center bg-light mb-4 w-50 h-75 text-center shadow-sm mb-3 m-auto">
        <img src={'/images/poslix-sm.png'} className={'logo-css-small'} />
        <img src={'/images/logo1.png'} className={'logo-css-big'} />
      </div>

      <div className="sidebar-nav flex-fill">
        {isOwner ? <OwnerSidebarNav /> : <SidebarNav shopId={shopId} />}
      </div>

      <Button
        variant="link"
        className="sidebar-toggler d-none d-md-inline-block rounded-0 text-end pe-4 fw-bold shadow-none"
        onClick={toggleIsNarrow}
        type="button"
        aria-label="sidebar toggler">
        <FontAwesomeIcon className="sidebar-toggler-chevron" icon={faAngleLeft} fontSize={24} />
      </Button>
    </div>
  );
}

export const SidebarOverlay = (props: { isShowSidebar: boolean; toggleSidebar: () => void }) => {
  const { isShowSidebar, toggleSidebar } = props;

  return (
    <div
      tabIndex={-1}
      aria-hidden
      className={classNames('sidebar-overlay position-fixed top-0 bg-dark w-100 h-100 opacity-50', {
        'd-none': !isShowSidebar,
      })}
      onClick={toggleSidebar}
    />
  );
};
