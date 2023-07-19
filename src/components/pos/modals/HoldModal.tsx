import React, { useState, useContext, useEffect } from 'react'
import { useRecoilState } from 'recoil';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { clearOrders } from "../../../recoil/atoms";
import { Toastify } from 'src/libs/allToasts';
import { IHold, IHoldItems } from '@models/common-model';

const HoldModal = (probs: any) => {

    const { openDialog, isShowModal, holdObj, shopId } = probs;
    const [clearEvent, setClear] = useRecoilState(clearOrders);
    const [holdItems, setHoldItems] = useState<IHold[]>([]);
    const [newItem, setNewItem] = useState<IHold>({ name: "", data: "", length: 0, location_id: 0 });
    const [orderIds, setOrderIds] = useState<IHoldItems[]>([]);

    useEffect(() => {
        if (isShowModal) {
            setNewItem({ name: "", data: "", length: 0, location_id: 0 })
            const holdItemsFromStorage = localStorage.getItem("holdItems" + shopId);
            if (holdItemsFromStorage)
                setHoldItems(JSON.parse(holdItemsFromStorage));
            holdObj.orders.map((p: any, i: number) => orderIds.push({
                type: p.type, product_id: p.product_id, variation_id: p.variation_id, data: "", qty: 0,
                tailoring: holdObj.quantity[i].tailoring, tailoringCutsom: holdObj.quantity[i].tailoringCutsom
            }))
        } else
            setOrderIds([])
    }, [isShowModal])
    const style = {
        minWidth: '500px'
    };
    return (
        <>
            <Dialog
                open={isShowModal}
                sx={style}
                className="poslix-modal">
                <DialogTitle className="poslix-modal text-primary">Hold Orders</DialogTitle>
                <DialogContent className="poslix-modal-content" style={{ minWidth: "400px", minHeight: "180px" }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-lg-12 mb-12">
                                        <label>Enter Name :</label>
                                        <input
                                            type="text"
                                            name="cname"
                                            className="form-control"
                                            placeholder="First Name"
                                            value={newItem.name}
                                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <hr />
                            </div>
                            <div className="modal-footer">
                                <a
                                    className="btn btn-link link-success fw-medium"
                                    onClick={() => { openDialog(false) }}
                                >
                                    Close <i className="ri-close-line me-1 align-middle" />
                                </a>
                                <button type="button" className="btn p-2 btn-primary" onClick={() => {
                                    if (holdObj.orders.length > 0) {
                                        if (newItem.name.length > 0) {
                                            Toastify('success', 'Products Saved');
                                            const _data = [...holdItems, { name: newItem.name, data: JSON.stringify(orderIds), length: orderIds.length, location_id: shopId }];
                                            localStorage.setItem("holdItems" + shopId, JSON.stringify(_data))
                                            const random = Math.random();
                                            setClear(random);
                                            openDialog(false)
                                        } else
                                            Toastify('error', "Enter Hold Name First!");
                                    } else
                                        Toastify('error', 'There Is Nothing For Hold!')
                                }}>
                                    Save
                                </button>
                            </div>
                        </div>
                        {/* /.modal-content */}
                    </div>
                </DialogContent >
            </Dialog>

        </>
    )

}

export default HoldModal;