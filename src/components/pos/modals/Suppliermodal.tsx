import React, { useState, useContext, useEffect } from 'react'
import { apiFetch, apiUpdateCtr, apiInsertCtr, apiFetchCtr } from '../../../libs/dbUtils'
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { ProductContext } from "../../../context/ProductContext"
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import SnakeAlert from '../utils/SnakeAlert'
import mStyle from '../../../styles/Customermodal.module.css';
import { Toastify } from 'src/libs/allToasts';

const Suppliermodal = (probs: any) => {

    const { openDialog, statusDialog, userdata, showType, shopId } = probs;
    const customerTemplate = { id: 0, firstName: '', lastName: '', mobile: '', addr1: '', addr2: '', city: '', state: '', country: '', zipCode: '', shipAddr: '' }
    const [moreInfo, setMoreInfo] = useState(false);
    const [customerInfo, setCustomerInfo] = useState(customerTemplate);
    const { customers, setCustomers } = useContext(ProductContext);
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [openSnakeBar, setOpenSnakeBar] = useState(false);
    const handleClose = () => {
        setOpen(false)
        openDialog(false);
    };
    useEffect(() => {
        if (!statusDialog)
            return
        setCustomerInfo(customerTemplate)
        setOpen(statusDialog)
        if (userdata !== undefined && showType != 'add' && statusDialog)
            getCustomerInfo(userdata.value);
    }, [statusDialog])

    async function insertCustomerInfo() {
        const { success, msg, code, newdata } = await apiInsertCtr({ type: 'customer', subType: "addCustomer", shopId, data: customerInfo })
        if (success) {
            setCustomers([...customers, newdata])
            handleClose();
            Toastify('success', 'Successfully Created')
        } else if (code == 100)
            Toastify('error', msg);
        else
            Toastify('error', "Has Error, Try Again...");
    }
    async function getCustomerInfo(theId: any) {
        setIsLoading(true)
        setCustomerInfo(customerTemplate)
        var result = await apiFetchCtr({ fetch: 'customer', subType: 'getCustomerInfo', theId, shopId })
        if (result.success) {
            console.log(result?.newdata[0]);
            const selCustomer = result?.newdata[0]
            setCustomerInfo({
                ...customerInfo,
                id: theId,
                mobile: selCustomer.mobile,
                firstName: selCustomer.first_name,
                lastName: selCustomer.last_name,
                city: selCustomer.city,
                state: selCustomer.state,
                addr1: selCustomer.addr1,
                addr2: selCustomer.addr2,
                zipCode: selCustomer.zip_code,
                country: selCustomer.country,
                shipAddr: selCustomer.shipping_address,
            })
            setIsLoading(false)
            console.log(result.newdata[0].mobile);
        } else {
            Toastify("error", "has error, Try Again...");
        }
    }
    async function editCustomerInfo() {
        var result = await apiUpdateCtr({ type: 'customer', subType: "editCustomerInfo", shopId, data: customerInfo })
        if (result.success) {
            const cinx = customers.findIndex(customer => customer.value === customerInfo.id);
            if (cinx > -1) {
                const upCustomer = [...customers];
                upCustomer[cinx] = { ...upCustomer[cinx], value: customerInfo.id, label: customerInfo.firstName + " " + customerInfo.lastName + " | " + customerInfo.mobile, mobile: result.newdata.mobile };
                setCustomers(upCustomer);
            }
            handleClose();
            Toastify("success", "Successfully Edited")

        } else
            Toastify("error", "has error, Try Again...");
    }
    const makeShowSnake = (val: any) => {
        setOpenSnakeBar(val)
    }

    return (
      <>
        <Dialog
          open={open}
          className="poslix-modal"
          onClose={handleClose}
          maxWidth={"xl"}
        >
          <DialogTitle className="poslix-modal-title text-primary">
            {showType + " Supplier"}
          </DialogTitle>
          <DialogContent>
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "20px",
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <div className="poslix-modal">
                <div className="modal-content">
                  <div className="modal-body">
                    <fieldset disabled={showType == "show" ? true : false}>
                      <div className="row">
                        <div className="col-lg-6 mb-3">
                          <label>Name :</label>
                          <input
                            type="text"
                            name="cname"
                            className="form-control"
                            placeholder="Name"
                            value={customerInfo.firstName}
                            onChange={(e) =>
                              setCustomerInfo({
                                ...customerInfo,
                                firstName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-lg-6 mb-3">
                          <label>Transactions :</label>
                          <input
                            type="text"
                            name="cemail"
                            className="form-control"
                            placeholder="Transactions"
                            value={customerInfo.lastName}
                            onChange={(e) =>
                              setCustomerInfo({
                                ...customerInfo,
                                lastName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-lg-6 mb-3">
                          <label>Paid invoices</label>
                          <input
                            type=""
                            name=""
                            className="form-control"
                            placeholder="Paid invoices"
                            value={customerInfo.mobile}
                            onChange={(e) =>
                              setCustomerInfo({
                                ...customerInfo,
                                mobile: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-lg-6 mb-3">
                          <label>Unpaid invoices</label>
                          <input
                            type=""
                            name=""
                            className="form-control"
                            placeholder="Unpaid invoices"
                            value={customerInfo.mobile}
                            onChange={(e) =>
                              setCustomerInfo({
                                ...customerInfo,
                                mobile: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </fieldset>
                    {/* <div className="col-lg-4 mb-3 mt-lg-4 mt-0">
                                    <button className="btn btn-primary" onClick={() => { setMoreInfo(!moreInfo); }}>
                                        {moreInfo ? "Less " : "More "} Information <i className={`ri-arrow-${moreInfo ? 'up' : 'down'}-s-line ps-1`} />
                                    </button>
                                </div>
                                {
                                    moreInfo ? (
                                        <>
                                            <div className="row">
                                                <div className="col-lg-6 mb-3">
                                                    <label>Address line 1</label>
                                                    <input
                                                        type=""
                                                        name=""
                                                        className="form-control"
                                                        placeholder="Address line 1"
                                                        value={customerInfo.addr1}
                                                        onChange={(e) => setCustomerInfo({ ...customerInfo, addr1: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label>Address line 2</label>
                                                    <input
                                                        type=""
                                                        name=""
                                                        className="form-control"
                                                        placeholder="Address line 2"
                                                        value={customerInfo.addr2}
                                                        onChange={(e) => setCustomerInfo({ ...customerInfo, addr2: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-lg-3 mb-3">
                                                    <label>City</label>
                                                    <input
                                                        type=""
                                                        name=""
                                                        className="form-control"
                                                        placeholder="City"
                                                        value={customerInfo.city}
                                                        onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-lg-3 mb-3">
                                                    <label>State</label>
                                                    <input
                                                        type=""
                                                        name=""
                                                        className="form-control"
                                                        placeholder="State"
                                                        value={customerInfo.state}
                                                        onChange={(e) => setCustomerInfo({ ...customerInfo, state: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-lg-3 mb-3">
                                                    <label>Country</label>
                                                    <input
                                                        type=""
                                                        name=""
                                                        className="form-control"
                                                        placeholder="Country"
                                                        value={customerInfo.country}
                                                        onChange={(e) => setCustomerInfo({ ...customerInfo, country: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-lg-3 mb-3">
                                                    <label>Zip code</label>
                                                    <input
                                                        type=""
                                                        name=""
                                                        className="form-control"
                                                        placeholder="Zip code"
                                                        value={customerInfo.zipCode}
                                                        onChange={(e) => setCustomerInfo({ ...customerInfo, zipCode: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <hr />
                                            <label>Shipping address</label>
                                            <input
                                                type=""
                                                name=""
                                                className="form-control"
                                                placeholder="Shipping address"
                                                value={customerInfo.shipAddr}
                                                onChange={(e) => setCustomerInfo({ ...customerInfo, shipAddr: e.target.value })}
                                            />
                                        </>
                                    ) : null
                                } */}
                  </div>
                  <div className="modal-footer">
                    <a
                      className="btn btn-link link-success fw-medium"
                      onClick={() => handleClose()}
                    >
                      <i className="ri-close-line me-1 align-middle" /> Close
                    </a>
                    {showType != "show" && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          console.log(customerInfo);
                          if (showType == "edit") editCustomerInfo();
                          else insertCustomerInfo();
                        }}
                      >
                        {showType} Supplier
                      </button>
                    )}
                  </div>
                </div>
                {/* /.modal-content */}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );

}

export default Suppliermodal;