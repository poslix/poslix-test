'use client';
import { DevTool } from '@hookform/devtools';
import { paymentTypeData } from '@models/data';
import classNames from 'classnames';
import { update } from 'lodash';
import { useMemo, useState } from 'react';
import { Button, Form, InputGroup, Stack } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { useFieldArray, useForm } from 'react-hook-form';
import { MdDelete, MdOutlineShoppingCartCheckout } from 'react-icons/md';
import FormField from 'src/components/form/FormField';
import SelectField from 'src/components/form/SelectField';
import MainModal from 'src/components/modals/MainModal';
import { useUser } from 'src/context/UserContext';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { clearCart, selectCartByLocation } from 'src/redux/slices/cart.slice';
import api from 'src/utils/app-api';

export default function PaymentCheckoutModal({ show, setShow, shopId }) {
  const dispatch = useAppDispatch();
  const { locationSettings } = useUser();
  const [remaining, setRemaining] = useState<number>(0);

  const [lastEdited, setLastEdited] = useState<number>(0);

  const [paidAmount, setPaidAmount] = useState<{
    [x: string]: number;
  }>({
    '0': 0,
  });
  const selectCartForLocation = selectCartByLocation(shopId);
  const cart = useAppSelector(selectCartForLocation); // current location order

  const totalDiscount =
    cart?.cartDiscountType === 'percentage'
      ? (+(cart?.cartDiscount ?? 0) / 100) * +(cart?.cartSellTotal ?? 0)
      : +(cart?.cartDiscount ?? 0);

  const totalTax =
    cart?.cartTaxType === 'percentage'
      ? (+(cart?.cartTax ?? 0) / 100) * +(cart?.cartSellTotal ?? 0)
      : +(cart?.cartTax ?? 0);

  const totalNoTax = +(cart?.cartSellTotal ?? 0) + +(cart?.shipping ?? 0);
  const totalAmount = totalNoTax + totalTax - totalDiscount;

  const paymentTypes = useMemo(
    () =>
      paymentTypeData().map((item, idx) => ({
        ...item,
        value: (idx + 1).toString(),
      })),
    []
  );

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      notes: '',
      payment: [
        {
          payment_id: '1',
          amount: totalAmount?.toString() ?? '0',
          note: '',
        },
      ],
    },
  });
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'payment', // unique name for your Field Array
  });

  const onSubmit = (data) => {
    const checkoutData = {
      notes: data?.notes,
      payment: data?.payment,
      location_id: shopId,
      customer_id: cart?.customer_id,
      disount_type: cart?.cartDiscountType,
      discount_amount: cart?.cartDiscount,
      tax_type: cart?.cartTaxType,
      tax_amount: cart?.cartTax,
      cart: cart?.cartItems.map((product) => ({
        product_id: product?.product_id,
        qty: product?.quantity,
        note: data?.notes,
      })),
    };
    api
      .post('/checkout', checkoutData)
      .then((res) => {
        console.log(res);
      })
      .then(() => {
        dispatch(clearCart({ location_id: shopId }));
      });
    console.log(data);
  };

  const paidSum = useMemo(() => {
    return Object.values(paidAmount).reduce((acc, curr) => acc + curr, 0);
  }, [paidAmount]);

  return (
    <div>
      <MainModal
        title="Payment"
        show={show}
        setShow={setShow}
        body={
          <Container fluid>
            <Stack>
              <Row>
                <h5 className="fw-bold">
                  <span style={{ width: '6rem', display: 'inline-block' }}>Amount: </span>
                  <span>
                    {totalNoTax?.toFixed(locationSettings?.location_decimal_places) ?? ''}{' '}
                  </span>
                  <span>{locationSettings?.currency_name ?? ''}</span>
                </h5>
                <h6 className="fw-normal">
                  <span style={{ width: '6rem', display: 'inline-block' }}>Taxes: </span>+{' '}
                  <span>{totalTax?.toFixed(locationSettings?.location_decimal_places) ?? ''} </span>
                  <span>{locationSettings?.currency_name ?? ''}</span>
                </h6>
                <h6 className="fw-normal">
                  <span style={{ width: '6rem', display: 'inline-block' }}>Discount:</span>-{' '}
                  <span>
                    {totalDiscount?.toFixed(locationSettings?.location_decimal_places) ?? ''}{' '}
                  </span>
                  <span>{locationSettings?.currency_name ?? ''}</span>
                </h6>
                <h6 className="fw-semibold">
                  <span style={{ width: '6rem', display: 'inline-block' }}>Total: </span>
                  <span>
                    {totalAmount?.toFixed(locationSettings?.location_decimal_places) ?? ''}{' '}
                  </span>
                  <span>{locationSettings?.currency_name ?? ''}</span>
                </h6>
              </Row>
            </Stack>
            <Form
              noValidate
              hidden={cart?.cartItems?.length === 0 || !locationSettings?.currency_name}
              onSubmit={handleSubmit(onSubmit)}
              id="hook-form">
              <Row>
                <Col>
                  <FormField
                    textArea
                    type="text"
                    name="notes"
                    placeholder="Enter your notes"
                    register={register}
                    label="Order Notes"
                    errors={errors}
                  />
                </Col>
              </Row>
              {fields.map((field, idx) => (
                <div className="d-flex flex-row gap-2" key={field.id}>
                  <Col xs={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold fs-6">Amount</Form.Label>
                      <InputGroup className="mb-3">
                        <Form.Control
                          autoFocus={lastEdited === idx}
                          autoComplete="off"
                          placeholder="enter amount"
                          type="number"
                          name={`payment.${idx}.amount`}
                          min={0}
                          max={totalAmount ?? 0}
                          {...register(`payment.${idx}.amount`)}
                          value={paidAmount[idx] ?? 0}
                          onChange={(e) => {
                            setLastEdited(idx);
                            setValue(`payment.${idx}.amount`, e.target.value);
                            setPaidAmount((prev) => ({
                              ...prev,
                              [idx]: +e.target.value,
                            }));
                          }}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col xs={3}>
                    <SelectField
                      name={`payment.${idx}.payment_id`}
                      options={paymentTypes}
                      register={register}
                      label="Method"
                      errors={errors}
                    />
                  </Col>
                  <Col xs={idx > 0 ? 3 : null}>
                    <FormField
                      type="text"
                      name={`payment.${idx}.note`}
                      placeholder="your notes"
                      register={register}
                      label="Pay. Note"
                      errors={errors}
                    />
                  </Col>
                  {idx > 0 && (
                    <Col className="mt-auto mb-3">
                      <Button
                        className="h-60 w-100 mt-auto align-items-center gap-1 d-flex flex-row"
                        onClick={() => {
                          remove(idx);

                          setPaidAmount((prev) => {
                            const { [idx]: _, ...rest } = prev;
                            return rest;
                          });
                        }}>
                        Remove <MdDelete />
                      </Button>
                    </Col>
                  )}
                </div>
              ))}
              <Row>
                <Col>
                  <Button
                    // disabled={totalAmount >= paidAmount ? 'true' : 'false'}
                    onClick={() =>
                      append({
                        payment_id: '1',
                        amount: '',
                        note: '',
                      })
                    }>
                    Add Payment Row
                  </Button>
                </Col>
              </Row>
            </Form>
          </Container>
        }
        footer={
          <div
            style={{
              display:
                cart?.cartItems?.length === 0 || !locationSettings?.currency_name
                  ? 'hidden'
                  : 'flex',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
            {totalAmount * 100 - paidSum * 100 > 0 && (
              <span className="text-danger">
                {Math.abs(totalAmount - paidSum)?.toFixed(
                  locationSettings?.location_decimal_places
                )}{' '}
                {totalAmount - paidSum > 0 ? 'remaining' : 'exceeded'}
              </span>
            )}
            <Button
              type="submit"
              form="hook-form"
              className={classNames(
                'btn btn-label d-flex flex-row align-items-center gap-3',
                'btn-primary',
                ' right nexttab'
              )}>
              <span>Complete Order</span>
              <MdOutlineShoppingCartCheckout />
            </Button>
          </div>
        }
      />
      {/* <DevTool control={control} /> set up the dev tool */}
    </div>
  );
}
