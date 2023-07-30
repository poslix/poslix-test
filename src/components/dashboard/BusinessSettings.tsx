import { useEffect, useState } from "react";
import { Button, ButtonGroup, Card, Spinner, Table } from 'react-bootstrap'
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { apiFetchCtr, apiInsert, apiInsertCtr, apiUpdateCtr } from "src/libs/dbUtils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowAltCircleLeft, faEdit } from '@fortawesome/free-solid-svg-icons'
import { redirectToLogin } from '../../libs/loginlib'
import { OwnerAdminLayout } from "@layout";
import Select from 'react-select';
import { Toastify } from "src/libs/allToasts";
import { ToastContainer } from 'react-toastify';
import { useRouter } from "next/router";

const BusinessSettings = ({ username, businessId }: any) => {

    const [formObj, setFormObj] = useState({ id: 0, business_id: '', business_type: '', name: '', country: '', currency_id: 10, mobile: '', email: '' })
    const [locations, setLocations] = useState<{ id: number, name: string, currency_id: number, decimal_places: number }[]>([])
    const [currencies, setCurrencies] = useState<{ id: number, name: string }[]>([])
    const [roles, setRoles] = useState<{ value: number, label: string }[]>([])
    const [selectedRoles, setSelectedRoles] = useState<{ value: number, label: string }[]>([])
    const [businessUsers, setBusinessUsers] = useState<{ value: number, label: string, level: string, stuff_ids: string, locationId: number }[]>([])
    const [allusers, setAllusers] = useState<{ value: number, label: string }[]>([])
    const [pages, setPages] = useState<{ value: string, label: string, isChoosed_r: boolean, isChoosed_e: boolean, isChoosed_d: boolean, isChoosed_i: boolean }[]>([])

    const [loading, setLoading] = useState(true)
    const [isEditedStuff, setIsEditedStuff] = useState(true)
    const [showAddUser, setShowAddUser] = useState(false)
    const [errorForm, setErrorForm] = useState({ name: false, decimal: false })
    const [shopId, setShopId] = useState(0);
    const [selectedUserId, setSelectedUserId] = useState(0);
    const router = useRouter()

    var errors = [];
    const pages2 = [
        { value: 'POS', label: 'POS', isChoosed_r: false, isChoosed_e: false, isChoosed_d: false, isChoosed_i: false },
        { value: 'products', label: 'products', isChoosed_r: false, isChoosed_e: false, isChoosed_d: false, isChoosed_i: false },
        { value: 'purchases', label: 'purchases', isChoosed_r: false, isChoosed_e: false, isChoosed_d: false, isChoosed_i: false },
        { value: 'category', label: 'category', isChoosed_r: false, isChoosed_e: false, isChoosed_d: false, isChoosed_i: false },
        { value: 'taxes', label: 'taxes', isChoosed_r: false, isChoosed_e: false, isChoosed_d: false, isChoosed_i: false },
    ];

    async function initDataPage(businessId = 0) {
        if (businessId == 0) return false;
        const { success, newdata } = await apiFetchCtr({ fetch: 'owner', subType: 'getBusinessSettings', shopId: businessId })
        if (!success) {
            alert('error fetching..')
            return
        }
        setLoading(false)
        const { general } = newdata;
        setFormObj({
            ...formObj,
            name: general[0].name,
            email: general[0].email,
            business_type: general[0].business_type,
        })
        setLocations(newdata.locations)
        setRoles(newdata.roles)
        setBusinessUsers(newdata.users)
        setAllusers(newdata.allusers)
        setCurrencies(newdata.currencies)
        setPages(pages2)
    }
    useEffect(() => {
        initDataPage(businessId)
    }, [])

    function handelChange(e: any, idx: number) {
        const { name, checked } = e.target;
        var _rows: any = pages;
        _rows[idx][name] = checked;
        setPages(_rows)
        setLocations([...locations])
    }
    async function addEditUserStuf() {
        var result = await apiInsertCtr({ type: "owner", subType: 'addupdateUserStuff', isEdit: isEditedStuff, businessId, locationId: shopId, data: { stuffs: selectedRoles, user: selectedUserId } })
        const { success, newdata } = result;
        if (success) {
            const _idx = businessUsers.findIndex((el: any) => { return el.value == selectedUserId && el.locationId == shopId })
            var _data: any = businessUsers;
            if (_idx > -1)
                _data[_idx].stuff_ids = newdata;
            else
                _data.push(newdata)

            setBusinessUsers([..._data])
            setShowAddUser(false)
            Toastify('success', 'successfully Updated');
        } else
            Toastify('error', 'Error , Try Again');

    }
    function showPropryRoles(rolesIds: string) {
        if (rolesIds === "no") {
            return (<div className="roles-parent-no-peri" ><div>No Permissions</div></div>)
        } else {
            var _roles = rolesIds.split(',');
            return (<div className="roles-parent">
                {roles.map((mp) => {
                    return _roles.includes(mp.value + "") && <div>{mp.label}</div>
                })}
            </div>)
        }
    }
    function showPropryRoles_test(roles: string) {
        if (roles === "no") {
            return (<div className="roles-parent-no-peri" ><div>No Permissions</div></div>)
        } else {
            const _roles = roles.replaceAll('_r', '_read').replaceAll('_e', '_edit').replaceAll('_d', '_delete').replaceAll('_i', '_insert').split(',');

            return (<div className="roles-parent">
                {_roles.map((mp) => {
                    return mp.length > 0 && <div>{mp}</div>
                })}
            </div>)
        }
    }
    async function updateSettings(settingType: string, index = 0) {
        var result = await apiUpdateCtr({ type: 'owner', subType: settingType, genSettings: formObj, locationSetting: locations[index], data: { businessId, locationId: shopId } })
        const { success } = result;
        if (success) {
          Toastify("success", "Updated sucessfully");
          // Retrieve the array from local storage
          const myArray = JSON.parse(localStorage.getItem("userlocs")) || [];
            const currency_code = currencies.filter((c: any) =>{return c.value == locations[index].currency_id})[0].name
            
          // Define the ID of the object you want to modify
          const objectId = locations[index].id;
            
          // Find the object with the desired ID and modify it
          const modifiedArray = myArray.map((obj) => {
            if (obj.value === objectId) {
              // Modify the object here
              return {
                ...obj,
                currency_decimal_places: locations[index].decimal_places,
                currency_code: currency_code.substring(currency_code.lastIndexOf('(')+1, currency_code.lastIndexOf(')'))
              }; // Replace with the property you want to change and its new value
            }
            return obj;
          });
          
          // Save the modified array back to local storage
          localStorage.setItem("userlocs", JSON.stringify(modifiedArray));
        } else {
            Toastify('error', 'Has Error ,try Again')
        }
    }
    function handelChangeLocationSettings(evn: any, index: number) {
        var _data: any = locations;
        if (evn.target != undefined) {
            _data[index][evn.target.name] = evn.target.value;
        } else {
            _data[index].currency_id = evn.value;
        }
        setLocations([..._data])
    }
    return (
        <>
            <OwnerAdminLayout>
                <ToastContainer />
                <div className="row">
                    <div className="col-md-12">
                        <button className='mb-4 btn btn-primary p-3' onClick={() => { router.push(`/${username}/business`) }} ><FontAwesomeIcon icon={faArrowAltCircleLeft} /> My Business List </button>
                        <Tabs
                            id="controlled-tab-example"
                            activeKey={shopId}
                            onSelect={(k: any) => {
                                setShowAddUser(false)
                                setShopId(k)
                            }}
                        >

                            <Tab eventKey="0" title="general">
                                <Card >
                                    <Card.Header className="p-3 bg-white">
                                        <h5>General Settings {formObj.name}</h5>
                                    </Card.Header>
                                    {!loading ? <Card.Body className='table-responsive text-nowrap'>
                                        {!showAddUser && <form className='form-style'>
                                            <div className="row">
                                                <div className="col-md-4 col-lg-4 col-cm-4">
                                                    <div className="form-group2">
                                                        <h4>Basic Settings</h4>
                                                    </div>
                                                    <div className="form-group2">
                                                        <label>Business Type:</label>
                                                        <input type="text" className="form-control" value={formObj.business_type} disabled={true} />
                                                    </div>
                                                    <div className="form-group2">
                                                        <label>Business Name: <span className='text-danger'>*</span></label>
                                                        <input type="text" className="form-control" placeholder="" value={formObj.name}
                                                            onChange={(e) => { setFormObj({ ...formObj, name: e.target.value }) }} />
                                                        {errorForm.name && <p className='p-1 h6 text-danger '>Enter Business name</p>}
                                                    </div>
                                                    <div className="form-group2">
                                                        <label>Email: <span className='text-danger'>*</span></label>
                                                        <input type="text" className="form-control" placeholder="" value={formObj.email}
                                                            onChange={(e) => { setFormObj({ ...formObj, email: e.target.value }) }} />
                                                    </div>

                                                </div>
                                            </div>
                                            <br />
                                            <button type="button" className="btn m-btn btn-primary p-2 "
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    errors = [];
                                                    if (formObj.name.length == 0) errors.push('error')
                                                    setErrorForm({
                                                        ...errorForm,
                                                        name: formObj.name.length == 0 ? true : false,

                                                    })
                                                    if (errors.length == 0) {
                                                        updateSettings('generalBusinessSettings')
                                                    }
                                                }} >Save</button>
                                        </form>}

                                    </Card.Body> : <div className='d-flex justify-content-around' ><Spinner animation="grow" /></div>}
                                </Card>
                            </Tab>
                            {
                                locations.map((loc, i: number) => {
                                    return (
                                        <Tab key={i} eventKey={loc.id} title={loc.name}>
                                            <Card >
                                                <Card.Header className="p-3 bg-white">
                                                    <h5>Settings Of {loc.name} Location </h5>
                                                </Card.Header>
                                                <Card.Body className=''>
                                                    {!showAddUser && <div className="setting-locations">
                                                        <div className="col-md-4 col-lg-4 col-cm-4">
                                                            <div className="form-group">
                                                                <label>Location Name: <span className='text-danger'>*</span></label>
                                                                <input type="text" name="name" className="form-control" placeholder="Location Name" value={loc.name}
                                                                    onChange={(e) => { handelChangeLocationSettings(e, i) }}
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Currency Type: <span className='text-danger'>*</span></label>
                                                                <Select
                                                                    options={currencies}
                                                                    value={currencies.filter((f: any) => { return f.value == loc.currency_id })}
                                                                    onChange={(e) => { handelChangeLocationSettings(e, i) }}
                                                                />
                                                            </div>
                                                            <div className="form-group">
                                                                <label>Decimal Place: <span className='text-danger'>*</span></label>
                                                                <input type="number" name="decimal_places" className="form-control" placeholder="" value={loc.decimal_places}
                                                                    onChange={(e) => { handelChangeLocationSettings(e, i) }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <button type="button" className="btn m-btn btn-primary p-2 "
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                errors = [];
                                                                if (locations[i].decimal_places == 0) errors.push('error')
                                                                if (locations[i].name.length == 0) errors.push('error')
                                                                setErrorForm({
                                                                    ...errorForm,
                                                                    decimal: locations[i].decimal_places == 0,
                                                                    name: locations[i].name.length == 0
                                                                })
                                                                if (errors.length == 0) {
                                                                    updateSettings('locationBusinessSettings', i)
                                                                }
                                                            }} >Save</button>
                                                        <div className="row">
                                                            <h4>User Stuff</h4>
                                                            <br />
                                                            <br />
                                                            <Table className="">
                                                                <thead className="thead-dark">
                                                                    <tr>
                                                                        <th style={{ width: '6%' }} >#</th>
                                                                        <th>User Name</th>
                                                                        <th>Roles</th>
                                                                        <th>Action</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {allusers.map((bs, i) => {
                                                                        return (
                                                                            <tr key={i}>
                                                                                <th scope="row"></th>
                                                                                <td>{bs.label}</td>
                                                                                <td>{showPropryRoles(businessUsers.find((ee) => ee.value == bs.value && ee.locationId == shopId)?.stuff_ids || 'no')}</td>
                                                                                <td><ButtonGroup className="mb-2 m-buttons-style"><Button onClick={() => {
                                                                                    var _rows = pages;
                                                                                    var isNew = businessUsers.findIndex((ee) => ee.value == bs.value && ee.locationId == shopId) > -1;
                                                                                    var _stuf = (businessUsers.find((ee) => ee.value == bs.value && ee.locationId == shopId)?.stuff_ids || ' ').split(',');
                                                                                    var _myStuffs = roles.filter((rl) => { return _stuf.includes(rl.value + '') })
                                                                                    setSelectedRoles(_myStuffs)
                                                                                    // for (let ix = 0; ix < _rows.length; ix++) {
                                                                                    //     _stuf = businessUsers.find((ee) => ee.value == bs.value && ee.locationId == shopId)?.stuff || ' ';
                                                                                    //     _rows[ix].isChoosed_r = (',' + _stuf).indexOf(',' + _rows[ix].label + '_r,') != -1 ? true : false
                                                                                    //     _rows[ix].isChoosed_e = (',' + _stuf).indexOf(',' + _rows[ix].label + '_e,') != -1 ? true : false
                                                                                    //     _rows[ix].isChoosed_d = (',' + _stuf).indexOf(',' + _rows[ix].label + '_d,') != -1 ? true : false
                                                                                    //     _rows[ix].isChoosed_i = (',' + _stuf).indexOf(',' + _rows[ix].label + '_i,') != -1 ? true : false
                                                                                    // }
                                                                                    setPages(_rows)
                                                                                    setSelectedUserId(bs.value)
                                                                                    setIsEditedStuff(isNew)
                                                                                    setShowAddUser(true)
                                                                                }}><FontAwesomeIcon icon={faEdit} /></Button></ButtonGroup></td>
                                                                            </tr>
                                                                        )
                                                                    })}
                                                                </tbody>
                                                            </Table>
                                                        </div>
                                                    </div>}
                                                    {/* add stuff */}
                                                    {showAddUser && <form className='user-stuff-form'>

                                                        <button className='mb-4 btn btn-primary p-3' onClick={() => { setShowAddUser(false) }}><FontAwesomeIcon icon={faArrowAltCircleLeft} /> back </button>
                                                        <div className="row">
                                                            <div className="col-md-6 col-lg-6 col-cm-6">
                                                                <div className="form-group2">
                                                                    <h4>User Stuff Settings</h4>
                                                                </div>
                                                                {/* {JSON.stringify(pages)} */}
                                                                <div className="form-group">
                                                                    <label>Selected User : <span className='text-danger'>*</span></label>
                                                                    <Select
                                                                        options={allusers}
                                                                        isDisabled={true}
                                                                        value={allusers.filter((f: any) => { return f.value == selectedUserId })}
                                                                        onChange={(itm) => {
                                                                            setSelectedUserId(itm!.value)
                                                                            var _rows = pages;
                                                                            setPages(_rows)
                                                                            setShowAddUser(true)
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>User Roles: <span className='text-danger'>*</span></label>
                                                                    <Select
                                                                        options={roles}
                                                                        isMulti={false}
                                                                        value={selectedRoles}
                                                                        onChange={(itm: any) => setSelectedRoles([itm])}
                                                                    />
                                                                </div>
                                                                <br />
                                                            </div>


                                                        </div>

                                                        <button type="button" className="btn m-btn btn-primary p-2 "
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                addEditUserStuf()
                                                            }} >Save</button>
                                                    </form>}

                                                </Card.Body>
                                            </Card>
                                            {/* start user stuf */}
                                        </Tab>
                                    )
                                })
                            }

                        </Tabs>

                    </div>
                </div>
            </OwnerAdminLayout>
        </>
    )
}
export default BusinessSettings;