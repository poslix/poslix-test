import type { NextPage } from 'next'
import Table from 'react-bootstrap/Table';
import { AdminLayout } from '@layout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import Select from 'react-select';
import { faTrash, faFloppyDisk, faPlus, faEye, faSpinner, faEdit } from '@fortawesome/free-solid-svg-icons'
import { Button, ButtonGroup, Card } from 'react-bootstrap'
import React, { useState, useEffect } from 'react'
import AlertDialog from 'src/components/utils/AlertDialog';
import AddGroupModal from 'src/components/utils/AddGroupModal';
import ShowDialog from 'src/components/utils/ShowDialog';
import { ITax, ITokenVerfy } from '@models/common-model';
import { apiFetch, apiFetchCtr, apiInsertCtr } from 'src/libs/dbUtils';
import { useRouter } from 'next/router'
import * as cookie from 'cookie'
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';

const Taxes: NextPage = (props: any) => {

    const { shopId, rules } = props;
    const selectStyle = { control: (style: any) => ({ ...style, color: '#db3333', borderRadius: '10px', marginTop: '4px', borderBottom: '1px solid #eaeaea' }) }
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingDetails, setIsLoadingDetails] = useState(false)
    const [taxs, setTaxs] = useState<ITax[]>([])
    const [taxsExcise, setTaxsExcise] = useState<ITax[]>([])
    const [taxsService, setTaxsService] = useState<ITax[]>([])
    const [taxesGroup, setTaxesGroup] = useState<ITax[]>([])
    const [show, setShow] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [itemDetails, setItemDetails] = useState<ITax[]>([]);
    const [groupModal, setGroupModal] = useState(false);
    const [selectId, setSelectId] = useState(0);
    const [selectType, setSelectType] = useState('');

    const router = useRouter()
    const taxValueType = [
        { label: 'Percentage', value: 'percentage' },
        { label: 'Fixed', value: 'fixed' }
    ]

    async function initDataPage() {
        var result = await apiFetchCtr({ fetch: 'taxes', subType: 'getTaxs', shopId })
        const { success, newdata } = result;
        if (success) {
            if (rules.hasInsert) {
                newdata.push({ id: 0, name: '', amount: 0, type: '', isPrimary: false, taxType: 'primary', isNew: 1 })
                newdata.push({ id: 0, name: '', amount: 0, type: '', isPrimary: false, taxType: 'excise', isNew: 1 })
                newdata.push({ id: 0, name: '', amount: 0, type: '', amountType: "percentage", isPrimary: false, taxType: 'service', isNew: 1 })
            }
            setTaxs(newdata.filter((p: ITax) => { return p.taxType == 'primary' }))
            setTaxsExcise(newdata.filter((p: ITax) => { return p.taxType == 'excise' }))
            setTaxsService(newdata.filter((p: ITax) => { return p.taxType == 'service' }))
            setTaxesGroup(newdata.filter((p: ITax) => { return p.taxType == 'group' }))
            setIsLoading(false)
        }

    }
    async function addUpdateTaxs(rows: ITax[]) {
        if (rows[0].taxType == "primary") {
            let notHas = true;
            for (var j = 0; j < rows.length - 1; j++) {
                if (rows[j].isPrimary)
                    notHas = false;
            }
            if (notHas) {
                Toastify('error', "Error, you have to set one item is primary")
                return;
            }
        }
        const { success, data } = await apiInsertCtr({ type: 'taxes', subType: 'insetUpdatePrimaryTax', data: rows, shopId })
        if (!success) {
            Toastify('error', "Has Error ,try Again")
            return;
        }
        let jj = 0;
        const _taxs = rows[0].taxType == 'primary' ? [...taxs] : rows[0].taxType == 'excise' ? [...taxsExcise] : [...taxsService]
        for (var j = 0; j < _taxs.length - 1; j++) {
            _taxs[j].isNew = 0;
            if (_taxs[j].id == 0) {
                _taxs[j].id = data[jj]
                jj++;
            }
        }

        rows[0].taxType == 'primary' ? setTaxs(_taxs) : rows[0].taxType == 'excise' ? setTaxsExcise(_taxs) : setTaxsService(_taxs)
        Toastify('success', "successfuly Done!")
    }

    useEffect(() => {
        initDataPage();
    }, [router.asPath])

    const handlePrimarySwitchChange = (e: any, i: number) => {
        const _taxs = [...taxs];
        var sv = _taxs[i].isPrimary;
        for (var j = 0; j < _taxs.length; j++)
            _taxs[j].isPrimary = false;

        _taxs[i].isPrimary = !sv;
        setTaxs(_taxs)
    }
    const handleInputChange = (e: any, i: number) => {
        const _taxs = [...taxs]
        e.target.name == 'tax-name' ? _taxs[i].name = e.target.value : _taxs[i].amount = e.target.value

        var hasEmpty = false;
        for (var j = 0; j < _taxs.length; j++)
            if (_taxs[j].name.length == 0) hasEmpty = true

        if (!hasEmpty) _taxs.push({ id: 0, name: '', amount: 0, amountType: '', isPrimary: false, taxType: 'primary', isNew: 1 })
        setTaxs(_taxs)
    }
    const handleDelete = (i: number, type: string) => {
        const _taxs = type == 'primary' ? [...taxs] : type == 'excise' ? [...taxsExcise] : type == 'group' ? [...taxesGroup] : [...taxsService]
        if (_taxs[i].isNew) {
            _taxs.splice(i, 1);
            type == 'primary' ? setTaxs(_taxs) : type == 'excise' ? setTaxsExcise(_taxs) : setTaxsService(_taxs)
        } else {
            setShow(true)
            setSelectId(_taxs[i].id);
            setSelectType(type);
        }

    }
    const handleChangeExcAndService = (e: any, i: number, isExc: boolean) => {
        const _taxes = isExc ? [...taxsExcise] : [...taxsService]
        e.target.name == 'tax-name' ? _taxes[i].name = e.target.value : e.target.name == 'tax-value' ? _taxes[i].amount = e.target.value : _taxes[i].amountType = e.target.value
        var hasEmpty = false;
        for (var j = 0; j < _taxes.length; j++)
            if (_taxes[j].name.length == 0) hasEmpty = true
        if (!hasEmpty) _taxes.push({ id: 0, name: '', amount: 0, amountType: 'percentage', taxType: isExc ? 'excise' : 'service', isPrimary: false, isNew: 1 })
        isExc ? setTaxsExcise(_taxes) : setTaxsService(_taxes)
    }
    const addNewGroup = (id = 0) => {
        setSelectType("edit")
        setSelectId(id)
        setGroupModal(true)
    }

    async function showDetailsHandle(id: number) {
        setSelectId(id)
        setIsLoadingDetails(true)
        const { success, newdata } = await apiFetchCtr({ fetch: 'taxes', subType: "getGroupItems", id, shopId })
        if (!success) {
            Toastify('error', "Has Error ,try Again")
            return;
        }
        setItemDetails(newdata)
        setIsLoadingDetails(false)
        setShowDetails(true)
    }
    const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
        if (result) {
            const _taxs = section == 'primary' ? [...taxs] : section == 'excise' ? [...taxsExcise] : section == 'group' ? [...taxesGroup] : [...taxsService]
            const idx = _taxs.findIndex((itm: any) => itm.id == selectId);
            if (idx != -1)
                _taxs.splice(idx, 1);
            section == 'primary' ? setTaxs(_taxs) : section == 'excise' ? setTaxsExcise(_taxs) : section == 'group' ? setTaxesGroup(_taxs) : setTaxsService(_taxs)
        }
        if (msg.length > 0)
            Toastify(result ? 'success' : 'error', msg)
        setShow(false)
    }

    return (
        <>
            <AdminLayout shopId={shopId}>

                <ToastContainer />
                <AlertDialog alertShow={show} shopId={shopId} alertFun={handleDeleteFuc} id={selectId} type="taxes" subType="deleteTax" section={selectType}>
                    Are you Sure You Want Delete This Item ?
                </AlertDialog>

                <ShowDialog alertShow={showDetails} alertFun={(e: boolean) => setShowDetails(e)} id={selectId} type="deleteTax" taxs={taxs} >
                    <Table className="table table-hover" responsive>
                        <thead className="thead-dark">
                            <tr>
                                <th>Name</th>
                                <th>Tax Type</th>
                                <th>Amount Type</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                !isLoadingDetails && itemDetails.map((ex: any, i: number) => {
                                    return (
                                        <tr key={i}>
                                            <td>{ex.name}</td>
                                            <td>{ex.tax_type}</td>
                                            <td>{ex.type}</td>
                                            <td>{ex.type == 'fixed' ? ex.amount : ex.amount + '%'}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </Table>
                </ShowDialog>

                <AddGroupModal alertShow={groupModal} shopId={shopId} alertFun={(e: boolean) => setGroupModal(e)} id={selectId} type={selectType} dataItems={taxesGroup} allTaxes={{ taxes: taxs, excise: taxsExcise, services: taxsService, taxesGroup }} />
                <div className="row">
                    <div className="col-md-12">

                        <Card>
                            <Card.Header className="p-3 bg-white">
                                <h5>Taxes List</h5>
                            </Card.Header>
                            <Card.Body>
                                {!isLoading ? <Table className="table table-hover remove-last-del-icon" responsive>
                                    <thead className="thead-dark">
                                        <tr>
                                            <th style={{ width: '50%' }} >Name</th>
                                            <th style={{ width: '15%' }}>Amount (%)</th>
                                            <th style={{ width: '10%' }}>is Primary?</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            taxs.map((ex: any, i: number) => {
                                                return (
                                                    <tr key={i} style={{ background: ex.isNew ? '#c6e9e6' : '' }}>
                                                        <td><input type="text" name="tax-name" className="form-control p-2" disabled={!rules.hasInsert} placeholder="Enter New Tax Name" value={ex.name} onChange={(e) => { handleInputChange(e, i) }} /></td>
                                                        <td><input type="number" min={0} max={100} step={1} name="tax-value" disabled={!rules.hasInsert} className="form-control p-2" placeholder="Tax Value" value={ex.amount} onChange={(e) => { handleInputChange(e, i) }} /></td>
                                                        <td><Form.Check type="switch" id="custom-switch" disabled={!rules.hasInsert} className="custom-switch" checked={ex.isPrimary ? true : false} onChange={(e) => { handlePrimarySwitchChange(e, i) }} /></td>
                                                        <td><ButtonGroup className="mb-2 m-buttons-style">
                                                            {rules.hasDelete && <Button onClick={() => handleDelete(i, 'primary')}><FontAwesomeIcon icon={faTrash} /></Button>}
                                                        </ButtonGroup></td>
                                                    </tr>)
                                            })
                                        }
                                    </tbody>
                                </Table>
                                    : <div className='d-flex justify-content-around' ><Spinner animation="grow" /></div>}
                            </Card.Body>
                            {rules.hasInsert && <div className='m-3'><button className='btn m-btn btn-primary p-3' onClick={() => addUpdateTaxs(taxs)}><FontAwesomeIcon icon={faFloppyDisk} /> save</button></div>}
                        </Card>

                        {/* excces */}
                        <Card className='mt-4'>
                            <Card.Header className="p-3 bg-white">
                                <h5>Excise Taxes List</h5>
                            </Card.Header>
                            <Card.Body >
                                {!isLoading ? <Table className="table table-hover remove-last-del-icon" responsive>
                                    <thead className="thead-dark">
                                        <tr>
                                            <th style={{ width: '50%' }} >Name</th>
                                            <th style={{ width: '15%' }}>Amount (%)</th>
                                            <th style={{ width: '35%' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            taxsExcise.map((ex: any, i: number) => {
                                                return (
                                                    <tr key={i} style={{ background: ex.isNew ? '#c6e9e6' : '' }}>
                                                        <td><input type="text" name="tax-name" className="form-control p-2" disabled={!rules.hasInsert} placeholder="Enter New Tax Name" value={ex.name} onChange={(e) => { handleChangeExcAndService(e, i, true) }} /></td>
                                                        <td><input type="number" min={0} step={1} name="tax-value" disabled={!rules.hasInsert} className="form-control p-2" placeholder="Add Excise Tax Value" value={ex.amount} onChange={(e) => { handleChangeExcAndService(e, i, true) }} /></td>
                                                        <td><ButtonGroup className="mb-2 m-buttons-style">
                                                            <Button disabled={!rules.hasInsert} onClick={() => handleDelete(i, 'excise')}><FontAwesomeIcon icon={faTrash} /></Button>
                                                        </ButtonGroup></td>
                                                    </tr>)
                                            })
                                        }
                                    </tbody>
                                </Table>
                                    : <div className='d-flex justify-content-around' ><Spinner animation="grow" /></div>}
                            </Card.Body>
                            {rules.hasInsert && <div className='m-3'><button className='btn m-btn btn-primary p-3' onClick={() => addUpdateTaxs(taxsExcise)}><FontAwesomeIcon icon={faFloppyDisk} /> save </button></div>}
                        </Card>

                        {/* Service Charge */}
                        <Card className='mt-4'>
                            <Card.Header className="p-3 bg-white">
                                <h5>Service Charge Taxes List</h5>
                            </Card.Header>
                            <Card.Body >
                                {!isLoading ? <Table className="table table-hover remove-last-del-icon" >
                                    <thead className="thead-dark">
                                        <tr>
                                            <th style={{ width: '15%' }}>Type</th>
                                            <th style={{ width: '30%' }}>Name</th>
                                            <th style={{ width: '25%' }}>Amount (%)</th>
                                            <th style={{ width: '35%' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            taxsService.map((ex: ITax, i: number) => {
                                                return (
                                                    <tr key={i} style={{ background: ex.isNew ? '#c6e9e6' : '' }}>
                                                        <Select
                                                            className="p-2 m-brd-bottom"
                                                            isDisabled={!rules.hasInsert}
                                                            styles={selectStyle}
                                                            options={taxValueType}
                                                            value={taxValueType.filter((it: any) => { return it.value == ex.amountType })}
                                                            onChange={(itm) => {
                                                                handleChangeExcAndService({ target: { name: 'select', value: itm!.value } }, i, false)
                                                                console.log(itm, i);
                                                            }}
                                                        />
                                                        <td><input type="text" name="tax-name" className="form-control p-2" disabled={!rules.hasInsert} placeholder="Tax Name" value={ex.name} onChange={(e) => { handleChangeExcAndService(e, i, false) }} /></td>
                                                        <td><input type="number" min={0} step={1} name="tax-value" disabled={!rules.hasInsert} className="form-control p-2" placeholder="Add Service Charge Value" value={ex.amount} onChange={(e) => { handleChangeExcAndService(e, i, false) }} /></td>
                                                        <td><ButtonGroup className="mb-2 m-buttons-style">
                                                            {rules.hasDelete && <Button onClick={() => handleDelete(i, 'service')}><FontAwesomeIcon icon={faTrash} /></Button>}
                                                        </ButtonGroup></td>
                                                    </tr>)
                                            })
                                        }
                                    </tbody>
                                </Table>
                                    : <div className='d-flex justify-content-around' ><Spinner animation="grow" /></div>}
                            </Card.Body>
                            {rules.hasInsert && <div className='m-3'><button className='btn m-btn btn-primary p-3' onClick={() => addUpdateTaxs(taxsService)}><FontAwesomeIcon icon={faFloppyDisk} /> save </button></div>}
                        </Card>

                        {/* Group */}

                        <Card className='mt-4'>
                            <Card.Header className="p-3 bg-white">
                                <h5>Groupe Taxes List</h5>
                            </Card.Header>
                            <Card.Body>
                                {!isLoading ? <Table className="table table-hover" responsive>
                                    <thead className="thead-dark">
                                        <tr>
                                            <th style={{ width: '50%' }}>Name</th>
                                            <th style={{ width: '10%' }}>Default Tax</th>
                                            <th style={{ width: '35%' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            taxesGroup.map((ex: any, i: number) => {
                                                return (
                                                    <tr key={i}>
                                                        <td>{ex.name}</td>
                                                        <td><Form.Check type="switch" disabled={true} className="custom-switch" checked={ex.isPrimary ? true : false} /></td>
                                                        <td><ButtonGroup className="mb-2 m-buttons-style">
                                                            {rules.hasDelete && <Button onClick={() => handleDelete(i, 'group')}><FontAwesomeIcon icon={faTrash} /></Button>}
                                                            <Button onClick={() => showDetailsHandle(ex.id)}>{isLoadingDetails && ex.id == selectId ? <FontAwesomeIcon icon={faSpinner} /> : <FontAwesomeIcon icon={faEye} />}</Button>
                                                            {rules.hasInsert && <Button onClick={() => addNewGroup(ex.id)}><FontAwesomeIcon icon={faEdit} /></Button>}
                                                        </ButtonGroup></td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                                    : <div className='d-flex justify-content-around' ><Spinner animation="grow" /></div>}
                            </Card.Body>
                            {rules.hasInsert && <div className='m-3'><button className='btn m-btn btn-primary p-3' onClick={() => addNewGroup()}><FontAwesomeIcon icon={faPlus} /> Add New Group </button></div>}
                        </Card>
                    </div>
                </div>
            </AdminLayout >
        </>
    )
}
export default Taxes;
export async function getServerSideProps(context: any) {
    const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
    var _isOk = true, _rule = true;
    //check page params
    var shopId = context.query.id;
    if (shopId == undefined)
        return { redirect: { permanent: false, destination: "/page403" } }

    //check user permissions
    var _userRules = {}
    await verifayTokens({ headers: { authorization: 'Bearer ' + parsedCookies.tokend } }, (repo: ITokenVerfy) => {
        _isOk = repo.status;
        if (_isOk) {
            var _rules = keyValueRules(repo.data.rules || []);
            if (_rules[-2] != undefined && _rules[-2][0].stuff != undefined && _rules[-2][0].stuff == 'owner') {
                _rule = true;
                _userRules = { hasDelete: true, hasEdit: true, hasView: true, hasInsert: true };
            }
            else if (_rules[shopId] != undefined) {
                var _stuf = '';
                _rules[shopId].forEach((dd: any) => _stuf += dd.stuff)
                const { userRules, hasPermission } = hasPermissions(_stuf, 'taxes')
                _rule = hasPermission
                _userRules = userRules
            } else
                _rule = false
        }

    })
    if (!_isOk) return { redirect: { permanent: false, destination: "/user/login" } }
    if (!_rule) return { redirect: { permanent: false, destination: "/page403" } }
    //status ok
    return {
        props: { shopId, rules: _userRules },
    };

}