import Link from 'next/link'
import { useEffect, useState } from 'react';
import { Nav } from 'react-bootstrap'
import { getUsername } from 'src/libs/loginlib';

export default function HeaderFeaturedNav() {

  const [userLevel, setUserLevel] = useState('')
  const [fullname, setFullname] = useState('')
  const [path, setPath] = useState('')
  useEffect(() => {
    var _lv = localStorage.getItem('levels') || '';
    setFullname(localStorage.getItem('userfullname') || '');
    setUserLevel(_lv)
    setPath('/' + getUsername())
  }, [])
  return (
    <Nav>
      <Nav.Item>
        <Link href={path + '/business'} passHref legacyBehavior>
          {userLevel == 'owner' ? <Nav.Link className="p-2">My Businesses</Nav.Link> : ''}
        </Link>
      </Nav.Item>
    </Nav >
  )
}
