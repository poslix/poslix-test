import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { apiDeleteCtr } from "../../libs/dbUtils"

export default function AlertDialog(props: any) {
    const { shopId, type, subType, id, section } = props
    const handleClose = () => props.alertFun(false, '');
    async function deleteProd() {
        const { success, msg } = await apiDeleteCtr({ shopId, type, subType, id, section })
        if (success) {
            props.alertFun(true, "Item successfully deleted!!", section)
        } else
            props.alertFun(false, msg)

    }
    const actionHandle = () => {
        deleteProd();
    }
    return (
        <>
            <Modal
                show={props.alertShow}
                onHide={() => props.alertFun(false, '')}
                backdrop="static"
                keyboard={false}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title className='text-primary'>POSLIX SYSTEM</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {props.children}
                </Modal.Body>
                <Modal.Footer className='d-flex '>
                    <Button className='p-2' style={{ background: '#ffffff', color: '#000', border: 'none' }} onClick={handleClose}>   Dismiss   </Button>
                    <Button className='p-2' style={{ background: '#e75050', color: '#ffffff' }} onClick={actionHandle}>   Delete   </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}