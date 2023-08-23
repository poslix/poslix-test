import { BusinessTypeData } from '@models/data';
import { useEffect, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Select from 'react-select';
import { Toastify } from 'src/libs/allToasts';
import { apiInsertCtr } from 'src/libs/dbUtils';
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhoneNumber,
} from 'src/libs/toolsUtils';
import { colourStyles } from 'src/utils/color.style';

const initalInputState = {
  id: '',
  username: '',
  password: '',
  name: '',
  phone: '',
  mail: '',
  businessname: '',
  businesstype: 0,
};

export default function RegisterView() {
  const [phone, setPhone] = useState('');
  const [isStep1, setIsStep1] = useState(true);

  const [warName, setWarName] = useState(false);
  const [warnpass, setwarnpass] = useState(false);
  const [warPhone, setWarPhone] = useState(false);
  const [warBType, setWarBType] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [warnemail, setwarnemail] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [hasErrorMsg, setHasErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);
  const [inputs, setinputs] = useState(initalInputState);
  const [showLoginDialog, setShowLoginDialog] = useState(true);
  const [warBusinessName, setWarBusinessName] = useState(false);
  const [busniessType, setBusniessType] = useState(BusinessTypeData);

  useEffect(() => {
    setSuccessMsg(false);
    setHasError(false);
  }, [showLoginDialog]);

  useEffect(() => {
    if (phone.length > 0 && !validatePhoneNumber(phone)) setWarPhone(true);
    else setWarPhone(false);
    setinputs({ ...inputs, phone: phone });
  }, [phone]);

  const inputEvent = (event: any) => {
    const name = event.target.name;
    const value = event.target.value;
    if (name == 'mail') {
      if (value.length > 0 && !validateEmail(value)) setwarnemail(true);
      else setwarnemail(false);
    } else if (name == 'name') {
      if (value.length > 0 && !validateName(value)) setWarName(true);
      else setWarName(false);
    } else if (name == 'password') {
      setwarnpass(value.length > 0 && !validatePassword(value));
    }
    setinputs((lastValue) => {
      return {
        ...lastValue,
        [name]: value,
      };
    });
  };
  const submitForm = (e: any) => {
    e.preventDefault();
    setHasError(false);
    if (showLoginDialog) {
      setwarnemail(false);
      setwarnpass(false);
      if (inputs.password.length < 3 || !validatePassword(inputs.password)) {
        setwarnpass(true);
      }
      if (inputs.mail.length < 3 || !validateEmail(inputs.mail)) {
        setwarnemail(true);
      }
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
        if (isOK) registeration('newRegister');
      } else {
        let isOK = true;
        setWarBusinessName(false);
        setWarBType(false);
        if (inputs.businessname.length < 3 || !validateName(inputs.businessname)) {
          setWarBusinessName(true);
          isOK = false;
        }
        if (inputs.businesstype < 1) {
          setWarBType(true);
          isOK = false;
        }
        if (isOK) registeration('userNewBusiness');
      }

      return;
    }
  };

  async function registeration(steps: string) {
    if (isWaiting) return;
    const { success, newdata, msg } = await apiInsertCtr({
      type: 'user',
      subType: steps,
      data: inputs,
    });
    setIsWaiting(false);
    if (!success) {
      setHasErrorMsg(msg);
      setHasError(true);
      return;
    }
    if (isStep1) {
      setinputs({ ...inputs, id: newdata.id });
      setIsStep1(false);
      Toastify('success', 'Done, Pass The Last Step');
    } else {
      Toastify('success', 'Your registration has been successfully completed');
      setSuccessMsg(true);
      setIsStep1(true);
      setShowLoginDialog(true);
      // signin();
    }
  }

  if (isStep1)
    return (
      <div className="regformform">
        <div className="step1">
          <form className="formfileds" onSubmit={submitForm}>
            <div className="input_text">
              <input
                type="text"
                placeholder="Your Full Name"
                name="name"
                value={inputs.name}
                onChange={inputEvent}
              />
              {warName && <p>Please enter a valid Name.</p>}
            </div>
            <div className="input_text">
              <input
                type="text"
                placeholder="Email Address"
                name="mail"
                value={inputs.mail}
                onChange={inputEvent}
              />
              {warnemail && <p>Please enter a valid email address.</p>}
            </div>
            <div className="input_text">
              <PhoneInput
                country={'om'}
                value={phone}
                autoFormat={true}
                onChange={(phone) => setPhone(phone)}
              />
              {warPhone && <p>Please enter a valid Phone Number.</p>}
            </div>
            <div className="input_text">
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={inputs.password}
                onChange={inputEvent}
              />
              {warnpass && (
                <p>
                  Password must contain at least one digit,lowercase letter,uppercase letter and be
                  at least 6 characters
                </p>
              )}
            </div>
            <button className="btn-login mt-auto" type="submit">
              {isWaiting && <img className="login-loading" src={'/images/loading.gif'} />}
              Sign Up
            </button>
          </form>
        </div>
      </div>
    );

  return (
    <div className="regformform">
      <div className="step2">
        <div className="login-register-box">
          <h3>Business Info</h3>
          <p>You Haven't Business , Create One!</p>
        </div>
        <h5></h5>
        {/* {JSON.stringify(inputs)} */}
        <form className="formfileds" onSubmit={submitForm}>
          <div className="input_text">
            <input
              type="text"
              className="form-control m-input"
              placeholder="Your Business Name"
              name="businessname"
              value={inputs.businessname}
              onChange={inputEvent}
            />
            {warBusinessName && <p>Enter Your Business Name First</p>}
          </div>
          <div className="form-group">
            <label>Business Type:</label>
            <Select
              styles={colourStyles}
              options={busniessType}
              value={busniessType.filter((f: any) => {
                return f.value == inputs.businesstype;
              })}
              onChange={(itm) => {
                setinputs({ ...inputs, businesstype: Number(itm!.value) });
              }}
            />
            {warBType && <p className="lg-msg-error">Select Your Business Type First!</p>}
          </div>
          <div className="">
            <button className="btn-login" type="submit">
              {isWaiting && <img className="login-loading" src={'/images/loading.gif'} />}
              Create New Business
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
