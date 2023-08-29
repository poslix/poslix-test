import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OwnerAdminLayout } from '@layout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Card } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import AddBusinessLocationView from 'src/modules/business/add-location/add-location-view';

export default function AddBusinessLocation({ username, busniessType }: any) {
  const router = useRouter();
  const businessId = router.query.id as string;

  return (
    <OwnerAdminLayout>
      <div className="row">
        <div className="col-md-12">
          <Link href={`/${username}/business`} className="btn btn-primary p-3 mb-3">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to list{' '}
          </Link>
          <Card>
            <Card.Header className="p-3 bg-white">
              <h5>Add New Location</h5>
            </Card.Header>
            <Card.Body>
              <AddBusinessLocationView businessId={businessId} />
            </Card.Body>
          </Card>
        </div>
      </div>
      <ToastContainer />
    </OwnerAdminLayout>
  );
}
