import type { NextPage } from 'next';
import Select, { StylesConfig } from 'react-select';
import { useRouter } from 'next/router';

import { AdminLayout } from '@layout';

import { Card } from 'react-bootstrap';

import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { apiFetch, apiInsert, apiUpdateCtr } from 'src/libs/dbUtils';
import { Toast } from 'src/libs/allToasts';
import { IreadyGroupTax, IsaleProductItem, ITax, ITokenVerfy } from '@models/common-model';

import { finalCalculation } from 'src/libs/calculationTax';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as cookie from 'cookie';
import {
  getRealWord,
  hasPermissions,
  keyValueRules,
  verifayTokens,
} from 'src/pages/api/checkUtils';

const AddSale: NextPage = (props: any) => {
  const { shopId, rules } = props;
  const [formObj, setFormObj] = useState({
    id: 0,
    location: 0,
    customer: 0,
    saleDate: '',
    document: '',
    qty: 0,
    discountType: '',
    discountAmount: '',
    orderTax: 0,
    shippingDetails: 0,
    shippingAddress: 0,
    shippingStatus: '',
    delieveredTo: '',
    paymentAmount: '',
    paymentStatus: 0,
    paidOn: '',
    total: 0,
    status: '',
    product: 0,
    final_total: 0,
  });

  // All States
  const [errorForm, setErrorForm] = useState({
    location: false,
  });
  const [customers, setCustomers] = useState<{ value: number; label: string }[]>([]);
  const [invoiceSchema, setInvoiceSchema] = useState<{ value: number; label: string }[]>([]);
  const [orderTax, setOrderTax] = useState<{ value: number; label: string }[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [total_items, setTotal_items] = useState(0);
  const [total_price, setTotal_price] = useState(0);
  const [locations, setLocations] = useState<{ value: number; label: string }[]>([]);
  const [searchItems, setSearchItems] = useState([]);
  const [searchTxt, setSearchTxt] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [total, setTotal] = useState(0);

  const [selectProducts, setSelectProducts] = useState<IsaleProductItem[]>([]);

  const [defTaxGroup, setDefTaxGroup] = useState<IreadyGroupTax>({
    primary: 0,
    nonPrimary: 0,
    excises: 0,
    serviesFixed: 0,
    servicesPercentage: 0,
  });
  const [readyTaxGroup, setReadyTaxGroup] = useState<IreadyGroupTax[]>([]);
  const [taxGroups, setTaxGroups] = useState<any>([]);
  const [taxGroup, setTaxGroup] = useState<IreadyGroupTax[]>([]);
  const [show, setShow] = useState(false);
  const [subtotal, setSubtotal] = useState(0);

  // End States

  // variables
  const router = useRouter();
  const slug = router.query.slug;
  const discountType = [
    { value: 'fixed', label: 'Fixed' },
    { value: 'percentage', label: 'Percentage' },
  ];
  const colourStyles = { control: (style: any) => ({ ...style, borderRadius: '10px' }) };

  var formObjRef = useRef<any>();
  formObjRef.current = formObj;

  // End Variables

  // Functions

  const filterArray = (array1: any, array2: any) => {
    const filtered = array1.filter((el: any, index: any) => {
      return array2[index]?.product_id == el.id;
    });
    return filtered;
  };

  // Init data for Add or Edit
  async function initDataPage(id = '0') {
    if (id != '0') setIsEdit(true);
    var result = await apiFetch({ fetch: 'initSalesData', data: { id: id, shopId } });
    const { success, newdata } = result;

    if (success) {
      setCustomers(newdata.customers);
      setInvoiceSchema(newdata.invoice_schemes);
      setOrderTax(newdata.taxes);

      let _none = 0,
        _primary = 0,
        _excises = 0,
        _servies_percetage = 0,
        _servies_fixed = 0;
      newdata.taxes.map((tx: ITax) => {
        if (tx.tax_type == 'primary' && tx.is_primary) _primary += tx.amount;
        else if (tx.tax_type == 'primary') _none += tx.amount;
        else if (tx.tax_type == 'excise') _excises += tx.amount;
        else if (tx.tax_type == 'service' && tx.type == 'percentage')
          _servies_percetage += tx.amount;
        else if (tx.tax_type == 'service' && tx.type == 'fixed') _servies_fixed += tx.amount;
      });
      setDefTaxGroup({
        primary: _primary / 100,
        nonPrimary: _none / 100,
        excises: _excises / 100,
        serviesFixed: _servies_fixed,
        servicesPercentage: _servies_percetage / 100,
      });
      setLocations(newdata.locations);
      setProducts(newdata.products);
      setTaxGroups(newdata.tax_group);
      setTaxGroup(newdata.tax_group);

      //get walkInCustomer make it default customer
      const walkInCustomer = newdata.customers.find((ele: any) => ele.label === 'Walk-In Customer');
      setFormObj({
        ...formObj,
        customer: walkInCustomer?.value ? walkInCustomer?.value : 0,
      });

      if (newdata.transaction.length > 0) {
        const itm = newdata.transaction[0];
        setFormObj({
          ...formObj,
          id: itm.id,
          location: itm.location_id,
          customer: itm.contact_id,
          saleDate: itm.transaction_date,
          product: 169,
        });
        const output = newdata.products.filter((product: any) => {
          return newdata.sellLines.some((line: any) => {
            if (line.product_id == product.id) {
              Object.assign(product, { quantity: Number(line.quantity) });
              return line;
            }
          });
        });
        var UniqueProduct: any = {};
        const orders = output.filter(
          (obj: any) => !UniqueProduct[obj.id] && (UniqueProduct[obj.id] = true)
        );

        setSelectProducts(orders);
      }
      setLoading(false);
    } else alert('erorrrs');
  }

  //For detect any change in product edit list
  const onChangeInput = (e: any, id: any) => {
    const { name, value } = e.target;
    const editData = selectProducts.map((item) =>
      item.id === id && name ? { ...item, [name]: value } : item
    );

    setSelectProducts(editData);
  };
  useEffect(() => {
    var _items = 0,
      _prices_perItem = 0,
      _total_price = 0;
    selectProducts.map((p: IsaleProductItem) => {
      _items += Number(p.quantity);

      _prices_perItem = Number(p.quantity) * Number(p.price);
      setSubtotal(_prices_perItem);

      if (p.def_tax) _total_price += finalCalculation(defTaxGroup, _prices_perItem);
      else if (p.product_tax > 0)
        _total_price += finalCalculation(readyTaxGroup[p.product_tax], _prices_perItem);
      else if (p.brand_tax > 0)
        _total_price += finalCalculation(readyTaxGroup[p.brand_tax], _prices_perItem);
      else if (p.cat_tax > 0)
        _total_price += finalCalculation(readyTaxGroup[p.cat_tax], _prices_perItem);
      else _total_price += _prices_perItem;
    });
    setFormObj({ ...formObj, total: _total_price });
    setTotal(_total_price);
    setTotal_items(_items);
    setTotal_price(_total_price);
  }, [selectProducts]);
  const onChangeLocation = (e: any) => {
    const productByLocation = products.filter((p: any) => {
      return p.location == e.value;
    });
    setProducts(productByLocation);
  };

  // For Add New Sale
  async function insertSale() {
    setFormObj({
      ...formObj,
      final_total: total,
    });
    const holdObj = {
      name: '',
      orders: selectProducts,
      quantity: [],
    };
    const details = {
      customerId: formObj.customer,
      discount: 0,
      isReturn: 0,
      taxRate: 0,
      location_id: formObj.location,
      totalAmount: total,
    };
    const { success, msg } = await apiInsert({
      type: 'transactionSale',
      data: { shopId, items: holdObj, details },
    });
    if (success) {
      router.push('/shop/' + shopId + '/sales');
      Toast.fire({
        icon: 'success',
        title: msg,
      });
    } else {
      alert('Has Error ,try Again');
    }
  }

  // For Edir Sale
  async function editSale() {
    var result = await apiUpdateCtr({
      type: 'editSale',
      data: formObjRef.current,
    });
    const { success } = result;

    if (success) {
      router.push('/admin/sales');
      Toast.fire({
        icon: 'success',
        title: result.msg,
      });
    } else {
      alert('Has Error ,try Again');
    }
  }

  //For change Route based on slug
  useEffect(() => {
    initDataPage();
  }, [router.asPath]);

  // End Functions

  return (
    <>
      <AdminLayout shopId={shopId}>
        <Card className="mb-4">
          <Card.Header className="p-3 bg-white">
            <h5>{isEdit ? 'Edit Sale ' : 'Add New Sale'}</h5>
          </Card.Header>
          <Card.Body>
            {/* Form */}
            <form className="form-style">
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group2">
                    <label>
                      Customer: <span className="text-danger">*</span>
                    </label>
                    <Select
                      styles={colourStyles}
                      options={customers}
                      value={customers?.filter((f: any) => {
                        return f.value == formObj.customer;
                      })}
                      onChange={(itm) => {
                        setFormObj({ ...formObj, customer: itm!.value });
                      }}
                    />
                  </div>
                </div>
              </div>
              <br />
              {/* product */}
              <div className="row">
                <div className="d-flex justify-content-around">
                  <input
                    type="search"
                    className="form-control p-3 product-search"
                    style={{ maxWidth: '400px' }}
                    placeholder="Enter ID / Product Name / Sku "
                    value={searchTxt}
                    onChange={(e) => {
                      if (e.target.value.length > 0) {
                        const mfil: any = products.filter((p: any) => {
                          return (
                            p.name.includes(e.target.value) ||
                            p.sku.includes(e.target.value) ||
                            p.id.toString().includes(e.target.value)
                          );
                        });
                        setSearchItems(mfil);
                        if (mfil.length == 1) {
                          setSearchItems([]);
                          setTimeout(() => {
                            setSearchTxt('');
                          }, 100);
                        }
                      } else setSearchItems([]);
                      setSearchTxt(e.target.value);
                    }}
                  />
                  {/* start */}
                  {searchItems.length > 0 && (
                    <ul
                      id="ui-id-1"
                      className="container-popup-menu"
                      style={{ position: 'absolute', top: '358px' }}>
                      {searchItems.slice(0, 5).map((pro: any) => {
                        return (
                          <>
                            <li
                              className="ui-menu-item"
                              onClick={() => {
                                const idx = selectProducts.findIndex(
                                  (eItm: any) => eItm.id === pro.id
                                );
                                if (idx == -1)
                                  setSelectProducts([
                                    ...selectProducts,
                                    {
                                      id: pro.id,
                                      product: pro.name,
                                      cost: 0,
                                      price: Number(pro.price),
                                      quantity: 1,
                                      def_tax: pro.def_tax,
                                      product_tax: pro.product_tax,
                                      brand_tax: pro.brand_tax,
                                      cat_tax: pro.cat_tax,
                                    },
                                  ]);
                                else alert('The Product is Exist...');
                                setSearchItems([]);
                                setSearchTxt('');
                              }}>
                              {pro.name} | {pro.sku}
                            </li>
                          </>
                        );
                      })}
                    </ul>
                  )}
                  {/* end */}
                </div>
              </div>
              <br />
              {/* Edit list product */}
              {selectProducts.length != 0 && (
                <div className="row justify-content-center">
                  <div className="col-md-6 ">
                    <table className="">
                      <thead className="text-center font-weight-bold bg-primary p-2">
                        <tr>
                          <th>Name</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Remove</th>
                        </tr>
                      </thead>
                      <tbody className="text-center">
                        {selectProducts.map((pro, index) => (
                          <tr key={pro.id}>
                            <td>
                              <input
                                className="text-input-editlist"
                                name="product"
                                disabled
                                value={pro.product}
                                type="text"
                                onChange={(e) => onChangeInput(e, pro.id)}
                              />
                            </td>
                            <td>
                              <input
                                className="text-input-editlist"
                                name="price"
                                value={pro.price}
                                type="text"
                                onChange={(e) => onChangeInput(e, pro.id)}
                                placeholder="Type price"
                              />
                            </td>
                            <td>
                              <input
                                className="text-input-editlist"
                                name="quantity"
                                type="text"
                                value={pro.quantity}
                                onChange={(e) => onChangeInput(e, pro.id)}
                                placeholder="Type quantity"
                              />
                            </td>
                            <td>
                              <FontAwesomeIcon
                                onClick={() => {
                                  setSelectProducts(selectProducts.filter((item) => item !== pro));
                                }}
                                icon={faTrash}
                                color={'#045C54'}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group2">
                    <label>
                      Discount Amount: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Discount Amount"
                      value={formObj.discountAmount}
                      onChange={(e) => {
                        setFormObj({
                          ...formObj,
                          discountAmount: e.target.value,
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group2">
                    <label>
                      Discount Type: <span className="text-danger">*</span>
                    </label>
                    <Select
                      styles={colourStyles}
                      options={discountType}
                      value={discountType.filter((f: any) => {
                        return f.value == formObj.discountType;
                      })}
                      onChange={(itm) => {
                        setFormObj({ ...formObj, discountType: itm!.value });
                      }}
                    />
                  </div>
                </div>
              </div>
              <br />
              <br />
              <br />
              {selectProducts.length != 0 && (
                <div className="row justify-content-end">
                  <div className="col-lg-4">
                    <div className="flex justify-content-between">
                      <div>
                        <b className="font-weight-bold">Subtotal</b>
                      </div>

                      <span>{subtotal}</span>
                    </div>
                    <hr />
                    <div className="flex justify-content-between">
                      <div>
                        <b className="font-weight-bold">Quantity</b>
                      </div>
                      <div>
                        <span>{total_items}</span>
                      </div>
                    </div>
                    {orderTax && (
                      <>
                        <hr />
                        <div className="flex justify-content-between">
                          <div>
                            <b className="font-weight-bold">Order Tax</b>
                          </div>

                          <div>
                            {orderTax.map((tax: any) => {
                              return (
                                <>
                                  <div>
                                    {tax?.name} {tax?.amount}%
                                  </div>
                                  <br />
                                </>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                    <hr />
                    <div className="flex justify-content-between">
                      <div>
                        <b className="font-weight-bold">Total</b>
                      </div>
                      <div>
                        <span>{total.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="btn m-btn btn-primary p-2 "
                onClick={(e) => {
                  e.preventDefault();

                  if (isEdit) {
                    editSale();
                  } else {
                    insertSale();
                  }
                }}>
                {isEdit ? 'Edit' : 'Save'}
              </button>
            </form>
          </Card.Body>
        </Card>
      </AdminLayout>
    </>
  );
};
export default AddSale;
export async function getServerSideProps(context: any) {
  const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
  var _isOk = true;
  //check page params
  var shopId = context.query.id;
  var _addOrEdit = context.query.slug[0];
  var _EditId = context.query.slug[1];

  if (shopId == undefined) _isOk = false;
  if (_addOrEdit != 'add' && _addOrEdit != 'edit') _isOk = false;

  if (!_isOk) return { redirect: { permanent: false, destination: '/page403' } };

  //check user permissions
  await verifayTokens(
    { headers: { authorization: 'Bearer ' + parsedCookies.tokend } },
    (repo: ITokenVerfy) => {
      _isOk = repo.status;
      var _rules = keyValueRules(repo.data.rules || []);
      if (_isOk && _rules[shopId] != undefined) {
        var _stuf = '';
        _rules[shopId].forEach((dd: any) => (_stuf += dd.stuff));
        _addOrEdit = getRealWord(_addOrEdit);
        const { hasPermission } = hasPermissions(_stuf, 'products', _addOrEdit);
        _isOk = hasPermission;
      } else _isOk = false;
    }
  );
  if (!_isOk) return { redirect: { permanent: false, destination: '/page403' } };
  return {
    props: { shopId, editId: _addOrEdit == 'edit' ? _EditId : 0 },
  };
  //status ok
}
