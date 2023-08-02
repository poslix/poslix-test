import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { apiDelete } from "../../libs/dbUtils"
import { useAlert } from 'react-alert'

export default function ShowDialog(props: any) {

    const handleClose = () => props.alertFun(false);
    async function deletet() {
        console.log(props.type);

        return;
        var result = await apiDelete({ type: props.type, id: props.id })
        const { success } = result;
        if (success) {
            // alertNoti.success('Item successfully deleted!!')
            const idx = props.products.findIndex((itm: any) => itm.id === props.id);
            props.products.splice(idx, 1)
            handleClose();
        } else {
            // alertNoti.error("Has Error ,try Again")
        }
    }
    const actionHandle = () => {
        deletet();
    }
    return (
        <>
            <Modal
                show={props.alertShow}
                onHide={handleClose}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title className='text-primary'>Show Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {props.children}
                </Modal.Body>
                <Modal.Footer className='d-flex '>
                    <Button className='p-2' onClick={handleClose}>   Dismiss   </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}