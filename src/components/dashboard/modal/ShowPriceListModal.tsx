import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import mStyle from '../../../styles/Customermodal.module.css';
import { apiFetchCtr } from 'src/libs/dbUtils';

const ShowPriceListModal = (props: any) => {
  const { productId, shopId, isOpenPriceDialog, setIsOpenPriceDialog, type } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [prices, setPrices] = useState([]);

  async function getPrices() {
    var result = await apiFetchCtr({
      fetch: 'products',
      subType: 'getPrices',
      productId,
      shopId,
      type,
    });
    if (result.success) {
      setPrices(result.data.pricesList);
      setIsLoading(false);
    } else {
      alert('has error, Try Again...');
    }
  }

  useEffect(() => {
    if (isOpenPriceDialog) getPrices();
  }, [isOpenPriceDialog]);

  const style = {
    minWidth: '500px',
  };
  return (
    <>
      <Dialog
        open={isOpenPriceDialog}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={style}>
        <DialogTitle className={mStyle.bgg} id="scroll-dialog-title">
          <h5 className="modal-title" id="myLargeModalLabel">
            List Of Price
          </h5>
        </DialogTitle>
        <DialogContent>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-body listOfPrice">
                <table className="table" style={{ fontSize: '11px', textAlign: 'center' }}>
                  <thead>
                    {type === 'variable' && <th>Size</th>}
                    <th>Qty Left</th>
                    <th>Cost</th>
                    <th>Price</th>
                    <th>Created at</th>
                  </thead>
                  {!isLoading &&
                    prices.map((pr: any, idx: number) => {
                      return (
                        <tr key={idx}>
                          {pr.name && <td>{pr.name}</td>}
                          <td>{Number(pr.qty_left).toFixed(0)}</td>
                          <td>{Number(pr.cost).toFixed(3)}</td>
                          <td>{Number(pr.price).toFixed(3)}</td>
                          <td>{pr.created_at !== null ? pr.created_at.split('T')[0] : ''}</td>
                        </tr>
                      );
                    })}
                </table>

                <hr />
              </div>

              <div className="modal-footer">
                <a
                  href="javascript:void(0);"
                  className="btn btn-link link-success fw-medium"
                  onClick={() => {
                    setIsOpenPriceDialog(false);
                  }}>
                  Close <i className="ri-close-line me-1 align-middle" />
                </a>
              </div>
            </div>
            {/* /.modal-content */}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShowPriceListModal;
