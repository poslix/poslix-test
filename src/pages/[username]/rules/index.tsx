import { faArrowAltCircleLeft, faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { OwnerAdminLayout } from '@layout';
import { IRoles } from '@models/common-model';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, Spinner, Table } from 'react-bootstrap';
import withAuth from 'src/HOCs/withAuth';
import AddNewRole from 'src/components/dashboard/AddNewRole';
import AlertDialog from 'src/components/utils/AlertDialog';
import { Toastify } from 'src/libs/allToasts';
import { deleteData, findAllData } from 'src/services/crud.api';

const Roles = ({ username }: any) => {
  const [stuffs, setStuffs] = useState<IRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddNew, setIsAddNew] = useState(false);

  const [selectedId, setSelectedId] = useState(0);
  const [selectedRole, setSelectedRole] = useState(0);
  const [selectedStuff, setSelectedStuff] = useState('');
  const [selectedName, setSelectedName] = useState('');

  async function initDataPage() {
    const res = await findAllData('roles/get');
    for (const iterator in res.data.result) {
      // console.log(iterator, res.data.result[iterator]);
      
    }
    setStuffs(res.data.result);
    setIsLoading(false);
  }

  function showPropryRoles_test(roles: string) {
    if (roles === 'no') {
      return (
        <div className="roles-parent-no-peri">
          <div>No Permissions</div>
        </div>
      );
    } else {
      // const _roles = roles
      //   .replaceAll('_r', '_read')
      //   .replaceAll('_e', '_edit')
      //   .replaceAll('_d', '_delete')
      //   .replaceAll('_i', '_insert')
      //   .split(',');

      // return (
      //   <div className="roles-parent">
      //     {_roles.map((mp) => {
      //       return mp.length > 0 && <div>{mp}</div>;
      //     })}
      //   </div>
      // );
    }
  }
  useEffect(() => {
    initDataPage();
  }, []);
const [show, setShow] =  useState(false)
  return (
    <OwnerAdminLayout>
      <AlertDialog
          alertShow={show}
          alertFun={(result: boolean, msg: string) => {
            if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
              initDataPage()
              setSelectedId(-1)
            setShow(false);
          }}
          id={selectedId}
          url={"roles/delete"}>
          Are you Sure You Want Delete This Role ?
        </AlertDialog>
      <button
        className="mb-4 btn btn-primary p-3"
        style={{ width: '150px' }}
        onClick={() => {
          setSelectedId(-1);
          setSelectedRole(-1);
          setSelectedStuff('');
          setIsAddNew(!isAddNew);
        }}>
        <FontAwesomeIcon icon={!isAddNew ? faPlus : faArrowAltCircleLeft} />{' '}
        {!isAddNew ? 'Add Role' : 'Back'}
      </button>
      {isAddNew && (
        <AddNewRole
          setIsAddNew={setIsAddNew}
          stuffs={stuffs}
          index={selectedId}
          selectedRole={selectedRole}
          selectedStuff={selectedStuff}
          selectedName={selectedName}
          initPage={initDataPage}
        />
      )}
      {!isAddNew && (
        <div className="row">
          <div className="col-md-12">
            <Card>
              <Card.Header className="p-3 bg-white">
                <h5>Rules</h5>
              </Card.Header>
              <Card.Body>
                {!isLoading ? (
                  <Table className="table table-hover" responsive>
                    <thead className="thead-dark">
                      <tr>
                        <th style={{ width: '6%' }}>#</th>
                        <th>Name</th>
                        <th>Stuff</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stuffs?.map((role: any, i: number) => {
                        return (
                          <tr>
                            <th scope="row">{i + 1}</th>
                            <th>{role.name}</th>
                            <td>{showPropryRoles_test(role.permissions)}</td>
                            <td>
                              <ButtonGroup className="mb-2 m-buttons-style">
                                <Button
                                  onClick={() => {
                                    setSelectedId(role.id);
                                    setShow(true)
                                    }}>
                                  <FontAwesomeIcon icon={faTrash} />
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedRole(role.id);
                                    setSelectedStuff(role.permissions.map((perm) => {return perm.id}));
                                    setSelectedName(role.name);
                                    setSelectedId(role.id);
                                    setIsAddNew(true);
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
  );
};
export default withAuth(Roles);
