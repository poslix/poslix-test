import { DiscountType } from '@models/common-model';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { ChangeEvent, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import MainModal from 'src/components/modals/MainModal';
import { useAppDispatch } from 'src/hooks';
import { setCartDiscount } from 'src/redux/slices/cart.slice';

const defaultDiscountType = 'fixed';
const defaultDuscount = 0;

export function EditDiscountModal({
  show,
  setShow,
  shopId,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  shopId: number;
}) {
  const dispatch = useAppDispatch();
  const [discountType, setDiscountType] = useState<DiscountType>(defaultDiscountType);
  const [discountAmount, setDiscountAmount] = useState(defaultDuscount);

  const handleChangeDiscountType = (event: SelectChangeEvent) => {
    setDiscountType(event?.target?.value as DiscountType);
  };

  const handleChangeDiscount = (event: ChangeEvent<HTMLInputElement>) => {
    const val = Number(event?.target?.value);
    if (val >= 0) setDiscountAmount(val);
  };

  const handleCancel = () => {
    setShow(false);
    setDiscountType(defaultDiscountType);
    setDiscountAmount(defaultDuscount);
  };

  const handleUpdate = () => {
    dispatch(
      setCartDiscount({
        location_id: shopId,
        type: discountType,
        discount: discountAmount,
      })
    );
    setShow(false);
  };

  useEffect(() => {
    if (!show) {
      setDiscountType(defaultDiscountType);
      setDiscountAmount(defaultDuscount);
    }
  }, [show]);

  return (
    <MainModal
      setShow={() => setShow(false)}
      title="Edit Discount"
      show={show}
      body={
        <div className="d-flex" style={{ gap: '16px', padding: '1rem' }}>
          <div style={{ width: '500px', maxWidth: '40vw' }}>
            <FormControl fullWidth>
              <InputLabel id="discount-type-select-label">Discount Type</InputLabel>
              <Select
                labelId="discount-type-select-label"
                id="discount-type-select"
                value={discountType}
                label="Discount Type"
                onChange={handleChangeDiscountType}
                variant="filled">
                <MenuItem value="fixed">Fixed</MenuItem>
                <MenuItem value="percent">Percent</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div style={{ width: '500px', maxWidth: '40vw' }}>
            <FormControl fullWidth>
              <TextField
                autoFocus
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
      }
      footer={
        <>
          <Button variant="outline-primary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>Update</Button>
        </>
      }
    />
  );
}
