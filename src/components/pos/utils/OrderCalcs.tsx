import { ITax } from '@models/pos.types';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import { useUser } from 'src/context/UserContext';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { selectCartByLocation, setCartTax } from 'src/redux/slices/cart.slice';
import { useTaxesList } from 'src/services/pos.service';
import { IOrderMiniDetails } from '../../../models/common-model';
import { EditDiscountModal } from '../modals/edit-discount/EditDiscountModal';

interface IOrderCalcsProps {
  orderEditDetails: IOrderMiniDetails;
  lang: any;
  __WithDiscountFeature__total: any;
  shopId: number;
}

export const OrderCalcs = ({
  orderEditDetails,
  lang,
  __WithDiscountFeature__total,
  shopId,
}: IOrderCalcsProps) => {
  const dispatch = useAppDispatch();
  const { locationSettings } = useUser();

  const selectCartForLocation = selectCartByLocation(shopId);
  const cart = useAppSelector(selectCartForLocation); // current location order

  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  useTaxesList(shopId, {
    onSuccess(data) {
      const _tax: ITax = data?.result?.taxes?.find((tax: ITax) => tax?.is_primary === 1);
      console.log(_tax);
      dispatch(
        setCartTax({ tax: _tax?.amount ?? 0, location_id: shopId, type: _tax?.type ?? 'fixed' })
      );
    },
  });

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

  return (
    <div className="table calcs-table table-borderless  align-middle mb-0 border-top border-top-dashed mt-2">
      <div>
        <div className="calcs-details-row">
          <div className="py-1 calcs-details-col">
            <div>
              {lang.cartComponent?.tax}
              <span>
                {cart?.cartTaxType === 'percentage' ? (
                  <>({+cart?.cartTax}%)</>
                ) : (
                  <>
                    ({+cart?.cartTax} {locationSettings?.currency_code})
                  </>
                )}
              </span>
            </div>
            <div>
              {(+cart?.cartSellTotal * (cart?.cartTax / 100)).toFixed(
                +locationSettings?.location_decimal_places
              )}{' '}
              <span style={{ fontSize: '10px' }}>{locationSettings?.currency_code}</span>
            </div>
          </div>

          <div className="py-1 calcs-details-col">
            <div>{lang.cartComponent?.shipping} (+)</div>
            <div>
              {(+(cart?.shipping ?? 0))?.toFixed(+locationSettings?.location_decimal_places)}{' '}
              <span style={{ fontSize: '10px' }}>{locationSettings?.currency_code}</span>
            </div>
          </div>
        </div>

        <div className="calcs-details-row">
          <div className="py-1 calcs-details-col">
            <div>{lang.cartComponent?.discount} (-)</div>
            <div>
              <EditIcon
                onClick={() => setIsDiscountModalOpen(true)}
                style={{
                  fontSize: '16px',
                  marginRight: '4px',
                  cursor: 'pointer',
                }}
              />
              <span>
                {totalDiscount?.toFixed(locationSettings?.location_decimal_places)}{' '}
                <span style={{ fontSize: '10px' }}>{locationSettings?.currency_code}</span>
              </span>
            </div>
          </div>
          <div className="py-1 calcs-details-col">
            <div>{lang.cartComponent?.total}</div>
            <div>
              {totalAmount?.toFixed(locationSettings?.location_decimal_places)}{' '}
              <span style={{ fontSize: '10px' }}>{locationSettings?.currency_code}</span>
            </div>
          </div>
        </div>

        {orderEditDetails?.isEdit &&
          +(
            __WithDiscountFeature__total +
            (totalAmount - totalNoTax) -
            orderEditDetails?.total_price
          ).toFixed(locationSettings?.location_decimal_places) != 0 && (
            <div className="calcs-details-row">
              <div className="py-1 calcs-details-col">
                <div></div>
                <div></div>
              </div>
              <div className="py-1 calcs-details-col">
                <div>Difference</div>
                <div>
                  {(
                    __WithDiscountFeature__total +
                    (totalAmount - totalNoTax) -
                    orderEditDetails?.total_price
                  ).toFixed(locationSettings?.location_decimal_places)}{' '}
                  <span style={{ fontSize: '10px' }}>{locationSettings?.currency_code}</span>
                </div>
              </div>
            </div>
          )}

        <EditDiscountModal
          shopId={shopId}
          show={isDiscountModalOpen}
          setShow={setIsDiscountModalOpen}
        />
      </div>
    </div>
  );
};
