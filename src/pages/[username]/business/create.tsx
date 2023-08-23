import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OwnerAdminLayout } from '@layout';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import { Card } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import CreateBusinessView from 'src/modules/business/create-business/create-business-view';
import { ROUTES } from 'src/utils/app-routes';

export default function CreateBusinessPage({ username }: any) {
  return (
    <OwnerAdminLayout>
      <div className="row">
        <div className="col-md-12">
          <Link href={'/' + username + '/business'} className="btn btn-primary p-3 mb-3">
            <FontAwesomeIcon icon={faArrowLeft} /> Back to list{' '}
          </Link>
          <Card>
            <Card.Header className="p-3 bg-white">
              <h5>Create Business </h5>
            </Card.Header>
            <Card.Body>
              <CreateBusinessView />
            </Card.Body>
          </Card>
        </div>
      </div>
      <ToastContainer />
    </OwnerAdminLayout>
  );
}

export async function getServerSideProps(context: any) {
  const session = await getSession({ req: context.req });
  if (!session) return { redirect: { permanent: false, destination: ROUTES.AUTH } };

  const username = session?.user?.username;

  return {
    props: { username },
  };
}
