import type { NextPage } from 'next';
import Table from 'react-bootstrap/Table';
import { AdminLayout } from '@layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import { faTrash, faFloppyDisk, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AlertDialog from 'src/components/utils/AlertDialog';
import { apiFetchCtr, apiInsertCtr, apiUpdateCtr } from 'src/libs/dbUtils';
import * as cookie from 'cookie';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import { ITokenVerfy } from '@models/common-model';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
import Link from 'next/link';
import Select from 'react-select';

const AddTailoring: NextPage = (props: any) => {
  const { shopId, rules, editId } = props;
  const [formObj, setFormObj] = useState<any>({
    id: 0,
    name: '',
    multiple: 0,
    sizes: [{ name: '', isPrimary: false, isNew: true }],
    extras: [
      {
        name: 'addOns',
        isRequired: false,
        items: [
          { name: 'item1', isNew: true },
          { name: 'item2', isNew: true },
        ],
      },
    ],
  });
  const [errorForm, setErrorForm] = useState({
    name: false,
    sizes: false,
    multiple: false,
    primary: false,
  });
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<{ value: number; label: string }[]>([]);
  const [extras, setExtras] = useState<{ value: number; label: string }[]>([]);

  const colourStyles = {
    control: (style: any, state: any) => ({
      ...style,
      borderRadius: '10px',
      background: '#f5f5f5',
      height: '50px',
      borderColor: state.isFocused ? '2px solid #045c54' : '#eaeaea',
      boxShadow: 'none',
      '&:hover': {
        border: '2px solid #045c54 ',
      },
    }),
    menu: (provided: any, state: any) => ({
      ...provided,
      borderRadius: '10px',
      padding: '10px',
      border: '1px solid #c9ced2',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#e6efee' : 'white',
      color: '#2e776f',
      borderRadius: '10px',
      '&:hover': {
        backgroundColor: '#e6efee',
        color: '#2e776f',
        borderRadius: '10px',
      },
    }),
  };

  const router = useRouter();

  async function initDataPage(id = '0') {
    setIsLoading(true);
    const { success, data } = await apiFetchCtr({
      fetch: 'tailoring',
      subType: 'getInitPage',
      shopId,
      id,
    });
    if (success) {
      console.log('dd ', data);
      setExtras(data.extras);
      if (id != '0') {
        setIsEdit(true);
        setFormObj({
          ...formObj,
          id: data.tailoring[0].id,
          multiple: data.tailoring[0].multiple_value,
          name: data.tailoring[0].name,
          sizes: [
            ...data.sizes,
            {
              name: '',
              isPrimary: false,
              isNew: true,
            },
          ],
        });
        const extraIds = ',' + data.tailoring[0].extras;
        console.log('extraIds', extraIds);
        console.log(
          'd',
          data.extras.filter((ex: any) => extraIds.includes(ex.value + ','))
        );

        setSelectedExtras(data.extras.filter((ex: any) => extraIds.includes(ex.value + ',')));
      }

      setIsLoading(false);
    }
  }
  async function addTailoring() {
    const { success } = await apiInsertCtr({
      type: 'tailoring',
      subType: 'tailoringadd',
      data2: { data: formObj, selectedExtras },
      shopId,
    });
    if (!success) {
      Toastify('error', 'Has Error ,try Again');
      return;
    }
    Toastify('success', 'successfuly Done!');
    router.push('/shop/' + shopId + '/tailoring');
  }
  async function UpdateTailoring() {
    const { success } = await apiUpdateCtr({
      type: 'tailoring',
      subType: 'tailoringedit',
      data2: { data: formObj, selectedExtras },
      shopId,
      id: editId,
    });
    if (!success) {
      Toastify('error', 'Has Error ,try Again');
      return;
    }
    Toastify('success', 'successfuly Done!');
    router.push('/shop/' + shopId + '/tailoring');
  }
  const handlePrimarySwitchChange = (e: any, i: number) => {
    const _rows = [...formObj.sizes];
    var sv = _rows[i].isPrimary;
    for (var j = 0; j < _rows.length; j++) _rows[j].isPrimary = false;

    _rows[i].isPrimary = !sv;
    setFormObj({ ...formObj, sizes: _rows });
  };
  const handleInputChange = (e: any, i: number) => {
    const _rows = [...formObj.sizes];
    _rows[i].name = e.target.value;

    var hasEmpty = false;
    for (var j = 0; j < _rows.length; j++) if (_rows[j].name.length == 0) hasEmpty = true;

    if (!hasEmpty) _rows.push({ id: 0, name: '', isNew: true });
    setFormObj({ ...formObj, sizes: _rows });
  };
  const handleDeleteMan = (i: number) => {
    const _rows = [...formObj.sizes];
    if (_rows[i].isNew) {
      if (_rows.length == 1) return;
      _rows.splice(i, 1);
      setFormObj({ ...formObj, sizes: _rows });
    } else {
      setSelectId(_rows[i].id);
      setShow(true);
    }
  };
  useEffect(() => {
    initDataPage(editId);
  }, [router.asPath]);
  const handleDelete = (result: boolean, msg: string) => {
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
    setShow(false);
    if (result) {
      const _rows = [...formObj.sizes];
      const idx = _rows.findIndex((itm: any) => itm.id == selectId);
      _rows.splice(idx, 1);
      setFormObj({ ...formObj, sizes: _rows });
    }
  };
  const handleAddItem = () => {
    const _rows = [...formObj.extras];
    _rows.push({
      name: '',
      items: [
        { name: 'item1', isNew: true },
        { name: 'item2', isNew: true },
      ],
      isNew: true,
    });
    setFormObj({ ...formObj, extras: _rows });
  };
  const handleDeleteExtra = (i: number) => {
    const _rows = [...formObj.extras];
    if (_rows[i].isNew) {
      _rows.splice(i, 1);
      setFormObj({ ...formObj, extras: _rows });
    } else {
      alert('delete from db');
    }
  };
  var errors = [];

  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        <AlertDialog
          alertShow={show}
          alertFun={handleDelete}
          shopId={shopId}
          id={selectId}
          subType="deleteSizeItem"
          type="tailoring"
          products={formObj.sizes}>
          Are you Sure You Want Delete This Item ?
        </AlertDialog>
        <div className="row">
          <div className="mb-3">
            <Link className="btn btn-primary p-3" href={'/shop/' + shopId + '/tailoring'}>
              Back To List
            </Link>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <Card>
              <Card.Header className="p-3 bg-white">
                <h5>Add New Tailoring Type</h5>
              </Card.Header>
              <Card.Body className="form-style">
                <div className="form-group2">
                  <label>
                    Type Name: <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type Name"
                    value={formObj.name}
                    onChange={(e) => {
                      setFormObj({ ...formObj, name: e.target.value });
                    }}
                  />
                  {errorForm.name && <p className="p-1 h6 text-danger ">Enter Name</p>}
                </div>
                <div className="form-group2">
                  <label>
                    multiple: <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="multiple"
                    value={formObj.multiple}
                    onChange={(e) => {
                      setFormObj({ ...formObj, multiple: +e.target.value });
                    }}
                  />
                  {errorForm.multiple && <p className="p-1 h6 text-danger ">Enter multiple</p>}
                </div>
              </Card.Body>
            </Card>
            {formObj.name.length > 0 && (
              <Card className="mt-3" style={{ borderRadius: '10px' }}>
                <Card.Header className="p-3 bg-white">
                  <h5>Add Sizes For {formObj.name}</h5>
                </Card.Header>
                <Card.Body className="table-responsive text-nowrap">
                  {errorForm.primary && (
                    <p className="p-1 h6 text-danger ">One Item Must Be Primary</p>
                  )}
                  {!isLoading ? (
                    <Table className="table table-hover" responsive>
                      <thead className="thead-dark">
                        <tr>
                          <th style={{ width: '6%' }}>#</th>
                          <th>Name</th>
                          <th>Multiple</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formObj.sizes.map((ex: any, i: number) => {
                          return (
                            <tr key={i}>
                              <th scope="row">{i + 1}</th>
                              <td>
                                <input
                                  type="text"
                                  disabled={!rules.hasInsert}
                                  name="tax-name"
                                  className="form-control p-2"
                                  placeholder="Enter New Tax Name"
                                  value={ex.name}
                                  onChange={(e) => {
                                    handleInputChange(e, i);
                                  }}
                                />
                              </td>
                              <td>
                                <Form.Check
                                  type="switch"
                                  id="custom-switch"
                                  disabled={!rules.hasInsert}
                                  className="custom-switch"
                                  checked={ex.isPrimary}
                                  onChange={(e) => {
                                    handlePrimarySwitchChange(e, i);
                                  }}
                                />
                              </td>
                              <td>
                                <ButtonGroup className="mb-2 m-buttons-style">
                                  {rules.hasDelete && (
                                    <Button
                                      onClick={() => {
                                        handleDeleteMan(i);
                                      }}>
                                      <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                  )}
                                </ButtonGroup>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {errorForm.sizes && <p className="p-1 h6 text-danger ">Add size(s) first</p>}
                    </Table>
                  ) : (
                    <div className="d-flex justify-content-around">
                      <Spinner animation="grow" />
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}
            <Card className="mt-3" style={{ borderRadius: '10px' }}>
              <Card.Header className="p-3 bg-white">
                <h5>Extra Items</h5>
              </Card.Header>
              <Card.Body>
                <Select
                  styles={colourStyles}
                  isMulti={true}
                  options={extras}
                  value={selectedExtras}
                  onChange={(itm: any) => {
                    setSelectedExtras(itm);
                  }}
                />
              </Card.Body>
            </Card>
            {rules.hasInsert && (
              <div className="m-3">
                <button
                  className="btn m-btn btn-primary p-3"
                  onClick={() => {
                    errors = [];
                    if (formObj.name.length == 0) errors.push('error');
                    if (formObj.multiple.length == 0) errors.push('error');
                    if (
                      formObj.sizes.length == 0 ||
                      formObj.sizes[0].name.toString().trim().length == 0
                    )
                      errors.push('error');
                    let _has = true;
                    formObj.sizes.map((d: any) => {
                      if (d.isPrimary) _has = false;
                    });
                    if (_has) errors.push('error');
                    setErrorForm({
                      ...errorForm,
                      name: formObj.name.length == 0,
                      sizes:
                        formObj.sizes.length == 0 ||
                        formObj.sizes[0].name.toString().trim().length == 0,
                      multiple: formObj.multiple.length == 0,
                      primary: _has,
                    });
                    if (errors.length == 0) {
                      if (isEdit) UpdateTailoring();
                      else addTailoring();
                    } else Toastify('error', 'Enter Requires Field');
                  }}>
                  <FontAwesomeIcon icon={faFloppyDisk} /> save
                </button>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
};
export default AddTailoring;
export async function getServerSideProps(context: any) {
  const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
  var _isOk = true,
    _rule = true;
  //check page params
  //local..../shop/2/tayloring
  var shopId = context.query.id;
  if (shopId == undefined) return { redirect: { permanent: false, destination: '/page403' } };

  let _addOrEdit = context.query.slug[0];
  if (_addOrEdit != 'add' && _addOrEdit != 'edit') _isOk = false;

  if (!_isOk) return { redirect: { permanent: false, destination: '/page403' } };

  var _EditId = context.query.slug[1];
  if (Number(_EditId) == 0) return { redirect: { permanent: false, destination: '/page403' } };
  //check user permissions
  var _userRules = {};
  await verifayTokens(
    { headers: { authorization: 'Bearer ' + parsedCookies.tokend } },
    (repo: ITokenVerfy) => {
      _isOk = repo.status;
      if (_isOk) {
        var _rules = keyValueRules(repo.data.rules || []);
        if (
          _rules[-2] != undefined &&
          _rules[-2][0].stuff != undefined &&
          _rules[-2][0].stuff == 'owner'
        ) {
          _rule = true;
          _userRules = { hasDelete: true, hasEdit: true, hasView: true, hasInsert: true };
        } else if (_rules[shopId] != undefined) {
          var _stuf = '';
          _rules[shopId].forEach((dd: any) => (_stuf += dd.stuff));
          const { userRules, hasPermission } = hasPermissions(_stuf, 'tailoring');
          _rule = hasPermission;
          _userRules = userRules;
        } else _rule = false;
      }
    }
  );
  if (!_isOk) return { redirect: { permanent: false, destination: '/user/auth' } };
  if (!_rule) return { redirect: { permanent: false, destination: '/page403' } };

  //status ok
  return {
    props: { shopId, rules: _userRules, _addOrEdit, editId: _addOrEdit == 'edit' ? _EditId : 0 },
  };
}
