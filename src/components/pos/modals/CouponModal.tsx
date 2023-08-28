import React, { useState, useContext, useEffect } from 'react';
import { apiFetchCtr } from '../../../libs/dbUtils';
import { useRecoilState } from 'recoil';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { cartJobType } from '../../../recoil/atoms';

import { IHold } from '../../../models/common-model';
import { UserContext } from 'src/context/UserContext';

const MenuCouponModal = (props: any) => {
  const { openDialog, isShowModal, shopId } = props;
  const [couponText, setCouponText] = useState('');
  const [, setJobType] = useRecoilState(cartJobType);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [ordersList, setOrdersList] = useState([]);
  const [displayOrder, setDisplayOrder] = useState([]);
  const [holdItems, setHoldItems] = useState<IHold[]>([]);
  const removeElement = (i: number) => {
    const newItems = [...holdItems];
    newItems.splice(i, 1);
    setHoldItems(newItems);
    localStorage.setItem('holdItems' + shopId, JSON.stringify(newItems));
  };
  const RestoreElement = (val: any, index: number) => {
    setJobType({ req: 1, val: val, val2: index + '' });
    openDialog(false);
  };
  async function getOrders(barCodeId = -1) {
    setIsLoading(true);
    var result = await apiFetchCtr({ fetch: 'pos', subType: 'getLastOrders', barCodeId, shopId });

    if (result.success) {
      if (barCodeId == -1) {
        setOrdersList(result?.newdata);
        setIsLoading(false);
        setIsLoadingDetails(true);
      } else {
        setDisplayOrder(result?.newdata);
        setIsLoading(true);
        setIsLoadingDetails(false);
      }
    }
  }
  useEffect(() => {
    if (isShowModal) setJobType({ req: 6, val: '' });
    const holdItemsFromStorage = localStorage.getItem('holdItems' + shopId);
    if (holdItemsFromStorage) setHoldItems(JSON.parse(holdItemsFromStorage).reverse());
    getOrders();
  }, []);
  return (
    <>
      <Dialog open={isShowModal} className="poslix-modal">
        <DialogTitle className="poslix-modal text-primary">Enter Coupon</DialogTitle>
        <DialogContent className="poslix-modal-content">
          <div className="poslix-modal" style={{ minWidth: '500px' }}>
            <div className="modal-content">
              <div className="form-group2">
                <label>Coupon Code:</label>
                <input
                  type="text"
                  className="form-control"
                  value={couponText}
                  min={0}
                  step={0.1}
                  onChange={(e) => setCouponText(e.target.value)}
                />
              </div>

              <div className="modal-footer pt-2">
                {couponText.length > 0 && (
                  <button
                    type="button"
                    onClick={() => console.log(true)}
                    className="btn  fs-15 fs-sm-20 bg-success mx-3"
                    style={{ color: 'white' }}>
                    APPLY COUPON
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    openDialog(false);
                  }}
                  className="btn  fs-15 fs-sm-20 bg-danger"
                  style={{ color: 'white' }}>
                  {' '}
                  <i className="ri-close-line me-1 align-middle" /> Close
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MenuCouponModal;
