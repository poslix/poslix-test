import { faBarcode, faPenToSquare, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { ILocationSettings } from '@models/common-model';
import { Button as MButton } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { debounce } from '@mui/material/utils';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import type { NextPage } from 'next';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer } from 'react-toastify';
import ShowPriceListModal from 'src/components/dashboard/modal/ShowPriceListModal';
import LocationModal from 'src/components/pos/modals/LocationModal';
import AlertDialog from 'src/components/utils/AlertDialog';
import { Toastify } from 'src/libs/allToasts';
import { findAllData } from 'src/services/crud.api';
import { ROUTES } from 'src/utils/app-routes';
import { authApi } from 'src/utils/auth-api';
import * as XLSX from 'xlsx';
import { darkModeContext } from '../../../../context/DarkModeContext';
import { apiInsertCtr } from '../../../../libs/dbUtils';
import styles from './table.module.css';

const Product: NextPage = (props: any) => {
  const { rules } = props;
  const myLoader = (img: any) => img.src;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState();
  const [totalRows, setTotalRows] = useState();
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
      renderCell: ({ row }: Partial<GridRowParams>) => {
        if (row.type == 'single')
          return Number(row.sell_price).toFixed(locationSettings?.location_decimal_places);
        else
          return (
            Number(row.min_price).toFixed(locationSettings?.location_decimal_places) +
            ' - ' +
            Number(row.max_price).toFixed(locationSettings?.location_decimal_places)
          );
      },
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
      renderCell: ({ row }) => <p>{row.name}</p>,
    },
    {
      field: 'stock',
      headerName: 'Qty',
      flex: 0.5,
      headerClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
      cellClassName: `${darkMode ? 'dark-mode-body' : 'light-mode-body '}`,
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
            {permissions.hasEdit && (
              <Button
                onClick={() => {
                  router.push('/shop/' + shopId + '/products/edit/' + row.id);
                }}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
            )}
            {permissions.hasDelete && (
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
    const [isHovered, setIsHovered] = useState(false);

    const divStyle = {
      background: isHovered ? '#99CC66' : '#779933',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      borderRadius: '12px',
      marginRight: '0.5rem',
      transition: 'background-color 0.3s',
    };
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
    setIsLoading(false);
    if (router.isReady) {
      const res = await findAllData(`products/${router.query.id}?all_data=1`);
      setProducts(res.data.result);
      // setCurrentPage(res.data.result.current_page);
      // setLastPage(res.data.result.last_page);
      // setTotalRows(res.data.result.total);
      // setFilteredProducts(data.products);
      setIsLoading(false);
    }
    // if (!success) {
    //   Toastify('error', 'Somthing wrong!!, try agian');
    //   return;
    // }
  }
  const [permissions, setPermissions] = useState<any>();
  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissions'));
    const getPermissions = { hasView: false, hasInsert: false, hasEdit: false, hasDelete: false };
    perms.product.map((perm) =>
      perm.name.includes('GET')
        ? (getPermissions.hasView = true)
        : perm.name.includes('POST')
        ? (getPermissions.hasInsert = true)
        : perm.name.includes('PUT')
        ? (getPermissions.hasEdit = true)
        : perm.name.includes('DELETE')
        ? (getPermissions.hasDelete = true)
        : null
    );

    setPermissions(getPermissions);

    const _locs = JSON.parse(localStorage.getItem('locations') || '[]');
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
  }, []);

  const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
    initDataPage();
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

  const [shopId, setShopId] = useState('');
  useEffect(() => {
    if (router.isReady) setShopId(router.query.id.toString());
  }, []);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const getRowClassName = () => styles.rowStyling;
  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        <AlertDialog
          alertShow={show}
          alertFun={handleDeleteFuc}
          shopId={shopId}
          id={selectId}
          url={'products'}>
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
        {!isLoading && permissions.hasInsert && (
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
                rows={products}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                onSelectionModelChange={(ids: any) => onRowsSelectionHandler(ids)}
                onCellClick={handleCellClick}
                components={{ Toolbar: CustomToolbar }}
                // rowCount={totalRows}
                // onPageChange={(params) => setCurrentPage(params + 1)}
                // pagination
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
/**
 * @description get server side props
 * @param {any} context
 *
 * get the cookies from the context
 * check the page params
 * check user permissions
 *
 */
export async function getServerSideProps(context: any) {
  // check if the user is logged in
  const session = await getSession(context);
  if (!session) return { redirect: { permanent: false, destination: ROUTES.AUTH } };

  const shopId = context.query.id;
  if (!shopId) return { redirect: { permanent: false, destination: '/page403' } };

  try {
    const stuffPermissions = await (await authApi(session))
      .get('permissions/13')
      .then(({ data }) => data.result[0].stuff);

    return {
      props: {
        permissions: stuffPermissions ?? {},
        shopId,
        rules: {
          //! this should be dynamic
          hasDelete: true,
          hasEdit: true,
          hasView: true,
          hasInsert: true,
        },
      },
    };
  } catch (e) {
    return { redirect: { permanent: false, destination: ROUTES.AUTH } };
  }
}
