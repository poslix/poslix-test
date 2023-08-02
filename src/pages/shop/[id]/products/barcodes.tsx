import type { NextPage } from 'next';
import { AdminLayout } from '@layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from 'react-bootstrap/Spinner';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup, Form } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { apiFetchCtr } from '../../../../libs/dbUtils';
import { useRouter } from 'next/router';
import AlertDialog from 'src/components/utils/AlertDialog';
import { ILocationSettings, ITokenVerfy } from '@models/common-model';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import * as cookie from 'cookie';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import BarcodeGenerator from 'src/components/dashboard/BarcodeGenerator';
import { useReactToPrint } from 'react-to-print';
import VariationModal from 'src/components/pos/modals/VariationModal';
import { useRecoilState } from 'recoil';
import { cartJobType } from 'src/recoil/atoms';
const Product: NextPage = (probs: any) => {
  const { shopId, rules } = probs;
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({
    value: 0,
    label: '',
    currency_decimal_places: 0,
    currency_code: '',
    currency_id: 0,
    currency_rate: 1,
    currency_symbol: '',
  });
  const router = useRouter();
  const [products, setProducts] = useState<
    { id: number; name: string; sku: string; type: string; qty: number }[]
  >([]);
  const [options, setOptions] = useState<{
    name: boolean;
    category: boolean;
    price: boolean;
    businessName: boolean;
  }>({ name: false, category: false, price: false, businessName: false });
  const [selectedProducts, setSelectedProducts] = useState<
    {
      id: number;
      product_id: number;
      variation_id: number;
      sku: string;
      name: string;
      price: number;
      quantity: number;
      category: string;
    }[]
  >([]);
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductForVariation, setSelectedProductForVariation] = useState<{
    product_id: number;
    product_name: string;
    is_service: number;
  }>({ product_id: 0, product_name: '', is_service: 0 });
  const [isOpenVariationDialog, setIsOpenVariationDialog] = useState(false);
  const [allVariations, setAllVariations] = useState([]);
  const [jobType] = useRecoilState(cartJobType);
  const colourStyles = {
    control: (style: any, state: any) => ({
      ...style,
      borderRadius: '10px',
      background: '#f5f5f5',
      height: '50px',
      borderColor: state.isFocused ? '2px solid #045c54' : '#eaeaea',
      boxShadow: 'none',
      '&:hover': {
        border: '2px solid #045c54 ',
      },
    }),
    menu: (provided: any, state: any) => ({
      ...provided,
      borderRadius: '10px',
      padding: '10px',
      border: '1px solid #c9ced2',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#e6efee' : 'white',
      color: '#2e776f',
      borderRadius: '10px',
      '&:hover': {
        backgroundColor: '#e6efee',
        color: '#2e776f',
        borderRadius: '10px',
      },
    }),
  };

  const columns: GridColDef[] = [
    { field: 'id', minWidth: 50 },
    { field: 'name', headerName: 'name', minWidth: 150 },
    {
      field: 'quantity',
      headerName: 'qty',
      editable: true,
      type: 'number',
    },
    {
      field: 'action',
      headerName: 'Action ',
      sortable: false,
      disableExport: true,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <ButtonGroup className="mb-2 m-buttons-style">
            <Button
              onClick={() => {
                const rows = [...selectedProducts];
                const _index = rows.findIndex((it: any) => it.product_id == row.product_id);
                if (_index > -1) rows.splice(_index, 1);
                setSelectedProducts(rows);
              }}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </ButtonGroup>
        </>
      ),
    },
  ];
  async function initDataPage() {
    const { success, data } = await apiFetchCtr({
      fetch: 'products',
      subType: 'initBarcodePage',
      shopId,
    });
    if (!success) {
      Toastify('error', 'Somthing wrong!!, try agian');
      return;
    }
    setProducts(data.products);
    setAllVariations(data.variations);
    setIsLoading(false);
  }

  useEffect(() => {
    var _locs = JSON.parse(localStorage.getItem('userlocs') || '[]');
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.value == shopId;
          })
        ]
      );
    else alert('errorr location settings');
    initDataPage();
  }, [router.asPath]);

  const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
    if (result) {
      const _data = [...products];
      const idx = _data.findIndex((itm: any) => itm.id == selectId);
      console.log(idx, selectId);
      if (idx != -1) {
        _data.splice(idx, 1);
        setProducts(_data);
      }
    }
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
    setShow(false);
  };
  const saveToCell = (params: any) => {
    const found = selectedProducts.findIndex((el) => el.id === params.id);
    if (found > -1) {
      var _datas: any = selectedProducts;
      _datas[found][params.field] = params.value;
      setSelectedProducts([..._datas]);
    }
  };
  const addPackageProducts = (e: any) => {
    if (e.type == 'variable') {
      setSelectedProductForVariation({
        product_id: e.product_id,
        is_service: 0,
        product_name: e.name,
      });
      setIsOpenVariationDialog(true);
      return;
    }
    const found = selectedProducts.some((el) => el.product_id === e.value);
    if (!found)
      setSelectedProducts([
        ...selectedProducts,
        {
          id: e.product_id,
          product_id: e.product_id,
          variation_id: 0,
          name: e.name,
          quantity: 1,
          price: e.price,
          category: e.category,
          sku: e.sku,
        },
      ]);
    else Toastify('error', 'already exists in list');
  };
  useEffect(() => {
    if (jobType.req == 4) {
      console.log(jobType);
      // when Select Variation From PopUp
      console.log(allVariations);
      allVariations.map((varItm: any, index: number) => {
        if (varItm.variation_id == jobType.val) {
          const found = selectedProducts.some((el) => el.variation_id == varItm.variation_id);
          if (!found)
            setSelectedProducts([
              ...selectedProducts,
              {
                id: +Number(varItm.product_id) + Math.floor(Math.random() * 1200),
                product_id: varItm.product_id,
                variation_id: varItm.variation_id,
                name: selectedProductForVariation.product_name + ' ' + varItm.name,
                quantity: 1,
                price: varItm.variation_price,
                sku: varItm.sku,
                category: 'no set',
              },
            ]);
          else Toastify('error', 'already exists in list');
        }
      });
    }
  }, [jobType]);
  const generateItems = () => {
    return (
      <div>
        {selectedProducts.map((sp) => {
          const items = [];
          for (let i = 0; i < sp.quantity; i++) {
            items.push(
              <div key={`${sp.sku}-${i}`} style={{ height: '120px' }}>
                {options.businessName && (
                  <h6 style={{ textAlign: 'center', fontSize: '20px' }}>
                    {locationSettings.label}
                  </h6>
                )}
                {options.name && (
                  <h6 style={{ textAlign: 'center', fontSize: '20px' }}>{sp.name}</h6>
                )}
                {options.price && (
                  <h6 style={{ textAlign: 'center', fontSize: '20px' }}>
                    {Number(sp.price).toFixed(locationSettings.currency_decimal_places)}{' '}
                    {locationSettings.currency_code}
                  </h6>
                )}
                {options.category && (
                  <h6 style={{ textAlign: 'center', fontSize: '20px' }}>{sp.category}</h6>
                )}
                <div style={{ textAlign: 'center' }}>
                  <BarcodeGenerator sku={sp.sku} />
                </div>
              </div>
            );
          }
          return items;
        })}
      </div>
    );
  };
  //start
  const componentRef = React.useRef(null);
  class ComponentToPrint extends React.PureComponent {
    render() {
      return generateItems();
    }
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        {isOpenVariationDialog && (
          <VariationModal
            selectedProductForVariation={selectedProductForVariation}
            isOpenVariationDialog={isOpenVariationDialog}
            setIsOpenVariationDialog={setIsOpenVariationDialog}
            variations={allVariations}
          />
        )}
        <AlertDialog
          alertShow={show}
          alertFun={handleDeleteFuc}
          shopId={shopId}
          id={selectId}
          type="products"
          subType="deleteProduct">
          Are you Sure You Want Delete This Item ?
        </AlertDialog>
        {!isLoading ? (
          <>
            <div className="page-content-style card">
              <h5>Barcode Generator</h5>
              <h5>
                Step1: <span style={{ color: '#cdc8c8' }}>Selecet Products</span>
              </h5>
              <Select
                styles={colourStyles}
                options={products}
                onChange={(e) => addPackageProducts(e)}
              />
              <DataGrid
                className="datagrid-style"
                sx={{
                  '.MuiDataGrid-columnSeparator': {
                    display: 'none',
                  },
                  '&.MuiDataGrid-root': {
                    border: 'none',
                  },
                }}
                rows={selectedProducts}
                columns={columns}
                pageSize={10}
                onCellEditCommit={saveToCell}
                columnVisibilityModel={{ id: false }}
                rowsPerPageOptions={[10]}
              />
              <h5>
                Step2: <span style={{ color: '#cdc8c8' }}>Options</span>
              </h5>
              <div className="invoice-settings-body" style={{ maxWidth: '500px' }}>
                <div className="invoice-settings-item">
                  <div>Business Name</div>
                  <div>
                    <Form.Check
                      type="switch"
                      className="custom-switch"
                      onChange={(e) => {
                        setOptions({ ...options, businessName: e.target.checked });
                      }}
                    />
                  </div>
                </div>
                <div className="invoice-settings-item">
                  <div>Product Name</div>
                  <div>
                    <Form.Check
                      type="switch"
                      className="custom-switch"
                      onChange={(e) => {
                        setOptions({ ...options, name: e.target.checked });
                      }}
                    />
                  </div>
                </div>
                <div className="invoice-settings-item">
                  <div>Price</div>
                  <div>
                    <Form.Check
                      type="switch"
                      className="custom-switch"
                      onChange={(e) => {
                        setOptions({ ...options, price: e.target.checked });
                      }}
                    />
                  </div>
                </div>
                <div className="invoice-settings-item">
                  <div>Category</div>
                  <div>
                    <Form.Check
                      type="switch"
                      className="custom-switch"
                      onChange={(e) => {
                        setOptions({ ...options, category: e.target.checked });
                      }}
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary p-2"
                onClick={handlePrint}
                style={{ width: '100%', maxWidth: '500px', marginTop: '10px' }}>
                Show
              </button>
            </div>
          </>
        ) : (
          <div className="d-flex justify-content-around">
            <Spinner animation="grow" />
          </div>
        )}
        {
          <div style={{ display: 'none' }}>
            <ComponentToPrint ref={componentRef} />
          </div>
        }
        <div style={{ display: 'none' }} className="page-content-style card">
          <div className="barcode-print-container"></div>
        </div>
      </AdminLayout>
    </>
  );
};
export default Product;
export async function getServerSideProps(context: any) {
  const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
  var _isOk = true,
    _rule = true;
  //check page params
  var shopId = context.query.id;
  if (shopId == undefined) return { redirect: { permanent: false, destination: '/page403' } };

  //check user permissions
  var _userRules = {};
  await verifayTokens(
    { headers: { authorization: 'Bearer ' + parsedCookies.tokend } },
    (repo: ITokenVerfy) => {
      _isOk = repo.status;

      if (_isOk) {
        var _rules = keyValueRules(repo.data.rules || []);
        console.log(_rules);
        if (
          _rules[-2] != undefined &&
          _rules[-2][0].stuff != undefined &&
          _rules[-2][0].stuff == 'owner'
        ) {
          _rule = true;
          _userRules = { hasDelete: true, hasEdit: true, hasView: true, hasInsert: true };
        } else if (_rules[shopId] != undefined) {
          var _stuf = '';
          _rules[shopId].forEach((dd: any) => (_stuf += dd.stuff));
          const { userRules, hasPermission } = hasPermissions(_stuf, 'products');
          _rule = hasPermission;
          _userRules = userRules;
        } else _rule = false;
      }
    }
  );
  console.log('_isOk22    ', _isOk);
  if (!_isOk) return { redirect: { permanent: false, destination: '/user/auth' } };
  if (!_rule) return { redirect: { permanent: false, destination: '/page403' } };
  return {
    props: { shopId: context.query.id, rules: _userRules },
  };
  //status ok
}
