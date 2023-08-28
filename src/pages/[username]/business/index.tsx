import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OwnerAdminLayout } from '@layout';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useContext } from 'react';
import { Card, Spinner, Table } from 'react-bootstrap';
import withAuth from 'src/HOCs/withAuth';
import { darkModeContext } from 'src/context/DarkModeContext';
import { useUser } from 'src/context/UserContext';
import BusinessRow from 'src/modules/business/business-list/business-row';
import { useBusinessList } from 'src/services';

const MyBusinessesPage = () => {
  const { darkMode } = useContext(darkModeContext);
  const { data: session } = useSession();

  const { user } = useUser();
  const { businessList, isLoading, error, refetch } = useBusinessList({
    suspense: !user.username,
  });
  const username = user?.username;

  return (
    <OwnerAdminLayout>
      <div className="row">
        <div className="col-md-12">
          <Link href={`/${username}/business/create`} className="btn btn-primary p-3 mb-3">
            <FontAwesomeIcon icon={faPlus} /> Add New Business{' '}
          </Link>
          <Card className={darkMode ? 'dark-mode-body' : ''}>
            <Card.Header
              className={`p-3 bg-white ${darkMode ? 'dark-mode-body' : 'light-mode-body'}`}>
              <h5>My Business</h5>
            </Card.Header>
            <Card.Body className={darkMode ? 'dark-mode-body rounded-3' : ''}>
              {businessList.length > 0 ? (
                <Table className="table table-hover rounded-3" responsive>
                  <thead className="thead-dark rounded-3">
                    <tr className={darkMode ? 'dark-mode-body rounded-3' : ''}>
                      <th style={{ width: '6%' }}>#</th>
                      <th>Name</th>
                      <th className="text-center">type</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businessList.map((business) => (
                      <BusinessRow key={business.id} business={business} />
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="d-flex justify-content-around">
                  <Spinner animation="grow" />
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </OwnerAdminLayout>
  );
};

export default withAuth(MyBusinessesPage);
