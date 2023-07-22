import { useEffect, useState } from "react";
import { Button, ButtonGroup, Card, Spinner, Table } from 'react-bootstrap'
import { apiFetch, apiInsert } from "src/libs/dbUtils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPenToSquare, faPlus, faStreetView, faFolderOpen, faArrowAltCircleLeft, faGear, faDesktop, faChartPie, faLayerGroup } from '@fortawesome/free-solid-svg-icons'
import { redirectToLogin } from '../../libs/loginlib'
import { userDashboard } from "@models/common-model";
import Select, { StylesConfig } from 'react-select';
import { IconProp } from "@fortawesome/fontawesome-svg-core";
const AddNewRole = (probs: any) => {

    const [formObj, setFormObj] = useState({ isNew: true, name: '', stuff: '' });
    const [errorForm, setErrorForm] = useState({ name: false, stuff: false })
    const [pages, setPages] = useState<{ value: string, label: string, stuffs: object[], icon?: IconProp }[]>([])
    const pages2 = [
        { value: 'split', label: 'Sales List', stuffs: [], icon: faChartPie },
        { value: 'sales', label: 'Sales', stuffs: [{ label: 'View', value: 'view', isChoose: false }, { label: 'Edit', value: 'edit' }, { label: 'Delete', value: 'delete' }, { label: 'Insert', value: 'insert' }] },
        { value: 'quotations', label: 'Quotations', stuffs: [{ label: 'View', value: 'view', isChoose: false }, { label: 'Edit', value: 'edit' }, { label: 'Delete', value: 'delete' }, { label: 'Insert', value: 'insert' }] },
        { value: 'split', label: 'setup', stuffs: [], icon: faLayerGroup },
        { value: 'products', label: 'Products', stuffs: [{ label: 'View', value: 'view', isChoose: false }, { label: 'Edit', value: 'edit' }, { label: 'Delete', value: 'delete' }, { label: 'Insert', value: 'insert' }] },
        { value: 'purchases', label: 'Purchases', stuffs: [{ label: 'View', value: 'view' }, { label: 'Edit', value: 'edit' }, { label: 'Delete', value: 'delete' }, { label: 'Insert', value: 'insert' }] },
        { value: 'category', label: 'Category & Brands', stuffs: [{ label: 'View', value: 'view' }, { label: 'Edit', value: 'edit' }, { label: 'Delete', value: 'delete' }, { label: 'Insert', value: 'insert' }] },
        { value: 'split', label: 'Settings', stuffs: [], icon: faGear },
        { value: 'taxes', label: 'Taxes', stuffs: [{ label: 'View', value: 'view' }, { label: 'Insert & Edit', value: 'insert' }, { label: 'Delete', value: 'delete' }] },
        { value: 'discounts', label: 'Discount', stuffs: [{ label: 'View', value: 'view' }, { label: 'Edit', value: 'edit' }, { label: 'Delete', value: 'delete' }, { label: 'Insert', value: 'insert' }] },
        { value: 'expanses', label: 'Expenses', stuffs: [{ label: 'View', value: 'view' }, { label: 'Insert & Edit', value: 'insert' }, { label: 'Delete', value: 'delete' }] },
        { value: 'split', label: 'POS Screen', stuffs: [], icon: faDesktop },
        { value: 'POS', label: 'POS', stuffs: [{ label: 'Orders', value: 'orders' }, { label: 'payment', value: 'payment' }] },
    ];
    async function insertUpdateUsers() {
        const { success, newdata, msg } = await apiInsert({ type: 'addUpdatebusinessRoles', data: { data: formObj, pages: pages } })
        console.log(success);
        console.log("result ", newdata);
        if (!success) {
            alert(msg)
            return
        }
        if (formObj.isNew)
            probs.stuffs.push(newdata);
        else {
            probs.stuffs[probs.index].stuff = newdata.stuff;
            probs.stuffs[probs.index].name = newdata.name;
        }
        probs.setIsAddNew(false)

    }
    function handelChange(idx: number, stufIndex: number) {
        // const { checked } = e.target;
        var _rows: any = pages;
        _rows[idx].stuffs[stufIndex].isChoose = !_rows[idx].stuffs[stufIndex].isChoose;
        setPages(_rows)
        setFormObj({ ...formObj, stuff: 'd' })
    }
    const showInnerRoles = (item: any, index: number) => {
        return (item.stuffs.map((st: any, stIndex: number) => {
            return (
                <div className="form-control" onClick={() => { handelChange(index, stIndex) }}>
                    <input className="form-check-input me-1" type="checkbox" checked={st.isChoose} />
                    <label> {st.label}</label>
                </div>
            )
        }))
    }
    var errors = [];
    useEffect(() => {
        if (probs.index > -1) {
            setFormObj({ ...probs.stuffs[probs.index], isNew: false })
            var _userStuff = probs.stuffs[probs.index].stuff.toLowerCase();
            console.log(_userStuff);

            pages2.map((pg, i) => {
                pg.stuffs.map((st: any, stIndex: number) => {
                    if (_userStuff.includes(pg.value.toLowerCase() + "/" + st.value.toLowerCase()))
                        pages2[i].stuffs[stIndex].isChoose = true;
                })
            });

        }
        setPages(pages2)
    }, [])

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <Card >
                        <Card.Header className="p-3 bg-white">
                            <h5>Add New Role</h5>
                        </Card.Header>
                        <Card.Body >

                            <form className='form-style'>
                                {/* {JSON.stringify(formObj)} */}
                                <div className="col-md-12">
                                    <div className="col-md-6">
                                        <div >
                                            <label>Rule Name: <span className='text-danger'>*</span></label>
                                            <input type="text" className="form-control" placeholder="" value={formObj.name!}
                                                onChange={(e) => { setFormObj({ ...formObj, name: e.target.value }) }} />
                                            {errorForm.name && <p className='p-1 h6 text-danger '>Enter Rule Name</p>}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <form className='user-stuff-form'>
                                            <div className="col-md-6 col-lg-6 col-cm-6">
                                                {/* {JSON.stringify(pages)} */}
                                                <label>Rules: <span className='text-danger'>*</span></label>
                                                <ul className="list-group">
                                                    {pages.map((pg, i) => {
                                                        if (pg.value == 'split')
                                                            return (<><li className="list-group-item bg-primary" ><span><FontAwesomeIcon icon={pg.icon!} size="1x" /> {pg.label}</span><div className="checkbox-rols"></div></li></>)
                                                        return (<>
                                                            <li className="list-group-item" >
                                                                <span>{pg.label}</span>
                                                                <div className="checkbox-rols">
                                                                    {showInnerRoles(pg, i)}
                                                                </div>
                                                            </li>
                                                        </>)
                                                    })}


                                                </ul>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                <button type="button" className="btn m-btn btn-primary p-2 mt-4 "
                                    onClick={(e) => {
                                        e.preventDefault();
                                        errors = [];
                                        if (formObj.name.length == 0) errors.push('error')

                                        setErrorForm({
                                            ...errorForm,
                                            name: formObj.name.length == 0 ? true : false,
                                        })
                                        if (errors.length == 0) {
                                            insertUpdateUsers()
                                        }
                                    }} >Save
                                </button>
                            </form>
                        </Card.Body>
                    </Card >
                </div >
            </div >
        </>
    )
}
export default AddNewRole;