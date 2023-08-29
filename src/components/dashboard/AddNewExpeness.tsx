import { useEffect, useState } from 'react';
import { apiInsertCtr, apiUpdateCtr } from 'src/libs/dbUtils';
import { IExpenseList, IPayment } from '@models/common-model';
import Select from 'react-select';
import { Toastify } from 'src/libs/allToasts';
import DatePicker from 'react-datepicker';
import { createNewData, updateData } from 'src/services/crud.api';
import { useRouter } from 'next/router';

const AddNewExpeness = (props: any) => {
  const { shopId, setExpensesList, rows, cats, setIsAddExpense, selectId } = props;
  const [formObj, setFormObj] = useState<IExpenseList>({
    id: 0,
    expense_id: 0,
    name: '',
    amount: 0,
    date: new Date(),
    category_id: '',
  });
  const [cateData, setCateData] = useState<{ id: number; name: string; value: number }[]>([]);
  const [errorForm, setErrorForm] = useState({ expense_id: false, name: false, amount: false });
  const colourStyles = { control: (style: any) => ({ ...style, borderRadius: '10px' }) };
  const router = useRouter()
  async function addExpense() {
    if(router.query.id){      
      const res = await createNewData(`expenses/${router.query.id}`, formObj)
      console.log(res);
      if (res.data.success || res.data.status == 201) {
        Toastify('success', 'successfully Creat');
        let _rows = [...rows];
        _rows.push({
          id: res.data.result,
          name: formObj.name,
          category: formObj.category_id,
          amount: formObj.amount,
          date: formObj.date,
        });
        setExpensesList(_rows);
        setIsAddExpense(false);
      }
    }
  }
  async function editEpense() {
    console.log(formObj);
    
    const res = await updateData('expenses', selectId, formObj)
    if (res.data.success) {
      let _i = rows.findIndex((rw: any) => rw.id == selectId);
      if (_i > -1) {
        let _rows = [...rows];
        _rows[_i].name = formObj.name;
        _rows[_i].category = formObj.category_id;
        _rows[_i].amount = formObj.amount;
        _rows[_i].date = formObj.date;
        setExpensesList(_rows);
      }
  
      setIsAddExpense(false);
    }
  }
  var errors = [];
  useEffect(() => {
    setCateData(cats.filter((c) => c.id !== 0).map((c) => ({ label: c.name, value: c.id })));
    if (selectId > 0) {
      let _i = rows.findIndex((rw: any) => rw.id == selectId);
      if (_i > -1)
        setFormObj({
          amount: rows[_i].amount,
          date: rows[_i].date.length > 0 ? new Date(rows[_i].date) : new Date(),
          expense_id: rows[_i].expense_id,
          id: rows[_i].id,
          category_id: rows[_i].category,
          name: rows[_i].name,
        });
    }
  }, []);

  return (
    <>
      <form className="form-style">
        <div className="col-md-12">
          <div className="col-md-6">
            <div className="form-group2">
              <label>
                Category Expense: <span className="text-danger">*</span>
              </label>
              <Select
                styles={colourStyles}
                options={cateData}
                value={cateData.filter((f: any) => {
                  if (f.value == formObj.expense_id) return { label: f.name, value: f.id };
                })}
                onChange={(itm: any) => {
                  setFormObj({ ...formObj, expense_id: itm!.value, category_id: itm!.value });
                }}
              />
              {errorForm.expense_id && <p className="p-1 h6 text-danger ">Select Category</p>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group2">
              <label>
                Name: <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder=""
                value={formObj.name}
                min={0}
                step={0.1}
                onChange={(e) => {
                  setFormObj({ ...formObj, name: e.target.value });
                }}
              />
              {errorForm.name && <p className="p-1 h6 text-danger ">Enter Name</p>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group2">
              <label>
                Amount: <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                placeholder=""
                value={formObj.amount}
                min={0}
                step={0.1}
                onChange={(e) => {
                  setFormObj({ ...formObj, amount: Number(e.target.value) });
                }}
              />
              {errorForm.name && <p className="p-1 h6 text-danger ">Enter Amount</p>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group2">
              <label>Date:</label>
              <DatePicker
                className="form-control p-2"
                selected={formObj.date}
                onChange={(date: Date) => setFormObj({ ...formObj, date: date })}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group2">
              <label>Attach:</label>
              <input type="file" className="form-control" />
            </div>
          </div>
        </div>
        <br />
        <button
          type="button"
          className="btn m-btn btn-primary p-2 "
          onClick={(e) => {
            e.preventDefault();
            errors = [];
            if (formObj.expense_id == 0) errors.push('id');
            if (formObj.name.length <= 1) errors.push('name');
            if (formObj.amount == 0) errors.push('amount');

            setErrorForm({
              ...errorForm,
              expense_id: formObj.expense_id == 0,
              name: formObj.name.length <= 1,
              amount: formObj.amount == 0,
            });
            if (errors.length == 0) {
              if (selectId > 0) editEpense();
              else addExpense();
            } else Toastify('error', 'Fix The Error Fist');
            // editExpenses();
          }}>
          {selectId > 0 ? 'Edit' : 'Add'}
        </button>
      </form>
      <hr />
    </>
  );
};
export default AddNewExpeness;
