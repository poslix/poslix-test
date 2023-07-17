import React, { useContext } from "react";
import { UserContext } from "src/context/UserContext";
import { IOrdersCalcs } from "../../../models/common-model";

export const OrderCalcs = (calcs: IOrdersCalcs) => {
  const { taxRate, subTotal, totalAmount, orderEditDetails, shippingRate } = calcs;
  const { locationSettings } = useContext(UserContext);
  return (
    <div className="table calcs-table table-borderless  align-middle mb-0 border-top border-top-dashed mt-2">
      <div>
        <div className="calcs-details-row">
          <div className="py-1 calcs-details-col">
            <div>
              Estimated Tax ({taxRate}%)
            </div>
            <div>
              {(totalAmount - subTotal).toFixed(locationSettings.currency_decimal_places)}
            </div>
          </div>
          <div className="py-1 calcs-details-col">
            <div>Shipping Charge (+)</div>
            <div>{shippingRate?.toFixed(locationSettings.currency_decimal_places)}</div>
          </div>
        </div>
        <div className="calcs-details-row">
          <div className="py-1 calcs-details-col">
            <div>Discount (-)</div>
            <div>0</div>
          </div>
          <div className="py-1 calcs-details-col">
            <div>Total Amount</div>
            <div>{totalAmount.toFixed(locationSettings.currency_decimal_places)} <span style={{ fontSize: '10px' }}>OMR</span></div>
          </div>
        </div>
        {orderEditDetails.isEdit && +(totalAmount - orderEditDetails.total_price).toFixed(locationSettings.currency_decimal_places) != 0 && <div className="calcs-details-row">
          <div className="py-1 calcs-details-col">
            <div></div>
            <div></div>
          </div>
          <div className="py-1 calcs-details-col">
            <div>Difference</div>
            <div>{(totalAmount - orderEditDetails.total_price).toFixed(locationSettings.currency_decimal_places)} <span style={{ fontSize: '10px' }}>{locationSettings.currency_code}</span></div>
          </div>
        </div>}
      </div>
    </div>
  );
};
