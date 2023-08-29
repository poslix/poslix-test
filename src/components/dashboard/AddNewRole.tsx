import { useEffect, useState } from 'react';
import { Button, ButtonGroup, Card, Spinner, Table } from 'react-bootstrap';
import { apiFetch, apiInsert } from 'src/libs/dbUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faPenToSquare,
  faPlus,
  faStreetView,
  faFolderOpen,
  faArrowAltCircleLeft,
  faGear,
  faDesktop,
  faChartPie,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';
import { redirectToLogin } from '../../libs/loginlib';
import { userDashboard } from '@models/common-model';
import Select, { StylesConfig } from 'react-select';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { createNewData, findAllData, updateData } from 'src/services/crud.api';
const AddNewRole = (props: any) => {
  const [formObj, setFormObj] = useState({ isNew: true, name: '', stuff: '' });
  const [errorForm, setErrorForm] = useState({ name: false, stuff: false });
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(-1);
  const [pages, setPages] = useState<
    { value: string; label: string; stuffs: object[]; icon?: IconProp }[]
  >([]);
  const pages2 = [
    { value: 'split', label: 'Sales List', stuffs: [], icon: faChartPie },
    {
      value: 'sales',
      label: 'Sales',
      stuffs: [
        { label: 'View', value: 'view', isChoose: false },
        { label: 'Edit', value: 'edit' },
        { label: 'Delete', value: 'delete' },
        { label: 'Insert', value: 'insert' },
      ],
    },
    {
      value: 'quotations',
      label: 'Quotations',
      stuffs: [
        { label: 'View', value: 'view', isChoose: false },
        { label: 'Edit', value: 'edit' },
        { label: 'Delete', value: 'delete' },
        { label: 'Insert', value: 'insert' },
      ],
    },
    { value: 'split', label: 'setup', stuffs: [], icon: faLayerGroup },
    {
      value: 'products',
      label: 'Products',
      stuffs: [
        { label: 'View', value: 'view', isChoose: false },
        { label: 'Edit', value: 'edit' },
        { label: 'Delete', value: 'delete' },
        { label: 'Insert', value: 'insert' },
      ],
    },
    {
      value: 'purchases',
      label: 'Purchases',
      stuffs: [
        { label: 'View', value: 'view' },
        { label: 'Edit', value: 'edit' },
        { label: 'Delete', value: 'delete' },
        { label: 'Insert', value: 'insert' },
      ],
    },
    {
      value: 'category',
      label: 'Category & Brands',
      stuffs: [
        { label: 'View', value: 'view' },
        { label: 'Edit', value: 'edit' },
        { label: 'Delete', value: 'delete' },
        { label: 'Insert', value: 'insert' },
      ],
    },
    { value: 'split', label: 'Settings', stuffs: [], icon: faGear },
    {
      value: 'taxes',
      label: 'Taxes',
      stuffs: [
        { label: 'View', value: 'view' },
        { label: 'Insert & Edit', value: 'insert' },
        { label: 'Delete', value: 'delete' },
      ],
    },
    {
      value: 'discounts',
      label: 'Discount',
      stuffs: [
        { label: 'View', value: 'view' },
        { label: 'Edit', value: 'edit' },
        { label: 'Delete', value: 'delete' },
        { label: 'Insert', value: 'insert' },
      ],
    },
    {
      value: 'expanses',
      label: 'Expenses',
      stuffs: [
        { label: 'View', value: 'view' },
        { label: 'Insert & Edit', value: 'insert' },
        { label: 'Delete', value: 'delete' },
      ],
    },
    { value: 'split', label: 'POS Screen', stuffs: [], icon: faDesktop },
    {
      value: 'POS',
      label: 'POS',
      stuffs: [
        { label: 'Orders', value: 'orders' },
        { label: 'payment', value: 'payment' },
      ],
    },
  ];
  async function insertUpdateUsers() {
    let res;
    if (selectedRole > -1)
      res = await updateData('roles/update', selectedRole, {
        name: formObj.name,
        permissions,
      });
    else
      res = await createNewData('roles/store', {
        name: formObj.name,
        permissions,
      });
    props.setIsAddNew(false);
    props.initPage()
  }
  function handelChange(checked: boolean, value: string, name: string) {
    console.log(checked, value, name);
    const perms = [...permissions]
    if(checked && perms.indexOf(value) < 0)
      perms.push(value)
    else perms.splice(perms.indexOf(value), 1)
    setPermissions([...perms])
  }
  const showInnerRoles = (item: any, index: number) => {
    return item.stuffs.map((st: any, stIndex: number) => {
      return (
        <div
          className="form-control"
          onClick={(e) => {
            handelChange(e, item.value, st.value, st.isChoose);
          }}>
          <input className="form-check-input me-1" type="checkbox" defaultChecked={st.isChoose} />
          <label>{st.label}</label>
        </div>
      );
    });
  };
  var errors = [];
  const [fields, setFields] = useState<any>([])
  const [permissions, setPermissions] = useState([])
  const initPageData = async () => {
    const res = await findAllData('permissions');
    const finalRes: any = [];
    for (const key in res.data.result) {
      const el = res.data.result[key]
      const current: any = {title: key, roles: []};
      for (const entry in el) {
        if(el[entry].name.includes('GET') && !current.roles.some((role) => role.label === 'View'))
          current.roles.push({value: el[entry].id, label: 'View',})
        else if(el[entry].name.includes('POST') && !current.roles.some((role) => role.label === 'Create'))
          current.roles.push({value: el[entry].id, label: 'Create',})
        else if(el[entry].name.includes('PUT') && !current.roles.some((role) => role.label === 'Edit'))
          current.roles.push({value: el[entry].id, label: 'Edit',})
        else if(el[entry].name.includes('DELETE') && !current.roles.some((role) => role.label === 'Delete'))
          current.roles.push({value: el[entry].id, label: 'Delete',})
      }
      finalRes.push(current)
    }
    console.log('finalRes', finalRes);
    setFields(finalRes)
  }
  useEffect(() => {
    initPageData()
    if (props.index > -1) {
      console.log(props.selectedRole);
      
      setSelectedRole(props.selectedRole);
      setRoles(props.selectedStuff);
      setPermissions(props.selectedStuff)
      setFormObj({ ...props.stuffs[props.index], isNew: false, name: props.selectedName  });
      // var _userStuff = props.stuffs[props.index].stuff.toLowerCase();

      // pages2.map((pg, i) => {
      //   pg.stuffs.map((st: any, stIndex: number) => {
      //     if (_userStuff.includes(pg.value.toLowerCase() + '/' + st.value.toLowerCase()))
      //       pages2[i].stuffs[stIndex].isChoose = true;
      //   });
      // });
    }
    // setPages(pages2);
  }, []);

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <Card>
            <Card.Header className="p-3 bg-white">
              <h5>{props.index > -1 ? 'Edit' : 'Add New'} Role</h5>
            </Card.Header>
            <Card.Body>
              <form className="form-style">
                {/* {JSON.stringify(formObj)} */}
                <div className="col-md-12">
                  <div className="col-md-6">
                    <div>
                      <label>
                        Rule Name: <span className="text-danger">*</span>
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
                      {errorForm.name && <p className="p-1 h6 text-danger ">Enter Rule Name</p>}
                    </div>
                  </div>
                  <div className="row">
                    <form className="user-stuff-form">
                      <div className="col-md-6 col-lg-6 col-cm-6">
                        {/* {JSON.stringify(pages)} */}
                        <label>
                          Rules: <span className="text-danger">*</span>
                        </label>
                        <ul className="list-group">
                          {/* {pages.map((pg, i) => {
                            if (pg.value == 'split')
                              return (
                                <>
                                  <li className="list-group-item bg-primary">
                                    <span>
                                      <FontAwesomeIcon icon={pg.icon!} size="1x" /> {pg.label}
                                    </span>
                                    <div className="checkbox-rols"></div>
                                  </li>
                                </>
                              );
                            return (
                              <>
                                <li className="list-group-item">
                                  <span>{pg.label}</span>
                                  <div className="checkbox-rols">{showInnerRoles(pg, i)}</div>
                                </li>
                              </>
                            );
                          })} */}
                          {fields.length > 0 && fields.map((pg, i) => {
                            return (
                              <>
                                <li className="list-group-item bg-primary">
                                  <span>
                                    {pg.title}
                                  </span>
                                  <div className="checkbox-rols"></div>
                                </li>
                                <div className="flex">
                                  {pg.roles.map((role) => {
                                    return (
                                      <li className="list-group-item">
                                        <div className="checkbox-rols">
                                          <div className="form-control">
                                            <input className="form-check-input me-1" type="checkbox"
                                              onClick={(e: any) => {
                                                handelChange(e.target.checked, role.value, pg.title);
                                              }}
                                              defaultChecked={props.selectedStuff.indexOf(role.value) > -1} />
                                            <label>{role.label}</label>
                                          </div>
                                        </div>
                                      </li>
                                    )
                                  })}
                                </div>
                              </>
                            );
                          })}
                        </ul>
                      </div>
                    </form>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn m-btn btn-primary p-2 mt-4 "
                  onClick={(e) => {
                    e.preventDefault();
                    errors = [];
                    if (formObj.name.length == 0) errors.push('error');

                    setErrorForm({
                      ...errorForm,
                      name: formObj.name.length == 0 ? true : false,
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
export default AddNewRole;
