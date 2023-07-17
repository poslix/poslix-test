import type { NextPage } from 'next'
import Image from 'next/image'
import Table from 'react-bootstrap/Table';
import { AdminLayout } from '@layout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Spinner from 'react-bootstrap/Spinner';
import { faTrash, faPenToSquare, faPlus, faTag } from '@fortawesome/free-solid-svg-icons'
import { Button, ButtonGroup, Card } from 'react-bootstrap'
import React, { useState, useEffect } from 'react'
import { apiFetchCtr } from "../../../../libs/dbUtils"
import { useRouter } from 'next/router'
import AlertDialog from 'src/components/utils/AlertDialog';
import { redirectToLogin } from '../../../../libs/loginlib'
import { ILocationSettings, IPageRules, ITokenVerfy } from '@models/common-model';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import * as cookie from 'cookie'
import ShowPriceListModal from 'src/components/dashboard/modal/ShowPriceListModal';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
const Product: NextPage = (probs: any) => {

    const { shopId, rules } = probs;
    const [locationSettings, setLocationSettings] = useState<ILocationSettings>({ value: 0, label: "", currency_decimal_places: 0, currency_code: '', currency_id: 0, currency_rate: 1, currency_symbol: '' })
    const router = useRouter()
    const [products, setProducts] = useState<{ id: number, name: string, sku: string, type: string, qty: number }[]>([])
    const [show, setShow] = useState(false);
    const [selectId, setSelectId] = useState(0);
    const [type, setType] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isOpenPriceDialog, setIsOpenPriceDialog] = useState(false);

    async function initDataPage() {
        const { success, data } = await apiFetchCtr({ fetch: 'products', subType: 'getProducts', shopId })
        if (!success) {
            Toastify('error', 'Somthing wrong!!, try agian')
            return
        }
        setProducts(data.products)
        setIsLoading(false)
    }

    useEffect(() => {
        var _locs = JSON.parse(localStorage.getItem('userlocs') || '[]');
        if (_locs.toString().length > 10)
            setLocationSettings(_locs[_locs.findIndex((loc: any) => { return loc.value == shopId })])
        else alert("errorr location settings")
        initDataPage();
    }, [router.asPath])

    const handleClick = (index: number) => {
        if (products[index].type != 'package' && products[index].qty > 0) {
            setSelectId(products[index].id);
            setType(products[index].type)
            setIsOpenPriceDialog(true)
        }
    }
    const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
        if (result) {
            const _data = [...products]
            const idx = _data.findIndex((itm: any) => itm.id == selectId);
            console.log(idx, selectId);
            if (idx != -1) {
                _data.splice(idx, 1);
                setProducts(_data)
            }
        }
        if (msg.length > 0)
            Toastify(result ? 'success' : 'error', msg)
        setShow(false)
    }
    return (
        <>
            <AdminLayout shopId={shopId}>
                <ToastContainer />
                <AlertDialog alertShow={show} alertFun={handleDeleteFuc} shopId={shopId} id={selectId} type="products" subType="deleteProduct" >
                    Are you Sure You Want Delete This Item ?
                </AlertDialog>
                <ShowPriceListModal shopId={shopId} productId={selectId} type={type} isOpenPriceDialog={isOpenPriceDialog} setIsOpenPriceDialog={() => setIsOpenPriceDialog(false)} />
                <div className="row">
                    <div className="col-md-12">
                        <Card>
                            <Card.Header className="p-3 bg-white">
                                <h5 >Transfer List</h5>
                            </Card.Header>
                            <Card.Body className='table-responsive text-nowrap'>
                                <h6 style={{ textAlign: 'center', color: '#009688' }}>Comming soon</h6>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </AdminLayout >
        </>
    )
}
export default Product;
export async function getServerSideProps(context: any) {
    const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
    var _isOk = true, _rule = true;
    //check page params
    var shopId = context.query.id;
    if (shopId == undefined)
        return { redirect: { permanent: false, destination: "/page403" } }

    //check user permissions
    var _userRules = {};
    await verifayTokens({ headers: { authorization: 'Bearer ' + parsedCookies.tokend } }, (repo: ITokenVerfy) => {
        _isOk = repo.status;

        if (_isOk) {
            var _rules = keyValueRules(repo.data.rules || []);
            console.log(_rules);
            if (_rules[-2] != undefined && _rules[-2][0].stuff != undefined && _rules[-2][0].stuff == 'owner') {
                _rule = true;
                _userRules = { hasDelete: true, hasEdit: true, hasView: true, hasInsert: true };
            } else if (_rules[shopId] != undefined) {
                var _stuf = '';
                _rules[shopId].forEach((dd: any) => _stuf += dd.stuff)
                const { userRules, hasPermission } = hasPermissions(_stuf, 'products')
                _rule = hasPermission
                _userRules = userRules
            } else
                _rule = false
        }

    })
    console.log('_isOk22    ', _isOk);
    if (!_isOk) return { redirect: { permanent: false, destination: "/user/login" } }
    if (!_rule) return { redirect: { permanent: false, destination: "/page403" } }
    return {
        props: { shopId: context.query.id, rules: _userRules },
    };
    //status ok


}