import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, ButtonGroup } from 'react-bootstrap';

export default function LocationRow({ location, locations, businessId }) {
  const router = useRouter();

  return (
    <tr key={location.location_id}>
      <th scope="row"></th>
      <td>{location.location_name}</td>
      <td className="text-center">. . .</td>

      <td>
        <ButtonGroup className="mb-2 m-buttons-style">
          <Link href={`/shop/${location.location_id}/products`}>
            <Button
              onClick={() => {
                localStorage.setItem('businessId', businessId);
                localStorage.setItem('locations', JSON.stringify(locations));
              }}>
              <FontAwesomeIcon icon={faFolderOpen} />
            </Button>
          </Link>
        </ButtonGroup>
      </td>
    </tr>
  );
}
