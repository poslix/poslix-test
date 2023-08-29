import React, { useContext, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import { Form, Button, Card } from 'react-bootstrap';
import { apiFetchCtr, apiInsertCtr } from '../../libs/dbUtils';
import { ITax } from '../../models/common-model';
import { Toastify } from 'src/libs/allToasts';
import { UserContext } from 'src/context/UserContext';
import { createNewData, findAllData, updateData } from 'src/services/crud.api';
import { useRouter } from 'next/router';
function AddGroupModal(props: any) {
  const { allTaxes, dataItems, shopId, id, type, alertShow } = props;
  const { taxes, excise, services, taxesGroup } = allTaxes;
  const [allItems, setAllItems] = useState<ITax[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalTax, setTotalTax] = useState<number>(0);
  const [gname, setGname] = useState('');
  const [taxData, setTaxData] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const { locationSettings } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (alertShow) {
      setGname('');
      setIsDefault(false);
      if (type == 'edit' && id != 0) {
        initForEdit(id);
      } else {
        setAllItems([
          ...taxes,
          { isSplit: true, name: 'Excise Taxes List' },
          ...excise,
          { isSplit: true, name: 'Service Charge Taxes List' },
          ...services,
        ]);
        const _taxs = [...allItems];
        _taxs.forEach((item1: any) => {
          item1.isChoosed = false;
        });
        calcu();
        setIsLoading(false);
      }
    }
  }, [alertShow]);

  async function initForEdit(id: number) {
    const res = await findAllData(`taxes/${id}/show`);
    if (res.data.success) {
      setTaxData(res.data.result.tax);
      let _total = 0;
      const _taxs = [
        ...taxes,
        { isSplit: true, name: 'Excise Taxes List' },
        ...excise,
        { isSplit: true, name: 'Service Charge Taxes List' },
        ...services,
      ];

      _taxs.forEach((item1: any) => {
        console.log(item1);
        if (res.data.result.tax.tax_group.some((item2: any) => item2.id === item1.id)) {
          item1.isChoosed = true;
          _total += Number(item1.amount);
        } else item1.isChoosed = false;
      });
      setAllItems(_taxs);
      setTotalTax(_total);
      setGname(res.data.result.tax.name);
      setIsDefault(res.data.result.tax.is_primary);
      setIsLoading(false);
    }
  }
  const handleClose = () => props.alertFun(false);
  const handleShow = () => props.alertFun(true);

  const calcu = () => {
    const _taxs = [...allItems] as any[];
    var _total = 0;
    for (var j = 0; j < _taxs.length; j++)
      _total += _taxs[j].isChoosed ? Number(_taxs[j].amount) : 0;
    setTotalTax(_total);
  };
  const handleSwitchChange = (e: any, i: number) => {
    const _taxs = [...allItems] as any[];
    _taxs[i].isChoosed = !_taxs[i].isChoosed;
    setAllItems(_taxs);
    calcu();
  };
  async function addGroupTax() {
    if (gname.length < 3) {
      Toastify('error', 'Enter Group Name First At least 3 Characters');
      return;
    }
    if (totalTax == 0 || totalTax == null) {
      Toastify('error', 'Choose Some Taxes (At Least 2 Chooses)');
      return;
    }
    setIsLoading(true);
    const tax_ids = [];
    allItems.filter((tax) => tax.id > 0 && tax['isChoosed']).map((tax) => tax_ids.push(tax.id));
    let res;
    if (id) {
      res = await updateData('taxes', id, {
        name: gname,
        amount: 0,
        is_primary: isDefault,
        type: 'percentage',
        tax_type: 'group',
        tax_ids,
      });
    } else {
      res = await createNewData(`taxes/${router.query.id}`, {
        name: gname,
        amount: 0,
        is_primary: isDefault,
        type: 'percentage',
        tax_type: 'group',
        tax_ids,
      });
    }
    if (!res.data.success) {
      Toastify('error', 'Has Error ,try Again');
      return;
    }
    if (id == 0) {
      if (isDefault) {
        const _taxs = [...dataItems];
        for (var j = 0; j < _taxs.length; j++) dataItems[j].is_primary = false;
      }
      dataItems.push({
        id: res.data.result.tax,
        name: gname,
        amount: totalTax,
        amountType: '',
        is_primary: isDefault,
        isChoosed: 0,
        taxType: 'group',
        isNew: 0,
      });
    } else {
      if (isDefault) {
        const _taxs = [...dataItems];
        for (var j = 0; j < _taxs.length; j++) dataItems[j].is_primary = id == dataItems[j].id;
      }
    }
    handleClose();
    setIsLoading(false);
    Toastify('success', 'Group Off Taxes successfully Created');
  }

  return (
    <>
      <Modal
        size="lg"
        show={alertShow}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered>
        <Modal.Header closeButton>
          <Modal.Title>{type === 'edit' ? 'Edit' : 'Add New'} Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card.Body>
            {isLoading ? (
              <h5 style={{ textAlign: 'center' }}>Wait...</h5>
            ) : (
              <Table className="table table-hover" responsive>
                <thead className="thead-dark">
                  <tr>
                    <th style={{ width: '50%' }}>Taxes List</th>
                    <th style={{ width: '15%' }}>Amount</th>
                    <th style={{ width: '35%' }}>Choose</th>
                  </tr>
                </thead>
                <tbody>
                  {allItems.map((ex: ITax, i: number) => {
                    if (!ex.isNew) {
                      return [
                        <>
                          {!(ex as any).isSplit ? (
                            <tr key={i}>
                              <td>
                                {ex.name}{' '}
                                <span style={{ fontSize: '10px', color: '#a3a0a0' }}>
                                  {ex.is_primary ? '[Primary]' : ''}
                                </span>
                              </td>
                              <td>
                                {ex.amount}
                                {ex.type == 'percentage' ? '%' : locationSettings?.currency_code}
                              </td>
                              <td>
                                <Form.Check
                                  type="checkbox"
                                  className="custom-checkbox"
                                  checked={(ex as any).isChoosed ? true : false}
                                  onChange={(e) => {
                                    handleSwitchChange(e, i);
                                  }}
                                />
                              </td>
                            </tr>
                          ) : (
                            <tr>
                              {' '}
                              <th colSpan={3} style={{ width: '100%' }}>
                                {ex.name}
                              </th>
                            </tr>
                          )}
                        </>,
                      ];
                    }
                  })}
                  <tr>
                    <th>Group Name</th>
                    <th></th>
                    <th>Is Default</th>
                  </tr>
                  <tr>
                    <td>
                      <input
                        type="text"
                        name="tax-name"
                        value={gname}
                        className="form-control p-2"
                        placeholder="Enter Group Name"
                        onChange={(e) => {
                          setGname(e.target.value);
                        }}
                      />
                    </td>
                    <td></td>
                    <td>
                      <Form.Check
                        type="switch"
                        className="custom-switch"
                        checked={isDefault}
                        onChange={(e) => {
                          setIsDefault(!isDefault);
                        }}
                      />
                    </td>
                  </tr>
                  <br />
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => addGroupTax()}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
export default AddGroupModal;
