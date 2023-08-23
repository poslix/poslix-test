import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { Toastify } from 'src/libs/allToasts';
import { clearCart } from 'src/redux/slices/cart.slice';
import HoldModal from '../../modals/HoldModal';
import OrdersModal from '../../modals/hold-orders/HoldOrdersModal';
import PaymentModal from '../../modals/PaymentModal';
import ConfirmationModal from 'src/components/modals/confirmation-modal/ConfirmationModal';
import { selectCartByLocation } from 'src/redux/slices/cart.slice';

export const OrdersFooter = ({
  orderEditDetails,
  details,
  holdObj,
  shopId,
  selectedHold,
  lang,
  tax,
  __WithDiscountFeature__total,
  setDiscount,
  totalDiscount,
  ...props
}: any) => {
  const dispatch = useAppDispatch();
  const selectCartForLocation = selectCartByLocation(shopId);
  const allCart = useAppSelector((state) => state.cart);
  const cart = useAppSelector(selectCartForLocation); // current location order
  // assumption of one order at a time / one cart

  const [clearCartModal, setClearCartModal] = useState<boolean>(false);
  const [holdModal, setHoldModal] = useState<boolean>(false);

  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const HoldModalHandler = (status: boolean) => {
    setIsShowModal(status);
  };
  const [paymentModalShow, setPaymentModalShow] = useState<boolean>(false);

  const [isShowOrdersModal, setIsShowOrdersModal] = useState<boolean>(false);

  const handleCartClear = () => {
    dispatch(clearCart({ location_id: shopId }));
    setClearCartModal(false);
  };

  return (
    <>
      {/* <PaymentModal
        selectedHold={selectedHold}
        shopId={shopId}
        orderEditDetails={orderEditDetails}
        openDialog={paymentModalHandler}
        statusDialog={paymentModalShow}
        holdObj={props.holdObj}
        details={props.details}
        // with discount feature
        tax={tax}
        __WithDiscountFeature__total={__WithDiscountFeature__total}
        setDiscount={setDiscount}
        totalDiscount={totalDiscount}
      /> */}

      <div className="footer-up-flex gap-1">
        <Button
          disabled={!cart?.cartItems?.length}
          onClick={() => setClearCartModal(true)}
          className="flex-grow-1"
          variant="danger">
          {lang.cartComponent.delete}
        </Button>
        <HoldModal shopId={shopId} lang={lang} />
        <OrdersModal shopId={shopId} lang={lang} />
      </div>
      <div
        className="btn-group footer-payment-btns d-flex flex-grow-1 mt-1"
        role="group"
        aria-label="Basic mixed styles example"
        style={{ maxHeight: '5%', minHeight: '40px', background: '#025c53' }}>
        <button
          type="button"
          onClick={() => {
            if (details.customerId != undefined) {
              if (details.totalAmount > 0 || orderEditDetails.total_price > 0) {
                setPaymentModalShow(true);
              } else Toastify('error', 'Select Product(s) First');
            } else Toastify('error', 'Select Cuctomer First');
          }}
          className="btn btn-primary fs-15 fs-sm-20">
          {orderEditDetails.isEdit ? lang.cartComponent.saveOrder : lang.cartComponent.checkout}
        </button>
      </div>
      {/* MODALS */}
      <ConfirmationModal
        show={clearCartModal}
        onConfirm={handleCartClear}
        onClose={() => setClearCartModal(false)}
        message="Are you sure you want to clear cart?"
      />
    </>
  );
};
