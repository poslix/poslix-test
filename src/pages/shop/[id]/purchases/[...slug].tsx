import type { NextPage } from 'next';
import Select from 'react-select';
import { useRouter } from 'next/router';
import { AdminLayout } from '@layout';
import { Card } from 'react-bootstrap';
import React, { useState, useEffect, useRef } from 'react';
import { apiFetchCtr, apiInsertCtr, apiUpdateCtr } from 'src/libs/dbUtils';
import DatePicker from 'react-datepicker';
import Form from 'react-bootstrap/Form';
import 'react-datepicker/dist/react-datepicker.css';
import {
  ILocationSettings,
  IPurchaseExpndes,
  IpurchaseProductItem,
  ITokenVerfy,
} from 'src/models/common-model';
import { TableExpeseRows, TableTaxRows } from 'src/components/utils/ExpendsRow';
import * as cookie from 'cookie';
import {
  getRealWord,
  hasPermissions,
  keyValueRules,
  verifayTokens,
} from 'src/pages/api/checkUtils';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditIcon from '@mui/icons-material/Edit';
import { purchaseStatusDataAdd, paymentStatusData, paymentTypeData } from '../../../../models/data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-regular-svg-icons';
import VariationModal from 'src/components/pos/modals/VariationModal';
import { cartJobType } from 'src/recoil/atoms';
import { useRecoilState } from 'recoil';
import { ToastContainer } from 'react-toastify';
import { Toastify } from 'src/libs/allToasts';
import { findAllData } from 'src/services/crud.api';
import withAuth from 'src/HOCs/withAuth';
const AddPurchase: NextPage = (props: any) => {
  const { shopId, editId } = props;

  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({
    // @ts-ignore
    value: 0,
    label: '',
    currency_decimal_places: 0,
    currency_code: '',
    currency_id: 0,
    currency_rate: 1,
    currency_symbol: '',
  });
  const [formObj, setFormObj] = useState({
    id: 0,
    supplier_id: 0,
    location_id: 0,
    currency_id: 0,
    currency_symbol: '',
    currency_code: '',
    currency_rate: 0,
    total_price: 0,
    ref_no: '',
    date: new Date(),
    taxs: 0,
    subTotal_price: 0,
    total_tax: 0,
    total_expense: 0,
    discount_type: 'fixed',
    discount_amount: 0,
    purchaseStatus: '',
    paymentStatus: '',
    paid_amount: 0,
    total_discount: 0,
    paymentType: '',
    paymentDate: new Date(),
    payment_id: 0,
  });
  const [errorForm, setErrorForm] = useState({
    morePaid: false,
    paid: false,
    products: false,
    supplier_id: false,
    taxInclu: false,
    paymentStatus: false,
    paymentType: false,
    paymentDate: false,
    purchaseStatus: false,
  });
  const selectStyle = {
    control: (style: any) => ({ ...style, color: '#db3333', borderRadius: '10px' }),
  };
  const [suppliers, setSuppliers] = useState<{ value: number; label: string }[]>([]);
  const [purchaseDetails, setPurchaseDetails] = useState<
    { label: string; value: string; priority: number }[]
  >([
    { label: 'Discount :', value: 'discount', priority: 1 },
    { label: 'Total Expenses :', value: 'expense', priority: 2 },
    { label: 'Taxes :', value: 'taxes', priority: 3 },
  ]);
  const [currencies, setCurrencies] = useState<
    { value: number; label: string; symbol: string; exchange_rate: number; code: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isEditSort, setIsEditSort] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [vatInColumn, setVatInColumn] = useState(false);
  const [isOpenVariationDialog, setIsOpenVariationDialog] = useState(false);
  const [selectedProductForVariation, setSelectedProductForVariation] = useState<{
    product_id: number;
    product_name: string;
    is_service: number;
  }>({ product_id: 0, product_name: '', is_service: 0 });
  const [purchaseStatus, setPurchaseStatus] =
    useState<{ value: string; label: string }[]>(purchaseStatusDataAdd);
  const [paymentTypes, setPaymentTypes] =
    useState<{ value: string; label: string }[]>(paymentTypeData);
  const [paymentStatus, setPaymentStatus] =
    useState<{ value: string; label: string }[]>(paymentStatusData);
  const [products, setProducts] = useState<{ value: number; label: string }[]>([]);
  const [selectProducts, setSelectProducts] = useState<IpurchaseProductItem[]>([]);
  const [allVariations, setAllVariations] = useState([]);
  const [total_qty, setTotal_qty] = useState(0);
  const [expends, setExpends] = useState<{ label: ''; value: 0 }[]>([]);
  const [selectedExpends, setSelectedExpends] = useState<IPurchaseExpndes[]>([]);
  const [selectedExpendsEdit, setSelectedExpendsEdit] = useState<IPurchaseExpndes[]>([]);
  const [selectedTaxes, setSelectedTaxes] = useState<IPurchaseExpndes[]>([]);
  const [expenseCounter, setExpenseCounter] = useState(0);
  const [totalExpends, setTotalExpends] = useState(0);
  const [selecetdId, setSelecetdId] = useState({ product_id: 0, variation_id: 0 });
  const [jobType] = useRecoilState(cartJobType);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);

  const onCostClick = (type: string, id: number, vr: number) => {
    const found = selectProducts.findIndex((el) => el.product_id === id && el.variation_id == vr);
    if (found > -1) {
      var _datas: any = selectProducts;
      if (type == 'useExpnds') _datas[found].costType = _datas[found].costType == 1 ? 0 : 1;
      else if (type == 'useTax') _datas[found].costType = _datas[found].costType == 2 ? 0 : 2;
      else if (type == 'useTotal') _datas[found].costType = _datas[found].costType == 3 ? 0 : 3;

      setSelectProducts([..._datas]);
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Product Name', minWidth: 200 },
    {
      field: 'cost',
      headerName: 'Cost',
      colSpan: 1,
      minWidth: 350,
      editable: true,
      type: 'number',
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <div>{row.cost}</div>
          {locationSettings?.currency_id != formObj.currency_id && (
            <div className="purchase-converted-cost">
              {(formObj.currency_rate * row.cost).toFixed(
                locationSettings?.location_decimal_places
              )}{' '}
              <span style={{ opacity: '0.5', fontSize: '10px' }}>
                {' '}
                {locationSettings?.currency_code}
              </span>
            </div>
          )}
          {row.cost < row.notifyExpensePrice && (
            <div
              className={row.costType == 1 ? 'purchase-label active-label' : 'purchase-label'}
              id="use-expends"
              onClick={() => onCostClick('useExpnds', row.product_id, row.variation_id)}>
              <span>EXP</span> {row.notifyExpensePrice}
            </div>
          )}
          {row.cost < row.notifyTaxPrice && (
            <div
              className={row.costType == 2 ? 'purchase-label active-label' : 'purchase-label'}
              id="use-tax"
              onClick={() => onCostClick('useTax', row.product_id, row.variation_id)}>
              <span> TX</span> {row.notifyTaxPrice}
            </div>
          )}
          {row.notifyExpensePrice > 0 && row.notifyTaxPrice > 0 && (
            <div
              className={row.costType == 3 ? 'purchase-label active-label' : 'purchase-label'}
              id="use-tax"
              onClick={() => onCostClick('useTotal', row.product_id, row.variation_id)}>
              <span> Total</span> {row.notifyTotalPrice}
            </div>
          )}
        </>
      ),
    },
    { field: 'price', headerName: 'Price', minWidth: 150, editable: true, type: 'number' },
    { field: 'quantity', headerName: 'Qty', minWidth: 150, editable: true, type: 'number' },
    { field: 'vat', headerName: 'VAT %', minWidth: 150, editable: true, type: 'number' },
    {
      field: 'lineTotal',
      headerName: 'Line Total',
      minWidth: 100,
      type: 'number',
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <div>
            {locationSettings?.currency_id == formObj.currency_id
              ? Number(row.cost * row.quantity).toFixed(locationSettings?.location_decimal_places)
              : (formObj.currency_rate * row.cost).toFixed(
                  locationSettings?.location_decimal_places
                )}
          </div>
        </>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      minWidth: 100,
      sortable: false,
      disableExport: true,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <Button
            variant="outlined"
            onClick={() => {
              setSelecetdId({ product_id: row.product_id, variation_id: row.variation_id });
              setOpenRemoveDialog(true);
            }}>
            <DeleteIcon />
          </Button>
        </>
      ),
    },
  ];

  const colourStyles = { control: (style: any) => ({ ...style, borderRadius: '10px' }) };
  const router = useRouter();
  var formObjRef = useRef<any>();
  formObjRef.current = formObj;

  const formatProductsOptions = (products: any) => (
    <div>
      <div>({Number(products.sell_price).toFixed(3)})</div>
      <div style={{ opacity: '0.8' }}>
        <span>{products.name}</span>
      </div>
    </div>
  );

  async function initDataPage(url) {
    if (url?.length == 2) setIsEdit(true);

    if (url?.length == 2) {
      const res = await findAllData(`purchase/${router.query.slug[1]}/show`);
      const itm = res.data.result;
      setProducts(itm?.products);
      // setSuppliers([...itm?.suppliers, { label: 'Walk-in Supplier', value: 1 }]);
      setCurrencies(itm?.currencies);
      setExpends(itm?.expenses);
      setAllVariations(itm?.allVariations);
      if (itm?.purchase?.length > 0) {
        if (itm?.selected_lines.length > 0) {
          var _rows: any = [],
            cop = 0;
          itm?.selected_lines.map((sp: any) => {
            cop++;
            _rows.push({
              id:
                +Number(sp.product_id) +
                Math.floor(Math.random() * 7990) +
                cop +
                Math.floor(Math.random() * 1200),
              product_id: sp.product_id,
              variation_id: sp.variation_id,
              name: sp.name,
              quantity: Number(sp.quantity).toFixed(locationSettings?.location_decimal_places),
              price: Number(sp.price).toFixed(locationSettings?.location_decimal_places),
              cost: Number(sp.cost).toFixed(locationSettings?.location_decimal_places),
              lineTotal: (parseFloat(sp.cost) * parseFloat(sp.quantity)).toFixed(
                locationSettings?.location_decimal_places
              ),
              taxAmount: 0,
              costType: sp.cost_type,
              trans_id: sp.trans_id,
            });
          });
          setSelectProducts([..._rows]);
        } else {
          //error!
        }
        setSelectedExpendsEdit(itm?.selected_expnses);
        let _sumTotalExp = 0;
        itm?.selected_expnses.map(
          (mp: any) => (_sumTotalExp += parseFloat((mp.enterd_value * mp.currency_rate).toString()))
        );
        const itm1 = itm?.purchase[0];
        let paymentType = '',
          amount = 0,
          pay_id = 0;
        if (itm?.selected_payment.length > 0) {
          paymentType = itm?.selected_payment[0].payment_type;
          amount = itm?.selected_payment[0].amount;
          pay_id = itm?.selected_payment[0].id;
        }
        let _taxes = JSON.parse(itm.taxes);
        setSelectedTaxes(_taxes);
        // itm.currency_id
        const pidex = itm?.currencies.findIndex((ps: any) => ps.value == itm.currency_id);

        let crate = 0,
          cCode = '';
        if (pidex > -1) {
          crate = itm?.currencies[pidex].exchange_rate;
          cCode = itm?.currencies[pidex].code;
        }

        setFormObj({
          ...formObj,
          id: itm1.id,
          supplier_id: itm1.contact_id,
          currency_id: itm1.currency_id,
          currency_rate: crate,
          currency_symbol: '',
          currency_code: cCode,
          total_price: itm1.total_price,
          ref_no: itm1.invoice_no,
          date: new Date(),
          taxs: 0,
          subTotal_price: 0,
          total_tax: itm1.total_taxes,
          total_expense: _sumTotalExp,
          discount_type: 'fixed',
          discount_amount: 0,
          purchaseStatus: itm1.status,
          paymentStatus: itm1.payment_status,
          paid_amount: Number(amount),
          total_discount: 0,
          paymentType: paymentType,
          paymentDate: new Date(),
          payment_id: pay_id,
        });
      }
      setLoading(false);
    }
  }

  async function insertPurchase() {
    const { success } = await apiInsertCtr({
      type: 'transactions',
      subType: 'addPurchase',
      shopId,
      data: {
        totalOrder: formObjRef.current,
        lines: selectProducts,
        expenses: selectedExpends,
        taxes: selectedTaxes,
      },
    });
    if (!success) {
      alert('Has Error ,try Again');
      return;
    }
    Toastify('success', 'Purchase Successfully Created..');
    router.push('/shop/' + shopId + '/purchases');
  }
  async function editPurchase() {
    const { success } = await apiUpdateCtr({
      type: 'transactions',
      subType: 'editPurchase',
      shopId,
      data: {
        totalOrder: formObjRef.current,
        lines: selectProducts,
        expenses: selectedExpends,
        taxes: selectedTaxes,
      },
    });
    if (!success) {
      Toastify('error', 'Has Error ,Check You Inputs Try Again');
      return;
    }
    Toastify('success', 'Purchase Successfully Edited..');
    router.push('/shop/' + shopId + '/purchases');
  }
  var errors = [];
  useEffect(() => {
    var _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.value == shopId;
          })
        ]
      );
    else alert('errorr location settings');
    initDataPage(router.query.slug);
  }, [router.asPath]);

  function getPriority(type: string, subTotal: number): number {
    switch (type) {
      case 'discount':
        return subTotal - formObj.total_discount;
      case 'expense':
        return subTotal + formObj.total_expense;
      case 'taxes':
        return (formObj.total_tax / 100) * subTotal + subTotal;
    }
    return 0;
  }
  function finalCalculation(subTotal = 0) {
    subTotal = subTotal > 0 ? subTotal : formObj.subTotal_price;
    var _total = subTotal;
    if (_total <= 0) return;
    purchaseDetails.map((dp) => (_total = getPriority(dp.value, _total)));

    setFormObj({
      ...formObj,
      total_price: _total,
      subTotal_price: subTotal,
      paid_amount:
        formObj.paymentStatus == 'paid' || formObj.paymentStatus == 'credit'
          ? _total
          : formObj.paid_amount,
    });
  }
  useEffect(() => {
    var _prices = 0,
      _qty = 0;
    selectProducts.map((p: IpurchaseProductItem) => {
      _qty += Number(p.quantity);
      _prices += Number(p.lineTotal);
    });
    setTotal_qty(_qty);
    setFormObj({ ...formObj, subTotal_price: _prices });
    finalCalculation(_prices);
  }, [selectProducts]);

  useEffect(() => {
    var _disAmount = 0,
      _total = 0;
    _disAmount = formObj.discount_amount;

    // formObj.discount_type == 'fixed' ?  : ((formObj.discount_amount / 100) * formObj.subTotal_price).toFixed(3)

    if (formObj.discount_type == 'percent') {
      _disAmount = _disAmount > 100 ? 100 : _disAmount;
      _total = (_disAmount / 100) * formObj.subTotal_price;
    } else {
      _disAmount = _disAmount > formObj.subTotal_price ? formObj.subTotal_price : _disAmount;
      _total = _disAmount;
    }
    setFormObj({ ...formObj, total_discount: _total, discount_amount: _disAmount });
  }, [formObj.discount_type, formObj.discount_amount]);

  //expenses
  useEffect(() => {
    var _sum = 0;

    selectedExpends.map((ep) => (_sum += Number(ep.enterd_value * ep.currency_rate)));
    selectedExpendsEdit.map((ep) => (_sum += Number(ep.enterd_value * ep.currency_rate)));
    setTotalExpends(_sum);

    setFormObj({
      ...formObj,
      total_expense: +_sum.toFixed(locationSettings?.location_decimal_places),
    });
    calculationLabels(_sum, formObj.total_tax);
  }, [selectedExpends, selectedExpendsEdit]);

  useEffect(() => {
    finalCalculation();
  }, [purchaseDetails]);
  useEffect(() => {
    finalCalculation();
  }, [formObj.total_discount]);
  useEffect(() => {
    finalCalculation();
  }, [formObj.total_expense]);
  useEffect(() => {
    finalCalculation();
  }, [formObj.total_tax]);
  useEffect(() => {
    setFormObj({
      ...formObj,
      currency_id: locationSettings?.currency_id,
      currency_code: locationSettings?.currency_code,
    });
  }, [locationSettings]);
  useEffect(() => {
    calculationLabels(formObj.total_expense, formObj.total_tax);
  }, [formObj.currency_rate]);

  const calculationLineTotal = (item: IpurchaseProductItem): number => {
    switch (item.costType) {
      case 0:
        return item.cost;
      case 1:
        return item.notifyExpensePrice || 0;
      case 2:
        return item.notifyTaxPrice || 0;
      case 3:
        return item.notifyTotalPrice || 0;
      default:
        return item.cost;
    }
  };
  const addTableRows = (rowType = 'expense') => {
    if (rowType == 'expense') {
      //expense
      if (selectedExpends.length < 5)
        setSelectedExpends([
          ...selectedExpends,
          {
            label: 'Select One',
            value: 0,
            currency_code: '',
            currency_id: 0,
            currency_rate: 1,
            converted_value: 0,
            enterd_value: 0,
            isNew: true,
          },
        ]);
      else alert('Erorr , maximum 5 fileds');
    } else {
      //add taxes

      setSelectedTaxes([
        ...selectedTaxes,
        {
          label: '',
          value: 0,
          currency_code: '',
          currency_id: 0,
          currency_rate: 1,
          converted_value: 0,
          enterd_value: 0,
          isNew: true,
        },
      ]);
    }
  };
  const deleteTableRows = (index: any) => {
    const _rows = [...selectedExpends];
    _rows.splice(index, 1);

    setSelectedExpends(_rows);

    setExpenseCounter(expenseCounter - 1);
  };
  const handleChange = (index: any, evnt: any, isNew: Boolean) => {
    const _expends: IPurchaseExpndes[] | any = isNew
      ? [...selectedExpends]
      : [...selectedExpendsEdit];
    if ('label' in evnt && 'code' in evnt) {
      _expends[index].currency_code = evnt.code;
      _expends[index].currency_rate = evnt.exchange_rate;
      _expends[index].currency_id = evnt.value;
    } else if ('label' in evnt) {
      _expends[index].label = evnt.label;
      _expends[index].value = evnt.value;
    } else {
      const { name, value } = evnt.target;
      _expends[index][name] = value;
    }
    _expends[index].converted_value = +Number(
      _expends[index].currency_id == locationSettings?.currency_id
        ? _expends[index].value
        : _expends[index].value * _expends[index].currency_rate
    ).toFixed(locationSettings?.location_decimal_places);
    if (isNew) setSelectedExpends(_expends);
    else setSelectedExpendsEdit(_expends);
  };
  //taxes
  useEffect(() => {
    var _tx = 0;
    selectedTaxes.map((ep: any) => (_tx += Number(ep.converted_value)));
    setFormObj({ ...formObj, total_tax: +_tx.toFixed(locationSettings?.location_decimal_places) });
    calculationLabels(formObj.total_expense, _tx);
  }, [selectedTaxes]);
  const deleteRowTaxes = (index: any) => {
    const _rows = [...selectedTaxes];
    _rows.splice(index, 1);
    setSelectedTaxes(_rows);
  };
  const handlerRowTaxes = (index: any, evnt: any) => {
    const _rows: IPurchaseExpndes[] | any = [...selectedTaxes];

    if ('label' in evnt) {
      _rows[index].currency_rate = evnt.exchange_rate;
      _rows[index].currency_id = evnt.value;
    } else {
      const { name, value } = evnt.target;
      _rows[index][name] = value;
    }
    _rows[index].converted_value = +Number(
      _rows[index].currency_id == locationSettings?.currency_id
        ? _rows[index].value
        : _rows[index].value * _rows[index].currency_rate
    ).toFixed(locationSettings?.location_decimal_places);
    setSelectedTaxes(_rows);
  };
  useEffect(() => {
    if (jobType.req == 4) {
      allVariations.map((varItm: any, index: number) => {
        if (varItm.variation_id == jobType.val) {
          const found = selectProducts.some((el) => el.variation_id == varItm.variation_id);
          if (!found) {
            setSelectProducts([
              ...selectProducts,
              {
                id: +Number(varItm.product_id) + Math.floor(Math.random() * 1200),
                product_id: varItm.product_id,
                variation_id: varItm.variation_id,
                name: selectedProductForVariation.product_name + ' ' + varItm.name,
                quantity: 1,
                price: varItm.variation_price,
                cost: varItm.variation_cost,
                lineTotal: parseFloat(varItm.variation_cost),
                taxAmount: 0,
                costType: 0,
                isNew: true,
              },
            ]);
            setSelectedExpends([...selectedExpends]);
          } else Toastify('error', 'already exists in list');
        }
      });
    }
  }, [jobType]);
  //product add / update
  const addToProductQuotations = (e: any) => {
    if (e.type == 'variable') {
      setSelectedProductForVariation({
        product_id: e.product_id,
        is_service: 0,
        product_name: e.name,
      });
      setIsOpenVariationDialog(true);
      return;
    }
    const found = selectProducts.some((el) => el.product_id === e.value);
    if (!found) {
      setSelectProducts([
        ...selectProducts,
        {
          id: e.product_id,
          product_id: e.product_id,
          variation_id: 0,
          name: e.name,
          quantity: 1,
          price: e.sell_price,
          cost: e.cost_price,
          lineTotal: e.cost_price,
          taxAmount: 0,
          costType: 0,
          isNew: true,
        },
      ]);
      setSelectedExpends([...selectedExpends]);
    } else Toastify('error', 'already exists in list');
  };
  const saveToCell = (params: any) => {
    const found = selectProducts.findIndex((el) => el.id === params.id);
    if (found > -1) {
      var _datas: any = selectProducts;
      _datas[found][params.field] = params.value;
      if (params.field == 'cost' || params.field == 'quantity')
        _datas[found].lineTotal =
          locationSettings?.currency_id == formObj.currency_id
            ? Number(_datas[found].cost * _datas[found].quantity).toFixed(
                locationSettings?.location_decimal_places
              )
            : Number(_datas[found].cost * formObj.currency_rate * _datas[found].quantity).toFixed(
                locationSettings?.location_decimal_places
              );

      setSelectProducts([..._datas]);
      calculationLabels(formObj.total_expense, formObj.total_tax);
    }
  };
  const sortHandler = (i: number, type: string) => {
    var _data = [...purchaseDetails];
    var _temp = _data[i].priority;
    if (type == 'd') {
      _data[i].priority = _data[i + 1].priority;
      _data[i + 1].priority = _temp;
    } else {
      _data[i].priority = _data[i - 1].priority;
      _data[i - 1].priority = _temp;
    }
    _data.sort((a: any, b: any) => (a.priority > b.priority ? 1 : -1));
    setPurchaseDetails(_data);
  };
  function getCost(cost = 0) {
    return locationSettings?.currency_code == formObj.currency_code
      ? cost
      : cost * formObj.currency_rate;
  }
  function calculationLabels(totalEpx: number, totalTax: number) {
    var _subtotal = 0;
    var _rows: any = [...selectProducts];
    _rows.map((rs: any) => (_subtotal += parseFloat(rs.lineTotal)));
    totalTax = (totalTax / 100) * _subtotal;
    _rows.map((sp: IpurchaseProductItem, i: number) => {
      var _ExpVal = ((sp.lineTotal / _subtotal) * totalEpx) / sp.quantity;
      var _TaxVal = ((sp.lineTotal / _subtotal) * totalTax) / sp.quantity;

      _rows[i].notifyExpensePrice =
        _ExpVal > 0
          ? +Number(_ExpVal + parseFloat(getCost(sp.cost).toString())).toFixed(
              locationSettings?.location_decimal_places
            )
          : 0;
      if (_ExpVal == 0 && _rows[i].costType == 1) _rows[i].costType = 0;

      _rows[i].notifyTaxPrice =
        _TaxVal > 0
          ? +Number(_TaxVal + parseFloat(getCost(sp.cost).toString())).toFixed(
              locationSettings?.location_decimal_places
            )
          : 0;
      if (_TaxVal == 0 && _rows[i].costType == 2) _rows[i].costType = 0;

      _rows[i].notifyTotalPrice = Number(
        _rows[i].notifyExpensePrice + _rows[i].notifyTaxPrice
      ).toFixed(locationSettings?.location_decimal_places);
      if (_rows[i].notifyTotalPrice == 0 && _rows[i].costType == 2) _rows[i].costType = 0;
    });
    setSelectProducts(_rows);
  }

  return (
    <>
      <AdminLayout shopId={shopId}>
        {isOpenVariationDialog && (
          <VariationModal
            selectedProductForVariation={selectedProductForVariation}
            isOpenVariationDialog={isOpenVariationDialog}
            setIsOpenVariationDialog={setIsOpenVariationDialog}
            variations={allVariations}
          />
        )}
        <ToastContainer />
        <Dialog
          open={openRemoveDialog}
          onClose={() => {
            setOpenRemoveDialog(false);
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description">
          <DialogTitle id="alert-dialog-title">Remove Product</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you Sure You Want Remove This Item ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRemoveDialog(false)}>Cancel</Button>
            <Button
              onClick={() => {
                const rows = [...selectProducts];
                const _index = rows.findIndex(
                  (it: any) =>
                    it.product_id == selecetdId.product_id &&
                    it.variation_id == selecetdId.variation_id
                );
                if (_index > -1) rows.splice(_index, 1);
                setSelectProducts(rows);
                setOpenRemoveDialog(false);
                setSelectedExpends([...selectedExpends]);
              }}>
              Yes
            </Button>
          </DialogActions>
        </Dialog>
        <div className="mb-4">
          <button
            className="btn m-btn btn-primary p-3"
            onClick={() => router.push('/shop/' + shopId + '/purchases')}>
            <FontAwesomeIcon icon={faArrowAltCircleLeft} /> Back To List{' '}
          </button>
        </div>
        {loading ? (
          <Card className="mb-4">
            <Card.Header className="p-3 bg-white">
              <h5>Loading</h5>
            </Card.Header>
          </Card>
        ) : (
          <>
            <Card className="mb-4">
              <Card.Header className="p-3 bg-white">
                <h5>{isEdit ? 'Edit Purchase ' : 'Add Purchase'}</h5>
              </Card.Header>
              <Card.Body>
                <div className="form-style2">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group2">
                        <label>
                          Supplier : <span className="text-danger">*</span>
                        </label>
                        <Select
                          styles={selectStyle}
                          options={suppliers}
                          value={suppliers.filter((sp) => sp.value == formObj.supplier_id)}
                          onChange={(itm) => {
                            setFormObj({ ...formObj, supplier_id: itm!.value });
                          }}
                        />
                        {errorForm.supplier_id && (
                          <p className="p-1 h6 text-danger ">Select a Supplier</p>
                        )}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group2">
                        <label>Reference No :</label>
                        <input
                          type="text"
                          className="form-control p-2"
                          placeholder="Reference No"
                          value={formObj.ref_no}
                          onChange={(e) => {
                            setFormObj({ ...formObj, ref_no: e.target.value });
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group2">
                        <label>Purchase Date :</label>
                        <DatePicker
                          className="form-control p-2"
                          selected={formObj.date}
                          onChange={(date: Date) => setFormObj({ ...formObj, date: date })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3" style={{ display: 'none' }}>
                      <div className="form-group">
                        <label>Document : </label>
                        <input type="file" accept="image/*" className="form-control" />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Purchase Status: <span className="text-danger">*</span>
                        </label>
                        <Select
                          styles={colourStyles}
                          options={purchaseStatus}
                          value={purchaseStatus.filter((f: any) => {
                            return f.value == formObj.purchaseStatus;
                          })}
                          onChange={(itm) => {
                            setFormObj({ ...formObj, purchaseStatus: itm!.value });
                          }}
                        />
                        {errorForm.purchaseStatus && (
                          <p className="p-1 h6 text-danger ">Select One Item</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {formObj.purchaseStatus != 'draft' && formObj.purchaseStatus != '' && (
                    <div className="row">
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>
                            Payment Status: <span className="text-danger">*</span>
                          </label>
                          <Select
                            styles={colourStyles}
                            options={paymentStatus}
                            value={paymentStatus.filter((f: any) => {
                              return f.value == formObj.paymentStatus;
                            })}
                            onChange={(itm) => {
                              setFormObj({
                                ...formObj,
                                paymentStatus: itm!.value,
                                paid_amount:
                                  itm!.value == 'paid' || itm!.value == 'credit'
                                    ? formObj.total_price
                                    : 0,
                              });
                            }}
                          />
                          {errorForm.paymentStatus && (
                            <p className="p-1 h6 text-danger ">Select One Item</p>
                          )}
                        </div>
                      </div>
                      {formObj.paymentStatus == 'partially_paid' && (
                        <div className="col-md-3">
                          <div className="form-group2">
                            <label>Paid Amount :</label>
                            <input
                              type="text"
                              className="form-control p-2"
                              placeholder="Paid Amount"
                              value={formObj.paid_amount}
                              onChange={(e) => {
                                setFormObj({ ...formObj, paid_amount: +e.target.value });
                              }}
                            />
                            {errorForm.paid && (
                              <p className="p-1 h6 text-danger ">Enter A Amount</p>
                            )}
                          </div>
                        </div>
                      )}
                      {formObj.paymentStatus != 'due' && (
                        <div className="col-md-3">
                          <div className="form-group2">
                            <label>Payment Date :</label>
                            <DatePicker
                              className="form-control p-2"
                              selected={formObj.paymentDate}
                              onChange={(date: Date) =>
                                setFormObj({ ...formObj, paymentDate: date })
                              }
                            />
                            {errorForm.paymentDate && (
                              <p className="p-1 h6 text-danger ">
                                Enter Payment Date From Calander
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="col-md-3">
                        <div className="form-group2">
                          <label>Payment Type :</label>
                          <Select
                            styles={colourStyles}
                            options={paymentTypes}
                            value={paymentTypes.filter((f: any) => {
                              return f.value == formObj.paymentType;
                            })}
                            onChange={(itm) => {
                              setFormObj({ ...formObj, paymentType: itm!.value });
                            }}
                          />
                          {errorForm.paymentType && (
                            <p className="p-1 h6 text-danger ">Select One Item</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
            <div className="row">
              <div className="col-md-3">
                <div className="form-group">
                  <Select
                    styles={selectStyle}
                    options={currencies}
                    value={currencies?.filter((f: any) => {
                      return f.value == formObj.currency_id;
                    })}
                    onChange={(itm) => {
                      setFormObj({
                        ...formObj,
                        currency_code: itm!.code,
                        currency_rate: itm!.exchange_rate,
                        currency_id: itm!.value,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="col-md-3" style={{ display: 'none' }}>
                <div className="form-group">
                  <button
                    type="button"
                    className="btn m-btn btn-primary p-2"
                    onClick={() => {
                      setVatInColumn(!vatInColumn);
                    }}>
                    {vatInColumn ? 'VAT In Table' : 'In Order Only'}
                  </button>
                </div>
              </div>
            </div>

            <Card className="mb-4">
              <Card.Header className="p-3 bg-white">
                <Select
                  formatOptionLabel={formatProductsOptions}
                  styles={colourStyles}
                  options={products}
                  onChange={(e) => addToProductQuotations(e)}
                />
                {errorForm.products && (
                  <p className="p-1 h6 text-danger ">Select One Product at Least</p>
                )}
              </Card.Header>
              <Card.Body>
                <div style={{ height: 300, width: '100%' }}>
                  <DataGrid
                    rows={selectProducts}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    onCellEditCommit={saveToCell}
                    columnVisibilityModel={{
                      vat: vatInColumn,
                    }}
                  />
                </div>
                <Grid container spacing={2} className="mt-3 d-flex justify-content-end">
                  <Grid item xs={6} textAlign="left">
                    <table className="m-table-expends">
                      <tbody>
                        <TableExpeseRows
                          rowsData={selectedExpendsEdit}
                          curencise={currencies}
                          selData={selectedExpendsEdit}
                          deleteTableRows={deleteTableRows}
                          handleChange={handleChange}
                        />
                        <TableExpeseRows
                          rowsData={expends}
                          curencise={currencies}
                          selData={selectedExpends}
                          deleteTableRows={deleteTableRows}
                          handleChange={handleChange}
                        />
                        <tr>
                          <td colSpan={3}>
                            <button
                              onClick={() => addTableRows()}
                              className="btn m-btn btn-primary p-2"
                              style={{ borderRadius: '0px' }}>
                              {' '}
                              + Add Shipping Expends
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </Grid>
                  <Grid item xs={6}>
                    <div className="purchase-items">
                      <div className="purchase-item">
                        <p className="puchase-arrow" style={{ width: '100px' }}></p>
                        <div className="purchase-text">
                          <p></p>
                          <p>
                            <Button
                              variant="outlined"
                              onClick={() => {
                                setIsEditSort(!isEditSort);
                              }}>
                              <EditIcon />
                            </Button>
                          </p>
                        </div>
                      </div>
                      <div className="purchase-item">
                        {isEditSort && <p className="puchase-arrow" style={{ width: '100px' }}></p>}
                        <div className="purchase-text">
                          <p>items</p>
                          <p>
                            {selectProducts.length}{' '}
                            <span style={{ opacity: '0.5' }}> [{total_qty}]</span>{' '}
                          </p>
                        </div>
                      </div>
                      <Divider flexItem></Divider>
                      <div className="purchase-item">
                        {isEditSort && <p className="puchase-arrow" style={{ width: '100px' }}></p>}
                        <div className="purchase-text">
                          <p>Sub Total</p>
                          <p>
                            {Number(formObj.subTotal_price).toFixed(
                              locationSettings?.location_decimal_places
                            )}{' '}
                            <span style={{ opacity: '0.5' }}>
                              {' '}
                              {locationSettings?.currency_code}
                            </span>{' '}
                          </p>
                        </div>
                      </div>
                      <Divider flexItem></Divider>
                      {purchaseDetails.map((pd: any, i: number) => {
                        return (
                          <>
                            <div key={i} className="purchase-item">
                              {isEditSort && (
                                <p className="puchase-arrow" style={{ width: '100px' }}>
                                  {isEditSort && i != 0 && (
                                    <Button variant="outlined" onClick={() => sortHandler(i, 'u')}>
                                      <KeyboardArrowUpIcon />
                                    </Button>
                                  )}
                                  {isEditSort && purchaseDetails.length - 1 != i && (
                                    <Button variant="outlined" onClick={() => sortHandler(i, 'd')}>
                                      <KeyboardArrowDownIcon />
                                    </Button>
                                  )}
                                </p>
                              )}
                              <div className="purchase-text">
                                <p>{pd.label}</p>
                                {pd.value == 'discount' && (
                                  <div className="d-flex">
                                    <div className="px-3">
                                      <Form.Select
                                        style={{ width: '130px' }}
                                        onChange={(e) => {
                                          setFormObj({ ...formObj, discount_type: e.target.value });
                                        }}>
                                        <option value={'fixed'}>Fixed</option>
                                        <option value={'percent'}>Percent %</option>
                                      </Form.Select>
                                    </div>
                                    <div>
                                      <Form.Control
                                        size="sm"
                                        type="number"
                                        min={0}
                                        value={formObj.discount_amount}
                                        onChange={(e) => {
                                          setFormObj({
                                            ...formObj,
                                            discount_amount: +e.target.value,
                                          });
                                        }}
                                      />
                                    </div>
                                    <p>&nbsp;</p>
                                    <p className="fixed-width">
                                      {formObj.total_discount.toFixed(
                                        locationSettings?.location_decimal_places
                                      )}{' '}
                                    </p>
                                  </div>
                                )}
                                {pd.value == 'expense' && (
                                  <p>
                                    {formObj.total_expense.toFixed(
                                      locationSettings?.location_decimal_places
                                    )}
                                  </p>
                                )}
                                {pd.value == 'taxes' && !vatInColumn && (
                                  <div>
                                    <table className="m-table-expends">
                                      <tbody>
                                        <TableTaxRows
                                          rowsData={selectedTaxes}
                                          curencise={currencies}
                                          deleteTableRows={deleteRowTaxes}
                                          handleChange={handlerRowTaxes}
                                        />
                                        <tr>
                                          <td colSpan={3}>
                                            <button
                                              onClick={() => addTableRows('taxes')}
                                              className="btn m-btn btn-primary p-2"
                                              style={{ borderRadius: '0px' }}>
                                              {' '}
                                              + Add Taxe(s)
                                            </button>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <p className="fixed-width">
                                      {formObj.total_tax}%(
                                      {((formObj.total_tax / 100) * formObj.subTotal_price).toFixed(
                                        locationSettings?.location_decimal_places
                                      )}
                                      )
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Divider flexItem></Divider>
                          </>
                        );
                      })}
                      <div className="purchase-item">
                        {isEditSort && <p className="puchase-arrow" style={{ width: '100px' }}></p>}
                        <div className="purchase-text">
                          <p>Total</p>
                          <p>
                            {Number(formObj.total_price).toFixed(
                              locationSettings?.location_decimal_places
                            )}
                            <span style={{ opacity: '0.5', fontSize: '10px' }}>
                              {' '}
                              {locationSettings?.currency_code}
                            </span>
                          </p>
                        </div>
                        <div className="purchase-text">
                          <p>Total Paid</p>
                          <p>
                            {formObj.paid_amount.toFixed(locationSettings?.location_decimal_places)}
                            <span style={{ opacity: '0.5', fontSize: '10px' }}>
                              {' '}
                              {locationSettings?.currency_code}
                            </span>
                          </p>
                        </div>
                        <div className="purchase-text">
                          <p>Total Remaining</p>
                          <p>
                            {(formObj.total_price - formObj.paid_amount).toFixed(
                              locationSettings?.location_decimal_places
                            )}
                            <span style={{ opacity: '0.5', fontSize: '10px' }}>
                              {' '}
                              {locationSettings?.currency_code}
                            </span>
                          </p>
                        </div>
                        {errorForm.morePaid && (
                          <p className="p-1 h6 text-danger ">Error! ,Enter Right Amount</p>
                        )}
                      </div>
                    </div>
                  </Grid>
                </Grid>
                <button
                  type="button"
                  className="btn m-btn btn-primary p-2"
                  onClick={(e) => {
                    e.preventDefault();
                    errors = [];
                    if (formObj.supplier_id == 0) errors.push('error');
                    if (selectProducts.length == 0) errors.push('error');
                    if (formObj.purchaseStatus.length <= 2) errors.push('error');
                    if (formObj.purchaseStatus != 'draft') {
                      if (formObj.paymentStatus.length <= 2) errors.push('error');
                      if ((formObj.paymentDate + '').length <= 2) errors.push('error2');
                      if (formObj.paymentType.length <= 2) errors.push('error');
                    }
                    if (formObj.paymentStatus == 'partially_paid' && formObj.paid_amount < 0.5)
                      errors.push('error');

                    setErrorForm({
                      ...errorForm,
                      supplier_id: formObj.supplier_id == 0,
                      purchaseStatus: formObj.purchaseStatus.length <= 2,
                      paymentDate: (formObj.paymentDate + '').length <= 2,
                      paymentStatus: formObj.paymentStatus.length <= 2,
                      paymentType: formObj.paymentType.length <= 2,
                      products: selectProducts.length == 0,
                      paid: formObj.paymentStatus == 'partially_paid' && formObj.paid_amount < 0.5,
                      morePaid: formObj.paid_amount > formObj.total_price,
                    });

                    if (errors.length == 0) {
                      if (isEdit) editPurchase();
                      else insertPurchase();
                    } else Toastify('error', 'Enter Requires Field');
                  }}>
                  {isEdit ? 'Edit' : 'Save'}
                </button>
              </Card.Body>
            </Card>
          </>
        )}
      </AdminLayout>
    </>
  );
};
export default withAuth(AddPurchase);
