import React, { useId } from 'react';
import { Form, Spinner } from 'react-bootstrap';

interface SelectFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  options: { value: string | number; label: string }[];
  register: any;
  errors: any;
  loading?: boolean;
  required?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  options,
  register,
  errors,
  loading = false,
  required = false,
  ...props
}) => {
  const isInvalid = !!errors[name];
  const formId = useId();

  return (
    <Form.Group controlId={`form-field-${name}-${formId}`}>
      <Form.Label className="fw-semibold fs-6">
        {label}
        {required && <span className="text-danger ms-2">*</span>}
      </Form.Label>
      <Form.Select isInvalid={isInvalid} name={name} {...register(name)} {...props}>
        {options.map((option, idx) => (
          <option key={`${formId}-${option.value}-${idx}`} value={option.value}>
            {/* using idx in key is bad but some values from BE get repeated as some point */}
            {option.label}
          </option>
        ))}
      </Form.Select>
      {isInvalid && <Form.Text className="text-danger">{errors[name]?.message}</Form.Text>}
      {loading && <Spinner animation="border" size="sm" />}
    </Form.Group>
  );
};

export default SelectField;
