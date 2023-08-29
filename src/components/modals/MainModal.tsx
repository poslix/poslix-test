'use client';
import React, { Dispatch, Fragment, SetStateAction } from 'react';
import { Modal } from 'react-bootstrap';

const MainModal = ({
  show,
  setShow,
  body,
  title,
  footer,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  body: React.ReactNode;
  title: string;
  footer?: React.ReactNode;
}) => {
  const ModalBody = () => (React.isValidElement(body) ? body : <Fragment>{body}</Fragment>);
  const ModalFooter = () =>
    footer ? React.isValidElement(footer) ? footer : <Fragment>{footer}</Fragment> : null;

  const handleClose = () => setShow(false);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
        {title ?? 'Notice !'}
      </Modal.Header>
      <Modal.Body>
        <ModalBody />
      </Modal.Body>
      <Modal.Footer>
        <ModalFooter />
      </Modal.Footer>
    </Modal>
  );
};

export default MainModal;
