import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
export default function NotifiModal(props: any) {

    const handleClose = () => props.alertFun(false);


    return (
        <>
            <Modal
                show={props.alertShow}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>POSLIX SYSTEM</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {props.children}
                </Modal.Body>
                <Modal.Footer className='d-flex justify-content-around'>
                    <Button className='p-2' style={{ background: '#303C54', color: '#ffffff' }} onClick={handleClose}>   Close   </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}