import type { NextPage } from 'next'
import React, { useState, useEffect, useContext } from 'react'
import { apiInsertCtr, apiLogin } from "../../libs/dbUtils"
import { useRouter } from 'next/router'
import Select from 'react-select';
import { UserContext } from 'src/context/UserContext';
import { deleteCookie, setCookie } from 'cookies-next';
import { validateEmail, validateName, validatePassword, validatePhoneNumber } from 'src/libs/toolsUtils';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
import { BusinessTypeData } from '@models/data';
import Head from 'next/head';


import { darkModeContext } from 'src/context/DarkModeContext'
import DarkModeToggle from '@layout/AdminLayout/DarkModeToggle';
const register: NextPage = () => {

    const colourStyles = {
        control: (style: any, state: any) => (
            {
                ...style,
                borderRadius: '10px', background: '#f5f5f5', height: '50px',
                borderColor: state.isFocused ? '2px solid #045c54' : '#eaeaea', boxShadow: 'none',
                '&:hover': {
                    border: '2px solid #045c54 ',
                },
            }),
        menu: (provided: any, state: any) => (
            {
                ...provided,
                borderRadius: '10px',
                padding: '10px',
                border: '1px solid #c9ced2'
            }
        ), option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#e6efee' : 'white',
            color: '#2e776f',
            borderRadius: '10px',
            '&:hover': {
                backgroundColor: '#e6efee',
                color: '#2e776f',
                borderRadius: '10px'
            }
        }),

    }
    const router = useRouter()

    const [inputs, setinputs] = useState({
        id: "",
        username: "",
        password: "",
        name: '',
        phone: '',
        mail: '',
        businessname: '',
        businesstype: 0
    });
    const [busniessType, setBusniessType] = useState(BusinessTypeData);
    const [showLoginDialog, setShowLoginDialog] = useState(true);
    const [isStep1, setIsStep1] = useState(true);
    const [warnemail, setwarnemail] = useState(false);
    const [warnpass, setwarnpass] = useState(false);
    const [hasErrorMsg, setHasErrorMsg] = useState('');
    const [warName, setWarName] = useState(false);
    const [warPhone, setWarPhone] = useState(false);
    const [warBusinessName, setWarBusinessName] = useState(false);
    const [warBType, setWarBType] = useState(false);
    const [phone, setPhone] = useState('');
    const [hasError, setHasError] = useState(false);
    const [successMsg, setSuccessMsg] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [eye, seteye] = useState(true);
    const [pass, setpass] = useState("password");
    const { setUser } = useContext(UserContext);
    const {darkMode} = useContext(darkModeContext)

    const inputEvent = (event: any) => {
        const name = event.target.name;
        const value = event.target.value;
        if (name == "mail") {
            if (value.length > 0 && !validateEmail(value))
                setwarnemail(true);
            else
                setwarnemail(false);
        } else if (name == "name") {
            if (value.length > 0 && !validateName(value))
                setWarName(true);
            else
                setWarName(false);
        } else if (name == "password") {
            setwarnpass(value.length > 0 && !validatePassword(value))
        }
        setinputs((lastValue) => {
            return {
                ...lastValue,
                [name]: value
            }
        });
    };

    const submitForm = (e: any) => {
        e.preventDefault();
        setHasError(false)
        if (showLoginDialog) {
            setwarnemail(false);
            setwarnpass(false);
            if (inputs.password.length < 3 || !validatePassword(inputs.password)) { setwarnpass(true); }
            if (inputs.mail.length < 3 || !validateEmail(inputs.mail)) { setwarnemail(true); }
            else signin();
        } else {
            if (isStep1) {
                let isOK = true;
                setwarnpass(false);
                setwarnemail(false);
                setWarName(false);
                setWarPhone(false);
                if (inputs.password.length < 3 || !validatePassword(inputs.password)) {
                    setwarnpass(true);
                    isOK = false;
                }
                if (inputs.mail.length < 3 || !validateEmail(inputs.mail)) {
                    setwarnemail(true);
                    isOK = false;
                }
                if (inputs.name.length < 3 || !validateName(inputs.name)) {
                    setWarName(true);
                    isOK = false;
                }
                if (phone.length < 11 || !validatePhoneNumber(phone)) {
                    setWarPhone(true);
                    isOK = false;
                }
                if (isOK)
                    registeration('newRegister');
            }
            else {
                let isOK = true;
                setWarBusinessName(false)
                setWarBType(false);
                if (inputs.businessname.length < 3 || !validateName(inputs.businessname)) {
                    setWarBusinessName(true);
                    isOK = false;
                }
                if (inputs.businesstype < 1) {
                    setWarBType(true);
                    isOK = false;
                }
                if (isOK)
                    registeration('userNewBusiness');
            }

            return;

        }

    };
    const Eye = () => {
        if (pass == "password") {
            setpass("text");
            seteye(false);
        } else {
            setpass("password");
            seteye(true);
        }
    };

    async function signin() {
        if (isWaiting) return
        setIsWaiting(true)
        setHasError(false)
        const result = await apiLogin({ type: 'signin', data: inputs });
        if (!result.success) {
            setHasError(true)
            setHasErrorMsg(result.msg)
            setIsWaiting(false)
            return;
        }
        const { newdata } = result;
        setCookie('tokend', newdata.token);
        setUser(newdata.user)
        localStorage.setItem('userlocs', JSON.stringify(newdata.myBusiness))
        localStorage.setItem('userinfo', newdata.token)
        localStorage.setItem('userfullname', newdata.user.name)
        localStorage.setItem('username', newdata.user.username)
        localStorage.setItem('levels', newdata.user.level)

        if (newdata.user.level == 'user')
            router.push('/shop/' + newdata.myBusiness[0].value)
        else
            router.push('/' + newdata.user.username + '/business')
    }

    async function registeration(steps: string) {
        if (isWaiting)
            return
        const { success, newdata, msg } = await apiInsertCtr({ type: 'user', subType: steps, data: inputs });
        setIsWaiting(false);
        if (!success) {
            setHasErrorMsg(msg)
            setHasError(true)
            return;
        }
        if (isStep1) {
            setinputs({ ...inputs, id: newdata.id })
            setIsStep1(false)
            Toastify('success', 'Done, Pass The Last Step');
        }
        else {
            Toastify('success', 'Your registration has been successfully completed');
            setSuccessMsg(true)
            setIsStep1(true);
            setShowLoginDialog(true)
            signin();
        }
    }

    useEffect(() => {
        setSuccessMsg(false)
        setHasError(false)
    }, [showLoginDialog])
    useEffect(() => {
        if (phone.length > 0 && !validatePhoneNumber(phone))
            setWarPhone(true);
        else
            setWarPhone(false);
        setinputs({ ...inputs, phone: phone })
    }, [phone])
    
    useEffect(() => {
        deleteCookie('tokend');
        localStorage.removeItem('userlocs');
        localStorage.removeItem('userinfo');
        localStorage.removeItem('userfullname');
        localStorage.removeItem('username');
        localStorage.removeItem('levels');
        localStorage.removeItem("orders");
    }, [])
    return (
        <>
            <Head>
                <title>Poslix App</title>
                <meta name="description" content="Poslix App" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/site.webmanifest"></link>
            </Head>
            <ToastContainer />
            <div className=' position-absolute m-3 end-0'>

            <DarkModeToggle />
            </div>
            <div className={`login-body ${ darkMode ? "dark-mode-body" : "light-mode-body"}`}>
                <div className="container-login">
                    <div className="card">
                        <div className="form">
                            <div className="form-item left-side">
                                <img src={'https://app.dubbpie.com/assets/images/login-img.png'} />
                                <div className='login-ads-text'>
                                    <h3>Manage Your Business</h3>
                                    <p>Easily manage your store with<br /> POSLIX POS Screen</p>
                                </div>
                                <div className='login-footer-dots'>
                                    <div className='footer-arrows'>⮜</div>
                                    <div className='footer-dots'>
                                        <div className='footer-dots-item'></div>
                                        <div className='footer-dots-item active'></div>
                                        <div className='footer-dots-item'></div>
                                    </div>
                                    <div className='footer-arrows'>⮞</div>
                                </div>
                            </div>
                            <div className="form-item right-side">
                                <div className="login-logo-box">
                                    <img src={'/images/logo1.png'} />
                                </div>
                                {isStep1 && <div className="login-register-box">
                                    <h3>Welcome Back</h3>
                                    <p>To Start Working, First Login Or Register</p>
                                    <div className='switcher-box'>
                                        <div className={`switcher-box-item ${showLoginDialog ? 'active' : ''}`} onClick={() => setShowLoginDialog(true)}>Login In</div>
                                        <div className={`switcher-box-item ${!showLoginDialog ? 'active' : ''}`} onClick={() => setShowLoginDialog(false)}>Sign Up</div>
                                    </div>
                                </div>}
                                {hasError && <div className='login-error-msg'>{hasErrorMsg}</div>}
                                {successMsg && <div className='login-success-msg'>You Successfully Registered, Login Please</div>}
                                {/* login form */}
                                {showLoginDialog && <form onSubmit={submitForm}>
                                    <div className='login-content'>
                                        <div className="input_text">
                                            <input type="text" placeholder="Enter Email" name="mail" value={inputs.mail} onChange={inputEvent} />
                                            {warnemail && <p >Please enter a valid email address.</p>}
                                        </div>
                                        <div className="input_text">
                                            <input type={pass} placeholder="Enter Password" name="password" value={inputs.password} onChange={inputEvent} />
                                            <i onClick={Eye} className={`fa ${eye ? "fa-eye-slash" : "fa-eye"}`}></i>
                                            {warnpass && <p >Password must contain at least one digit,lowercase letter,uppercase letter and be at least 6 characters</p>}
                                        </div>
                                        <div className="recovery">
                                            <p>Recovery Password</p>
                                        </div>
                                    </div>
                                    <button className='btn-login' type="submit">
                                        {isWaiting && <img className='login-loading' src={'/images/loading.gif'} />}
                                        Sign in
                                    </button>

                                </form>}
                                {/* register form */}
                                {!showLoginDialog &&
                                    <div className="regformform">
                                        {/* {JSON.stringify(inputs)} */}
                                        {isStep1 ?
                                            (<div className='step1'>
                                                <form className='formfileds' onSubmit={submitForm}>

                                                    <div className="input_text">
                                                        <input type="text" placeholder="Your Full Name"
                                                            name='name' value={inputs.name} onChange={inputEvent}
                                                        />
                                                        {warName && <p >Please enter a valid Name.</p>}
                                                    </div>
                                                    <div className="input_text">
                                                        <input type="text" placeholder="Email Address"
                                                            name='mail' value={inputs.mail} onChange={inputEvent}
                                                        />
                                                        {warnemail && <p >Please enter a valid email address.</p>}
                                                    </div>
                                                    <div className="input_text">
                                                        <PhoneInput
                                                            country={'om'}
                                                            value={phone}
                                                            autoFormat={true}
                                                            onChange={phone => setPhone(phone)}
                                                        />
                                                        {warPhone && <p >Please enter a valid Phone Number.</p>}
                                                    </div>
                                                    <div className="input_text">
                                                        <input type="password" placeholder="Password"
                                                            name='password' value={inputs.password} onChange={inputEvent}
                                                        />
                                                        {warnpass && <p >Password must contain at least one digit,lowercase letter,uppercase letter and be at least 6 characters</p>}
                                                    </div>
                                                    <button className='btn-login' type="submit">
                                                        {isWaiting && <img className='login-loading' src={'/images/loading.gif'} />}
                                                        Sign Up
                                                    </button>

                                                </form>
                                            </div>) : (
                                                <div className="step2">
                                                    <div className="login-register-box">
                                                        <h3>Business Info</h3>
                                                        <p>You Haven't Business , Create One!</p>
                                                    </div>
                                                    <h5></h5>
                                                    {/* {JSON.stringify(inputs)} */}
                                                    <form className='formfileds' onSubmit={submitForm}>

                                                        <div className="input_text">
                                                            <input type="text" className="form-control m-input" placeholder="Your Business Name"
                                                                name='businessname' value={inputs.businessname} onChange={inputEvent}
                                                            />
                                                            {warBusinessName && <p>Enter Your Business Name First</p>}
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Business Type:</label>
                                                            <Select
                                                                styles={colourStyles}
                                                                options={busniessType}
                                                                value={busniessType.filter((f: any) => { return f.value == inputs.businesstype })}
                                                                onChange={(itm) => { setinputs({ ...inputs, businesstype: Number(itm!.value) }) }}
                                                            />
                                                            {warBType && <p className='lg-msg-error'>Select Your Business Type First!</p>}
                                                        </div>
                                                        <div className="">
                                                            <button className='btn-login' type="submit">
                                                                {isWaiting && <img className='login-loading' src={'/images/loading.gif'} />}
                                                                Create New Business
                                                            </button>
                                                        </div>

                                                    </form>
                                                </div>)}
                                    </div>}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default register;