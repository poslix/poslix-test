import React, { useState, useEffect } from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const today = new Date();
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
const last7Days = [new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000), today];
const last30Days = [new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000), today];
const thisMonth = [
  new Date(today.getFullYear(), today.getMonth(), 1),
  new Date(today.getFullYear(), today.getMonth() + 1, 0),
];
const lastMonth = [
  new Date(today.getFullYear(), today.getMonth() - 1, 1),
  new Date(today.getFullYear(), today.getMonth(), 0),
];
const thisMonthLastYear = [
  new Date(today.getFullYear() - 1, today.getMonth(), 1),
  new Date(today.getFullYear() - 1, today.getMonth() + 1, 0),
];
const thisYear = [new Date(today.getFullYear(), 0, 1), new Date(today.getFullYear(), 11, 31)];
const lastYear = [
  new Date(today.getFullYear() - 1, 0, 1),
  new Date(today.getFullYear() - 1, 11, 31),
];
const currentFinancialYear = [
  new Date(today.getFullYear(), 3, 1),
  new Date(today.getFullYear() + 1, 2, 31),
];
const lastFinancialYear = [
  new Date(today.getFullYear() - 1, 3, 1),
  new Date(today.getFullYear(), 2, 31),
];

const options = [
  { label: 'Today', range: [today, today] },
  { label: 'Yesterday', range: [yesterday, yesterday] },
  { label: 'Last 7 days', range: last7Days },
  { label: 'Last 30 days', range: last30Days },
  { label: 'This month', range: thisMonth },
  { label: 'Last month', range: lastMonth },
  { label: 'This month last year', range: thisMonthLastYear },
  { label: 'This year', range: thisYear },
  { label: 'Last year', range: lastYear },
  { label: 'Current financial year', range: currentFinancialYear },
  { label: 'Last financial year', range: lastFinancialYear },
  { label: 'Date', range: [], hidden: true },
];
// Eslam 20
export default function DatePicker({
  setStrSelectedDate,
  selectedRange,
  setSelectedRange,
  hiden = false,
  placeHolder = null,
}) {
  const [startDatepicker, setStartDatepicker] = useState<Date | null>();
  const [endDatepicker, setEndDatepicker] = useState<Date | null>();
  const [label, setLabel] = useState(null);

  const handleOptionClick = (range) => {
    setStartDatepicker(null);
    setEndDatepicker(null);
    setSelectedRange(range);
  };

  const renderOptions = () => {
    return options.map((option, index) => (
      <MenuItem
        style={{ display: option.hidden ? 'none' : 'block' }}
        value={option.label}
        key={index}
        onClick={() => handleOptionClick(option.range)}>
        {option.label}
      </MenuItem>
    ));
  };

  useEffect(() => {
    if (!selectedRange) {
      setStrSelectedDate([]);
      setLabel(null);
    } else {
      const startDate = selectedRange[0].toLocaleDateString();
      const endDate = selectedRange[1].toLocaleDateString();

      if (startDate == endDate) {
        setStrSelectedDate([startDate]);
      } else {
        setStrSelectedDate([startDate, endDate]);
      }

      // set select component label
      const selectedVal = options.find((option) => option.range[0] === selectedRange[0]);
      setLabel(selectedVal?.label);
    }
  }, [selectedRange]);

  const onChange = ([start, end]) => {
    setStartDatepicker(start);
    setEndDatepicker(end);
    if (end) setSelectedRange([start, end]);
  };
  return (
    <>
      <div className="w-fit rounded" style={{ border: '0.5px solid #ccc' }}>
        <ReactDatePicker
          selected={startDatepicker}
          startDate={startDatepicker}
          endDate={endDatepicker}
          selectsRange
          dateFormat="yyyy/MM/dd"
          className="p-3 border-0 bg-transparent"
          placeholderText={`${placeHolder === null ? 'Select Date' : placeHolder}`}
          onChange={(date) => onChange(date)}
        />
      </div>
      {!hiden && (
        <FormControl sx={{ m: 1, width: 220 }}>
          <InputLabel id="date-picker-label">Date</InputLabel>
          <Select labelId="date-picker-label" id="date-picker" label="Date" value={label || 'Date'}>
            {renderOptions()}
          </Select>
        </FormControl>
      )}
    </>
  );
}
