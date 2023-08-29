import React, { useState, useContext, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { IHold, IpaymentRow } from '../../../models/common-model';
import { apiInsertCtr } from '../../../libs/dbUtils';
import { cartJobType } from '../../../recoil/atoms';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { paymentTypeData } from '@models/data';
import { ProductContext } from 'src/context/ProductContext';
import { UserContext } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';

const SalesPaymentModal = (props: any) => {
  const { locationSettings } = useContext(UserContext);
  const {
    openDialog,
    statusDialog,
    setPaymentModalShow,
    setPaymentModalData,
    userData,
    location,
    holdObj,
    details,
    shopId,
    orderEditDetails,
    selectedHold,
    // to call the parent function to edite
    handlePrint,
    completeHandele,
    ///
  } = props;
  // with discount feature
  const { tax, __WithDiscountFeature__total, setDiscount, totalDiscount } = props;
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [mustPay, setMustPay] = useState<number>(0);
  const [difference, setDifference] = useState<number>(0);
  const [hasError, setHasError] = useState<{ st: boolean; msg: string }>({
    st: false,
    msg: '',
  });
  const [, setJobType] = useRecoilState(cartJobType);
  const [paymentRows, setPaymentRows] = useState<IpaymentRow[]>([
    { amount: 0, method: 'cash', notes: '' },
  ]);

  const [canPay, setCanPay] = useState<boolean>(true);
  const [orderNote, setOrderNote] = useState<string>('');
  const selectStyle = {
    control: (style: any) => ({
      ...style,
      fontSize: '12px',
      minWidth: '150px',
      maxHeight: '10px',
    }),
    menu: (base: any) => ({ ...base, fontSize: '12p x' }),
  };
  const [paymentMethods] = useState(paymentTypeData);
  const { products, setProducts, variations, setVariations } = useContext(ProductContext);
  const [holdItems, setHoldItems] = useState<IHold[]>([]);

  useEffect(() => {
    setHasError({ st: false, msg: '' });
    let _mustPay = +Math.abs(
      __WithDiscountFeature__total + details?.totalAmount - details?.subTotal
    ).toFixed(locationSettings?.location_decimal_places);
    setMustPay(_mustPay);
    setPaymentRows([{ amount: _mustPay, method: 'cash', notes: '' }]);

    if (!statusDialog) return;

    setOrderNote(orderEditDetails?.notes != null ? orderEditDetails?.notes : '');
    let _id = 0,
      fabs: any = [];
    holdObj?.orders.map((od: any, i: number) => {
      if (od.type == 'tailoring_package') {
        _id = holdObj.quantity[i].tailoringCutsom?.fabric_id!;
        let index = fabs.findIndex((item: any) => item.product_id == _id);
        if (index !== -1)
          fabs[index].qty +=
            holdObj.quantity[i].tailoringCutsom?.fabric_length! * holdObj.quantity[i].quantity;
        else
          fabs.push({
            product_id: _id,
            qty: holdObj.quantity[i].tailoringCutsom?.fabric_length! * holdObj.quantity[i].quantity,
          });
      }
    });
    holdObj?.orders.map((od: any, i: number) => {
      if (od.type == 'single' && od.is_fabric == 1 && od.sell_over_stock == 0) {
        _id = od.product_id;
        let index = fabs.findIndex((item: any) => item.product_id == _id);
        if (index !== -1) {
          let _sum = fabs[index].qty + holdObj.quantity[i].quantity;
          let _pro: any = products[holdObj.quantity[i].productIndex];
          if (_sum > _pro.total_qty) {
            Toastify('error', 'Over Stock #' + od.name);
            openDialog(false);
          }
        }
      }
    });
    const holdItemsFromStorage = localStorage.getItem('holdItems' + shopId);
    if (holdItemsFromStorage) setHoldItems(JSON.parse(holdItemsFromStorage).reverse());
  }, [statusDialog]);

  function calculation(_rows: IpaymentRow[]) {
    let _sum = 0;
    localStorage.setItem('payment', JSON.stringify(_rows));
    _rows.map((_i: IpaymentRow) => (_sum += Number(_i.amount!)));
    setTotalPaid(+Number(_sum).toFixed(locationSettings?.location_decimal_places));
  }
  const style = { minWidth: '500px' };
  const paymentRowChange = (index: any, evnt: any): void => {
    const _rows: any = [...paymentRows];
    if ('label' in evnt) _rows[index].method = evnt.value;
    else {
      const { name, value } = evnt.target;
      _rows[index][name] = value;
    }
    setPaymentRows(_rows);
    calculation(_rows);
  };
  const handlePayment = () => {
    let isOk = true;
    paymentRows.map((pr) => {
      if (pr.method!.length < 2) {
        isOk = false;
        return;
      }
    });
    if (!isOk) {
      Toastify('error', 'Choose Payment Method First ');
      return;
    }
    completeHandele(paymentRows[0], userData);
    setPaymentModalShow(false);
    // remove comment to call the api
    // canPay ? insertPayment() : Toastify("error", "Wrong Amount!!");
  };

  async function insertPayment() {
    var result = await apiInsertCtr({
      type: 'transactions',
      subType: 'newPosSale',
      data: {
        items: holdObj,
        details: {
          isReturn: userData.id,
          totalAmount: +userData.total_price,
        },
        paymentRows,
        orderEditDetails: {
          total_price: +userData.amount + +paymentRows[0].amount,
          isEdit: true,
          orderId: userData.id,
        },
        orderNote,
      },
      shopId,
    });
    if (result.success) {
      Toastify('success', 'successfully done');
      setPaymentModalShow(false);
      setPaymentModalData({});
      setJobType({ req: 2, val: orderNote, val2: result.newdata });
      handlePrint();
      if (
        holdItems.length > 0 &&
        selectedHold != undefined &&
        selectedHold.holdId != null &&
        selectedHold.holdId > -1
      ) {
        holdItems.splice(selectedHold.holdId, 1);
        localStorage.setItem('holdItems' + shopId, JSON.stringify(holdItems));
      }
    } else {
      alert('has error, Try Again...');
    }
  }
  return (
    <>
      <ToastContainer />
      <Dialog open={statusDialog} className="poslix-modal" sx={style}>
        <DialogTitle>Payment</DialogTitle>
        <DialogContent className="poslix-modal-content">
          <div className="modal-body">
            <div className="d-flex gap-2 justify-between" style={{ fontSize: 'small' }}>
              <div
                style={{
                  backgroundColor: '#ccc',
                  borderRadius: '5px',
                  paddingInline: '16px',
                  paddingTop: '6px',
                }}>
                <p>Customer: {userData?.customer_name}</p>
              </div>
              <div
                style={{
                  backgroundColor: '#ccc',
                  borderRadius: '5px',
                  paddingInline: '16px',
                  paddingTop: '6px',
                }}>
                <p>Invoice No.: {userData.id}</p>
                <p>Location: {location}</p>
              </div>
              <div
                style={{
                  backgroundColor: '#ccc',
                  borderRadius: '5px',
                  paddingInline: '16px',
                  paddingTop: '6px',
                }}>
                <p>Total Amount: {userData.total_price}</p>
                <p>Payment Note: {userData.note ? userData.note : '...'}</p>
              </div>
            </div>
            <div>
              <div className="payment-item">
                <label className="label" htmlFor="abount">
                  Order Note
                </label>
                <textarea
                  className="form-control"
                  name="order_note"
                  maxLength={80}
                  onChange={(e) => setOrderNote(e.target.value)}
                  value={orderNote}
                />
              </div>
              {paymentRows.map((paymentRow, i: number) => {
                return (
                  <div key={i} className="payment-box">
                    <div className="payment-item">
                      <label className="label" htmlFor="abount">
                        Amount
                      </label>
                      <input
                        className="form-control"
                        type="number"
                        name="amount"
                        onChange={(evnt) => paymentRowChange(0, evnt)}
                        value={paymentRow.amount ? paymentRow.amount : userData.totalDue}
                      />
                    </div>

                    <div className="payment-item">
                      <label className="label" htmlFor="abount">
                        Method{' '}
                      </label>
                      <Select
                        styles={selectStyle}
                        options={paymentMethods}
                        onChange={(evnt: any) => paymentRowChange(i, evnt)}
                        value={paymentMethods.find((f) => {
                          return f.value == paymentRow.method;
                        })}
                      />
                    </div>

                    <div className="payment-item">
                      <label className="label" htmlFor="abount">
                        Pay Note
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="notes"
                        onChange={(evnt) => paymentRowChange(i, evnt)}
                        value={paymentRow.notes}
                      />
                    </div>

                    <div className="payment-item">
                      <label className="label" htmlFor="abount">
                        Payed on
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="notes"
                        onChange={(evnt) => paymentRowChange(i, evnt)}
                        value={new Date().toString()}
                        disabled
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="modal-footer">
            <a
              onClick={() => {
                setPaymentModalShow(false);
                setPaymentModalData({});
              }}
              href="#"
              className="btn btn-link link-success fw-medium">
              <i className="ri-close-line me-1 align-middle" /> Close
            </a>
            <button
              type="button"
              className={
                'btn btn-label ' + (canPay ? 'btn-primary' : 'btn-danger') + ' right nexttab'
              }
              data-nexttab="pills-finish-tab"
              onClick={() => {
                handlePayment();
              }}>
              <i className="ri-shopping-basket-line label-icon align-middle fs-16 ms-2" />
              {canPay ? 'Complete Order' : 'Amount(s) Wrong!'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SalesPaymentModal;
