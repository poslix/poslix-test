import type { NextPage } from 'next';
import Table from 'react-bootstrap/Table';
import { AdminLayout } from '@layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import Select from 'react-select';
import {
  faTrash,
  faFloppyDisk,
  faPlus,
  faEye,
  faSpinner,
  faEdit,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import AlertDialog from 'src/components/utils/AlertDialog';
import AddGroupModal from 'src/components/utils/AddGroupModal';
import ShowDialog from 'src/components/utils/ShowDialog';
import { ITax, ITokenVerfy } from '@models/common-model';
import { apiFetch, apiFetchCtr, apiInsertCtr } from 'src/libs/dbUtils';
import { useRouter } from 'next/router';
import * as cookie from 'cookie';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
import withAuth from 'src/HOCs/withAuth';
import { createNewData, deleteData, findAllData, updateData } from 'src/services/crud.api';

const Taxes: NextPage = (props: any) => {
  const { shopId, rules } = props;
  const selectStyle = {
    control: (style: any) => ({
      ...style,
      color: '#db3333',
      borderRadius: '10px',
      marginTop: '4px',
      borderBottom: '1px solid #eaeaea',
    }),
  };
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [taxs, setTaxs] = useState<ITax[]>([]);
  const [taxsExcise, setTaxsExcise] = useState<ITax[]>([]);
  const [taxsService, setTaxsService] = useState<ITax[]>([]);
  const [taxesGroup, setTaxesGroup] = useState<ITax[]>([]);
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [itemDetails, setItemDetails] = useState<ITax[]>([]);
  const [groupModal, setGroupModal] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [selectType, setSelectType] = useState('');

  const router = useRouter();
  const taxValueType = [
    { label: 'Percentage', value: 'percentage' },
    { label: 'Fixed', value: 'fixed' },
  ];

  const [taxesList, setTaxesList] = useState();
  const [permissions, setPermissions] = useState<any>();

  async function initDataPage() {
    if (router.query.id && permissions) {
      const res = await findAllData(`taxes/${router.query.id}`);
      const newData = res.data.result.taxes;
      setTaxesList(res.data.result.taxes.filter((t) => t.tax_type !== 'group'));
      if (res.data.success) {
        if (permissions.hasInsert) {
          newData.push({
            id: 0,
            name: '',
            amount: 0,
            type: '',
            is_primary: false,
            tax_type: 'primary',
            isNew: 1,
          });
          newData.push({
            id: 0,
            name: '',
            amount: 0,
            type: '',
            is_primary: false,
            tax_type: 'excise',
            isNew: 1,
          });
          newData.push({
            id: 0,
            name: '',
            amount: 0,
            type: '',
            amountType: 'percentage',
            is_primary: false,
            tax_type: 'service',
            isNew: 1,
          });
        }
        setTaxs(
          newData.filter((p: ITax) => {
            return p.tax_type == 'primary';
          })
        );
        setTaxsExcise(
          newData.filter((p: ITax) => {
            return p.tax_type == 'excise';
          })
        );
        setTaxsService(
          newData.filter((p: ITax) => {
            return p.tax_type == 'service';
          })
        );
        setTaxesGroup(
          newData.filter((p: ITax) => {
            return p.tax_type == 'group';
          })
        );
        setIsLoading(false);
      }
    }
  }
  async function addUpdateTaxs(rows: ITax[]) {
    if (rows[0].tax_type == 'primary') {
      let notHas = true;
      for (var j = 0; j < rows.length - 1; j++) {
        if (rows[j].is_primary) notHas = false;
      }
      if (notHas) {
        Toastify('error', 'Error, you have to set one item is primary');
        return;
      }
    }
    const { success, data } = await apiInsertCtr({
      type: 'taxes',
      subType: 'insetUpdatePrimaryTax',
      data: rows,
      shopId,
    });
    if (!success) {
      Toastify('error', 'Has Error ,try Again');
      return;
    }
    let jj = 0;
    const _taxs =
      rows[0].tax_type == 'primary'
        ? [...taxs]
        : rows[0].tax_type == 'excise'
        ? [...taxsExcise]
        : [...taxsService];
    for (var j = 0; j < _taxs.length - 1; j++) {
      _taxs[j].isNew = 0;
      if (_taxs[j].id == 0) {
        _taxs[j].id = data[jj];
        jj++;
      }
    }

    rows[0].tax_type == 'primary'
      ? setTaxs(_taxs)
      : rows[0].tax_type == 'excise'
      ? setTaxsExcise(_taxs)
      : setTaxsService(_taxs);
    Toastify('success', 'successfuly Done!');
  }

  const handlePrimarySwitchChange = (e: any, i: number) => {
    const _taxs = [...taxs];
    var sv = _taxs[i].is_primary;
    for (var j = 0; j < _taxs.length; j++) _taxs[j].is_primary = false;

    _taxs[i].is_primary = !sv;
    setTaxs(_taxs);
  };
  const handleInputChange = (e: any, i: number) => {
    const _taxs = [...taxs];
    e.target.name == 'tax-name'
      ? (_taxs[i].name = e.target.value)
      : (_taxs[i].amount = e.target.value);

    var hasEmpty = false;
    for (var j = 0; j < _taxs.length; j++) if (_taxs[j].name.length == 0) hasEmpty = true;

    if (!hasEmpty)
      _taxs.push({
        id: 0,
        name: '',
        amount: 0,
        Etype: '',
        is_primary: false,
        tax_type: 'primary',
        isNew: 1,
      } as any);
    setTaxs(_taxs);
  };
  const handleDelete = async (i: number, type: string) => {
    const res = await deleteData('taxes', i);
    initDataPage();
  };
  const handleChangeExcAndService = (e: any, i: number, isExc: boolean) => {
    const _taxes = isExc ? [...taxsExcise] : [...taxsService];
    e.target.name == 'tax-name'
      ? (_taxes[i].name = e.target.value)
      : e.target.name == 'tax-value'
      ? (_taxes[i].amount = e.target.value)
      : (_taxes[i].type = e.target.value);
    var hasEmpty = false;
    for (var j = 0; j < _taxes.length; j++) if (_taxes[j].name.length == 0) hasEmpty = true;
    if (!hasEmpty)
      _taxes.push({
        id: 0,
        name: '',
        amount: 0,
        Etype: 'percentage',
        tax_type: isExc ? 'excise' : 'service',
        is_primary: false,
        isNew: 1,
      } as any);
    isExc ? setTaxsExcise(_taxes) : setTaxsService(_taxes);
  };
  const addNewGroup = (id = 0) => {
    setSelectType(id === 0 ? '' : 'edit');
    setSelectId(id);
    setGroupModal(true);
  };

  async function showDetailsHandle(id: number) {
    setSelectId(id);
    setIsLoadingDetails(true);
    const { success, newdata } = await apiFetchCtr({
      fetch: 'taxes',
      subType: 'getGroupItems',
      id,
      shopId,
    });
    if (!success) {
      Toastify('error', 'Has Error ,try Again');
      return;
    }
    setItemDetails(newdata);
    setIsLoadingDetails(false);
    setShowDetails(true);
  }
  const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
    if (result) {
      const _taxs =
        section == 'primary'
          ? [...taxs]
          : section == 'excise'
          ? [...taxsExcise]
          : section == 'group'
          ? [...taxesGroup]
          : [...taxsService];
      const idx = _taxs.findIndex((itm: any) => itm.id == selectId);
      if (idx != -1) _taxs.splice(idx, 1);
      section == 'primary'
        ? setTaxs(_taxs)
        : section == 'excise'
        ? setTaxsExcise(_taxs)
        : section == 'group'
        ? setTaxesGroup(_taxs)
        : setTaxsService(_taxs);
    }
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
    setShow(false);
  };

  const handleSave = async (item: any) => {
    const tax = { ...item };
    delete tax.id;
    tax.type = 'percentage';
    let res;

    if (item.id === 0) {
      res = await createNewData(`taxes/${router.query.id}`, tax);
    } else {
      res = await updateData('taxes', item.id, tax);
    }
    if (res.data.success) Toastify('success', 'successfuly Done!');
    else Toastify('error', 'Error On Add New');
  };

  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissions'));
    const getPermissions = { hasView: false, hasInsert: false, hasEdit: false, hasDelete: false };
    perms.tax.map((perm) =>
      perm.name.includes('GET')
        ? (getPermissions.hasView = true)
        : perm.name.includes('POST')
        ? (getPermissions.hasInsert = true)
        : perm.name.includes('PUT')
        ? (getPermissions.hasEdit = true)
        : perm.name.includes('DELETE')
        ? (getPermissions.hasDelete = true)
        : null
    );

    setPermissions(getPermissions);
    initDataPage();
  }, [router.asPath]);
  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        <AlertDialog
          alertShow={show}
          shopId={shopId}
          alertFun={handleDeleteFuc}
          id={selectId}
          url="taxes"
          section={selectType}>
          Are you Sure You Want Delete This Item ?
        </AlertDialog>

        <ShowDialog
          alertShow={showDetails}
          alertFun={(e: boolean) => setShowDetails(e)}
          id={selectId}
          type="deleteTax"
          taxs={taxs}>
          <Table className="table table-hover" responsive>
            <thead className="thead-dark">
              <tr>
                <th>Name</th>
                <th>Tax Type</th>
                <th>Amount Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {!isLoadingDetails &&
                itemDetails.map((ex: any, i: number) => {
                  return (
                    <tr key={i}>
                      <td>{ex.name}</td>
                      <td>{ex.tax_type}</td>
                      <td>{ex.type}</td>
                      <td>{ex.type == 'fixed' ? ex.amount : ex.amount + '%'}</td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </ShowDialog>

        <AddGroupModal
          alertShow={groupModal}
          shopId={shopId}
          alertFun={(e: boolean) => setGroupModal(e)}
          id={selectId}
          type={selectType}
          dataItems={taxesGroup}
          allTaxes={{ taxes: taxs, excise: taxsExcise, services: taxsService, taxesGroup }}
        />
        <div className="row">
          <div className="col-md-12">
            <Card>
              <Card.Header className="p-3 bg-white">
                <h5>Taxes List</h5>
              </Card.Header>
              <Card.Body>
                {!isLoading ? (
                  <Table className="table table-hover remove-last-del-icon" responsive>
                    <thead className="thead-dark">
                      <tr>
                        <th style={{ width: '50%' }}>Name</th>
                        <th style={{ width: '15%' }}>Amount (%)</th>
                        <th style={{ width: '10%' }}>is Primary?</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxs.map((ex: any, i: number) => {
                        return (
                          <tr key={i} style={{ background: ex.isNew ? '#c6e9e6' : '' }}>
                            <td>
                              <input
                                type="text"
                                name="tax-name"
                                className="form-control p-2"
                                disabled={!permissions.hasInsert}
                                placeholder="Enter New Tax Name"
                                value={ex.name}
                                onChange={(e) => {
                                  handleInputChange(e, i);
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step={1}
                                name="tax-value"
                                disabled={!permissions.hasInsert}
                                className="form-control p-2"
                                placeholder="Tax Value"
                                value={ex.amount}
                                onChange={(e) => {
                                  handleInputChange(e, i);
                                }}
                              />
                            </td>
                            <td>
                              <Form.Check
                                type="switch"
                                id="custom-switch"
                                disabled={!permissions.hasInsert}
                                className="custom-switch"
                                checked={ex.is_primary ? true : false}
                                onChange={(e) => {
                                  handlePrimarySwitchChange(e, i);
                                }}
                              />
                            </td>
                            <td>
                              <ButtonGroup className="mb-2 m-buttons-style">
                                {permissions.hasDelete && (
                                  <Button onClick={() => handleDelete(ex.id, 'primary')}>
                                    <FontAwesomeIcon icon={faTrash} />
                                  </Button>
                                )}
                              </ButtonGroup>
                              <ButtonGroup className="mb-2 m-buttons-style">
                                {permissions.hasEdit && (
                                  <Button onClick={() => handleSave(ex)}>
                                    <FontAwesomeIcon icon={faCheck} />
                                  </Button>
                                )}
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
              {!isLoading && permissions.hasInsert && (
                <div className="m-3">
                  <button className="btn m-btn btn-primary p-3" onClick={() => addUpdateTaxs(taxs)}>
                    <FontAwesomeIcon icon={faFloppyDisk} /> save
                  </button>
                </div>
              )}
            </Card>

            {/* excces */}
            <Card className="mt-4">
              <Card.Header className="p-3 bg-white">
                <h5>Excise Taxes List</h5>
              </Card.Header>
              <Card.Body>
                {!isLoading ? (
                  <Table className="table table-hover remove-last-del-icon" responsive>
                    <thead className="thead-dark">
                      <tr>
                        <th style={{ width: '50%' }}>Name</th>
                        <th style={{ width: '15%' }}>Amount (%)</th>
                        <th style={{ width: '35%' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxsExcise.map((ex: any, i: number) => {
                        return (
                          <tr key={i} style={{ background: ex.isNew ? '#c6e9e6' : '' }}>
                            <td>
                              <input
                                type="text"
                                name="tax-name"
                                className="form-control p-2"
                                disabled={!permissions.hasInsert}
                                placeholder="Enter New Tax Name"
                                value={ex.name}
                                onChange={(e) => {
                                  handleChangeExcAndService(e, i, true);
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min={0}
                                step={1}
                                name="tax-value"
                                disabled={!permissions.hasInsert}
                                className="form-control p-2"
                                placeholder="Add Excise Tax Value"
                                value={ex.amount}
                                onChange={(e) => {
                                  handleChangeExcAndService(e, i, true);
                                }}
                              />
                            </td>
                            <td>
                              <ButtonGroup className="mb-2 m-buttons-style">
                                <Button
                                  disabled={!permissions.hasInsert}
                                  onClick={() => handleDelete(ex.id, 'excise')}>
                                  <FontAwesomeIcon icon={faTrash} />
                                </Button>
                              </ButtonGroup>
                              <ButtonGroup className="mb-2 m-buttons-style">
                                {permissions.hasDelete && (
                                  <Button onClick={() => handleSave(ex)}>
                                    <FontAwesomeIcon icon={faCheck} />
                                  </Button>
                                )}
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
              {!isLoading && permissions.hasInsert && (
                <div className="m-3">
                  <button
                    className="btn m-btn btn-primary p-3"
                    onClick={() => addUpdateTaxs(taxsExcise)}>
                    <FontAwesomeIcon icon={faFloppyDisk} /> save{' '}
                  </button>
                </div>
              )}
            </Card>

            {/* Service Charge */}
            <Card className="mt-4">
              <Card.Header className="p-3 bg-white">
                <h5>Service Charge Taxes List</h5>
              </Card.Header>
              <Card.Body>
                {!isLoading ? (
                  <Table className="table table-hover remove-last-del-icon">
                    <thead className="thead-dark">
                      <tr>
                        <th style={{ width: '15%' }}>Type</th>
                        <th style={{ width: '30%' }}>Name</th>
                        <th style={{ width: '25%' }}>Amount (%)</th>
                        <th style={{ width: '35%' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxsService.map((ex: ITax, i: number) => {
                        return (
                          <tr key={i} style={{ background: ex.isNew ? '#c6e9e6' : '' }}>
                            <Select
                              className="p-2 m-brd-bottom"
                              isDisabled={!permissions.hasInsert}
                              styles={selectStyle}
                              options={taxValueType}
                              value={taxValueType.filter((it: any) => {
                                return it.value == ex.type;
                              })}
                              onChange={(itm) => {
                                handleChangeExcAndService(
                                  { target: { name: 'select', value: itm!.value } },
                                  i,
                                  false
                                );
                              }}
                            />
                            <td>
                              <input
                                type="text"
                                name="tax-name"
                                className="form-control p-2"
                                disabled={!permissions.hasInsert}
                                placeholder="Tax Name"
                                value={ex.name}
                                onChange={(e) => {
                                  handleChangeExcAndService(e, i, false);
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min={0}
                                step={1}
                                name="tax-value"
                                disabled={!permissions.hasInsert}
                                className="form-control p-2"
                                placeholder="Add Service Charge Value"
                                value={ex.amount}
                                onChange={(e) => {
                                  handleChangeExcAndService(e, i, false);
                                }}
                              />
                            </td>
                            <td>
                              <ButtonGroup className="mb-2 m-buttons-style">
                                {permissions.hasDelete && (
                                  <Button onClick={() => handleDelete(ex.id, 'service')}>
                                    <FontAwesomeIcon icon={faTrash} />
                                  </Button>
                                )}
                              </ButtonGroup>
                              <ButtonGroup className="mb-2 m-buttons-style">
                                {permissions.hasEdit && (
                                  <Button onClick={() => handleSave(ex)}>
                                    <FontAwesomeIcon icon={faCheck} />
                                  </Button>
                                )}
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
              {!isLoading && permissions.hasInsert && (
                <div className="m-3">
                  <button
                    className="btn m-btn btn-primary p-3"
                    onClick={() => addUpdateTaxs(taxsService)}>
                    <FontAwesomeIcon icon={faFloppyDisk} /> save{' '}
                  </button>
                </div>
              )}
            </Card>

            {/* Group */}

            <Card className="mt-4">
              <Card.Header className="p-3 bg-white">
                <h5>Groupe Taxes List</h5>
              </Card.Header>
              <Card.Body>
                {!isLoading ? (
                  <Table className="table table-hover" responsive>
                    <thead className="thead-dark">
                      <tr>
                        <th style={{ width: '50%' }}>Name</th>
                        <th style={{ width: '10%' }}>Default Tax</th>
                        <th style={{ width: '35%' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxesGroup.map((ex: any, i: number) => {
                        return (
                          <tr key={i}>
                            <td>{ex.name}</td>
                            <td>
                              <Form.Check
                                type="switch"
                                disabled={true}
                                className="custom-switch"
                                checked={ex.is_primary ? true : false}
                              />
                            </td>
                            <td>
                              <ButtonGroup className="mb-2 m-buttons-style">
                                {permissions.hasDelete && (
                                  <Button onClick={() => handleDelete(ex.id, 'group')}>
                                    <FontAwesomeIcon icon={faTrash} />
                                  </Button>
                                )}
                                <Button onClick={() => showDetailsHandle(ex.id)}>
                                  {isLoadingDetails && ex.id == selectId ? (
                                    <FontAwesomeIcon icon={faSpinner} />
                                  ) : (
                                    <FontAwesomeIcon icon={faEye} />
                                  )}
                                </Button>
                                {!isLoading && permissions.hasInsert && (
                                  <Button onClick={() => addNewGroup(ex.id)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                  </Button>
                                )}
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
              {!isLoading && permissions.hasInsert && (
                <div className="m-3">
                  <button className="btn m-btn btn-primary p-3" onClick={() => addNewGroup()}>
                    <FontAwesomeIcon icon={faPlus} /> Add New Group{' '}
                  </button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};
export default withAuth(Taxes);
