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
import { IPayment, userDashboard } from '@models/common-model';
import { paymentTypeData } from '@models/data';
import Select from 'react-select';

const AddNewPayment = (props: any) => {
  const { totalLeft, shopId, purchaseId, selectedIndex, orderPayments, setOrderPayments } = props;
  const [formObj, setFormObj] = useState<IPayment>({
    id: 0,
    payment_type: '',
    amount: 0,
    created_at: '',
  });

  const [errorForm, setErrorForm] = useState({ name: false, username: false, password: false });
  // const [_orderPayments, setOrderPayments] = useState<{ id: number, payment_type: string, amount: number, created_at: string }[]>([])
  const [business, setBusiness] = useState<{ id: number; name: string }[]>([]);
  const colourStyles = { control: (style: any) => ({ ...style, borderRadius: '10px' }) };
  const [paymentTypes, setPaymentTypes] =
    useState<{ value: string; label: string }[]>(paymentTypeData);

  async function insertPayment() {
    const { success, newdata, msg } = await apiInsertCtr({
      type: 'transactions',
      subType: 'addPayment',
      data: { frm: formObj, totalLeft, purchaseId },
      shopId,
    });

    if (!success) {
      alert(msg);
      return;
    }

    props.purchases[selectedIndex].payment_status = newdata.status;

    var _orders = [...orderPayments];
    _orders.push(newdata.payment);
    setOrderPayments(_orders);

    props.setIsAddNew(false);
  }
  var errors = [];
  useEffect(() => {
    setOrderPayments(orderPayments);
    // console.log(props.index);
    // if (props.index > -1)
    setFormObj({ ...formObj, amount: totalLeft });
  }, []);

  return (
    <>
      <form className="form-style">
        <div className="col-md-12">
          <div className="col-md-6">
            <div className="form-group2">
              <label>
                Payment Type: <span className="text-danger">*</span>
              </label>
              <Select
                styles={colourStyles}
                options={paymentTypes}
                value={paymentTypes.filter((f: any) => {
                  return f.value == formObj.payment_type;
                })}
                onChange={(itm) => {
                  setFormObj({ ...formObj, payment_type: itm!.value });
                }}
              />
              {errorForm.name && <p className="p-1 h6 text-danger ">Enter Full Name</p>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group2">
              <label>Amount:</label>
              <input
                type="number"
                className="form-control"
                placeholder=""
                value={formObj.amount}
                min={0}
                step={0.1}
                onChange={(e) => {
                  setFormObj({ ...formObj, amount: parseFloat(e.target.value) });
                }}
              />
            </div>
          </div>
        </div>
        <br />
        <button
          type="button"
          className="btn m-btn btn-primary p-2 "
          onClick={(e) => {
            e.preventDefault();
            errors = [];
            // if (formObj.name.length == 0) errors.push('error')
            // if (formObj.username.length == 0) errors.push('error')

            // setErrorForm({
            //     ...errorForm,
            //     name: formObj.name.length == 0 ? true : false,
            //     username: formObj.username.length == 0 ? true : false,
            //     password: formObj.password.length == 0 ? true : false,
            // })
            if (errors.length == 0) {
              insertPayment();
            }
          }}>
          Save
        </button>
      </form>
      <hr />
    </>
  );
};
export default AddNewPayment;
