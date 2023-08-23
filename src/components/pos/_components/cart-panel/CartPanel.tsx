import { useState } from 'react';
import { useAppSelector } from 'src/hooks';
import CustomerDataSelect from '../CustomerDataSelect';
import CartTable from '../cart-table/CartTable';
import { OrdersFooter } from '../orders-footer/OrdersFooter';
import styles from './CartPanel.module.scss';
import { selectCartByLocation } from 'src/redux/slices/cart.slice';
import { OrderCalcs } from '../../utils/OrderCalcs';

interface ICustomerItem {
  value: string;
  label: string;
  isNew: boolean;
}
interface IOrderItem {
  isEdit: boolean;
  name: string;
  total_price: number;
  orderId: number;
  notes?: string;
}

const initCustomer = {
  value: '1',
  label: 'walk-in customer',
  isNew: false,
};

const initOrder = {
  isEdit: false,
  name: '',
  total_price: 0,
  orderId: 0,
};

//! models need the full data to be refactored from static to dynamic

export default function CartPanel({ shopId, lang, direction }) {
  const selectCartForLocation = selectCartByLocation(shopId ?? 0);
  const cart = useAppSelector(selectCartForLocation);

  const [isOrderEdit, setIsOrderEdit] = useState<number>(0);
  const [customer, setCustomer] = useState<ICustomerItem>(initCustomer);
  const [orderEditDetails, setOrderEditDetails] = useState<IOrderItem>(initOrder);
  const [selectedHold, setSelectedHold] = useState<{ holdId: number }>({
    holdId: -1,
  });
  const [taxRate, setTaxRate] = useState<number>(0);
  const [subTotal, setSubTotal] = useState<number>(0);

  const [discount, setDiscount] = useState({
    type: 'fixed',
    amount: 0,
  });
  const [tax, setTax] = useState<number>(0);
  const [__WithDiscountFeature__total, set__WithDiscountFeature__total] = useState<number>(0);

  return (
    <div className={styles['cart__container']} style={{ direction }}>
      <CustomerDataSelect
        shopId={shopId}
        isOrderEdit={isOrderEdit}
        setCustomer={setCustomer}
        orderEditDetails={orderEditDetails}
        customer={customer}
      />
      <hr />
      <CartTable shopId={shopId} lang={lang} />
      <hr />

      <OrderCalcs
        shopId={shopId}
        orderEditDetails={orderEditDetails}
        taxRate={taxRate}
        subTotal={subTotal}
        shippingRate={0}
        // with discount feature
        tax={tax}
        __WithDiscountFeature__total={__WithDiscountFeature__total}
        setDiscount={setDiscount}
        totalDiscount={0}
        lang={lang}
      />
      <OrdersFooter
        selectedHold={selectedHold}
        orderEditDetails={orderEditDetails}
        shopId={shopId}
        details={{
          taxRate,
          customerId: customer?.value,
          totalAmount: cart?.cartSellTotal,
          subTotal,
          isReturn: isOrderEdit,
        }}
        holdObj={{ orders: cart?.cartItems, quantity: 0, name: 'noset' }}
        // with discount feature
        tax={tax}
        __WithDiscountFeature__total={__WithDiscountFeature__total}
        setDiscount={setDiscount}
        totalDiscount={0}
        lang={lang}
      />
    </div>
  );
}
