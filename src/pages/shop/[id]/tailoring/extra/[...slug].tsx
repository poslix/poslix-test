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

const ExtraManage: NextPage = (props: any) => {
  const { shopId, rules, editId } = props;
  const [formObj, setFormObj] = useState<any>({
    id: 0,
    name: '',
    isRequired: false,
    items: [{ name: '' }],
  });
  const [errorForm, setErrorForm] = useState({
    name: false,
    items: false,
    multiple: false,
    primary: false,
  });
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const router = useRouter();

  async function initDataPage(id = '0') {
    if (id == '0') return;
    setIsEdit(true);
    setIsLoading(true);
    const { success, data } = await apiFetchCtr({
      fetch: 'tailoring',
      subType: 'getInitExtra',
      shopId,
      id,
    });
    if (success) {
      if (data.length > 0 && data[0].id != undefined) {
        setFormObj({
          ...formObj,
          id: data[0].id,
          isRequired: data[0].is_required,
          name: data[0].name,
          items: JSON.parse(data[0].items),
        });
        setIsLoading(false);
      } else {
        Toastify('error', 'Error on load');
      }
    }
  }
  async function addExtras() {
    const { success } = await apiInsertCtr({
      type: 'tailoring',
      subType: 'addExtras',
      data: formObj,
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
      subType: 'updateExtra',
      data: formObj,
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
    const _rows = [...formObj.items];
    _rows[i].name = e.target.value;

    var hasEmpty = false;
    for (var j = 0; j < _rows.length; j++) if (_rows[j].name.length == 0) hasEmpty = true;

    if (!hasEmpty) _rows.push({ name: '' });
    setFormObj({ ...formObj, items: _rows });
  };
  const handleDeleteMan = (i: number) => {
    const _rows = [...formObj.items];
    if (_rows[i].isNew) {
      if (_rows.length == 1) return;
      _rows.splice(i, 1);
      setFormObj({ ...formObj, items: _rows });
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
    const _rows = [...formObj.items];
    _rows.push({ name: '' });
    setFormObj({ ...formObj, items: _rows });
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
            {JSON.stringify(formObj)}
            <Card className="mt-3" style={{ borderRadius: '10px' }}>
              <Card.Header className="p-3 bg-white">
                <h5>Extra Items</h5>
              </Card.Header>
              <Card.Body className="table-responsive text-nowrap">
                {!isLoading ? (
                  <Table className="table table-hover">
                    <thead className="thead-dark">
                      <tr>
                        <th>Title</th>
                        <th>Items</th>
                        <th>Is Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <input
                            type="text"
                            name="tax-name"
                            className="form-control p-2"
                            placeholder="Enter A Title"
                            value={formObj.name}
                            onChange={(e) => {
                              setFormObj({ ...formObj, name: e.target.value });
                            }}
                          />
                        </td>
                        <td>
                          <Table className="table table-hover">
                            <thead className="thead-dark">
                              <tr></tr>
                            </thead>
                            <tbody>
                              {formObj.items.map((ex: any, j: number) => {
                                return (
                                  <tr key={j * 82}>
                                    <td>
                                      <input
                                        type="text"
                                        name="tax-name"
                                        className="form-control p-2"
                                        placeholder="Enter Option Name"
                                        value={ex.name}
                                        onChange={(e) => {
                                          handleInputChange(e, j);
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <ButtonGroup className="mb-2 m-buttons-style">
                                        {rules.hasDelete && (
                                          <Button
                                            onClick={() => {
                                              handleDeleteMan(j);
                                            }}>
                                            <FontAwesomeIcon icon={faTrash} />
                                          </Button>
                                        )}
                                      </ButtonGroup>
                                    </td>
                                  </tr>
                                );
                              })}
                              <tr>
                                <td>
                                  <ButtonGroup className="mb-2 m-buttons-style">
                                    <Button
                                      onClick={() => {
                                        handleAddItem();
                                      }}>
                                      <FontAwesomeIcon icon={faPlus} /> Add filed
                                    </Button>
                                  </ButtonGroup>
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </td>
                        <td>
                          <Form.Check
                            type="switch"
                            id="custom-switch"
                            disabled={!rules.hasInsert}
                            className="custom-switch"
                            checked={formObj.isRequired}
                            onChange={(e) =>
                              setFormObj({ ...formObj, isRequired: !formObj.isRequired })
                            }
                          />
                        </td>
                      </tr>
                    </tbody>
                    {errorForm.items && <p className="p-1 h6 text-danger ">Add Items first</p>}
                  </Table>
                ) : (
                  <div className="d-flex justify-content-around">
                    <Spinner animation="grow" />
                  </div>
                )}
              </Card.Body>
            </Card>
            {rules.hasInsert && (
              <div className="m-3">
                <button
                  className="btn m-btn btn-primary p-3"
                  onClick={() => {
                    errors = [];
                    if (formObj.name.length == 0) errors.push('error');
                    if (
                      formObj.items.length == 0 ||
                      formObj.items[0].name.toString().trim().length == 0
                    )
                      errors.push('error');
                    setErrorForm({
                      ...errorForm,
                      name: formObj.name.length == 0,
                      items:
                        formObj.items.length == 0 ||
                        formObj.items[0].name.toString().trim().length == 0,
                    });
                    if (errors.length == 0) {
                      if (isEdit) UpdateTailoring();
                      else addExtras();
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
export default ExtraManage;
export async function getServerSideProps(context: any) {
  // return {
  //     props: { shopId: 5, rules: { hasDelete: true, hasEdit: true, hasView: true, hasInsert: true }, editId: 0 },
  // };

  const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
  var _isOk = true,
    _rule = true;

  var shopId = context.query.id;
  if (shopId == undefined) return { redirect: { permanent: false, destination: '/page403' } };

  let _addOrEdit = context.query.slug[0];
  if (_addOrEdit != 'add' && _addOrEdit != 'edit') _isOk = false;

  if (!_isOk) return { redirect: { permanent: false, destination: '/page403' } };

  var _EditId = context.query.slug[1];
  // if (Number(_EditId) == 0)
  //     return { redirect: { permanent: false, destination: "/page403" } }
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
