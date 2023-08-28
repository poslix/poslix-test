import { faGear, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { useUser } from 'src/context/UserContext';
import LocationRow from './location-row';

export default function BusinessRow({ business }) {
  const { user } = useUser();
  const router = useRouter();

  const username = user?.username;

  return (
    <Fragment>
      <tr style={{ background: '#e4edec' }}>
        <th scope="row">{business.id}</th>

        <td>{business.name}</td>
        <td className="text-center">{business.type}</td>
        <td>
          <ButtonGroup className="mb-2 m-buttons-style">
            <Button
              onClick={() => {
                router.push(`/${username}/business/${business.id}/settings`);
              }}>
              <FontAwesomeIcon icon={faGear} />
            </Button>
            <Button
              onClick={() => {
                router.push(`/${username}/business/${business.id}/add`);
              }}>
              <FontAwesomeIcon icon={faPlus} /> Add New Location
            </Button>
          </ButtonGroup>
        </td>
      </tr>
      {business.locations.map((location) => (
        <LocationRow key={location.location_id} location={location} locations={business.locations} businessId={business.id} />
      ))}
    </Fragment>
  );
}
