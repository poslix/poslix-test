import React, { useState, useEffect, useContext } from 'react'
import { useRecoilState } from 'recoil';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { cartJobType } from 'src/recoil/atoms';
import Select from 'react-select';
import { apiFetchCtr } from 'src/libs/dbUtils';
import { ProductContext } from 'src/context/ProductContext';
import { ITailoringPackagePrice } from '@models/common-model';
import { Toastify } from 'src/libs/allToasts';
const PackageItemsModal = (probs: any) => {
    const { filterdItems, packItems, isOpenDialog, setIsOpenDialog } = probs;
    return (
        <>
            <Dialog
                open={isOpenDialog}
                aria-labelledby="modal-modal-title2"
                aria-describedby="modal-modal-description2"
                className="poslix-modal">
                <DialogTitle className='poslix-modal-title text-primary'>
                    Package Content
                </DialogTitle>
                <DialogContent className="poslix-modal-content" >
                    <div className="poslix-modal">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div className="package-contianer">
                                    {
                                        packItems.map((pi: any, i: number) => {
                                            return (
                                                <div key={i} className="package-items">
                                                    <img src={pi.image} />
                                                    <div className='package-content-item'>
                                                        <h5>{pi.name}</h5>
                                                        <h6>{Number(filterdItems[i].price).toFixed(3)}</h6>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }

                                </div>
                            </div>
                        </div>
                        {/* /.modal-content */}
                        <div className="modal-footer">
                            <a
                                onClick={() => { setIsOpenDialog(false) }}
                                href="#"
                                className="btn btn-link link-success fw-medium"
                            >
                                <i className="ri-close-line me-1 align-middle" /> Close
                            </a>
                        </div>
                    </div>
                </DialogContent >
            </Dialog>

        </>
    )

}

export default PackageItemsModal;