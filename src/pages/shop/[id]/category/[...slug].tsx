import type { NextPage } from 'next';
import Select from 'react-select';
import { useRouter } from 'next/router';
import Spinner from 'react-bootstrap/Spinner';
import { AdminLayout } from '@layout';
import { Card } from 'react-bootstrap';
import React, { useState, useEffect, useRef } from 'react';
import { apiFetchCtr, apiInsertCtr, apiUpdateCtr } from '../../../../libs/dbUtils';
import * as cookie from 'cookie';
import {
  getRealWord,
  hasPermissions,
  keyValueRules,
  verifayTokens,
} from 'src/pages/api/checkUtils';
import { ITokenVerfy } from '@models/common-model';
import Link from 'next/dist/client/link';
import { ToastContainer } from 'react-toastify';
import { Toastify } from 'src/libs/allToasts';
import withAuth from 'src/HOCs/withAuth';
import { createNewData, findAllData, updateData } from 'src/services/crud.api';

const CategorySlug: NextPage = (props: any) => {
  const { editId, id} = props;
  const [shopId, setShopId] = useState('')
  const [formObj, setFormObj] = useState({
    id: 0,
    name: '',
    description: '',
    tax_id: null,
  });
  const [errorForm, setErrorForm] = useState({ name: false });
  const colourStyles = {
    control: (style: any) => ({ ...style, borderRadius: '10px' }),
  };
  const [taxGroup, setTaxGroup] = useState<{ value: number; label: string }[]>([]);
  const [selectedTax, setSelectedTax] = useState();
  const [type, setType] = useState('categories');
  const [typeName, setTypeName] = useState('Category');
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);

  const router = useRouter();
  var formObjRef = useRef<any>();
  formObjRef.current = formObj;

  async function initDataPage() {
    if(router.isReady) {
      setType(router.query.type.toString())
      setTypeName(router.query.type === 'categories' ? 'Category' : 'Brand')
      setShopId(router.query.id.toString())
      const routerParams = router.query.slug
      const res = await findAllData(`taxes/${router.query.id}`)
      res.data.result.taxes.map(tax => tax.label = tax.name)
      setTaxGroup(res.data.result.taxes)
      setSelectedTax(res.data.result.taxes.filter((f: any) => {
        return f.id == formObj.tax_id;
      }))
      if(routerParams[0] === 'edit') {
        setIsEdit(true)
        const res = await findAllData(`${router.query.type}/${routerParams[1]}/show`)
        const itm = res.data.result;
        itm.tax_id = itm.tax_id == 0 ? null : itm.tax_id;
        setFormObj({
          ...formObj,
          id: itm.id,
          name: itm.name,
          description: itm.description,
          tax_id: itm.never_tax == 1 ? -1 : itm.tax_id,
        });
        
      }
    }
    setLoading(false);
    // setTaxGroup([
    //   { value: null, label: 'Default Tax' },
    //   { value: -1, label: 'Never Tax' },
    //   ...newdata.taxes,
    // ]);
  }

  async function insertHandle() {
    const data = formObjRef.current
    delete data.id
    const res = await createNewData(`${type}/${router.query.id}`, data)
    if (res.data.success || res.data.status === 201) {
      Toastify('success', 'successfuly added');
      setTimeout(() => {
        router.push('/shop/' + shopId + '/category');
      }, 1000);
    } else {
      alert('Has Error ,try Again');
    }
  }
  async function editHandle() {
    const res = await updateData(`${type}`, router.query.slug[1], formObjRef.current)
    if (res.data.success) {
      Toastify('success', 'successfuly added');
      setTimeout(() => {
        router.push('/shop/' + shopId + '/category');
      }, 1000);
    } else {
      alert('Has Error ,try Again');
    }
  }
  var errors = [];
  useEffect(() => {
    initDataPage();
  }, [router.asPath]);

  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        <div className="row">
          <div className="mb-4">
            <Link
              className="btn btn-primary p-3"
              href={'/shop/' + shopId + '/category'}
              onClick={(e) => {
                e.preventDefault();
                router.push('/shop/' + shopId + '/category');
              }}>
              Back To List
            </Link>
          </div>
        </div>
        <Card className="mb-4">
          <Card.Header className="p-3 bg-white">
            <h5>{isEdit ? 'Edit ' + typeName : 'Add New ' + typeName}</h5>
          </Card.Header>
          <Card.Body>
            {!loading ? (
              <form className="form-style">
                <div className="form-group2">
                  <label>
                    Name: <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder=" Enter Name"
                    value={formObj.name}
                    onChange={(e) => {
                      setFormObj({ ...formObj, name: e.target.value });
                    }}
                  />
                  {errorForm.name && <p className="p-1 h6 text-danger ">Enter {typeName} name</p>}
                </div>
                <div className="row">
                  <div className="form-group">
                    <label>description:</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="description"
                      value={formObj.description}
                      onChange={(e) => {
                        setFormObj({ ...formObj, description: e.target.value });
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Custom Tax :</label>
                    <Select
                      // styles={colourStyles}
                      options={taxGroup}
                      value={selectedTax || undefined}
                      onChange={(itm) => {
                        console.log(itm);
                        setSelectedTax(itm)
                        setFormObj({ ...formObj, tax_id: itm?.id });
                      }}
                    />
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

                    setErrorForm({
                      ...errorForm,
                      name: formObj.name.length == 0 ? true : false,
                    });
                    if (errors.length == 0) {
                      isEdit ? editHandle() : insertHandle();
                    } else alert('Enter Required Field');
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
      </AdminLayout>
    </>
  );
};
export default withAuth(CategorySlug);