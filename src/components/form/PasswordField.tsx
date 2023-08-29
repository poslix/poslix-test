import React, { useId, useState } from 'react';
import { Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

export interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  register: any;
  errors: any;
  loading?: boolean;
  required?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  name,
  type,
  placeholder,
  register,
  errors,
  loading = false,
  required = false,
  ...props
}) => {
  const formId = useId();
  const isInvalid = !!errors[name];
  const [showPass, setShowPass] = useState(false);

  return (
    <Form.Group controlId={`form-field-${name}-${formId}`}>
      <Form.Label className="fw-semibold fs-6">
        {label}
        {required && <span className="text-danger ms-2">*</span>}{' '}
        {/* Display asterisk if required */}
      </Form.Label>
      <InputGroup className="mb-3">
        <Form.Control
          {...props}
          autoComplete="off"
          isInvalid={isInvalid}
          placeholder={placeholder}
          type={showPass ? 'text' : type}
          name={name}
          {...register(name)}
        />
        <Button
          variant="outline-secondary"
          className="d-flex align-items-center justify-content-center"
          style={{
            width: '3rem',
          }}
          onClick={() => setShowPass((p) => !p)}>
          {showPass ? <MdVisibility /> : <MdVisibilityOff />}
        </Button>
      </InputGroup>
      {isInvalid && <Form.Text className="text-danger">{errors[name]?.message}</Form.Text>}{' '}
      {loading && <Spinner animation="border" size="sm" />}
    </Form.Group>
  );
};

export default PasswordField;
