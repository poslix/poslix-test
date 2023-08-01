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

const PricingModal = (probs: any) => {
    const { openDialog, statusDialog, userdata, showType, shopId, pricingGroups, setPricingGroups } = probs;
    const pricingTemplate = {id: 0, name: ''}
    const [pricingName, setPricingName] = useState(pricingTemplate);
    const { customers, setCustomers } = useContext(ProductContext);
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const handleClose = () => {
        setOpen(false)
        openDialog(false);
    };
    useEffect(() => {
        
        if (!statusDialog)
            return
        setPricingName(pricingTemplate)
        setOpen(statusDialog)
        if (userdata !== undefined && showType != 'add' && statusDialog)
            // getPricingName(userdata.value);
            setPricingName(userdata)
    }, [statusDialog])

    async function insertpricingName() {
        const { success, msg, code, newdata } = await apiInsertCtr({ type: 'customer', subType: "addCustomer", shopId, data: pricingName })
        if (success) {
            setCustomers([...customers, newdata])
            handleClose();
            Toastify('success', 'Successfully Created')
        } else if (code == 100)
            Toastify('error', msg);
        else
            Toastify('error', "Has Error, Try Again...");
    }
    async function getPricingName(theId: any) {
        setIsLoading(true)
        setPricingName(pricingTemplate)
        var result = await apiFetchCtr({ fetch: 'customer', subType: 'getpricingName', theId, shopId })
        if (result.success) {
            console.log(result?.newdata[0]);
            const selCustomer = result?.newdata[0]
            setPricingName({
                ...pricingName,
                id: theId,
                name: selCustomer.name,
            })
            setIsLoading(false)
            console.log(result.newdata[0].mobile);
        } else {
            Toastify("error", "has error, Try Again...");
        }
    }
    // async function editpricingName() {
    //     var result = await apiUpdateCtr({ type: 'customer', subType: "editpricingName", shopId, data: pricingName })
    //     if (result.success) {
    //         const cinx = customers.findIndex(customer => customer.value === pricingName.id);
    //         if (cinx > -1) {
    //             const upCustomer = [...customers];
    //             upCustomer[cinx] = { ...upCustomer[cinx], value: pricingName.id, label: pricingName.firstName + " " + pricingName.lastName + " | " + pricingName.mobile, mobile: result.newdata.mobile };
    //             setCustomers(upCustomer);
    //         }
    //         handleClose();
    //         Toastify("success", "Successfully Edited")

    //     } else
    //         Toastify("error", "has error, Try Again...");
    // }
    return (
        <>
            <Dialog
                open={open}
                className="poslix-modal"
                onClose={handleClose}
                maxWidth={'xl'}>
                <DialogTitle className='poslix-modal-title text-primary'>{showType + ' Pricing Group'}</DialogTitle>
                <DialogContent  >
                    {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', margin: '20px' }}><CircularProgress /></Box> : <div className="poslix-modal">
                        <div className="modal-content">

                            <div className="modal-body">
                                <fieldset disabled={showType == 'show' ? true : false}>
                                    <div className="row">
                                        <div className="col-lg-4 mb-3" style={{minWidth: '400px'}}>
                                            <label>Name:</label>
                                            <input
                                                type="text"
                                                name="cname"
                                                className="form-control"
                                                placeholder="First Name"
                                                value={pricingName.name}
                                                onChange={(e) => setPricingName({ ...pricingName, name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                            <div className="modal-footer">
                                <a
                                    className="btn btn-link link-success fw-medium"
                                    onClick={() => handleClose()}
                                >
                                    <i className="ri-close-line me-1 align-middle" /> Close
                                </a>
                                {showType != 'show' && <button type="button" className="btn btn-primary" onClick={() => {
                                    if (showType == 'edit')
                                    {
                                        const newPricingGroups = pricingGroups.map((pg) => {
                                            return pg.id === pricingName.id ? {id: pg.id, name: pricingName.name} : pg 
                                        })
                                        setPricingGroups([...newPricingGroups])
                                        // editpricingName();
                                    }
                                    else
                                    {
                                        setPricingGroups([...pricingGroups,
                                            {id: pricingGroups[pricingGroups.length - 1].id + 1, name: pricingName.name}])
                                        insertpricingName();
                                    }
                                    handleClose()
                                }}>
                                    {showType} Pricing Group
                                </button>}
                            </div>

                        </div>
                        {/* /.modal-content */}
                    </div>}
                </DialogContent >
            </Dialog>

        </>
    )

}

export default PricingModal;