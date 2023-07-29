import { useEffect, useState } from "react";
import { Card, Spinner } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { getmyUsername } from "src/libs/loginlib";
import { apiFetchCtr, apiInsertCtr } from "src/libs/dbUtils";
import { OwnerAdminLayout } from "@layout";
import { useRouter } from 'next/router'
import Select from 'react-select';
import Link from 'next/link';
import { ToastContainer } from 'react-toastify';
import { Toastify } from "src/libs/allToasts";
import { setCookie } from 'cookies-next';
import { BusinessTypeData } from "@models/data";

const AddBusiness = ({ username }: any) => {

    const [formObj, setFormObj] = useState({ id: 0, business_id: '', business_type: 0, decimal_places: 0, name: '', country: 0, city: '', state: '', mobile: '', email: '' })
    const [errorForm, setErrorForm] = useState({ name: false, decimal_places: false, mobile: false, email: false, type: false })
    const [currencies, setCurrencies] = useState<{ value: number, label: string }[]>([])
    const [loading, setLoading] = useState(false)
    const [busniessType, setBusniessType] = useState(BusinessTypeData);

    const router = useRouter()

    async function initDataPage() {
        const { success, newdata } = await apiFetchCtr({ fetch: 'owner', subType: 'initAddBusiness' });
        if (!success) {
            Toastify('error', 'Error, Try Again')
            return;
        }
        setCurrencies(newdata)
        setLoading(false)
    }

    async function newBusiness() {
        const { success, newdata } = await apiInsertCtr({ type: 'owner', subType: 'createBusiness',
        data: {...formObj, types: localStorage.getItem("userlocs") ? JSON.parse(localStorage.getItem("userlocs")).map(loc => {
            return {id: loc.value, type: loc.typeid}
        }) : []}})
        if (!success) {
            Toastify('error', 'Error, Try Again')
            return;
        }
        Toastify('success', 'Business Successfuly Created..')
        setCookie('tokend', newdata);
        localStorage.setItem('userinfo', newdata)
        router.push('/' + username + '/business')
    }
    var errors = [];
    useEffect(() => {
        initDataPage()
    }, [router.asPath])

    return (
        <>
            <OwnerAdminLayout>
                <ToastContainer />
                <div className="row">
                    <div className="col-md-12">
                        <Link href={'/' + username + '/business'} className='btn btn-primary p-3 mb-3'><FontAwesomeIcon icon={faArrowLeft} /> Back to list </Link>
                        <Card >
                            <Card.Header className="p-3 bg-white">
                                <h5>Create Business </h5>
                            </Card.Header>
                            <Card.Body >
                                {!loading ?
                                    <form className='form-style'>
                                        {/* {JSON.stringify(formObj)} */}
                                        <div className="row">
                                            <div className="col-md-12 col-lg-6 col-cm-12">
                                                <div className="form-group2">
                                                    <label>Business Name: <span className='text-danger'>*</span></label>
                                                    <input type="text" className="form-control" placeholder="" value={formObj.name}
                                                        onChange={(e) => { setFormObj({ ...formObj, name: e.target.value }) }} />
                                                    {errorForm.name && <p className='p-1 h6 text-danger '>Enter Product name</p>}
                                                </div>
                                                <div className="form-group2">
                                                    <label>Mobile: <span className='text-danger'>*</span></label>
                                                    <input type="number" className="form-control" placeholder="" value={formObj.mobile}
                                                        onChange={(e) => { setFormObj({ ...formObj, mobile: e.target.value }) }} />
                                                    {errorForm.mobile && <p className='p-1 h6 text-danger '>Enter Mobile Number</p>}
                                                </div>
                                                <div className="form-group2">
                                                    <label>Email: <span className='text-danger'>*</span></label>
                                                    <input type="text" className="form-control" placeholder="" value={formObj.email}
                                                        onChange={(e) => { setFormObj({ ...formObj, email: e.target.value }) }} />
                                                    {errorForm.email && <p className='p-1 h6 text-danger '>Enter Email name</p>}
                                                </div>
                                                <div className="form-group">
                                                    <label>Business Type: <span className='text-danger'>*</span></label>
                                                    <Select
                                                        options={busniessType}
                                                        value={busniessType.filter((f: any) => { return f.value == formObj.business_type })}
                                                        onChange={(itm) => { setFormObj({ ...formObj, business_type: itm!.value }) }}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Country: <span className='text-danger'>*</span></label>
                                                    <Select
                                                        options={currencies}
                                                        value={currencies.filter((f: any) => { return f.value == formObj.country })}
                                                        onChange={(itm) => { setFormObj({ ...formObj, country: itm!.value }) }}
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group2">
                                                        <label>decimal places: <span className='text-danger'>*</span></label>
                                                        <input type="number" className="form-control" placeholder="" value={formObj.decimal_places}
                                                            onChange={(e) => { setFormObj({ ...formObj, decimal_places: +e.target.value }) }} />
                                                        {errorForm.decimal_places && <p className='p-1 h6 text-danger '>Enter decimal_places number</p>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 d-lg-block d-sm-none d-md-none">
                                                <img style={{ width: '100%' }} src={'https://static.vecteezy.com/system/resources/previews/012/024/324/original/a-person-using-a-smartphone-to-fill-out-a-registration-form-registration-register-fill-in-personal-data-use-the-application-vector.jpg'} />
                                            </div>
                                        </div>
                                        <br />
                                        <button type="button" className="btn m-btn btn-primary p-2 "
                                            onClick={(e) => {
                                                e.preventDefault();
                                                errors = [];
                                                if (formObj.name.length == 0) errors.push('error')
                                                if (formObj.business_type == 0) errors.push('error')
                                                if (formObj.email.length == 0) errors.push('error')
                                                if (formObj.mobile.length == 0) errors.push('error')
                                                if (formObj.decimal_places.toString().length == 0) errors.push('error')
                                                setErrorForm({
                                                    ...errorForm,
                                                    type: formObj.name.length == 0,
                                                    name: formObj.business_type == 0,
                                                    email: formObj.email.length == 0,
                                                    mobile: formObj.mobile.length == 0,
                                                    decimal_places: formObj.decimal_places.toString().length == 0,
                                                })
                                                if (errors.length == 0) {
                                                    newBusiness()
                                                }
                                                else
                                                    Toastify('error', 'Enter Requires Field')
                                            }} >Save
                                        </button>
                                    </form>
                                    : <div className='d-flex justify-content-around' ><Spinner animation="grow" /></div>}
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </OwnerAdminLayout>
        </>
    )
}
export default AddBusiness;
export function getServerSideProps(context: any) {
    let okUsername = true

    let username = getmyUsername(context.query);
    if (username == undefined || username == '0')
        okUsername = false;

    if (!okUsername)
        return { redirect: { permanent: false, destination: "/user/login" } }

    return {
        props: { username },
    };
}