import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICurrency } from '@models/business.types';
import { setCookie } from 'cookies-next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { ToastContainer } from 'react-toastify';
import { useCurrenciesList } from 'src/services/business.service';
import { OwnerAdminLayout } from '../../layout';
import { Toastify } from '../../libs/allToasts';
import { apiInsertCtr } from '../../libs/dbUtils';

const AddLocation = ({ username, businessId }: any) => {
  const [formObj, setFormObj] = useState({
    id: 0,
    name: '',
    state: '',
    currency_id: 0,
    decimal_places: 0,
  });
  const [isEdit, setIsEdit] = useState(false);
  const [errorForm, setErrorForm] = useState({
    name: false,
    currency: false,
    state: false,
    decimal_places: false,
  });
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState<{ value: number; label: string }[]>([]);
  const router = useRouter();
  const { isLoading } = useCurrenciesList(null, {
    onSuccess(data, key, config) {
      const _currenciesList = data.result.map((itm: ICurrency) => {
        return { value: itm.id, label: itm.currency };
      });

      setCurrencies(_currenciesList);
    },
  });

  async function addNewLocation() {
    setLoading(true);
    const { success, newdata } = await apiInsertCtr({
      type: 'owner',
      subType: 'AddLocation',
      businessId,
      data: {
        ...formObj,
        types: localStorage.getItem('userlocs')
          ? JSON.parse(localStorage.getItem('userlocs')).map((loc) => {
              return { id: loc.value, type: loc.typeid };
            })
          : [],
      },
    });
    setLoading(false);
    if (!success) {
      Toastify('error', 'error occurred, try agian');
      return;
    }
    Toastify('success', 'Location Successfuly Created..');
    setCookie('tokend', newdata);
    localStorage.setItem('userinfo', newdata);
    router.push(`/${username}/business`);
  }

  var errors = [];
  return (
    <div className="row">
      <div className="col-md-12">
        <Link href={'/' + username + '/business'} className="btn btn-primary p-3 mb-3">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to list{' '}
        </Link>
        <Card>
          <Card.Header className="p-3 bg-white">
            <h5>Add New Location</h5>
          </Card.Header>
          <Card.Body>
            {!isLoading ? (
              <form className="form-style">
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group2">
                      <label>
                        Shop Name: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder=""
                        value={formObj.name}
                        onChange={(e) => {
                          setFormObj({ ...formObj, name: e.target.value });
                        }}
                      />
                      {errorForm.name && <p className="p-1 h6 text-danger ">Enter Shop name</p>}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group2">
                      <label>
                        State: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder=""
                        value={formObj.state}
                        onChange={(e) => {
                          setFormObj({ ...formObj, state: e.target.value });
                        }}
                      />
                      {errorForm.state && <p className="p-1 h6 text-danger ">Enter State name</p>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>
                      Currency: <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={currencies}
                      value={currencies.filter((f: any) => {
                        return f.value == formObj.currency_id;
                      })}
                      onChange={(itm) => {
                        setFormObj({ ...formObj, currency_id: itm!.value });
                      }}
                    />
                    {errorForm.currency && <p className="p-1 h6 text-danger ">Select One Item</p>}
                  </div>
                  <div className="col-md-4">
                    <div className="form-group2">
                      <label>
                        decimal places: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder=""
                        value={formObj.decimal_places}
                        onChange={(e) => {
                          setFormObj({ ...formObj, decimal_places: +e.target.value });
                        }}
                      />
                      {errorForm.decimal_places && (
                        <p className="p-1 h6 text-danger ">Enter decimal_places number</p>
                      )}
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
                    if (formObj.name.length == 0) errors.push('error');
                    if (formObj.currency_id < 1) errors.push('error');
                    if (formObj.state.length == 0) errors.push('error');
                    if (formObj.decimal_places.toString().length == 0) errors.push('error');
                    setErrorForm({
                      ...errorForm,
                      name: formObj.name.length == 0,
                      currency: formObj.currency_id < 1,
                      state: formObj.state.length == 0,
                      decimal_places: formObj.decimal_places.toString().length == 0,
                    });
                    if (errors.length == 0) {
                      addNewLocation();
                    } else Toastify('error', 'Enter Requires Field');
                  }}>
                  {isEdit ? 'Edit' : 'Save'}
                </button>
              </form>
            ) : (
              <div className="d-flex justify-content-around">
                <Spinner animation="grow" />
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};
export default AddLocation;
