import {
  faBank,
  faCreditCard,
  faMoneyBillTransfer,
  faMoneyBillWave,
  faMoneyCheck,
  faSackDollar,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useContext, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { UserContext } from 'src/context/UserContext';
import { ProductContext } from '../../../context/ProductContext';
import { apiFetchCtr, apiInsertCtr } from '../../../libs/dbUtils';
import { cartJobType } from '../../../recoil/atoms';
import mStyle from '../../../styles/Customermodal.module.css';
import SnakeAlert from '../utils/SnakeAlert';

const CloseRegister = (probs: any) => {
  const [closeRegisterInfo, setCloseRegisterInfo] = useState({ cashInHand: 0, cheque: 0 });
  const [snakeTitle, setSnakeTitle] = useState('');

  const { products, setProducts, customers, setCustomers } = useContext(ProductContext);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cash, setCash] = useState(0);
  const [card, setCard] = useState(0);
  const [bankm, setBank] = useState(0);
  const [cheque, setCheque] = useState(0);
  const [note, setNote] = useState('');
  const [openSnakeBar, setOpenSnakeBar] = useState(false);
  const [, setJobType] = useRecoilState(cartJobType);
  const { openDialog, statusDialog, shopId } = probs;
  const { locationSettings } = useContext(UserContext);

  const handleClose = () => {
    setOpen(false);
    openDialog(false);
  };
  useEffect(() => {
    if (!statusDialog) return;
    setOpen(statusDialog);
    var cash = localStorage.getItem('hand_in_cash');
    setCloseRegisterInfo({ ...closeRegisterInfo, cashInHand: cash ? +cash : 0 });
    getcustomer();
  }, [statusDialog]);

  async function closeRegister() {
    // return
    var result = await apiInsertCtr({
      type: 'transactions',
      subType: 'close',
      shopId,
      data: { cash, card, bankm, cheque, note, hand: closeRegisterInfo.cashInHand },
    });
    if (result.success) {
      console.log(result.newdata);
      handleClose();
      setJobType({ req: 101, val: 'closeRegister' });
    } else {
      alert('has error, Try Again...');
    }
  }
  async function getcustomer() {
    setIsLoading(true);

    var { success, newdata } = await apiFetchCtr({
      subType: 'getclose',
      fetch: 'transactions',
      shopId,
    });
    if (!success) {
      alert('error in fetch..');
      return;
    }
    newdata.map((dd: any) => {
      if (dd.payment_type == 'cash') setCash(+dd.price);
      if (dd.payment_type == 'card') setCard(+dd.price);
      if (dd.payment_type == 'bank') setBank(+dd.price);
      if (dd.payment_type == 'cheque') setCheque(+dd.price);
    });
    setIsLoading(false);
  }
  const makeShowSnake = (val: any) => {
    setOpenSnakeBar(val);
  };

  return (
    <>
      <SnakeAlert title={snakeTitle} show={openSnakeBar} fun={makeShowSnake} />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        maxWidth={'xl'}>
        <DialogTitle className={mStyle.bgg} id="scroll-dialog-title">
          <h5 className="modal-title" id="myLargeModalLabel">
            Close Register
          </h5>
        </DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="close-register-box">
                    <div className="close-item">
                      <div className="close-item-inner">
                        <div className="close-item-inner-icon">
                          <FontAwesomeIcon icon={faMoneyBillTransfer} />
                        </div>
                        <p className="close-item-title">Card Payment</p>
                        <p className="close-item-title">
                          {Number(card).toFixed(3)} {locationSettings?.currency_code}
                        </p>
                      </div>
                    </div>
                    <div className="close-item">
                      <div className="close-item-inner">
                        <div className="close-item-inner-icon">
                          <FontAwesomeIcon icon={faMoneyBillWave} />
                        </div>
                        <p className="close-item-title">Cash in hand</p>
                        <p className="close-item-title">
                          {Number(closeRegisterInfo.cashInHand).toFixed(3)}{' '}
                          {locationSettings?.currency_code}
                        </p>
                      </div>
                    </div>
                    <div className="close-item">
                      <div className="close-item-inner">
                        <div className="close-item-inner-icon">
                          <FontAwesomeIcon icon={faBank} />
                        </div>
                        <p className="close-item-title">Bank Payment</p>
                        <p className="close-item-title">
                          {Number(bankm).toFixed(3)} {locationSettings?.currency_code}
                        </p>
                      </div>
                    </div>
                    <div className="close-item">
                      <div className="close-item-inner">
                        <div className="close-item-inner-icon">
                          <FontAwesomeIcon icon={faCreditCard} />
                        </div>
                        <p className="close-item-title">Cash Payment</p>
                        <p className="close-item-title">
                          {Number(cash).toFixed(3)} {locationSettings?.currency_code}
                        </p>
                      </div>
                    </div>
                    <div className="close-item">
                      <div className="close-item-inner">
                        <div className="close-item-inner-icon">
                          <FontAwesomeIcon icon={faMoneyCheck} />
                        </div>
                        <p className="close-item-title">Cheque Payment</p>
                        <p className="close-item-title">
                          {Number(cheque).toFixed(3)} {locationSettings?.currency_code}
                        </p>
                      </div>
                    </div>
                  </div>
                  <hr className="mt-3 mb-3" />
                  <div className="close-register-report">
                    <div className="close-report-items">
                      <div className="report-items-icon">
                        <FontAwesomeIcon icon={faSackDollar} />
                        <div className="report-name">Total Sales</div>
                      </div>
                      <div className="report-items-value">
                        {Number(cash + cheque + card + bankm).toFixed(3)}{' '}
                        {locationSettings?.currency_code}
                      </div>
                    </div>
                  </div>
                </div>
                <textarea
                  className="form-control close-note mb-4 mt-4"
                  placeholder="Your Note here"
                  rows={6}
                  onChange={(e) => setNote(e.target.value)}>
                  {note}
                </textarea>
                <div className="modal-footer mt-4">
                  <a
                    href="javascript:void(0);"
                    className="btn btn-link link-success fw-medium"
                    onClick={() => handleClose()}>
                    <i className="ri-close-line me-1 align-middle" /> Dismise
                  </a>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      closeRegister();
                    }}>
                    Close Register
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CloseRegister;
