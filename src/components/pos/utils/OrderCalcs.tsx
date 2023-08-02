import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import { UserContext } from "src/context/UserContext";
import { DiscountType, IOrdersCalcs } from "../../../models/common-model";
import EditIcon from "@mui/icons-material/Edit";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";

const defaultDiscountType = "fixed";
const defaultDuscount = 0;

export const OrderCalcs = (calcs: IOrdersCalcs) => {
  const { taxRate, orderEditDetails, subTotal, totalAmount, shippingRate, lang } =
    calcs;
  // with discount feature
  const { tax, __WithDiscountFeature__total, setDiscount, totalDiscount } =
    calcs;
  const { locationSettings } = useContext(UserContext);

  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountType, setDiscountType] =
    useState<DiscountType>(defaultDiscountType);
  const [discountAmount, setDiscountAmount] = useState(defaultDuscount);
  const handleChangeDiscountType = (event: SelectChangeEvent) => {
    setDiscountType(event.target.value as DiscountType);
  };
  const handleChangeDiscount = (event: ChangeEvent<HTMLInputElement>) => {
    const val = Number(event.target.value);
    if (val >= 0) setDiscountAmount(val);
  };
  const handleCancel = () => {
    setIsDiscountModalOpen(false);
    setDiscountType(defaultDiscountType);
    setDiscountAmount(defaultDuscount);
  };
  const handleUpdate = () => {
    setIsDiscountModalOpen(false);
    setDiscount({
      type: discountType,
      amount: discountAmount,
    });
  };

  return (
    <div className="table calcs-table table-borderless  align-middle mb-0 border-top border-top-dashed mt-2">
      <div>
        <div className="calcs-details-row">
          <div className="py-1 calcs-details-col">
            <div>{lang.cartComponent.tax} ({taxRate}%)</div>
            <div>
              {(totalAmount - subTotal).toFixed(
                locationSettings.currency_decimal_places
              )}
            </div>
          </div>
          <div className="py-1 calcs-details-col">
            <div>{lang.cartComponent.shipping} (+)</div>
            <div>
              {shippingRate?.toFixed(locationSettings.currency_decimal_places)}
            </div>
          </div>
        </div>
        <div className="calcs-details-row">
          <div className="py-1 calcs-details-col">
            <div>{lang.cartComponent.discount} (-)</div>
            <div>
              <EditIcon
                onClick={() => setIsDiscountModalOpen(true)}
                style={{
                  fontSize: "16px",
                  marginRight: "4px",
                  cursor: "pointer",
                }}
              />
              <span>
                {totalDiscount.toFixed(
                  locationSettings.currency_decimal_places
                )}{" "}
                <span style={{ fontSize: "10px" }}>{locationSettings.currency_code}</span>
              </span>
            </div>
          </div>
          <div className="py-1 calcs-details-col">
            <div>{lang.cartComponent.total}</div>
            <div>
              {(
                __WithDiscountFeature__total +
                (totalAmount - subTotal)
              ).toFixed(locationSettings.currency_decimal_places)}{" "}
              <span style={{ fontSize: "10px" }}>{locationSettings.currency_code}</span>
            </div>
          </div>
        </div>
        {orderEditDetails.isEdit &&
          +(
            __WithDiscountFeature__total +
            (totalAmount - subTotal) -
            orderEditDetails.total_price
          ).toFixed(locationSettings.currency_decimal_places) != 0 && (
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
                    (totalAmount - subTotal) -
                    orderEditDetails.total_price
                  ).toFixed(locationSettings.currency_decimal_places)}{" "}
                  <span style={{ fontSize: "10px" }}>
                    {locationSettings.currency_code}
                  </span>
                </div>
              </div>
            </div>
          )}
        <Dialog
          open={isDiscountModalOpen}
          onClose={() => setIsDiscountModalOpen(false)}
          aria-labelledby="discount-modal-title"
          aria-describedby="discount-modal-description"
          className="poslix-modal discount-modal"
        >
          <DialogTitle className="poslix-modal-title discount-modal-title text-primary">
            Discount
          </DialogTitle>
          <DialogContent>
            <h5 style={{ color: "#025c53", margin: "16px 0 20px" }}>
              Edit Discount:
            </h5>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ width: "500px", maxWidth: "40vw" }}>
                <FormControl fullWidth>
                  <InputLabel id="discount-type-select-label">
                    Discount Type
                  </InputLabel>
                  <Select
                    labelId="discount-type-select-label"
                    id="discount-type-select"
                    value={discountType}
                    label="Discount Type"
                    onChange={handleChangeDiscountType}
                    variant="filled"
                  >
                    <MenuItem value="fixed">Fixed</MenuItem>
                    <MenuItem value="percent">Percent</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div style={{ width: "500px", maxWidth: "40vw" }}>
                <FormControl fullWidth>
                  <TextField
                    value={discountAmount}
                    onChange={handleChangeDiscount}
                    id="discount"
                    label="Number"
                    type="number"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="filled"
                  />
                </FormControl>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button className="discount-dialog-action" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              className="discount-dialog-action"
              onClick={handleUpdate}
              autoFocus
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};
