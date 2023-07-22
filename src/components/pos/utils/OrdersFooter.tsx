import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { clearOrders } from "../../../recoil/atoms";
import HoldModal from "../modals/HoldModal";
import OrdersModal from "../modals/OrdersModal";
import PaymentModal from "../modals/PaymentModal";
import { Toastify } from "src/libs/allToasts";
export const OrdersFooter = (probs: any) => {
  const [clearEvent, setClear] = useRecoilState(clearOrders);
  const { orderEditDetails, details, holdObj, shopId, selectedHold, lang } = probs;
  // with discount feature
  const { tax, __WithDiscountFeature__total, setDiscount, totalDiscount } =
    probs;
  const _clearOrders = (): void => {
    const random = Math.random();
    setClear(random);
  };
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const HoldModalHandler = (status: boolean) => {
    setIsShowModal(status);
  };
  const [paymentModalShow, setPaymentModalShow] = useState<boolean>(false);

  const [isShowOrdersModal, setIsShowOrdersModal] = useState<boolean>(false);

  const OrdersModalHandler = (status: boolean) => {
    setIsShowOrdersModal(status);
  };
  const paymentModalHandler = (status: any) => {
    setPaymentModalShow(false);
  };
  const handleHoldFun = () => {
    if (holdObj.orders.length > 0) setIsShowModal(true);
    else Toastify("error", "No Product For Hold!");
  };

  return (
    <>
      {/* <Container /> */}
      <HoldModal
        shopId={shopId}
        openDialog={HoldModalHandler}
        isShowModal={isShowModal}
        holdObj={holdObj}
      />
      <PaymentModal
        selectedHold={selectedHold}
        shopId={shopId}
        orderEditDetails={orderEditDetails}
        openDialog={paymentModalHandler}
        statusDialog={paymentModalShow}
        holdObj={probs.holdObj}
        details={probs.details}
        // with discount feature
        tax={tax}
        __WithDiscountFeature__total={__WithDiscountFeature__total}
        setDiscount={setDiscount}
        totalDiscount={totalDiscount}
      />
      {isShowOrdersModal && (
        <OrdersModal
          shopId={shopId}
          openDialog={OrdersModalHandler}
          isShowModal={isShowOrdersModal}
          lang={lang}
        />
      )}
      <div className="footer-up-flex ">
        <button
          type="button"
          onClick={_clearOrders}
          className="btn footer-up-flex-item"
          style={{ background: "#ea6c6d" }}
        >
          {lang.cartComponent.delete}
        </button>
        <button
          type="button"
          onClick={() => handleHoldFun()}
          className="btn  footer-up-flex-item"
          style={{ background: "#e3d069" }}
        >
          {lang.cartComponent.hold}
        </button>
        <button
          type="button"
          onClick={() => setIsShowOrdersModal(true)}
          className="btn footer-up-flex-item"
          style={{ background: "#6c8dec" }}
        >
          {lang.cartComponent.orders}
        </button>
      </div>
      <div
        className="btn-group footer-payment-btns d-flex flex-grow-1 mt-1"
        role="group"
        aria-label="Basic mixed styles example"
        style={{ maxHeight: "5%", minHeight: "40px", background: "#025c53" }}
      >
        <button
          type="button"
          onClick={() => {
            if (details.customerId != undefined) {
              if (details.totalAmount > 0 || orderEditDetails.total_price > 0) {
                setPaymentModalShow(true);
              } else Toastify("error", "Select Product(s) First");
            } else Toastify("error", "Select Cuctomer First");
          }}
          className="btn btn-primary fs-15 fs-sm-20"
        >
          {orderEditDetails.isEdit ? lang.cartComponent.saveOrder : lang.cartComponent.checkout}
        </button>
      </div>
    </>
  );
};
