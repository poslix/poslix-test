import React, { useState, useContext, useEffect } from "react";
import { useRecoilState } from "recoil";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { IHold, IpaymentRow } from "../../../models/common-model";
import { apiFetchCtr, apiInsertCtr } from "../../../libs/dbUtils";
import { cartJobType } from "../../../recoil/atoms";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, ButtonGroup, Card } from "react-bootstrap";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { paymentTypeData } from "@models/data";
import { ProductContext } from "src/context/ProductContext";
import { UserContext } from "src/context/UserContext";
import { Toastify } from "src/libs/allToasts";
import { ToastContainer } from "react-toastify";
import { Prev } from "react-bootstrap/esm/PageItem";
const PaymentModal = (probs: any) => {
  const { locationSettings } = useContext(UserContext);
  const {
    openDialog,
    statusDialog,
    holdObj,
    details,
    shopId,
    orderEditDetails,
    selectedHold,
  } = probs;

  // with discount feature
  const { tax, __WithDiscountFeature__total, setDiscount, totalDiscount } =
    probs;
    
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [mustPay, setMustPay] = useState<number>(0);
  const [totalPaying, setTotalPaying] = useState<number>(0);
  const [difference, setDifference] = useState<number>(0);
  
  const [hasError, setHasError] = useState<{ st: boolean; msg: string }>({
    st: false,
    msg: "",
  });
  const [jobType, setJobType] = useRecoilState(cartJobType);
  
  // mohamed elsyea
  const [paymentRows, setPaymentRows] = useState<IpaymentRow[]>([
    { total: 0, amount: 0, method: "cash", notes: "", totalDue: difference, return:(difference * -1) },
  ]);

  const [currentRow, setCurrentRow] = useState<number>(0);

  const [toBeAdded, setToBeAdded]= useState<number>(0)
  // ---------------
  const [canPay, setCanPay] = useState<boolean>(true);
  const [orderNote, setOrderNote] = useState<string>("");
  const selectStyle = {
    control: (style: any) => ({
      ...style,
      fontSize: "12px",
      minWidth: "150px",
      maxHeight: "10px",
    }),
    menu: (base: any) => ({ ...base, fontSize: "12px" }),
  };
  const [paymentMethods, setPaymentMethods] = useState(paymentTypeData);
  
  // async function initDataPage() {
  //   var result = await apiFetchCtr({ fetch: 'payment', subType: 'getPayments', shopId })
  //   const { success, data } = result;
  //   if (success) {
  //     setPaymentMethods(data?.payments?.filter(method => method.enabled).map(method => {
  //       return {label: method.name, value: method.name.toLowerCase() }
  //     }))
  //   }
  // }
  // useEffect(() => {
  //   initDataPage()
  // }, [])
  const { products, setProducts, variations, setVariations } =
    useContext(ProductContext);
  const [holdItems, setHoldItems] = useState<IHold[]>([]);

  useEffect(() => {
    setHasError({ st: false, msg: "" });
    
    let _mustPay = +Math.abs(
      __WithDiscountFeature__total + details.totalAmount - details.subTotal
    ).toFixed(locationSettings.currency_decimal_places);
    
    setMustPay(_mustPay);
    // mohamed elsayed
    setPaymentRows([{ total: _mustPay, amount: _mustPay, method: "cash", notes: "", return: (difference * -1), totalDue: difference}]);
    // -----------------
    if (!statusDialog) return;

    setOrderNote(orderEditDetails.notes != null ? orderEditDetails.notes : "");
    let _id = 0,
      fabs: any = [];
    holdObj.orders.map((od: any, i: number) => {
      if (od.type == "tailoring_package") {
        _id = holdObj.quantity[i].tailoringCutsom?.fabric_id!;
        let index = fabs.findIndex((item: any) => item.product_id == _id);
        if (index !== -1)
          fabs[index].qty +=
            holdObj.quantity[i].tailoringCutsom?.fabric_length! *
            holdObj.quantity[i].quantity;
        else
          fabs.push({
            product_id: _id,
            qty:
              holdObj.quantity[i].tailoringCutsom?.fabric_length! *
              holdObj.quantity[i].quantity,
          });
      }
    });
    holdObj.orders.map((od: any, i: number) => {
      if (od.type == "single" && od.is_fabric == 1 && od.sell_over_stock == 0) {
        _id = od.product_id;
        let index = fabs.findIndex((item: any) => item.product_id == _id);
        if (index !== -1) {
          let _sum = fabs[index].qty + holdObj.quantity[i].quantity;
          let _pro: any = products.products[holdObj.quantity[i].productIndex];
          if (_sum > _pro.total_qty) {
            Toastify("error", "Over Stock #" + od.name);
            openDialog(false);
          }
        }
      }
    });
    const holdItemsFromStorage = localStorage.getItem("holdItems" + shopId);
    if (holdItemsFromStorage)
      setHoldItems(JSON.parse(holdItemsFromStorage).reverse());
  }, [statusDialog]);

  function calculation(_rows: IpaymentRow[]) {
    let _sum = 0;
    localStorage.setItem("payment", JSON.stringify(_rows));
    _rows.map((_i: IpaymentRow) => (_sum += Number(_i.amount!)));
    setTotalPaid(
      +Number(_sum).toFixed(locationSettings.currency_decimal_places)
    );
  }
  const style = { minWidth: "500px" };

  const paymentRowChange = (index: any, evnt: any): void => {
    const _rows: any = [...paymentRows];
    
    if ("label" in evnt) _rows[index].method = evnt.value;
    // mohamed elsayed
    else {
      const { name, value } = evnt.target;
      _rows[index][name] = value;
      if(name === 'amount'){
        let diff = Number((_rows[index]['total'] - (Number(value) + toBeAdded)).toFixed(locationSettings.currency_decimal_places));
        
        if(diff<0){
        _rows[index]['return'] =  Number((diff * -1))
        _rows[index]['totalDue'] = 0
        
        }else{
          _rows[index]['totalDue'] =   Number(diff)
        _rows[index]['return'] = 0
        }
        // _rows[index]['return'] = (difference * -1)
      }
    }
    // --------------------
    setPaymentRows(_rows);
    // setPaymentRows((Prev) => [...Prev][0]={..._rows[index], totalDue: [...Prev][0].totalDue, return: [...Prev][0].return});
    calculation(_rows);
    let calcTotal = 0;    
    _rows.map(row => calcTotal += Number(row.amount))
    setTotalPaying(calcTotal)
  };
  const paymentRowDel = (index: number): void => {
    if (paymentRows.length == 1 || index !== paymentRows.length - 1) return;
    const _rows: any = [...paymentRows];
    _rows.splice(index, 1);
    setPaymentRows(_rows);
    calculation(_rows);
    let calcTotal = 0;
    _rows.map(row => calcTotal += Number(row.amount))
    setTotalPaying(calcTotal)
  };
  // mohamed elsayed
  const newPaymentRow = (): void => {
    let rows: IpaymentRow[] = [...paymentRows];
    let totals = 0;
    rows.forEach(element => {
      totals += Number(element.amount)
    });
    setToBeAdded(totals);
    
    rows.push({
      total: rows[rows.length-1].total,
      amount: difference < 0 ? Math.abs(difference) : 0,
      // amount: totals,
      method: "cash",
      notes: "",
      return: difference < 0 ? 0 : rows[rows.length-1].return ,
      totalDue: difference < 0 ? 0 : rows[rows.length-1].totalDue
    });
    setPaymentRows(rows);
    setCurrentRow(rows.length-1);
    calculation(rows);
    let calcTotal = 0;
    rows.map(row => calcTotal += Number(row.amount))
    setTotalPaying(calcTotal)
  };
  // -----------------------
  useEffect(() => {
    let isCash = paymentRows[0].method === "cash" ? true : false;
    if (orderEditDetails.isEdit) {
      // setCanPay(isCash ? totalPaid >= _WithDiscountFeature_total : true);
      setCanPay(true);
      setDifference(
        +Number(
          totalPaid -
          +(
            __WithDiscountFeature__total +
            (details.totalAmount - details.subTotal)
          ).toFixed(locationSettings.currency_decimal_places)
        ).toFixed(locationSettings.currency_decimal_places)
      );
    } else {
      // setCanPay( isCash ?
      //   totalPaid.toFixed(locationSettings.currency_decimal_places) >=
      //     _WithDiscountFeature_total.toFixed(
      //       locationSettings.currency_decimal_places
      //     ) : true
      // );

      // setCanPay( isCash ?
      //   totalPaid >=
      //     _WithDiscountFeature_total : true
      // );
      setCanPay(true);
      setDifference(
        +Number(
          totalPaid -
          +(
            __WithDiscountFeature__total +
            (details.totalAmount - details.subTotal)
          ).toFixed(locationSettings.currency_decimal_places)
        ).toFixed(locationSettings.currency_decimal_places)
      );
    }
    const _rows: any = [...paymentRows];
    calculation(_rows);
  }, [totalPaid, paymentRows]);
  const handlePayment = () => {
    setCurrentRow(0);
    setToBeAdded(0);
    let isOk = true;
    paymentRows.map((pr) => {
      if (pr.method!.length < 2) {
        isOk = false;
        return;
      }
    });
    if (!isOk) {
      Toastify("error", "Choose Payment Method First ");
      return;
    }
    canPay ? insertPayment() : Toastify("error", "Wrong Amount!!");
  };
  function decreseStock() {
    let sumQty = 0;
    holdObj.quantity.map((qt: any, index: number) => {
      sumQty = 0;
      if (holdObj.orders[index].is_service == 0) {
        if (holdObj.orders[index].variation_id > 0) {
          //for variations
          if (qt.productIndex != -1) {
            var _variations_multi: any =
              variations.variations_multi[qt.productIndex];
            var isMore = _variations_multi.length > 1;
            qt.prices.map((ps: any, multi_idex: number) => {
              if (ps.stock_id > 0) {
                _variations_multi[multi_idex].qty -= ps.qty;
                sumQty += ps.qty;
              }
            });
            _variations_multi.map((items: any, multi_idex: number) => {
              if (isMore && items.qty == 0)
                _variations_multi.splice(multi_idex, 1);
            });
            var _variations: any = variations.variations;
            _variations[qt.productIndex] = {
              ..._variations[qt.productIndex],
              total_qty: _variations[qt.productIndex].total_qty - sumQty,
            };
          }
        } else {
          //for products
          if (qt.productIndex != -1) {
            var _products_multi: any = products.products_multi[qt.productIndex];
            var isMore = _products_multi.length > 1;
            qt.prices.map((ps: any, multi_idex: number) => {
              if (ps.stock_id > 0) {
                _products_multi[multi_idex].qty -= ps.qty;
                sumQty += ps.qty;
              }
            });
            _products_multi.map((items: any, multi_idex: number) => {
              if (items.qty == 0 && isMore)
                _products_multi.splice(multi_idex, 1);
            });
            var _products: any = products.products;
            const _dd = {
              ..._products[qt.productIndex],
              total_qty: _products[qt.productIndex].total_qty - sumQty,
            };
            _products[qt.productIndex] = _dd;
          }
        }
      }
    });
    if (sumQty > 0) {
      setVariations({ ...variations });
      setProducts({ ...products });
    }
  }
  async function insertPayment() {
    var result = await apiInsertCtr({
      type: "transactions",
      subType: "newPosSale",
      data: {
        items: holdObj,
        details,
        paymentRows,
        orderEditDetails,
        orderNote,
      },
      shopId,
    });
    if (result.success) {
      Toastify("success", "successfully done");
      openDialog(false);
      setJobType({ req: 2, val: orderNote, val2: result.newdata });
      if (
        holdItems.length > 0 &&
        selectedHold != undefined &&
        selectedHold.holdId != null &&
        selectedHold.holdId > -1
      ) {
        holdItems.splice(selectedHold.holdId, 1);
        localStorage.setItem("holdItems" + shopId, JSON.stringify(holdItems));
      }
    } else {
      alert("has error, Try Again...");
    }
  }
  function fixAmount() {
    if (paymentRows.length > 0) {
      const _rows: any = [...paymentRows];
      if (paymentRows.length == 1)
        paymentRows[0].amount = __WithDiscountFeature__total + Number((details.totalAmount - details.subTotal).toFixed(locationSettings.currency_decimal_places));
      else
        difference > 0
          ? (paymentRows[paymentRows.length - 1].amount! -= difference)
          : (paymentRows[paymentRows.length - 1].amount! += difference);
      setPaymentRows(_rows);
      calculation(_rows);
    }
  }

  return (
    <>
      <ToastContainer />
      <Dialog open={statusDialog} className="poslix-modal" sx={style}>
        <DialogTitle>Payment</DialogTitle>
        <DialogContent className="poslix-modal-content">
          <div className="modal-body">
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
                        min={0}
                        onChange={(evnt) => paymentRowChange(i, evnt)}
                        value={paymentRow.amount}
                      />
                    </div>

                    <div className="payment-item">
                      <label className="label" htmlFor="abount">
                        Method{" "}
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
                        Action
                      </label>
                      <ButtonGroup className="mb-2 m-buttons-style">
                        <Button onClick={() => paymentRowDel(i)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </ButtonGroup>
                    </div>

                  </div>


                );
              })}
            </div>
            <div className="col-lg-4 col-sm-6">
              <button
                type="button"
                onClick={newPaymentRow}
                className="btn btn-primary"
                data-nexttab="pills-finish-tab"
              >
                Add Payment Row
              </button>
            </div>
            {/* end */}
          </div>
            <div className="payment-box">
              <div className="view_payment" >
                <div className="view_payment_item">
                  <span>Total payable</span>
                  <span>{locationSettings.currency_code+" "+paymentRows[paymentRows.length - 1].total}</span>
                </div>
                <div className="view_payment_item">
                  <span>Total paying</span>
                  <span> {locationSettings.currency_code+" "+(totalPaying || paymentRows[paymentRows.length - 1].amount + toBeAdded).toString()}</span>
                </div>
                <div className="view_payment_item">
                  <span>Change Return</span>
                  <span> {locationSettings.currency_code+" "+paymentRows[paymentRows.length - 1].return }</span>
                </div>
                <div className="view_payment_item">
                  <span>Balance</span>
                  <span>{locationSettings.currency_code+" "+paymentRows[paymentRows.length - 1].totalDue }</span>
                </div>
              </div>
            </div>
          <div className="modal-footer">
            <a
              onClick={() => {
                openDialog(false);
                setCurrentRow(0)
                setToBeAdded(0);
              }}
              href="#"
              className="btn btn-link link-success fw-medium"
            >
              <i className="ri-close-line me-1 align-middle" /> Close
            </a>
            <button
              type="button"
              className={
                "btn btn-label " +
                (canPay ? "btn-primary" : "btn-danger") +
                " right nexttab"
              }
              data-nexttab="pills-finish-tab"
              onClick={handlePayment}
            >
              <i className="ri-shopping-basket-line label-icon align-middle fs-16 ms-2" />
              {canPay ? "Complete Order" : "Amount(s) Wrong!"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentModal;