import React, { useContext, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';
import { Form, Button, Card } from 'react-bootstrap'
import { apiFetchCtr, apiInsertCtr } from "../../libs/dbUtils"
import { ITax } from '../../models/common-model';
import { Toastify } from 'src/libs/allToasts';
import { UserContext } from 'src/context/UserContext';
function AddGroupModal(props: any) {

  const { allTaxes, dataItems, shopId, id, type, alertShow } = props;
  const { taxes, excise, services, taxesGroup } = allTaxes;
  const [allItems, setAllItems] = useState<ITax[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalTax, setTotalTax] = useState<number>(0)
  const [gname, setGname] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const { locationSettings } = useContext(UserContext);

  useEffect(() => {
    if (alertShow) {
      setGname("")
      setIsDefault(false)
      if (type == "edit" && id != 0) {
        initForEdit(id);
      } else {
        setAllItems([...taxes, { isSplit: true, name: 'Excise Taxes List' }, ...excise, { isSplit: true, name: 'Service Charge Taxes List' }, ...services])
        const _taxs = [...allItems]
        _taxs.forEach((item1: any) => {
          item1.isChoosed = false;
        });
        calcu()
        setIsLoading(false)
      }
    }
  }, [alertShow])

  async function initForEdit(id: number) {
    const { success, newdata } = await apiFetchCtr({ fetch: 'taxes', subType: "getGroupItems", id, shopId })
    if (!success) {
      Toastify('error', "Has Error ,try Again")
      return;
    }
    if (newdata.length > 0) {
      let _total = 0;
      const _taxs = [...taxes, { isSplit: true, name: 'Excise Taxes List' }, ...excise, { isSplit: true, name: 'Service Charge Taxes List' }, ...services]
      _taxs.forEach((item1: any) => {
        if (newdata.some((item2: any) => item2.tax_id === item1.id)) {
          item1.isChoosed = true;
          _total += Number(item1.amount);
        }
        else
          item1.isChoosed = false;
      });
      setAllItems(_taxs)
      setTotalTax(_total)
      taxesGroup.map((tg: any) => {
        if (tg.id == id) {
          setGname(tg.name)
          setIsDefault(tg.isPrimary)
        }
      })
    }
    setIsLoading(false)

  }
  const handleClose = () => props.alertFun(false);
  const handleShow = () => props.alertFun(true);

  const calcu = () => {
    const _taxs = [...allItems]
    var _total = 0;
    for (var j = 0; j < _taxs.length; j++)
      _total += _taxs[j].isChoosed ? Number(_taxs[j].amount) : 0
    setTotalTax(_total)
  }
  const handleSwitchChange = (e: any, i: number) => {
    const _taxs = [...allItems]
    _taxs[i].isChoosed = !_taxs[i].isChoosed;
    setAllItems(_taxs)
    calcu();
  }
  async function addGroupTax() {
    if (gname.length < 3) {
      Toastify('error', 'Enter Group Name First At least 3 Characters');
      return;
    }
    if (totalTax == 0 || totalTax == null) {
      Toastify('error', 'Choose Some Taxes (At Least 2 Chooses)');
      return;
    }
    setIsLoading(true)
    var result = await apiInsertCtr({ type: 'taxes', subType: 'insertGroupTax', shopId, data: allItems, gname, isDefault, id })
    const { success, data } = result;
    if (!success) {
      Toastify('error', 'Has Error ,try Again');
      return;
    }
    if (id == 0) {
      if (isDefault) {
        const _taxs = [...dataItems]
        for (var j = 0; j < _taxs.length; j++)
          dataItems[j].isPrimary = false;
      }
      dataItems.push({ id: data, name: gname, amount: totalTax, amountType: '', isPrimary: isDefault, isChoosed: 0, taxType: 'group', isNew: 0 })
    } else {
      if (isDefault) {
        const _taxs = [...dataItems]
        for (var j = 0; j < _taxs.length; j++)
          dataItems[j].isPrimary = id == dataItems[j].id
      }
    }
    handleClose()
    setIsLoading(false)
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
          <Modal.Title>Add New Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card.Body>
            {
              isLoading ? <h5 style={{ textAlign: "center" }}>Wait...</h5> : <Table className="table table-hover" responsive >
                <thead className="thead-dark">
                  <tr>
                    <th style={{ width: '50%' }}>Taxes List</th>
                    <th style={{ width: '15%' }}>Amount</th>
                    <th style={{ width: '35%' }}>Choose</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    allItems.map((ex: ITax, i: number) => {
                      if (!ex.isNew) {
                        return [<>
                          {!ex.isSplit ? <tr key={i}>
                            <td>{ex.name} <span style={{ fontSize: '10px', color: '#a3a0a0' }}>{ex.isPrimary ? '[Primary]' : ''}</span></td>
                            <td>{ex.amount}{ex.amountType == 'percentage' ? '%' : locationSettings.currency_code }</td>
                            <td><Form.Check type="checkbox" className="custom-checkbox" checked={ex.isChoosed ? true : false} onChange={(e) => { handleSwitchChange(e, i) }} /></td>
                          </tr>
                            : <tr> <th colSpan={3} style={{ width: '100%' }}>{ex.name}</th></tr>}

                        </>
                        ]
                      }
                    })
                  }
                  <tr>
                    <th>Group Name</th>
                    <th></th>
                    <th>Is Default</th>
                  </tr>
                  <tr>
                    <td>
                      <input type="text" name="tax-name" value={gname} className="form-control p-2" placeholder="Enter Group Name" onChange={(e) => { setGname(e.target.value) }} />
                    </td>
                    <td></td>
                    <td><Form.Check type="switch" className="custom-switch" checked={isDefault} onChange={(e) => { setIsDefault(!isDefault) }} /></td>
                  </tr>
                  <br />
                </tbody>
              </Table>
            }

          </Card.Body>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => addGroupTax()}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
export default AddGroupModal;