import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { clearOrders } from '../../../recoil/atoms';
import HoldModal from '../modals/HoldModal';
import OrdersModal from '../modals/hold-orders/HoldOrdersModal';
import PaymentModal from '../modals/PaymentModal';
import { Toastify } from 'src/libs/allToasts';
import { Container } from 'react-bootstrap';
import MenuCouponModal from '../modals/MenuCouponModal';
import CouponModal from '../modals/CouponModal';
export const MenuOrdersFooter = (props: any) => {
  const [clearEvent, setClear] = useRecoilState(clearOrders);
  const { orderEditDetails, details, holdObj, shopId, selectedHold } = props;
  const [isShowCouponModal, setIsShowCouponModal] = useState<boolean>(false);

  const OrdersModalHandler = (status: boolean) => {
    setIsShowCouponModal(status);
  };

  return (
    <>
      <CouponModal
        shopId={shopId}
        openDialog={OrdersModalHandler}
        isShowModal={isShowCouponModal}
      />
      {isShowCouponModal && (
        <CouponModal
          shopId={shopId}
          openDialog={OrdersModalHandler}
          isShowModal={isShowCouponModal}
        />
      )}

      <div className="footer-up-flex ">
        <button
          type="button"
          onClick={() => {
            if (details.customerId != undefined) {
              if (details.totalAmount > 0 || orderEditDetails.total_price > 0) {
                setIsShowCouponModal(true);
              } else Toastify('error', 'Select Product(s) First');
            } else Toastify('error', 'Select Cuctomer First');
          }}
          className="btn footer-up-flex-item  btn-primary button fs-15 fs-sm-20">
          Checkout
        </button>

        <button
          type="button"
          onClick={() => setIsShowCouponModal(true)}
          className="btn  fs-15 fs-sm-20"
          style={{ background: '#ea6c6d', color: 'white' }}>
          APPLY COUPON
        </button>
      </div>
    </>
  );
};
