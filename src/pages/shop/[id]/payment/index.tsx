import type { NextPage } from 'next'
import Table from 'react-bootstrap/Table';
import { AdminLayout } from '@layout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import { faPlus, faSave, faTrash } from '@fortawesome/free-solid-svg-icons'
import React, { useState, useEffect, useContext, useRef } from 'react'
import { ITokenVerfy } from '@models/common-model';
import { apiFetch, apiFetchCtr, apiInsertCtr } from 'src/libs/dbUtils';
import { useRouter } from 'next/router'
import * as cookie from 'cookie'
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
import { darkModeContext } from "../../../../context/DarkModeContext";
import { Button } from 'react-bootstrap';

const PaymentMethods: NextPage = (props: any) => {
    const { shopId, rules } = props;
    const [isLoading, setIsLoading] = useState(true)
    const [paymentMethods, setPaymentMethods] = useState([
        { name: "Card", enabled: true },
        { name: "Cash", enabled: true },
        { name: "Bank", enabled: true },
        { name: "Cheque", enabled: true }
    ]);

    async function initDataPage() {
        var result = await apiFetchCtr({ fetch: 'payment', subType: 'getPayments', shopId })
        const { success, data } = result;
        if (success) {
            setPaymentMethods(data?.payments?.length > 0 ? data.payments : [
                { name: "Card", enabled: true },
                { name: "Cash", enabled: true },
                { name: "Bank", enabled: true },
                { name: "Cheque", enabled: true }
            ])
            setIsLoading(false)
        }
    }

    useEffect(() => {
        initDataPage();
    }, [])

    const handleInputChange = (e: any, i: number) => {
        const _paymentMethods = [...paymentMethods];
        _paymentMethods[i].name = e.target.value;
        setPaymentMethods(_paymentMethods)
    }

    const handlePrimarySwitchChange = (e: any, i: number) => {
        const _paymentMethods = [...paymentMethods];
        _paymentMethods[i].enabled = !_paymentMethods[i].enabled;
        setPaymentMethods(_paymentMethods)
    }

    const addNewMethod = () => {
        setPaymentMethods([...paymentMethods, { name: '', enabled: false}])
    }

    const removeMethod = (index) => {
        setPaymentMethods(paymentMethods.filter((payment, i) => i !== index))
    }

    const saveMethods = async () => {
        // const finalMethods = paymentMethods.filter(method => method.enabled)
        setIsLoading(true)
        let {success, msg} = await apiInsertCtr({ type: 'payment', subType: 'insertPayment', shopId,
            data: paymentMethods
        })
        if (msg.length > 0) Toastify(success ? "success" : "error", msg);
        setIsLoading(false)
    }
    return (
        <>
            <AdminLayout shopId={shopId}>
                <ToastContainer />
                {!isLoading ?
                <Table className="table table-hover remove-last-del-icon" style={{width: '80%'}} responsive>
                    <thead className="thead-dark">
                        <tr>
                            <th style={{ width: '50%' }} >Method</th>
                            <th style={{ width: '15%' }}></th>
                            <th style={{ width: '15%' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paymentMethods?.map((method: any, i: number) => {
                            return (
                                <tr key={i}>
                                    <td><input type="text" name="tax-name" className="form-control p-2" disabled={!rules.hasInsert} placeholder="Enter New Method Name" value={method.name} onChange={(e) => { handleInputChange(e, i) }} /></td>
                                    <td className='d-flex justify-content-center pt-3'><Form.Check type="switch" id="custom-switch" disabled={!rules.hasInsert} className="custom-switch" checked={method.enabled ? true : false} onChange={(e) => { handlePrimarySwitchChange(e, i) }} /></td>
                                    <td>
                                        <Button className='m-buttons-style'
                                            onClick={() => removeMethod(i)}><FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </td>
                                </tr>
                            )
                        })
                        }
                    </tbody>
                    <div className='d-flex'>
                        <div className='m-3'>
                            <button style={{boxShadow: 'unset', backgroundColor: '#004e46'}} className='btn m-btn btn-primary btn-dark p-2' onClick={() => addNewMethod()}>
                                <FontAwesomeIcon icon={faPlus} /> Add New Method
                            </button>
                        </div>
                        <div className='m-3'>
                            <button style={{boxShadow: 'unset', backgroundColor: '#004e46'}} className='btn m-btn btn-primary p-2' onClick={() => saveMethods()}>
                                <FontAwesomeIcon icon={faSave} /> Save
                            </button>
                        </div>
                    </div>
                </Table>
                    : <div className='d-flex justify-content-around' ><Spinner animation="grow" /></div>}
            </AdminLayout >
        </>
    )
}
export default PaymentMethods;
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