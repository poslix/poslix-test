import type { NextPage } from 'next';
import Image from 'next/image';
import { AdminLayout } from '@layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from 'react-bootstrap/Spinner';
import {
  faTrash,
  faPenToSquare,
  faPlus,
  faTag,
  faBarcode,
} from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  MouseEventHandler,
  useContext,
} from 'react';
import { apiFetchCtr, apiInsertCtr } from '../../../../libs/dbUtils';
import { useRouter } from 'next/router';
import AlertDialog from 'src/components/utils/AlertDialog';
import { Button as MButton } from '@mui/material';
import { ILocationSettings, IPageRules, ITokenVerfy } from '@models/common-model';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import * as cookie from 'cookie';
import ShowPriceListModal from 'src/components/dashboard/modal/ShowPriceListModal';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  useGridApiContext,
  useGridApiRef,
} from '@mui/x-data-grid';
import { debounce } from '@mui/material/utils';
import TextField from '@mui/material/TextField';
import { Checkbox } from '@mui/material';
import LocationModal from 'src/components/pos/modals/LocationModal';
import * as XLSX from 'xlsx';

/*MOHAMMED MAHER */
import { darkModeContext } from '../../../../context/DarkModeContext';
const Product: NextPage = (probs: any) => {
  const { shopId, rules } = probs;
  const myLoader = (img: any) => img.src;
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({
    value: 0,
    label: '',
    currency_decimal_places: 0,
    currency_code: '',
    currency_id: 0,
    currency_rate: 1,
    currency_symbol: '',
  });
  const dataGridRef = useRef(null);
  const router = useRouter();
  const [products, setProducts] = useState<
    { id: number; name: string; sku: string; type: string; qty: number }[]
  >([]);
  const [show, setShow] = useState(false);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [type, setType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenPriceDialog, setIsOpenPriceDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState<Array<string>>([]);
  const [locationModal, setLocationModal] = useState<boolean>(false);
  const [locations, setLocations] = useState<{ value: number; label: string }[]>([]);
  // var _locs = JSON.parse(localStorage.getItem('userlocs') || '[]');

  /*MOHAMMED MAHER */
  const { darkMode } = useContext(darkModeContext);

  const columns: GridColDef[] = [
    // { field: "check", headerName: <Checkbox aria-label={"select-all"} onChange={(e: ChangeEvent<HTMLInputElement>)=>{
    //   // if(e.target.checked) setSelectedItems([...selectedItems, row.id])
    //   // else setSelectedItems(selectedItems.filter((id) => {return id !== row.id}))
    // }} />,
    // headerClassName:`${darkMode ? "dark-mode-body" : "light-mode-body "}` ,
    // cellClassName:`${darkMode ? "dark-mode-body" : "light-mode-body "}`,
    // minWidth: 10, renderCell: ({ row }: Partial<GridRowParams>) => (
    //   <Checkbox aria-label={row.name} onChange={(e: ChangeEvent<HTMLInputElement>)=>{
    //     if(e.target.checked) setSelectedItems([...selectedItems, row.id])
    //     else setSelectedItems(selectedItems.filter((id) => {return id !== row.id}))
    //   }} />
    // ) },
    {
      field: 'id',
      headerName: '#',
      minWidth: 50,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
    },
    {
      field: 'image',
      headerName: 'Image',
      flex: 1,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <Image
          alt=""
          loader={myLoader}
          width={50}
          height={50}
          src={row.image && row.image.length > 0 ? row.image : '/images/pos/placeholder.png'}
        />
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      flex: 0.5,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
    },
    {
      field: 'sku',
      headerName: 'sku ',
      flex: 0.5,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
    },
    {
      field: 'name',
      headerName: 'name ',
      flex: 1,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
    },
    {
      field: 'sell_price',
      headerName: 'Sell (Min - Max)',
      flex: 1,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        Number(row.min_price).toFixed(locationSettings?.currency_decimal_places)
        + ' - ' +
        Number(row.max_price).toFixed(locationSettings?.currency_decimal_places)
      )
    },
    // {
    //   field: "min_price",
    //   headerName: "Min",
    //   flex: 1,
    //   headerClassName:`${darkMode ? "dark-mode-body" : "light-mode-body "}` ,
    //   cellClassName:`${darkMode ? "dark-mode-body" : "light-mode-body "}`,
    //   renderCell: ({row}) => row.min_price
    // },
    // {
    //   field: "max_price",
    //   headerName: "Max",
    //   flex: 1,
    //   headerClassName:`${darkMode ? "dark-mode-body" : "light-mode-body "}` ,
    //   cellClassName:`${darkMode ? "dark-mode-body" : "light-mode-body "}`,
    //   renderCell: ({row}) => row.max_price
    // },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
    },
    {
      field: 'qty',
      headerName: 'Qty',
      flex: 0.5,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <div className={row.qty > 0 && row.type != 'package' ? 'clickable-qty' : ''}>
            {row.type != 'package' ? Number(row.qty).toFixed(0) : '---'}
            <span className="qty-over">[{Number(row.qty_over_sold).toFixed(0)}]</span>
          </div>
        </>
      ),
    },
    {
      field: 'action',
      headerName: 'Action ',
      sortable: false,
      disableExport: true,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <ButtonGroup className="mb-2 m-buttons-style">
            {rules.hasEdit && (
              <Button
                onClick={() => {
                  router.push('/shop/' + shopId + '/products/edit/' + row.id);
                }}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
            )}
            {rules.hasDelete && (
              <Button
                onClick={() => {
                  setSelectId(row.id);
                  setShow(true);
                }}>
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            )}
            <Button
              onClick={() => {
                router.push('/shop/' + shopId + '/products/barcodes/');
              }}>
              <FontAwesomeIcon icon={faBarcode} />
            </Button>
          </ButtonGroup>
        </>
      ),
    },
  ];

  const fileRef = useRef(null);
  const importFileClickHandler = () => {
    fileRef.current.click();
  };
  const importFileHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = async (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData: {
        id: number;
        name: string;
        sku: string;
        type: string;
        qty: number;
        sell: number;
        category: string;
      }[] = XLSX.utils.sheet_to_json(sheet);
      const newData = parsedData.map((item) => {
        delete item.id;
        return { ...item, location_id: shopId };
      });
      const { success, newdata } = await apiInsertCtr({
        type: 'products',
        subType: 'importFromFile',
        shopId,
        data: newData,
      });
      if (success) initDataPage();
    };
  };
  function CustomToolbar() {
    return (
      <GridToolbarContainer className="d-flex align-items-center">
        <GridToolbarExport />
        {/* mohamed elsayed */}
        <MButton onClick={importFileClickHandler}>Import</MButton>
        <input style={{ display: 'none' }} ref={fileRef} type="file" onChange={importFileHandler} />
        {/* /////////// */}
        <GridToolbarColumnsButton />
        <div
          style={{ color: '#1976d2', cursor: 'pointer' }}
          className={`${locations?.length > 1 && selectedItems.length > 0 ? 'pe-auto' : 'pe-none'}`}
          onClick={() => setLocationModal(true)}>
          SEND
        </div>
        <div
          style={{ color: '#1976d2', cursor: 'pointer', marginLeft: '0.5rem' }}
          className={`${locations?.length > 1 && selectedItems.length > 0 ? 'pe-auto' : 'pe-none'}`}
          onClick={() => setShowDeleteAll(true)}>
          DELETE
        </div>
      </GridToolbarContainer>
    );
  }
  async function initDataPage() {
    const { success, data } = await apiFetchCtr({
      fetch: 'products',
      subType: 'getProducts',
      shopId,
    });
    if (!success) {
      Toastify('error', 'Somthing wrong!!, try agian');
      return;
    }
    setProducts(data.products);
    setFilteredProducts(data.products);
    setIsLoading(false);
  }
  useEffect(() => {
    var _locs = JSON.parse(localStorage.getItem('userlocs') || '[]');
    setLocations(_locs);
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
      // const _data = [...products];
      // const idx = _data.findIndex((itm: any) => itm.id == selectId);
      // if (idx != -1) {
      //   _data.splice(idx, 1);
      //   setProducts(_data);
      // }
      initDataPage();
    }
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
    setShow(false);
    setShowDeleteAll(false);
  };
  const onRowsSelectionHandler = (ids: any) => {
    setSelectedItems(ids);
  };
  const handleCellClick = (params, event) => {
    if (params.field === 'qty') {
      let index = products.findIndex((p) => params.id == p.id);
      if (index == -1) return;
      if (products[index].type != 'package' && products[index].qty > 0) {
        setSelectId(products[index].id);
        setType(products[index].type);
        setIsOpenPriceDialog(true);
      }
    }
  };
  const handleSearch = (event) => {
    debounceSearchTerm(event.target.value);
  };
  // Debounce user input with lodash debounce function
  const debounceSearchTerm = debounce((value) => {
    setSearchTerm(value);
  }, 500);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const filteredList = products.filter(
        (product) =>
          product.name.includes(searchTerm.toLowerCase()) ||
          product.sku.includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filteredList);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        <AlertDialog
          alertShow={show}
          alertFun={handleDeleteFuc}
          shopId={shopId}
          id={selectId}
          type="products"
          subType="deleteProduct">
          Are you Sure You Want Delete This Item?
        </AlertDialog>
        <AlertDialog
          alertShow={showDeleteAll}
          alertFun={handleDeleteFuc}
          shopId={shopId}
          id={selectedItems}
          type="products"
          subType="deleteProducts">
          Are you Sure You Want Delete The Selected Items?
        </AlertDialog>
        <ShowPriceListModal
          shopId={shopId}
          productId={selectId}
          type={type}
          isOpenPriceDialog={isOpenPriceDialog}
          setIsOpenPriceDialog={() => setIsOpenPriceDialog(false)}
        />
        <LocationModal
          showDialog={locationModal}
          setShowDialog={setLocationModal}
          locations={locations}
          data={selectedItems}
          setData={setSelectedItems}
          shopId={shopId}
          value={locations.findIndex((loc: any) => {
            return loc.value == shopId;
          })}
        />
        {/* start */}
        {!isLoading && rules.hasInsert && (
          <div className="mb-2 flex items-center justify-between">
            <button
              className="btn btn-primary p-3"
              onClick={() => router.push('/shop/' + shopId + '/products/add')}>
              <FontAwesomeIcon icon={faPlus} /> Add New Product{' '}
            </button>
            <TextField label="search name/sku" variant="filled" onChange={handleSearch} />
          </div>
        )}

        {!isLoading ? (
          <>
            <div className="page-content-style card">
              <h5>Product List</h5>
              <DataGrid
                ref={dataGridRef}
                checkboxSelection
                className="datagrid-style"
                sx={{
                  '.MuiDataGrid-columnSeparator': {
                    display: 'none',
                  },
                  '&.MuiDataGrid-root': {
                    border: 'none',
                  },
                }}
                rows={filteredProducts}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                onSelectionModelChange={(ids: any) => onRowsSelectionHandler(ids)}
                onCellClick={handleCellClick}
                components={{ Toolbar: CustomToolbar }}
              />
            </div>
          </>
        ) : (
          <div className="d-flex justify-content-around">
            <Spinner animation="grow" />
          </div>
        )}
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
        if (
          _rules[-2] != undefined &&
          _rules[-2][0].stuff != undefined &&
          _rules[-2][0].stuff == 'owner'
        ) {
          _rule = true;
          _userRules = {
            hasDelete: true,
            hasEdit: true,
            hasView: true,
            hasInsert: true,
          };
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
  if (!_isOk) return { redirect: { permanent: false, destination: '/user/auth' } };
  if (!_rule) return { redirect: { permanent: false, destination: '/page403' } };
  return {
    props: { shopId: context.query.id, rules: _userRules },
  };
  //status ok
}
