import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faLanguage } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import Breadcrumb from '@layout/AdminLayout/Breadcrumb/Breadcrumb';
import HeaderFeaturedNav from '@layout/AdminLayout/Header/HeaderFeaturedNav';
import HeaderNotificationNav from '@layout/AdminLayout/Header/HeaderNotificationNav';
import HeaderProfileNav from '@layout/AdminLayout/Header/HeaderProfileNav';
import { Button, Container, Dropdown } from 'react-bootstrap';
import { useEffect, useState, useContext } from 'react';
import { RiEnglishInput } from 'react-icons/ri';
import { GiArabicDoor } from 'react-icons/gi';

/*MOHAMMED MAHER */
import DarkModeToggle from '../DarkModeToggle';
import { darkModeContext } from '../../../context/DarkModeContext';

type HeaderProps = {
  toggleSidebar: () => void;
  toggleSidebarMd: () => void;
};

export default function Header(props: HeaderProps) {
  const { toggleSidebar, toggleSidebarMd } = props;
  const [fullname, setFullname] = useState('');

  const { toggleDarkMode, darkMode, setDarkMode } = useContext(darkModeContext);

  useEffect(() => {
    setFullname(localStorage.getItem('userfullname') || '');
  }, []);
  return (
    <header
      className={`header sticky-top2 p-2 ${darkMode ? 'dark-mode-body ' : 'light-mode-body '}`}>
      <Container fluid className="header-navbar d-flex align-items-center">
        <Button
          variant="link"
          className="header-toggler d-md-none px-md-0 me-md-3 rounded-0 shadow-none"
          type="button"
          onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </Button>
        <Button
          variant="link"
          className="header-toggler d-none d-md-inline-block px-md-0 me-md-3 rounded-0 shadow-none"
          type="button"
          onClick={toggleSidebarMd}>
          <FontAwesomeIcon icon={faBars} />
        </Button>
        <Link href="/" className="header-brand d-md-none">
          sidebar-brand-full
        </Link>
        <div className="header-nav d-none d-md-flex">
          <HeaderFeaturedNav />
        </div>
        <Dropdown className="header-nav ms-auto">
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            {/* <FontAwesomeIcon icon={faEarthAmericas} /> */}
            <FontAwesomeIcon icon={faLanguage} />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item className="d-flex align-items-center" /*href="/action-1"*/>
              {/* <FontAwesomeIcon icon={faKaaba} /> */}
              <GiArabicDoor className="me-2" />
              Arabic
            </Dropdown.Item>
            {
              <Dropdown.Item className="d-flex align-items-center" /*href="/action-2"*/>
                <RiEnglishInput className="me-2" />
                English
              </Dropdown.Item>
            }
          </Dropdown.Menu>
        </Dropdown>
        <div className="ms-2">
          {/* <FontAwesomeIcon icon={faMoon} /> */}
          <DarkModeToggle />
        </div>
        <div className="header-nav ms-2">
          <div>Hi {fullname}</div>
        </div>
        <div className="header-nav ms-2">
          <HeaderProfileNav />
        </div>
      </Container>
    </header>
  );
}
