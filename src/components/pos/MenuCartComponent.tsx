import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useRecoilState } from 'recoil';
import { UserContext } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import { ProductContext } from '../../context/ProductContext';
import { finalCalculation } from '../../libs/calculationTax';
import { apiFetchCtr } from '../../libs/dbUtils';
import {
  IHoldItems,
  IOrderMiniDetails,
  IPackItem,
  IQuantity,
  ITax,
  Icustom,
  IproductInfo,
  IreadyGroupTax,
} from '../../models/common-model';
import { cartJobType, clearOrders, productDetails } from '../../recoil/atoms';
import Customermodal from './modals/CustomerModal';
import TailoringModal from './modals/TailoringModal';
import VariationModal from './modals/VariationModal';
import { MenuOrdersFooter } from './utils/MenuOrdersFooter';
import { OrderCalcs } from './utils/OrderCalcs';

export const MenuOrderComponent = (props: any) => {
  const { shopId } = props;
  const { products, customers, taxes, taxGroups, variations, packageItems } =
    useContext(ProductContext);
  const { locationSettings, tailoringSizes, invoicDetails, tailoringExtras } =
    useContext(UserContext);
  const [productsItems, SetProductsItems] = useState([]);
  const [quantity, setQuantity] = useState<IQuantity[]>([]);
  const [quantityPush, setQuantityPush] = useState<IQuantity[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [orders, setOrders] = useState<IproductInfo[]>([]);
  const [ordersPush, setOrdersPush] = useState<IproductInfo[]>([]);
  const [readyTaxGroup, setReadyTaxGroup] = useState<IreadyGroupTax[]>([]);
  const [totalAmount, setTotal] = useState<number>(0);
  const [subTotal, setSubTotal] = useState<number>(0);
  const [showType, setShowType] = useState(String);
  const [isOpenVariationDialog, setIsOpenVariationDialog] = useState(false);
  const [isOpenTailoringDialog, setIsOpenTailoringDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number>(-1);
  const [selectedProductForVariation, setSelectedProductForVariation] = useState<{
    product?: object;
    product_id: number;
    product_name: string;
    is_service: number;
    tailoring_id?: number;
    value?: string;
    tailoring_cart_index?: number;
    tailoringCustom?: Icustom;
  }>({ product_id: 0, product_name: '', is_service: 0, value: '' });
  const [selectedHold, setSelectedHold] = useState<{ holdId: number }>({ holdId: -1 });
  const [isOrderEdit, setIsOrderEdit] = useState<number>(0);
  const [orderEditDetails, setOrderEditDetails] = useState<IOrderMiniDetails>({
    isEdit: false,
    name: '',
    total_price: 0,
    orderId: 0,
  });
  const [shippingRate] = useState<number>(0);
  const [customerIsModal, setCustomerIsModal] = useState<boolean>(false);
  const [customer, setCustomer] = useState<{ value: string; label: string; isNew: boolean }>({
    value: '1',
    label: 'walk-in customer',
    isNew: false,
  });
  const [product, setProducInfo] = useRecoilState(productDetails);
  const [clearEvent, setClear] = useRecoilState(clearOrders);
  const [jobType, setJobType] = useRecoilState(cartJobType);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [orderId, setOrderId] = useState<number>(0);
  const [isLinking, setIsLinking] = useState<boolean>(false);
  const [isEnableLink, setIsEnableLink] = useState<boolean>(false);
  const [allowWork, setAllowWork] = useState<boolean>(false);
  const [orderNote, setOrderNote] = useState<string>('');
  const router = useRouter();
  const [colors, setColors] = useState<any>({
    '0': 'white',
    '1': 'red',
    '2': 'green',
    '3': 'blue',
    '4': 'yellow',
    '5': 'gray',
  });
  const [defTaxGroup, setDefTaxGroup] = useState<IreadyGroupTax>({
    primary: 0,
    nonPrimary: 0,
    excises: 0,
    serviesFixed: 0,
    servicesPercentage: 0,
  });
  const selectStyle = {
    control: (style: any) => ({
      ...style,
      fontSize: '12px',
      border: '1px solid #efefef',
      borderRadius: '12px',
    }),
  };

  async function getOrderForEdit(barCodeId: number | string) {
    var hasTailFabs = 0;
    var result = await apiFetchCtr({ fetch: 'pos', subType: 'getLastOrders', barCodeId, shopId });
    if (result.success) {
      ClearOrders();
      const _orders: IproductInfo[] = [];
      const _quantity: IQuantity[] = [];
      if (result.newdata.length > 0)
        setOrderEditDetails({
          isEdit: true,
          name: result.newdata[0].contact_name,
          total_price: result.newdata[0].total_price,
          orderId: 0,
          notes: result.newdata[0].notes,
        });

      result.newdata.map((itm: any) => {
        _orders.push({
          isEdit: true,
          transaction_id: itm.id,
          items: {},
          type: itm.type,
          total_qty: itm.qty,
          quantity2: 0,
          product_id: itm.product_id,
          variation_id: itm.variation_id,
          name: itm.name,
          price: itm.price,
          is_service: itm.is_service,
          is_fabric: itm.is_fabric,
          def_tax: true,
          category_tax: 0,
          brand_tax: 0,
          never_tax: 0,
          product_tax: 0,
          is_tailoring: itm.is_tailoring,
        });
        if (itm.tailoring_link_num > 0) hasTailFabs++;
        _quantity.push({
          freezeQuantity: parseFloat(itm.qty),
          freezeTaxAmount: parseFloat(itm.tax_amount),
          freezeTailoringCutsom: JSON.parse(itm.tailoring_custom),
          quantity: parseFloat(itm.qty),
          productIndex: -1,
          itemIndex: 0,
          prices: [{ stock_id: itm.stock_id, qty: itm.qty, price: itm.price, cost: 0 }],
          lineTotalPrice: itm.price,
          taxAmount: 0,
          tailoring: itm.tailoring_txt,
          tailoringCutsom: JSON.parse(itm.tailoring_custom),
          selectionColor: itm.tailoring_link_num,
        });
      });
      setOrders(_orders);
      setQuantity(_quantity);
      setIsOrderEdit(Number(barCodeId));
      if (hasTailFabs > 1) setIsEnableLink(true);
    }
  }
  const perperdForPrint = () => {
    let _items: any = [],
      totalTax = 0;
    if (quantity.length == 0 || quantity.length != orders.length) return;

    quantity.map((qt: any, i: number) => {
      // qt.taxAmount
      let _temp: any = [],
        _subPrice: any = [];
      qt.prices.map((rs: any) => {
        if (orders[i].isEdit) {
          _subPrice.push({ price: rs.price, qty: qt.quantity });
        } else if (!_temp.includes(rs.price)) {
          _temp.push(rs.price);
          _subPrice.push({ price: rs.price, qty: rs.qty });
        }
      });
      totalTax += parseFloat(qt.taxAmount);
      _items.push({ prices: _subPrice, taxAmount: qt.taxAmount, name: orders[i].name });
    });
    // ClearOrders()
    let counter = 0;
    return _items.map((_it: any, i: number) => {
      return _it.prices.map((rs: any) => {
        counter++;
        return (
          <tr key={counter}>
            <td>{rs.qty}</td>
            <td>{_it.name}</td>
            <th></th>
            <td>{Number(rs.price).toFixed(locationSettings?.location_decimal_places)}</td>
          </tr>
        );
      });
    });
  };
  let timeoutId,
    _id = '';
  useEffect(() => {
    ClearOrders();
    setTimeout(() => {
      setAllowWork(true);
    }, 600);
  }, [router.asPath]);

  // start recipt template
  const componentRef = React.useRef(null);
  class ComponentToPrint extends React.PureComponent {
    render() {
      return (
        <div className="bill">
          <div className="brand-logo">
            <img src={invoicDetails.logo} />
          </div>
          <br />
          <div className="brand-name">{invoicDetails.name}</div>
          <div className="shop-details">{invoicDetails.tell}</div>
          <br />
          <div className="bill-details">
            <div className="flex justify-between">
              <div>
                {invoicDetails.txtCustomer}{' '}
                {invoicDetails.isMultiLang && invoicDetails.txtCustomer2}
              </div>
              <div>{customer.label}</div>
            </div>
            <div className="flex justify-between">
              <div>
                {invoicDetails.orderNo} {invoicDetails.isMultiLang && invoicDetails.orderNo2}
              </div>
              <div>{orderId}</div>
            </div>
            <div className="flex justify-between">
              <div>
                {invoicDetails.txtDate} {invoicDetails.isMultiLang && invoicDetails.txtDate2}
              </div>
              <div>{new Date().toISOString().slice(0, 10)}</div>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr className="header">
                <th>
                  {invoicDetails.txtQty}
                  <br />
                  {invoicDetails.isMultiLang && invoicDetails.txtQty2}
                </th>
                <th>
                  {invoicDetails.txtItem}
                  <br />
                  {invoicDetails.isMultiLang && invoicDetails.txtItem2}
                </th>
                <th></th>
                <th>
                  {invoicDetails.txtAmount}
                  <br />
                  {invoicDetails.isMultiLang && invoicDetails.txtAmount2}
                </th>
              </tr>
              {perperdForPrint()}
              <tr className="net-amount">
                <td></td>
                <td>
                  {invoicDetails.txtTax} {invoicDetails.isMultiLang && invoicDetails.txtTax2}
                </td>
                <td></td>
                <td>
                  {(totalAmount - subTotal).toFixed(locationSettings?.location_decimal_places)}
                </td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className="txt-bold">
                  {invoicDetails.txtTotal} {invoicDetails.isMultiLang && invoicDetails.txtTotal2}
                </td>
                <td></td>
                <td className="txt-bold">
                  {Number(totalAmount).toFixed(locationSettings?.location_decimal_places)}
                </td>
              </tr>
            </thead>
          </table>
          <p className="recipt-footer">
            {invoicDetails.footer}
            {invoicDetails.isMultiLang && invoicDetails.footer2}
          </p>
          <p className="recipt-footer">{orderNote}</p>
          <br />
        </div>
      );
    }
  }
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  function checkProductQtyinPackagesItems(
    qty: number,
    _product_id: number,
    _total_qty: number
  ): boolean {
    let isAllowed = true;
    orders.map((or, index: number) => {
      if (or.type == 'package') {
        var ids = packageItems
          .filter((pi: IPackItem) => pi.parent_id == or.product_id)
          .map((tm: any) => {
            return tm.product_id;
          });
        var packageProducts: IproductInfo[] = products.filter((pro: IproductInfo) =>
          ids.includes(pro.product_id)
        );
        packageProducts.map((pp) => {
          if (!pp.is_service && !pp.sell_over_stock && pp.product_id == _product_id) {
            if (quantity[index].quantity + qty > _total_qty) {
              isAllowed = false;
              return;
            }
          }
        });
      }
    });
    return isAllowed;
  }
  function addToCard(fromHold: boolean, index1: number, index2: number) {
    if (index1 != -1) {
      let _product_id = products[index1].product_id;
      let _total_qty = products[index1].total_qty;
      //search into Orders and add to card
      let tmpOrders: IproductInfo[] = [...orders];
      let idx: number = 0;
      idx = orders.findIndex((el: any) => {
        return (
          (el.isEdit && el.quantity2 < 0 && el.product_id == _product_id) ||
          (!el.isEdit && el.product_id == _product_id)
        );
      });
      let qty = 1;
      if (idx > -1) {
        if (quantity.length != orders.length) {
          setProducInfo({ product_id: false });
          ClearOrders();
          return;
        }
        qty += quantity[idx].quantity;
      }
      //check selected product in packages only for quantity check
      if (!checkProductQtyinPackagesItems(qty, _product_id, _total_qty)) {
        Toastify('error', 'Out of stock!');
        return;
      }
      if (idx == -1 || fromHold) {
        let itm: any = products[index1][index2];

        ordersPush.push(itm);
        setOrders([...tmpOrders, itm]);
        let _quantity = [...quantity];

        if (itm.qty == 0 && itm.sell_over_stock == 1) {
          let _itm2 = {
            freezeQuantity: 0,
            quantity: 1,
            productIndex: index1,
            itemIndex: index2,
            prices: [{ stock_id: 0, qty: 1, price: itm.product_price, cost: itm.product_cost }],
            lineTotalPrice: itm.price,
            taxAmount: 0,
          };
          _quantity.push(_itm2);
          quantityPush.push(_itm2);
        } else {
          let _itm2 = {
            freezeQuantity: 0,
            quantity: 1,
            productIndex: index1,
            itemIndex: index2,
            prices: [{ stock_id: itm.stock_id, qty: 1, price: itm.price, cost: itm.cost }],
            lineTotalPrice: itm.price,
            taxAmount: 0,
          };
          _quantity.push(_itm2);
          quantityPush.push(_itm2);
        }
        setQuantity(_quantity);
      } else quantityChange(idx, 'plus');
    }
  }
  function addVarToCard(
    index1: number,
    index2: number,
    _variation_id: number | string,
    product_name = null
  ) {
    var index1 = -1,
      index2 = -1;
    variations.variations_multi.map((varItm: IproductInfo[], index: number) => {
      if (index2 == -1) {
        index1 = index;
        index2 = varItm.findIndex((itm: any) => {
          return itm.variation_id == _variation_id;
        });
      }
    });
    if (index1 != -1 && index2 != -1) {
      //search into Orders and add to card
      let tmpOrders: IproductInfo[] = [...orders];
      const idx = orders.findIndex((el: any) => {
        return (
          (el.isEdit && el.quantity2 < 0 && el.variation_id == _variation_id) ||
          (!el.isEdit && el.variation_id == _variation_id)
        );
      });
      if (idx == -1) {
        var _itm: any = variations.variations_multi[index1][index2];

        if (product.sell_over_stock == 0 && _itm.qty == 0) {
          Toastify('error', 'Out OF Stock');
          return;
        }
        const _ord = {
          ..._itm,
          name:
            product_name == null
              ? selectedProductForVariation.product_name + ' - ' + _itm.name
              : product_name + ' - ' + _itm.name,
        };
        ordersPush.push(_ord);
        setOrders([...tmpOrders, _ord]);
        let _quantity = [...quantity];
        const _quu = {
          freezeQuantity: 0,
          quantity: 1,
          productIndex: index1,
          itemIndex: index2,
          prices: [
            {
              stock_id: _itm.stock_id,
              qty: 1,
              price: _itm.stock_id > 0 ? _itm.price : _itm.variation_price,
              cost: _itm.stock_id > 0 ? _itm.cost : _itm.variation_cost,
            },
          ],
          lineTotalPrice: 0,
          taxAmount: 0,
        };
        _quantity.push(_quu);
        quantityPush.push(_quu);
        setQuantity(_quantity);
      } else quantityChange(idx, 'plus');
    }
  }
  useEffect(() => {
    if (orderId > 0) {
      handlePrint();
      setTimeout(() => {
        setOrderId(0);
        ClearOrders();
      }, 4000);
    }
  }, [orderId]);

  async function displayOrders() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    setSelectedHold({ holdId: Number(jobType.val2) });
    const _orders: IHoldItems[] = JSON.parse(jobType.val);
    let index1 = -1,
      index2 = -1;
    for (let i = 0; i < _orders.length; i++) {
      index1 = -1;
      index2 = -1;
      products.map((topPro: IproductInfo[], index: number) => {
        if (index2 == -1) {
          index1 = index;
          index2 = topPro.findIndex((itm: IproductInfo) => {
            return itm.product_id == _orders[i].product_id;
          });
        }
      });
      if (index1 != -1) {
        let _itm: any = products[index1];
        //when is tailoring
        if (_itm.is_tailoring > 0 || _itm.type == 'tailoring_package') {
          ordersPush.push(products[index1][index2]);
          quantityPush.push({
            freezeQuantity: 0,
            quantity: 1,
            productIndex: index1,
            itemIndex: index2,
            prices: [{ stock_id: 0, qty: 1, price: _itm.price, cost: _itm.cost }],
            lineTotalPrice: _itm.price,
            taxAmount: 0,
            tailoring: _orders[i].tailoring,
            tailoringCutsom: _orders[i].tailoringCutsom,
          });
        } else if (_orders[i].variation_id > 0) {
          //when variation
          addVarToCard(index1, index2, _orders[i].variation_id, _itm.name);
        } else if (_orders[i].type == 'single' || _orders[i].type == 'package') {
          //when is single
          addToCard(true, index1, index2);
        }
      } else {
      }
    }
    setQuantity([...quantityPush]);
    setOrders([...ordersPush]);
    setTimeout(() => {
      setOrdersPush([]);
      setQuantityPush([]);
    }, 200);
  }
  // end recipt
  useEffect(() => {
    if (jobType.req == 1) {
      const random = Math.random();
      setClear(random);
      displayOrders();
    } else if (jobType.req == 2) {
      setOrderEditDetails({ ...orderEditDetails, orderId: Number(jobType.val2!) });
      setOrderId(Number(jobType.val2));
      setOrderNote(jobType.val);
      setJobType({ req: 102, val: 'reload' });
      //
    } else if (jobType.req == 3) {
      //get Order For Edit
      setCustomer({ value: '1', label: 'walk-in customer', isNew: false });
      getOrderForEdit(jobType.val!);
    } else if (jobType.req == 4) {
      //For Variation Modal
      addVarToCard(0, 0, jobType.val, null);
    } else if (jobType.req == 5) {
      //for tailoring modal
      var index1 = -1,
        index2 = -1;
      products.map((topPro: IproductInfo[], index: number) => {
        if (index2 == -1) {
          index1 = index;
          index2 = topPro.findIndex((itm: IproductInfo) => {
            return itm.product_id == product.product_id;
          });
        }
      });
      if (index1 == -1) return;

      let f_length = 0;
      //get fabric pricess
      if (jobType.custom?.isPackage) {
        let f_index1 = -1,
          f_index2 = -1,
          f_id = jobType.custom?.fabric_id;
        f_length = jobType.custom?.fabric_length!;
        products.forEach((topPro: IproductInfo[], index: number) => {
          if (f_index2 == -1) {
            f_index1 = index;
            f_index2 = topPro.findIndex((itm: IproductInfo) => {
              return itm.product_id == f_id;
            });
          }
        });
        if (f_index1 == -1) return;
        let _theFab: IproductInfo = products[f_index1];
        if (!_theFab.sell_over_stock && (_theFab.total_qty == 0 || f_length > _theFab.total_qty)) {
          Toastify('error', 'The Selected Fabric Is Out Of Stock');
          return;
        }
      }

      let _quantity = [...quantity];
      //jobType.val2 => index in cart
      if (jobType.val2 != undefined && parseInt(jobType.val2!) != -1) {
        //for edit
        let _price = jobType.custom!.isPackage! ? jobType.custom!.price! : product.price;
        _quantity[parseInt(jobType.val2)].tailoring = jobType.val;
        _quantity[parseInt(jobType.val2)].tailoringIsEdit = jobType.val3;
        _quantity[parseInt(jobType.val2)].prices = [
          {
            stock_id: 0,
            qty: _quantity[parseInt(jobType.val2)].quantity,
            price: _price,
            cost: product.cost,
          },
        ];
        // _quantity[parseInt(jobType.val2)].lineTotalPrice = _price * _quantity[parseInt(jobType.val2)].quantity,
        _quantity[parseInt(jobType.val2)].tailoringCutsom = {
          fabric_id: jobType.custom?.fabric_id,
          fabric_length: jobType.custom?.fabric_length!,
          multiple: jobType.custom?.multiple,
          prices: [],
          notes: jobType.custom.notes,
          extras: jobType.custom.extras,
        };
        setQuantity(_quantity);
        calculateTotol();
      } else {
        //for new add
        let _data = JSON.parse(jobType.val!)[0];
        let _tailoringName = _data[_data.length - 1].value;
        let tmpOrders: IproductInfo[] = [...orders];
        let _price = jobType.custom!.isPackage! ? jobType.custom!.price! : product.price;

        setOrders([...tmpOrders, { ...product, name: product.name, price: _price }]);
        _quantity.push({
          freezeQuantity: 0,
          quantity: 1,
          productIndex: index1,
          itemIndex: index2,
          prices: [{ stock_id: 0, qty: 1, price: _price, cost: product.cost }],
          lineTotalPrice: 0,
          taxAmount: 0,
          tailoring: jobType.val,
          tailoringName: _tailoringName,
          tailoringIsEdit: jobType.val3,
          tailoringCutsom: {
            fabric_length: jobType.custom?.fabric_length!,
            fabric_id: jobType.custom?.fabric_id,
            multiple: jobType.custom?.multiple,
            prices: [],
            notes: jobType.custom.notes,
            extras: jobType.custom.extras,
          },
        });
        setQuantity(_quantity);
      }
      setJobType({ req: -1, val: 'reset' });
    } else if (jobType.req == 6) {
      setOrdersPush([]);
      setQuantityPush([]);
    }
  }, [jobType]);
  const ClearOrders = () => {
    setOrderEditDetails({ ...orderEditDetails, isEdit: false, total_price: 0 });
    setOrders([]);
    setQuantity([]);
    setIsOrderEdit(0);
    setTotal(0);
    setOrderId(0);
    setOrdersPush([]);
    setQuantityPush([]);
    setProducInfo({ product_id: false });
    setSelectedHold({ holdId: -1 });
    _id = '';
    setJobType({ req: -1, val: 'reset' });
  };
  useEffect(() => {
    ClearOrders();
  }, [clearEvent]);
  //Clear On Refresh
  useEffect(() => {
    ClearOrders();
    setCustomer({ value: '1', label: 'walk-in customer', isNew: false });
    setIsOrderEdit(0);
    setOrders([]);
    setQuantity([]);
  }, []);
  useEffect(() => {
    let _none = 0,
      _primary = 0,
      _excises = 0,
      _servies_percetage = 0,
      _servies_fixed = 0;

    // @ts-ignore
    taxes.forEach((tx: ITax, _idx: number) => {
      if (tx.tax_type == 'primary' && tx.is_primary) _primary += tx.amount;
      else if (tx.tax_type == 'primary') _none += tx.amount;
      else if (tx.tax_type == 'excise') _excises += tx.amount;
      else if (tx.tax_type == 'service' && tx.type == 'percentage') _servies_percetage += tx.amount;
      else if (tx.tax_type == 'service' && tx.type == 'fixed') _servies_fixed += tx.amount;
    });
    setDefTaxGroup({
      primary: _primary / 100,
      nonPrimary: _none / 100,
      excises: _excises / 100,
      serviesFixed: _servies_fixed,
      servicesPercentage: _servies_percetage / 100,
    });
    setTaxRate(_primary + _none + _excises + _servies_percetage);
    setReadyTaxGroup(taxGroups);
    if (invoicDetails != null) {
      console.log(invoicDetails);
    } else {
      console.log('is null def invoice ', invoicDetails);
    }
  }, [taxes]);
  function checkPackageItemsHasStock(orderQty: number) {
    var ids = packageItems
      .filter((pi: IPackItem) => pi.parent_id == product.product_id)
      .map((itm: any) => {
        return itm.product_id;
      });
    var packageProducts: IproductInfo[] = products.filter((pro: IproductInfo) =>
      ids.includes(pro.product_id)
    );
    let hasStock = true;
    packageProducts.map((pp) => {
      if (!pp.is_service && pp.total_qty == 0 && !pp.sell_over_stock) hasStock = false;
      else if (!pp.is_service && orderQty > pp.total_qty && !pp.sell_over_stock) hasStock = false;
      if (hasStock && !pp.is_service && !pp.sell_over_stock) {
        orders.map((or, index: number) => {
          if (or.product_id == pp.product_id) {
            var _item: any = products[quantity[index].productIndex];
            if (quantity[index].quantity + orderQty > _item.total_qty) hasStock = false;
            else {
              console.log('hast ', quantity[index]);
            }
          }
        });
      }
    });
    if (!hasStock) {
      Toastify('error', 'One of items is out of stock!');
      return;
    }
    // packagePrices.push(inenerPackagePrices)
    // console.log(packagePrices);

    // let tmpOrders: IproductInfo[] = [...orders];
    // const idx = orders.findIndex((el: any) => { return el.product_id == product.product_id })

    // if (idx == -1) {
    //   let itm: any = products.products_multi[index1][index2];
    //   setOrders([...tmpOrders, itm]);
    //   let _quantity = [...quantity];
    //   _quantity.push({ quantity: 1, productIndex: index1, itemIndex: index2, prices: [{ stock_id: 0, qty: 1, price: itm.product_price, cost: itm.cost, packs: inenerPackagePrices }], lineTotalPrice: itm.price });
    //   setQuantity(_quantity);
    // } else
    //   quantityChange(idx, 'plus')

    return true;
  }
  useEffect(() => {
    if (!allowWork) return;
    if (!product.product_id) return;
    if (product.type == 'single' && product.is_tailoring > 0) {
      //only tailoring service
      setSelectedProductForVariation({
        product_id: product.product_id,
        product_name: product.name,
        is_service: product.is_service,
        tailoring_id: product.is_tailoring,
        value: '',
        tailoring_cart_index: 0,
      });
      setIsOpenTailoringDialog(true);
      return;
    } else if (product.type == 'variable') {
      setSelectedProductForVariation({
        product_id: product.product_id,
        product_name: product.name,
        is_service: product.is_service,
      });
      setIsOpenVariationDialog(true);
      return;
    } else if (
      product.is_service == 0 &&
      product.type != 'package' &&
      product.type != 'tailoring_package' &&
      parseFloat(product.total_qty) == 0 &&
      product.sell_over_stock == 0
    ) {
      Toastify('error', 'Out Of Stock');
      return;
    }

    //get all pricess of selected product
    var index1 = -1,
      index2 = -1;
    products.map((topPro: IproductInfo[], index: number) => {
      if (index2 == -1) {
        index1 = index;
        index2 = topPro.findIndex((itm: IproductInfo) => {
          return itm.product_id == product.product_id;
        });
      }
    });
    if (product.type == 'package' && !checkPackageItemsHasStock(1)) return;
    if (product.type == 'tailoring_package') {
      //tailoring_package
      setSelectedProductForVariation({
        product: products[index1][index2],
        product_id: product.product_id,
        product_name: product.name,
        is_service: product.is_service,
        tailoring_id: product.is_tailoring,
        value: '',
        tailoring_cart_index: 0,
      });
      setIsOpenTailoringDialog(true);
      return;
    }
    console.log('foundt ', products[index1][index2]);
    addToCard(false, index1, index2);
  }, [product]);
  //calculate tax..
  useEffect(() => {
    setOrdersPush([]);
    setQuantityPush([]);
    calculateTotol();
  }, [orders]);
  //choose customer
  useEffect(() => {
    console.log(customer);
    if (customer?.isNew) setCustomerIsModal(true);
  }, [customer]);

  const calculateTotol = () => {
    setProducInfo({ product_id: false });
    if (orders.length != quantity.length) return;
    let _quantity = [...quantity];
    let totalWithoutTax: number = 0,
      _taxAmount = 0;
    let subItemTotal = 0,
      _subTotal = 0,
      taxPerItem = 0;
    let hasTailFabs = 0;
    orders.map((pro, idx) => {
      console.log(pro.isEdit, pro.quantity2);
      subItemTotal = 0;
      if (pro.isEdit && quantity[idx].freezeQuantity <= 0) return null;
      if (pro.is_fabric == 1 || pro.is_tailoring! > 0) hasTailFabs++;
      if (pro.isEdit) {
        quantity[idx].prices.map((pr) => (subItemTotal += pr.price * quantity[idx].quantity));
        taxPerItem = quantity[idx].freezeTaxAmount! / quantity[idx].freezeQuantity;
      } else quantity[idx].prices.map((pr) => (subItemTotal += pr.price * pr.qty));

      _quantity[idx].lineTotalPrice = subItemTotal;

      _taxAmount = 0;

      if (!pro.isEdit) {
        if (pro.never_tax == 0) {
          if (pro.def_tax) _taxAmount = finalCalculation(defTaxGroup, subItemTotal);
          else if (pro.product_tax > 0)
            _taxAmount = finalCalculation(readyTaxGroup[pro.product_tax], subItemTotal);
          else if (pro.brand_tax > 0)
            _taxAmount = finalCalculation(readyTaxGroup[pro.brand_tax], subItemTotal);
          else if (pro.category_tax > 0)
            _taxAmount = finalCalculation(readyTaxGroup[pro.category_tax], subItemTotal);
          else _taxAmount = subItemTotal;
        } else _taxAmount = subItemTotal;
      } else {
        _taxAmount = taxPerItem * quantity[idx].quantity + subItemTotal;
        console.log(
          'new tax ',
          taxPerItem,
          quantity[idx].quantity,
          ' result ',
          taxPerItem * quantity[idx].quantity
        );
      }

      totalWithoutTax += subItemTotal;
      _subTotal += _taxAmount;

      _quantity[idx].taxAmount = _taxAmount - subItemTotal;
    });

    if (hasTailFabs > 1) setIsEnableLink(true);
    else {
      setIsEnableLink(false);
      setIsLinking(false);
    }
    setQuantity(_quantity);
    setTotal(_subTotal);
    setSubTotal(totalWithoutTax);
  };
  const quantityChange = (index: number, type?: string, qt = 1, byHand = false): void => {
    let _quantity = [...quantity];
    let _orders = [...orders];
    if (type === 'plus') {
      if (!byHand) qt += quantity[index].quantity; //+ qt

      if (_orders[index].isEdit) {
        if (_quantity[index].quantity == _quantity[index].freezeQuantity) {
          Toastify('info', 'Add item(s) from Right Panel Or Barcod');
          return;
        }
        _quantity[index].quantity = qt;
        _orders[index].quantity2! = qt;
        setQuantity(_quantity);
        setOrders(_orders);
        calculateTotol();
        return;
      }

      const _pro: any =
        _orders[index].variation_id! > 0
          ? variations.variations[_quantity[index].productIndex]
          : products[_quantity[index].productIndex];
      console.log('_pro', _pro);

      //get packages only for quantity check
      if (!checkProductQtyinPackagesItems(qt, _orders[index].product_id!, _pro.total_qty)) {
        Toastify('error', 'Out of stock!');
        return;
      }

      //Check Package Items If Has Stock
      if (_pro.type == 'package') {
        console.log('injaaaa', qt, _pro);

        if (checkPackageItemsHasStock(qt)) {
          _quantity[index].quantity = qt;
          _quantity[index].prices[0].qty = qt;
          calculateTotol();
        } else return;
      } else if (_orders[index].is_tailoring! > 0 || _orders[index].type == 'tailoring_package') {
        //if is tailoring
        _quantity[index].quantity = qt;
        _quantity[index].prices[0].qty = qt;
        calculateTotol();
      } else if (_orders[index].is_service) {
        //is service
        _quantity[index].quantity = qt;
        _quantity[index].prices[0].qty = qt;
        calculateTotol();
      } else if (_orders[index].qty == 0 && _orders[index].sell_over_stock) {
        //if able sell over stock
        _quantity[index].quantity = qt;
        _quantity[index].prices[0].qty = qt;
        calculateTotol();
      } else {
        //if has quantity already
        let thePrices: any[];
        const isVar = _orders[index].variation_id! > 0;
        console.log('isVar ', isVar);

        if (isVar)
          thePrices = JSON.parse(
            JSON.stringify(variations.variations_multi[_quantity[index].productIndex])
          );
        else thePrices = JSON.parse(JSON.stringify(products[_quantity[index].productIndex]));

        let qtyToAllocate = qt;
        console.log('start for ', qtyToAllocate);

        _quantity[index].prices = [];

        for (let i = 0; i < thePrices.length && qtyToAllocate > 0; i++) {
          const stockItem = thePrices[i];
          if (stockItem.qty >= qtyToAllocate) {
            // Allocate full quantity from this stock item
            stockItem.qty -= qtyToAllocate;
            if (_quantity[index].prices.length > i) _quantity[index].prices[i].qty = qtyToAllocate;
            else
              _quantity[index].prices.push({
                stock_id: stockItem.stock_id,
                qty: qtyToAllocate,
                price: stockItem.price,
                cost: stockItem.cost,
              });

            qtyToAllocate = 0;
            console.log('from here');
          } else {
            console.log('from here 2');
            // Allocate partial quantity from this stock item
            qtyToAllocate -= stockItem.qty;
            if (_quantity[index].prices.length > i) _quantity[index].prices[i].qty = stockItem.qty;
            else
              _quantity[index].prices.push({
                stock_id: stockItem.stock_id,
                qty: stockItem.qty,
                price: stockItem.price,
                cost: stockItem.cost,
              });

            stockItem.qty = 0;
          }
        }
        _quantity[index].quantity = qt;
        console.log('end ', qtyToAllocate);
        //is over selling
        if (qtyToAllocate > 0.5 && _orders[index].sell_over_stock!) {
          if (_quantity[index].prices[_quantity[index].prices.length - 1].stock_id != 0) {
            console.log(_quantity[index].itemIndex);
            _quantity[index].prices.push({
              stock_id: 0,
              qty: qtyToAllocate,
              price: isVar ? _pro.variation_price! : _pro.product_price,
              cost: isVar ? _pro.variation_cost! : _pro.product_cost!,
            });
          } else _quantity[index].prices[_quantity[index].prices.length - 1].qty = qt;
        } else if (qtyToAllocate > 0.5) {
          _quantity[index].quantity -= qtyToAllocate;
          Toastify('error', 'Out Of Stock');
        }
        //
        _quantity[index].itemIndex = _quantity[index].prices.length - 1;
        calculateTotol();
      }
      setQuantity(_quantity);
      return;
    } else {
      if (quantity[index].freezeQuantity >= quantity[index].quantity) {
        console.log('when is edit');
        if (quantity[index].quantity == 0) {
          Toastify('warning', 'this item its Full Returned!!');
          return;
        }
        _quantity[index].quantity = _quantity[index].quantity! - 1;
        _orders[index].quantity2 = _quantity[index].quantity - quantity[index].freezeQuantity;
        setQuantity(_quantity);
        setOrders(_orders);
        calculateTotol();
      } else if (
        _quantity[index].quantity > 1 ||
        (orders[index].isEdit && _quantity[index].quantity > 0)
      ) {
        console.log('when is nott edit');
        _quantity[index].quantity = _quantity[index].quantity! - 1;
        // if (orders[index].isEdit) _orders[index].quantity2 = _quantity[index].quantity - orders[index].quantity!
        var _quans = _quantity[index].prices.reverse();
        console.log(_quans[0]);
        if (_quans[0].qty == 1) {
          _quans.splice(0, 1);
          _quantity[index].itemIndex--;
        } else _quans[0].qty -= 1;
        _quantity[index].prices = _quans.reverse();
        setQuantity(_quantity);
        calculateTotol();
        return;
      }

      if (quantity[index].quantity === 1) {
        let _quantity = [...quantity];
        if (!orders[index].isEdit) {
          _orders.splice(index, 1);
          _quantity.splice(index, 1);
          setOrders(_orders);
          setQuantity(_quantity);
        }
      }
    }
  };
  const customerModalHandler = (status: any) => {
    setCustomerIsModal(false);
  };
  const handleEditTailoring = (idx: number) => {
    if (quantity[idx].productIndex == -1) {
      var index1 = -1,
        index2 = -1;
      products.map((topPro: IproductInfo[], index: number) => {
        if (index2 == -1) {
          index1 = index;
          index2 = topPro.findIndex((itm: IproductInfo) => {
            return itm.product_id == orders[idx].product_id;
          });
        }
      });
      if (index1 == -1) {
        Toastify('error', 'Product not Found...');
        return;
      }
      quantity[idx].productIndex = index1;
      quantity[idx].itemIndex = index2;
    }
    let _item: any = products[quantity[idx].productIndex][quantity[idx].itemIndex];
    setSelectedProductForVariation({
      tailoringCustom: {
        fabric_id: quantity[idx].tailoringCutsom?.fabric_id,
        multiple: quantity[idx].tailoringCutsom?.multiple,
        notes: quantity[idx].tailoringCutsom.notes,
        extras: quantity[idx].tailoringCutsom.extras,
      },
      // product: products.products_multi[quantity[index].productIndex][quantity[index].itemIndex],
      product: {
        type: _item.type,
        tailoring_type_id: _item.tailoring_type_id,
        fabric_ids: _item.fabric_ids,
        product_ids: _item.product_ids,
        prices_json: _item.prices_json,
      },
      tailoring_cart_index: idx,
      product_id: orders[idx].product_id!,
      is_service: orders[idx].is_service == true ? 1 : 0,
      product_name: orders[idx].name!,
      tailoring_id: orders[idx].is_tailoring!,
      value: quantity[idx].tailoring,
    });
    setIsOpenTailoringDialog(true);
  };
  const handleColor = (index: number) => {
    if (!isLinking) return;
    let _quantity = [...quantity];
    let _num = _quantity[index].selectionColor;
    _num = colors[_num!] == undefined ? 1 : _num! + 1;
    console.log('set ', _num, colors[_num!]);

    _quantity[index].selectionColor = _num != 6 ? _num : 0;
    setQuantity(_quantity);
  };
  const handleQty = (evt: any, index: number) => {
    let _q = evt.target.value.length > 0 ? parseFloat(evt.target.value) : 1;
    _q = _q == 0 ? 1 : _q;
    quantityChange(index, 'plus', _q, true);
  };
  const handleLinkColor = () => {
    console.log('isLinking ', isLinking);
    if (isLinking) {
      //applay rulls
      console.log(colors);
    }
    setIsLinking(!isLinking);
  };
  const barcodeHandleChange = (e: string) => {
    _id += e;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      console.log('sku', _id);
      setSearchProduct(e);
      e = _id;
      if (e.length > 0) {
        const mfil: any = products.filter(
          (p: any) => p.name.toLowerCase().includes(e) || p.sku.toLowerCase().includes(e)
        );
        if (mfil.length == 1) {
          SetProductsItems([]);
          setProducInfo({ product_id: false });
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setSearchProduct('');
            SetProductsItems([]);
            console.log('inja timeout');
            _id = '';
            setProducInfo(mfil[0]);
          }, 200);
        } else SetProductsItems(mfil);
      } else SetProductsItems([]);
    }, 200);
  };

  return (
    <div className="card" style={{ width: '40%', marginLeft: '80px' }}>
      {/* <button onClick={handlePrint}>Lets Print</button> */}
      {
        <div style={{ display: 'none' }}>
          <ComponentToPrint ref={componentRef} />
        </div>
      }
      {isOpenVariationDialog && (
        <VariationModal
          selectedProductForVariation={selectedProductForVariation}
          isOpenVariationDialog={isOpenVariationDialog}
          setIsOpenVariationDialog={setIsOpenVariationDialog}
          variations={variations.variations}
        />
      )}
      {isOpenTailoringDialog && (
        <TailoringModal
          shopId={shopId}
          selectedProduct={selectedProductForVariation}
          isOpenTailoringDialog={isOpenTailoringDialog}
          setIsOpenTailoringDialog={setIsOpenTailoringDialog}
          tailoringsData={tailoringSizes}
          tailoringExtras={tailoringExtras}
        />
      )}
      <Customermodal
        shopId={shopId}
        showType={showType}
        userdata={customer}
        customers={customers}
        statusDialog={customerIsModal}
        openDialog={customerModalHandler}
      />
      <div className="card-body">
        <div
          className="table-responsive mt-3"
          id="products-list"
          data-simplebar=""
          style={{ height: '100%' }}>
          {isOrderEdit > 0 && (
            <div className="edited-Order">
              <div>#{isOrderEdit}</div>
              <div>Edited Order</div>
            </div>
          )}
          <table className="table m-font-size table-borderless text-center  align-middle mb-0">
            <thead>
              <tr>
                {isEnableLink && (
                  <th scope="col" style={{ width: 30 }}>
                    <div onClick={() => handleLinkColor()}>{isLinking ? 'Apply' : 'link'}</div>
                  </th>
                )}
                <th
                  scope="col"
                  style={{ width: 30 }}
                  onClick={() => {
                    console.log(orders);
                    console.log(quantity);
                  }}>
                  #
                </th>
                <th scope="col" className="text-start">
                  Product
                </th>
                <th scope="col">Quantity</th>
                <th scope="col" className="text-end">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5}>Add Some Product(s)</td>
                </tr>
              ) : null}
              {orders.length == quantity.length &&
                orders.map((order, i) => {
                  return (
                    <tr
                      key={i}
                      style={{
                        background: order.isEdit
                          ? quantity[i].quantity == 0
                            ? '#ebbfbf'
                            : '#bbe7e7'
                          : '',
                      }}>
                      {isEnableLink && (
                        <th scope="col">
                          <div
                            className={
                              isLinking
                                ? 'non-cliclable-color cliclable-color'
                                : 'non-cliclable-color'
                            }
                            style={{ background: colors[quantity[i].selectionColor!] }}
                            onClick={() => handleColor(i)}></div>
                        </th>
                      )}
                      <th scope="row"> {i + 1} </th>
                      <td className="text-start" style={{ cursor: 'pointer' }}>
                        <span className="fw-medium cart-product-name">
                          {' '}
                          {order.def_tax == false ? (
                            <i className="ri-flag-fill text-danger"></i>
                          ) : (
                            ''
                          )}{' '}
                          {order.name}{' '}
                        </span>
                      </td>
                      <td>
                        <div className="input-step">
                          {(order.is_tailoring! > 0 || order.type == 'tailoring_package') && (
                            <div
                              className="btn-tailoring-edit minus mr-2"
                              onClick={() => handleEditTailoring(i)}>
                              <i className="ri-global-fill" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              quantityChange(i, 'minus');
                            }}
                            className="minus">
                            {quantity[i].quantity === 1 ? (
                              <i className="fa-solid fa-xmark"></i>
                            ) : (
                              '-'
                            )}
                          </button>
                          <input
                            type="number"
                            className="product-quantity"
                            min={0}
                            onChange={(e) => handleQty(e, i)}
                            value={quantity[i].quantity}
                            onWheel={(e: React.WheelEvent<HTMLInputElement>) =>
                              (e.target as HTMLInputElement).blur()
                            }
                          />
                          <button
                            type="button"
                            onClick={() => {
                              quantityChange(i, 'plus');
                            }}
                            className="plus">
                            +
                          </button>
                        </div>
                        <span
                          style={{
                            position: 'absolute',
                            color:
                              order.quantity2! > 0
                                ? 'green'
                                : order.quantity2! < 0
                                ? 'red'
                                : 'black',
                            marginLeft: '4px',
                          }}>
                          {order.quantity2! > 0 ? '+' : ''}
                          {order.quantity2! != 0 ? order.quantity2 : ''}
                        </span>
                      </td>
                      <td className="text-end">
                        <span>
                          {Number(quantity[i].lineTotalPrice).toFixed(
                            locationSettings?.location_decimal_places
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {/*end table*/}
        </div>
        <OrderCalcs
          shopId={shopId}
          __WithDiscountFeature__total={0}
          lang={{}}
          orderEditDetails={orderEditDetails}
        />

        <MenuOrdersFooter
          selectedHold={selectedHold}
          orderEditDetails={orderEditDetails}
          shopId={shopId}
          details={{ taxRate, customerId: customer?.value, totalAmount, isReturn: isOrderEdit }}
          holdObj={{ orders, quantity, name: 'noset' }}
        />
      </div>
      {/* end card body */}
    </div>
  );
};
