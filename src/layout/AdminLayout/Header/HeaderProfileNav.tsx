import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faGear, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PropsWithChildren } from 'react';
import { Dropdown, Nav, NavItem } from 'react-bootstrap';
import { ROUTES } from 'src/utils/app-routes';

type NavItemProps = {
  icon: IconDefinition;
} & PropsWithChildren;

const ProfileDropdownItem = (props: NavItemProps) => {
  const { icon, children } = props;

  return (
    <>
      <FontAwesomeIcon className="me-2" icon={icon} fixedWidth />
      {children}
    </>
  );
};

export default function HeaderProfileNav() {
  const router = useRouter();
  const handleLogout = () => {
    signOut();
    setTimeout(() => {
      router.push(ROUTES.AUTH);
    }, 300);
  };
  return (
    <Nav>
      <Dropdown as={NavItem}>
        <Dropdown.Toggle
          variant="link"
          bsPrefix="shadow-none"
          className="py-0 px-2 rounded-0"
          id="dropdown-profile">
          <div className="avatarGear ">
            <FontAwesomeIcon icon={faGear} size="lg" />
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className="pt-0">
          <Dropdown.Header className="bg-light fw-bold">Settings</Dropdown.Header>
          <Link href="/" passHref legacyBehavior>
            <Dropdown.Item>
              <ProfileDropdownItem icon={faUser}>Profile</ProfileDropdownItem>
            </Dropdown.Item>
          </Link>
          <Link href="/" passHref legacyBehavior>
            <Dropdown.Item>
              <ProfileDropdownItem icon={faGear}>Settings</ProfileDropdownItem>
            </Dropdown.Item>
          </Link>
          <Dropdown.Divider />

          <Dropdown.Item onClick={handleLogout}>
            <ProfileDropdownItem icon={faPowerOff}>Logout</ProfileDropdownItem>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Nav>
  );
}
