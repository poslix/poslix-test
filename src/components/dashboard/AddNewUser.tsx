import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, Spinner, Table } from 'react-bootstrap';
import { apiFetch, apiInsert, apiInsertCtr } from 'src/libs/dbUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faPenToSquare,
  faPlus,
  faStreetView,
  faFolderOpen,
} from '@fortawesome/free-solid-svg-icons';
import { redirectToLogin } from '../../libs/loginlib';
import { userDashboard } from '@models/common-model';
import { Toastify } from 'src/libs/allToasts';
import { validateEmail } from 'src/libs/toolsUtils';
import { createNewData, updateData } from 'src/services/crud.api';
const AddNewUser = (props: any) => {
  const { index } = props;
  const [formObj, setFormObj] = useState<userDashboard>({
    isNew: true,
    name: '',
    username: '',
    password: '',
    contact_number: '',
    email: '',
  });
  const [errorForm, setErrorForm] = useState({
    name: false,
    email: false,
    email2: false,
    email3: false,
    password: false,
  });
  async function insertUpdateUsers() {
    let res;
    if(index != undefined && index > 0) {
      res = await updateData('update-user', index, {...formObj, first_name: formObj.name, number: formObj.contact_number})
    } else {
      res = await createNewData('add-user', {...formObj, first_name: formObj.name, number: formObj.contact_number})
    }
    if (res.data.success || res.data.status === 201) {
      Toastify('success', 'successfully done!');
      if (formObj.isNew) props.users.push({ ...formObj, id: res.data.result });
      props.setIsAddUser(false);
      props.initData()
    } else {
      setErrorForm({ name: false, email: false, email2: false, email3: true, password: false });
      Toastify('error', 'Somthing is Wrong!');
    }
  }
  var errors = [];
  useEffect(() => {
    if (index != undefined && index > 0) {
      const _idn = props.users.findIndex((od: any) => od.id == index);
      if (_idn > -1)
        setFormObj({ ...props.users[_idn], name: props.users[_idn].first_name +
          (props.users[_idn]?.last_name ? ' ' + props.users[_idn]?.last_name : ''),
          isNew: false });
      else {
        Toastify('error', 'Somthing is Wrong!, Try Later');
        props.setIsAddUser(false);
      }
    } else if (index != 0) {
      Toastify('error', 'Somthing is Wrong!, Try Later');
      props.setIsAddUser(false);
    }
  }, []);

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <Card>
            <Card.Header className="p-3 bg-white">
              <h5>Add New user</h5>
            </Card.Header>
            <Card.Body>
              {/* {JSON.stringify(formObj)} */}
              <form className="form-style">
                <div className="col-md-12">
                  <div className="col-md-6">
                    <div className="form-group2">
                      <label>
                        Full Name: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder=""
                        value={formObj.name!}
                        onChange={(e) => {
                          setFormObj({ ...formObj, name: e.target.value });
                        }}
                      />
                      {errorForm.name && <p className="p-1 h6 text-danger ">Enter Full Name</p>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group2">
                      <label>Phone Number:</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder=""
                        value={formObj.contact_number}
                        onChange={(e) => {
                          setFormObj({ ...formObj, contact_number: e.target.value });
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group2">
                      <label>
                        Email: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder=""
                        value={formObj.email}
                        onChange={(e) => {
                          setFormObj({ ...formObj, email: e.target.value });
                        }}
                      />
                      {errorForm.email && <p className="p-1 h6 text-danger ">Enter Email First</p>}
                      {!errorForm.email && errorForm.email2 && (
                        <p className="p-1 h6 text-danger ">Please enter a valid email address</p>
                      )}
                      {errorForm.email3 && (
                        <p className="p-1 h6 text-danger ">
                          This Email Already Exist,Use Another One
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group2">
                      <label>
                        Password: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder=""
                        value={formObj.password}
                        onChange={(e) => {
                          setFormObj({ ...formObj, password: e.target.value });
                        }}
                      />
                      {errorForm.password && <p className="p-1 h6 text-danger ">Enter Password</p>}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn m-btn btn-primary p-2 "
                  onClick={(e) => {
                    e.preventDefault();
                    errors = [];
                    if (formObj.name?.length == 0) errors.push('error');
                    if (formObj.email?.length == 0) errors.push('error');
                    if (formObj.password?.length == 0) errors.push('error');
                    if (!validateEmail(formObj.email)) errors.push('error');
                    setErrorForm({
                      ...errorForm,
                      name: formObj.name.length == 0,
                      email: formObj.email.length == 0,
                      email2: !validateEmail(formObj.email),
                      password: formObj.password?.length == 0,
                    });
                    if (errors.length == 0) {
                      insertUpdateUsers();
                    }
                  }}>
                  Save
                </button>
              </form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </>
  );
};
export default AddNewUser;
