import React, { useContext } from 'react';
import { useRecoilState } from 'recoil';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { cartJobType } from 'src/recoil/atoms';
import { UserContext } from 'src/context/UserContext';

const VariationModal = (props: any) => {
  const {
    selectedProductForVariation,
    isOpenVariationDialog,
    setIsOpenVariationDialog,
    variations,
  } = props;
  const [, setJobType] = useRecoilState(cartJobType);
  const style = {
    minWidth: '500px',
  };
  const { locationSettings } = useContext(UserContext);

  const handleClick = (variation_id: number) => {
    setJobType({ req: 4, val: variation_id.toString() });
    setIsOpenVariationDialog(false);
  };
  return (
    <>
      <Dialog
        open={isOpenVariationDialog}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="poslix-modal">
        <DialogTitle className="poslix-modal-title text-primary">Choose One</DialogTitle>
        <DialogContent className="poslix-modal-content">
          <div className="modal-content">
            <div className="modal-body">
              <div className="packitems-container">
                {variations &&
                  variations
                    .filter((vt: any) => vt.product_id == selectedProductForVariation.product_id)
                    .map((vr: any, idx: number) => {
                      console.log(vr);
                      return (
                        <div
                          key={idx}
                          className="packitems-var"
                          onClick={() => {
                            handleClick(vr.variation_id);
                          }}>
                          <div className="var-name">{vr.name}</div>
                          <div className="var-price">
                            {vr.total_qty > 0
                              ? Number(vr.price).toFixed(3)
                              : Number(vr.variation_price).toFixed(3)}{' '}
                            {locationSettings?.currency_code}
                          </div>
                          <div className="var-remaining-qty">
                            {Number(vr.total_qty).toFixed(0)} Remaining
                          </div>
                          <div className="item-icons">
                            {vr.sell_over_stock == 1 && (
                              <div className="inner-icon">
                                <img src="/images/pos/card/over_sell.png" />
                              </div>
                            )}
                            {vr.sell_over_stock == 0 && vr.total_qty == 0 && (
                              <span className="out-of-stock">Out OF Stock</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
              </div>
              <br />
              <br />
            </div>

            <div className="modal-footer">
              <a
                className="btn btn-link link-success fw-medium"
                onClick={() => {
                  setIsOpenVariationDialog(false);
                }}>
                Close <i className="ri-close-line me-1 align-middle" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VariationModal;
