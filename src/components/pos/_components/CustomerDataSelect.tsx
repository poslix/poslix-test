import { IOrderMiniDetails } from '@models/common-model';
import { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import { useProducts } from 'src/context/ProductContext';
import { Toastify } from 'src/libs/allToasts';
import CustomerModal from '../modals/CustomerModal';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { selectCartByLocation, setCartCustomer } from 'src/redux/slices/cart.slice';

const selectStyle = {
  control: (style: any) => ({
    ...style,
    fontSize: '12px',
    border: '1px solid #efefef',
    borderRadius: '12px',
  }),
};

export default function CustomerDataSelect({
  shopId,
  isOrderEdit,
  setCustomer,
  orderEditDetails,
  customer,
}: {
  shopId: number;
  isOrderEdit: number;
  setCustomer: React.Dispatch<
    React.SetStateAction<{ value: string; label: string; isNew: boolean }>
  >;
  orderEditDetails: IOrderMiniDetails;
  customer: { value: string; label: string; isNew: boolean };
}) {
  const ref = useRef(null);
  const dispatch = useAppDispatch();
  const { customers } = useProducts();
  const selectCartForLocation = selectCartByLocation(shopId);
  const cart = useAppSelector(selectCartForLocation); // current location order

  const [showType, setShowType] = useState(String);
  const [customerIsModal, setCustomerIsModal] = useState<boolean>(false);
  const currentCustomer = customers.find((c) => c.value === cart?.customer_id);

  const handleSelectCustomer = (e) => {
    if (cart?.customer_id > 0 && cart.cartItems.length > 0) {
      Toastify('error', 'Customer already selected!, clear or hold cart first!');
    }
  };

  const customerModalHandler = (status: any) => setCustomerIsModal(false);

  useEffect(() => {
    if (customer?.isNew) setCustomerIsModal(true);
  }, [customer]);

  return (
    <>
      <div className="d-flex" onClick={handleSelectCustomer} ref={ref}>
        <div className="flex-grow-1">
          <Select
            isLoading={customers.length === 0}
            styles={selectStyle}
            isDisabled={isOrderEdit > 0 || (cart?.customer_id > 0 && cart.cartItems.length > 0)}
            options={[{ value: '1', label: 'walk-in customer', isNew: false }, ...customers]}
            onChange={(choice: any) => {
              setCustomer({
                ...choice,
                isNew: choice.__isNew__ === undefined ? false : true,
              });
              dispatch(
                setCartCustomer({
                  customer_id: choice.value,
                  location_id: shopId,
                })
              );
            }}
            placeholder="Select Customer..."
            value={
              currentCustomer ||
              (isOrderEdit > 0 ? { label: orderEditDetails.name, value: '111' } : customer)
            }
          />
        </div>
        <button
          disabled={isOrderEdit > 0 || (cart?.customer_id > 0 && cart.cartItems.length > 0)}
          className="btn btn-primary ms-2 p-3"
          style={{
            lineHeight: 0,
            padding: '0px 12px !important',
            height: 38,
          }}
          type="button"
          onClick={() => {
            if (customer && customer.value !== '1') {
              setShowType('edit');
              setCustomerIsModal(true);
            } else Toastify('error', 'Choose Customer First!');
          }}>
          <i className="ri-edit-box-line" />
        </button>
        <button
          disabled={isOrderEdit > 0 || (cart?.customer_id > 0 && cart.cartItems.length > 0)}
          className="btn btn-primary ms-2 p-3"
          style={{
            lineHeight: 0,
            padding: '0px 12px !important',
            height: 38,
          }}
          type="button"
          onClick={() => {
            setShowType('add');
            setCustomerIsModal(true);
          }}>
          <i className="ri-add-circle-line" />
        </button>
      </div>
      <CustomerModal
        shopId={shopId}
        showType={showType}
        userdata={customer}
        customers={customers}
        statusDialog={customerIsModal}
        openDialog={customerModalHandler}
      />
    </>
  );
}
