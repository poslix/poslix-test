import { joiResolver } from '@hookform/resolvers/joi';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import FormField from 'src/components/form/FormField';
import { Toastify } from 'src/libs/allToasts';
import { addCustomerSchema } from 'src/modules/pos/_schema/add-customer.schema';
import api from 'src/utils/app-api';
import { useSWRConfig } from 'swr';
import { useProducts } from '../../../context/ProductContext';
import { apiUpdateCtr } from '../../../libs/dbUtils';

const customerTemplate = {
  id: 0,
  first_name: '',
  last_name: '',
  mobile: '',
  city: '',
  state: '',
  country: '',
  zip_code: '',
  address_line_1: '',
  address_line_2: '',
};

const CustomerModal = (props: any) => {
  const { openDialog, statusDialog, userdata, showType, shopId } = props;
  const [open, setOpen] = useState(false);
  const [moreInfo, setMoreInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countryList, setCountryList] = useState<any[]>([]);

  const [customerInfo, setCustomerInfo] = useState(customerTemplate);
  const { customers, setCustomers } = useProducts();

  const { mutate } = useSWRConfig();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,

    clearErrors,
  } = useForm({
    mode: 'onTouched',
    reValidateMode: 'onBlur',
    resolver: joiResolver(addCustomerSchema),
    // defaultValues: initState,
  });

  const handleEditCustomer = (data: any) => {
    api
      .put('/customers/' + userdata.value, data)
      .then((res) => res.data.result)
      .then((res) => {
        mutate('/customers/' + shopId);
        const cinx = customers.findIndex((customer) => customer.value === res.id);
        if (cinx > -1) {
          const upCustomer = [...customers];
          upCustomer[cinx] = {
            ...upCustomer[cinx],
            value: res.id,
            label: res.first_name + ' ' + res.last_name + ' | ' + res.mobile,
          };
          setCustomers(upCustomer);
        }

        Toastify('success', 'Successfully Update');
        handleClose();
      })
      .catch(() => Toastify('error', 'Has Error, Try Again...'))
      .finally(() => setIsLoading(false));
  };

  const handleAddCustomer = (data: any) => {
    api
      .post('/customers/' + shopId, data)
      .then((res) => res.data.result)
      .then((res) => {
        mutate('/customers/' + shopId);
        setCustomers([...customers, res]);
        Toastify('success', 'Successfully Created');
        handleClose();
      })
      .catch(() => {
        Toastify('error', 'Has Error, Try Again...');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    if (showType === 'edit') {
      handleEditCustomer(data);
    } else {
      handleAddCustomer(data);
    }
  };
  const onError = (errors: any, e: any) => console.log(errors, e);

  const handleClose = () => {
    setOpen(false);
    openDialog(false);
  };

  async function getCustomerInfo(theId: any) {
    setIsLoading(true);
    setCustomerInfo(customerTemplate);

    api
      .get('/customers/' + theId + '/show')
      .then((res) => {
        const selCustomer = res?.data?.result?.profile;

        Object.entries(selCustomer).forEach(([key, value]) => {
          if (!value) value = '';
          setValue(key, value);
        });
      })
      .catch(() => {
        Toastify('error', 'has error, Try Again...');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    if (!statusDialog) return;
    setCustomerInfo(customerTemplate);
    setOpen(statusDialog);
    if (userdata !== undefined && showType != 'add' && statusDialog)
      getCustomerInfo(userdata.value);
  }, [statusDialog]);

  useEffect(() => {
    if (!open) {
      reset();
      setMoreInfo(false);
      clearErrors();
    }
  }, [open]);

  if (isLoading)
    return (
      <Modal show={open} onHide={handleClose}>
        <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
          {showType + ' customer'}
        </Modal.Header>
        <Modal.Body>
          <Box sx={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
            <CircularProgress />
          </Box>
        </Modal.Body>
      </Modal>
    );

  return (
    <Modal show={open} onHide={handleClose}>
      <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
        {showType + ' customer'}
      </Modal.Header>
      <Modal.Body>
        <Form noValidate onSubmit={handleSubmit(onSubmit, onError)}>
          <Modal.Body>
            <fieldset disabled={showType === 'show'}>
              <FormField
                required
                type="text"
                name="first_name"
                label="First Name"
                placeholder="First Name"
                errors={errors}
                register={register}
              />
              <FormField
                type="text"
                name="last_name"
                label="Last Name"
                placeholder="Last Name"
                errors={errors}
                register={register}
              />
              <FormField
                required
                type="text"
                name="mobile"
                label="Mobile"
                placeholder="Enter customer mobile number"
                errors={errors}
                register={register}
              />
            </fieldset>
            <div className="d-flex flex-row mb-3">
              <Button
                variant="primary"
                className="ms-auto"
                onClick={() => {
                  setMoreInfo(!moreInfo);
                }}>
                {moreInfo ? 'Less ' : 'More '} Information{' '}
                <i className={`ri-arrow-${moreInfo ? 'up' : 'down'}-s-line ps-1`} />
              </Button>
            </div>

            {moreInfo ? (
              <div className="row">
                <div className="col-lg-6 mb-3">
                  <FormField
                    type="text"
                    name="address_line_1"
                    label="Address line 1"
                    placeholder="Enter Address line 1"
                    errors={errors}
                    register={register}
                  />
                </div>

                <div className="col-lg-6 mb-3">
                  <FormField
                    type="text"
                    name="address_line_2"
                    label="Address line 2"
                    placeholder="Enter Address line 2"
                    errors={errors}
                    register={register}
                  />
                </div>

                <div className="col-lg-3 mb-3">
                  <FormField
                    type="text"
                    name="country"
                    label="Country"
                    placeholder="Enter Country"
                    errors={errors}
                    register={register}
                  />
                </div>
                <div className="col-lg-3 mb-3">
                  <FormField
                    type="text"
                    name="state"
                    label="State"
                    placeholder="Enter State"
                    errors={errors}
                    register={register}
                  />
                </div>
                <div className="col-lg-3 mb-3">
                  <FormField
                    type="text"
                    name="city"
                    label="City"
                    placeholder="Enter City"
                    errors={errors}
                    register={register}
                  />
                </div>

                <div className="col-lg-3 mb-3">
                  <FormField
                    type="text"
                    name="zip_code"
                    label="Zip Code"
                    placeholder="Enter Zip Code"
                    errors={errors}
                    register={register}
                  />
                </div>
                <hr />
                <FormField
                  type="text"
                  name="shipping_address"
                  label="Shipping Address"
                  placeholder="Enter Shipping Address"
                  errors={errors}
                  register={register}
                />
              </div>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            <a className="btn btn-link link-success fw-medium" onClick={() => handleClose()}>
              <i className="ri-close-line me-1 align-middle" /> Close
            </a>{' '}
            {showType != 'show' && (
              <Button type="submit" className="text-capitalize" onClick={() => {}}>
                {showType} Customer
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CustomerModal;
