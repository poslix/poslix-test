import { useEffect, useState } from "react";
import { apiInsertCtr, apiUpdateCtr } from "src/libs/dbUtils";
import { IExpenseList, IPayment } from "@models/common-model";
import Select from 'react-select';
import { Toastify } from "src/libs/allToasts";
import DatePicker from "react-datepicker";

const AddNewExpeness = (probs: any) => {

    const { shopId, setExpensesList, rows, cats, setIsAddExpense, selectId } = probs
    const [formObj, setFormObj] = useState<IExpenseList>({ id: 0, expense_id: 0, name: '', amount: 0, date: new Date(), cate_name: '' })
    const [cateData, setCateData] = useState<{ id: number, name: string, value: number }[]>([])
    const [errorForm, setErrorForm] = useState({ expense_id: false, name: false, amount: false })
    const colourStyles = { control: (style: any) => ({ ...style, borderRadius: "10px" }), };
    async function addExpense() {
        const { success, newdata, msg } = await apiInsertCtr({ type: 'expenses', subType: 'addExpenseList', data: formObj, shopId })
        console.log(success);
        if (!success) {
            Toastify('error', msg);
            return
        }
        Toastify('success', 'successfully Creat');
        let _rows = [...rows]
        _rows.push({ id: newdata, name: formObj.name, category: formObj.cate_name, amount: formObj.amount, date: formObj.date })
        setExpensesList(_rows)
        setIsAddExpense(false)
    }
    async function editEpense() {
        const { success, msg } = await apiUpdateCtr({ type: 'expenses', subType: 'editExpense', data: formObj, shopId })
        console.log(success);
        if (!success) {
            Toastify('error', msg);
            return
        }
        let _i = rows.findIndex((rw: any) => rw.id == selectId);
        if (_i > -1) {
            let _rows = [...rows]
            _rows[_i].name = formObj.name;
            _rows[_i].category = formObj.cate_name;
            _rows[_i].amount = formObj.amount;
            _rows[_i].date = formObj.date;
            setExpensesList(_rows)
        }

        setIsAddExpense(false)
    }
    var errors = [];
    useEffect(() => {
        setCateData(cats.filter(c => c.id !== 0).map(c => ({ label: c.name, value: c.id })))
        if (selectId > 0) {
            let _i = rows.findIndex((rw: any) => rw.id == selectId);
            if (_i > -1)
                setFormObj({ amount: rows[_i].amount, date: rows[_i].date.length > 0 ? new Date(rows[_i].date) : new Date(), expense_id: rows[_i].expense_id, id: rows[_i].id, cate_name: rows[_i].category, name: rows[_i].name })
        }
    }, [])

    return (
        <>
            <form className='form-style'>
                <div className="col-md-12">
                    <div className="col-md-6">
                        <div className="form-group2">
                            <label>Category Expense: <span className='text-danger'>*</span></label>
                            <Select
                                styles={colourStyles}
                                options={cateData}
                                value={cateData.filter((f: any) => { if (f.value == formObj.expense_id) return { label: f.name, value: f.id } })}
                                onChange={(itm: any) => {
                                    setFormObj({ ...formObj, expense_id: itm!.value, cate_name: itm!.label })
                                }}
                            />
                            {errorForm.expense_id && <p className='p-1 h6 text-danger '>Select Category</p>}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group2">
                            <label>Name: <span className='text-danger'>*</span></label>
                            <input type="text" className="form-control" placeholder="" value={formObj.name} min={0} step={0.1}
                                onChange={(e) => { setFormObj({ ...formObj, name: e.target.value }) }} />
                            {errorForm.name && <p className='p-1 h6 text-danger '>Enter Name</p>}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group2">
                            <label>Amount: <span className='text-danger'>*</span></label>
                            <input type="number" className="form-control" placeholder="" value={formObj.amount} min={0} step={0.1}
                                onChange={(e) => { setFormObj({ ...formObj, amount: Number(e.target.value) }) }} />
                            {errorForm.name && <p className='p-1 h6 text-danger '>Enter Amount</p>}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group2">
                            <label>Date:</label>
                            <DatePicker className='form-control p-2' selected={formObj.date} onChange={(date: Date) => setFormObj({ ...formObj, date: date })} />
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
                <button type="button" className="btn m-btn btn-primary p-2 "
                    onClick={(e) => {
                        e.preventDefault();
                        errors = [];
                        if (formObj.expense_id == 0) errors.push('id')
                        if (formObj.name.length <= 1) errors.push('name')
                        if (formObj.amount == 0) errors.push('amount')

                        setErrorForm({
                            ...errorForm,
                            expense_id: formObj.expense_id == 0,
                            name: formObj.name.length <= 1,
                            amount: formObj.amount == 0,
                        })
                        if (errors.length == 0) {
                            if (selectId > 0)
                                editEpense();
                            else
                                addExpense();
                        }
                        else
                            Toastify('error', 'Fix The Error Fist');
                        // editExpenses();
                    }} >{selectId > 0 ? 'Edit' : 'Add'}
                </button>
            </form >
            <hr />
        </>
    )
}
export default AddNewExpeness;