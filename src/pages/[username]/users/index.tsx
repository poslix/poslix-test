import { faArrowAltCircleLeft, faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OwnerAdminLayout } from '@layout';
import { userDashboard } from '@models/common-model';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, Spinner, Table } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import withAuth from 'src/HOCs/withAuth';
import AddNewUser from 'src/components/dashboard/AddNewUser';
import { apiFetchCtr } from 'src/libs/dbUtils';

const Locations = ({ username }: any) => {
  const [users, setUsers] = useState<userDashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUser, setIsAddUser] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  async function initDataPage() {
    const { success, newdata } = await apiFetchCtr({
      fetch: 'owner',
      subType: 'getUsersMyBusiness',
    });
    if (!success) {
      alert('error');
      return;
    }
    setUsers(newdata.myusers);
    setIsLoading(false);
  }
  useEffect(() => {
    initDataPage();
  }, []);

  return (
    <>
      <OwnerAdminLayout>
        <ToastContainer />
        <button
          className="mb-4 btn btn-primary p-3"
          style={{ width: '150px' }}
          onClick={() => {
            setSelectedId(0);
            setIsAddUser(!isAddUser);
          }}>
          <FontAwesomeIcon icon={!isAddUser ? faPlus : faArrowAltCircleLeft} />{' '}
          {!isAddUser ? 'Add User' : 'Back'}
        </button>
        {isAddUser && <AddNewUser setIsAddUser={setIsAddUser} users={users} index={selectedId} />}
        {!isAddUser && (
          <div className="row">
            <div className="col-md-12">
              <Card>
                <Card.Header className="p-3 bg-white">
                  <h5>My Users </h5>
                </Card.Header>
                <Card.Body>
                  {!isLoading ? (
                    <Table className="table table-hover" responsive>
                      <thead className="thead-dark">
                        <tr>
                          <th style={{ width: '6%' }}>#</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Password</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user: any, i: number) => {
                          return (
                            <tr>
                              <th scope="row">{i + 1}</th>
                              <th>{user.name}</th>
                              <td>{user.email}</td>
                              <td>{user.password}</td>
                              <td>
                                <ButtonGroup className="mb-2 m-buttons-style">
                                  <Button onClick={() => {}}>
                                    <FontAwesomeIcon icon={faTrash} />
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setSelectedId(user.id);
                                      setIsAddUser(true);
                                    }}>
                                    <FontAwesomeIcon icon={faEdit} />
                                  </Button>
                                </ButtonGroup>
                              </td>
                            </tr>
                          );
                        })}
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
        )}
      </OwnerAdminLayout>
    </>
  );
};

export default withAuth(Locations);
