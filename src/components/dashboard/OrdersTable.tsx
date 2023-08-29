import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from 'react-bootstrap/Spinner';
import { faPencil, faArrowLeft, faEye } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import { apiFetchCtr, apiUpdateCtr } from '../../libs/dbUtils';
import { useRouter } from 'next/router';
import AlertDialog from 'src/components/utils/AlertDialog';
import { ILocationSettings } from '@models/common-model';
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
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
const OrdersTable = (props: any) => {
  const { shopId, rules } = props;
  const myLoader = (img: any) => img.src;
  const [locationSettings, setLocationSettings] = useState<
    ILocationSettings & { value: number; label: string }
  >({
    value: 0,
    label: '',
    location_decimal_places: 0,
    currency_code: '',
    currency_id: 0,
    // @ts-ignore
    currency_rate: 1,
    currency_symbol: '',
  });
  const router = useRouter();
  const [orders, setOrders] = useState<
    {
      id: number;
      transaction_id: number;
      type_name: string;
      created_at: string;
      tailoring_txt: string;
      tailoring_custom: string;
      status: string;
      tailoring_link_num: number;
      tname: string;
      contact_mobile: string;
      contact_name: string;
    }[]
  >([]);
  const [selectedOrders, setselectedOrders] = useState<{
    id: number;
    transaction_id: number;
    type_name: string;
    created_at: string;
    tailoring_txt: string;
    tailoring_custom: string;
    status: string;
    tailoring_link_num: number;
    tname: string;
    contact_mobile: string;
    contact_name: string;
  }>();
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [extras, setExtras] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [type, setType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<
    { name: string; value: string; is_primary: number }[]
  >([]);
  const [isOpenPriceDialog, setIsOpenPriceDialog] = useState(false);
  const [isShowDetails, setIsShowDetails] = useState(false);
  const [tailoringNotes, setTailoringNotes] = useState('');
  const [tailoringExtras, setTailoringExtras] = useState<{ id: number; value: string }[]>([]);
  const [tailoringName, setTailoringName] = useState('');
  const [searchtxt, setSearchtxt] = useState('');
  const [changeStatus, setChangeStatus] = useState<{ st: Boolean; i: number }>({
    st: false,
    i: 0,
  });
  const [fabricDetails, setFabricDetails] = useState<{
    name: string;
    image: string;
  }>({ name: '', image: '' });

  async function initDataPage() {
    const { success, data } = await apiFetchCtr({
      fetch: 'tailoring',
      subType: 'getOrders',
      shopId,
    });
    if (!success) {
      Toastify('error', 'Somthing wrong!!, try agian');
      return;
    }
    let _data: any = [];
    data.orders.map((rt: any) => {
      let _jName = JSON.parse(rt.tailoring_txt);
      _data.push({ ...rt, tname: _jName[0][_jName[0].length - 1].value });
    });
    setExtras(data.extras);
    setOrders(_data);
    setIsLoading(false);
  }
  async function getFabric(fabricId: number, linkId: number) {
    const { success, data } = await apiFetchCtr({
      fetch: 'tailoring',
      subType: 'getFabric',
      shopId,
      fabricId,
      linkId,
    });
    if (!success) {
      Toastify('error', 'Somthing wrong!!, try agian');
      return;
    }

    if (data.length > 0) {
      setFabricDetails(data[0]);
    } else {
      setFabricDetails({
        name: '',
        image: 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png',
      });
    }
  }
  async function updateStatus(id: number, stType: string, index: number) {
    if (isLoading) return;
    setIsLoading(true);
    const { success } = await apiUpdateCtr({
      type: 'tailoring',
      subType: 'changeStOrder',
      id,
      stType,
      shopId,
    });
    if (!success) {
      Toastify('error', 'Somthing wrong!!, try agian');
      return;
    }
    orders[index].status = stType;
    setOrders(orders);
    Toastify('success', 'Status successfully Changed');
    setIsLoading(false);
    setChangeStatus({ st: false, i: -1 });
  }
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
    initDataPage();
  }, [router.asPath]);

  const handleClick = (id: number, type: string, index: number) => {
    updateStatus(id, type, index);
  };
  const handleShow = (i: number) => {
    if (i == changeStatus.i) setChangeStatus({ st: !changeStatus.st, i: i });
    else setChangeStatus({ st: true, i: i });
  };
  const handleClickShowDetials2 = (index: number) => {};
  const handleClickShowDetials = (_ind: number) => {
    const index = orders.findIndex((or) => or.id == _ind);
    if (index != -1) {
      let _data = JSON.parse(orders[index].tailoring_txt)[0];
      setSelectedSizes(_data);
      setselectedOrders(orders[index]);
      setSelectedIndex(index);
      if (orders[index].tailoring_custom != null && orders[index].tailoring_custom.length > 5) {
        //its package
        let _packs = JSON.parse(orders[index].tailoring_custom);

        setTailoringNotes(_packs.notes);
        setTailoringExtras(
          _packs.extras != undefined && _packs.extras.length > 3 ? JSON.parse(_packs.extras) : []
        );
        setTailoringName(orders[index].tname);
        //getFabric(_packs.fabric_id, -1);
      } else if (orders[index].tailoring_link_num != null) {
        //get fabric by link
        //getFabric(-1, orders[index].tailoring_link_num);
      } else
        setFabricDetails({
          name: '',
          image: 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png',
        });

      setIsShowDetails(true);
    }
  };
  const classHandler = (status: string) => {
    switch (status) {
      case 'pending':
        return 'toolbar-tailoring order-pendeing-bg';
        break;
      case 'processing':
        return 'toolbar-tailoring order-processing-bg';
        break;
      case 'complete':
        return 'toolbar-tailoring order-complete-bg';
        break;
      default:
        return 'toolbar-tailoring';
        break;
    }
  };
  const statusHandler = (status: string) => {
    switch (status) {
      case 'pending':
        return "'t-status order-st-pendeing-bg";
        break;
      case 'processing':
        return "'t-status order-st-processing-bg";
        break;
      case 'complete':
        return "'t-status order-st-complete-bg";
        break;
      default:
        return "'t-status";
        break;
    }
  };
  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
        <GridToolbarColumnsButton />
        <GridToolbarQuickFilter />
      </GridToolbarContainer>
    );
  }
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'id', minWidth: 40 },
    { field: 'transaction_id', headerName: 'Order ID', flex: 0.5 },
    {
      field: 'tname',
      headerName: 'Name',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <p>{row.tname}</p>
        </>
      ),
    },
    { field: 'type_name', headerName: 'Type', flex: 0.5 },
    {
      field: 'created_at',
      headerName: 'Date',
      flex: 0.5,
      renderCell: ({ row }: Partial<GridRowParams>) => row.created_at.split('T')[0],
    },
    {
      field: 'status',
      headerName: 'status',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <div className={statusHandler(row.status)}>{row.status}</div>
      ),
    },
    {
      field: 'action',
      headerName: 'Action ',
      sortable: false,
      disableExport: true,
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <ButtonGroup className="mb-2 m-buttons-style">
            <Button
              onClick={() => {
                handleClickShowDetials(row.id);
              }}>
              <FontAwesomeIcon icon={faEye} />
            </Button>
          </ButtonGroup>
        </>
      ),
    },
  ];
  return (
    <>
      <ToastContainer />
      <AlertDialog
        alertShow={show}
        alertFun={(e: boolean) => setShow(e)}
        id={selectId}
        type="deleteProduct"
        products={orders}>
        Are you Sure You Want Delete This Item ?
      </AlertDialog>
      <ShowPriceListModal
        shopId={shopId}
        productId={selectId}
        type={type}
        isOpenPriceDialog={isOpenPriceDialog}
        setIsOpenPriceDialog={() => setIsOpenPriceDialog(false)}
      />
      {!isLoading ? (
        <div className="orders-tailoring-container">
          {/* {!isShowDetails && <div className='tailoring-tools-bar'>
                                            <input type='text' placeholder='Search...' value={searchtxt} onChange={(e) => setSearchtxt(e.target.value)} />
                                        </div>} */}
          {isShowDetails ? (
            <div className="order-details-box">
              <div className="order-details-body">
                <button
                  onClick={() => setIsShowDetails(false)}
                  type="button"
                  className="btn mt-4 p-3 mb-2 btn-primary">
                  <FontAwesomeIcon icon={faArrowLeft} /> Back
                </button>
                <div className="contact-info">
                  <div>
                    <img src="/images/dashboard/user.jpg" />
                  </div>
                  <div>
                    <span>Name:</span>
                    <br />
                    {selectedOrders.tname}
                  </div>
                  <div>
                    <span>Phone:</span>
                    <br />
                    {selectedOrders.contact_mobile}
                  </div>
                  <div>
                    <span>Tailoring Type:</span>
                    <br />
                    {selectedOrders.type_name}
                  </div>
                  <div>
                    <span>Order ID:</span>
                    <br />
                    {selectedOrders.transaction_id}
                  </div>
                  <div>
                    <span>Date:</span>
                    <br />
                    {selectedOrders.created_at.split('T')[0]}
                  </div>
                  <div>
                    <span>Status:</span>
                    <br />
                    {selectedOrders.status}{' '}
                    <Button onClick={() => handleShow(selectedIndex)}>
                      <FontAwesomeIcon icon={faPencil} />
                    </Button>
                  </div>
                </div>
                {/* {changeStatus.st && changeStatus.i == selectedIndex && (
                      <div className="status-mini-modal-cont">
                        <p>Change To</p>
                        <div className="status-mini-modal">
                          <div className="mini-item">
                            <button
                              onClick={() =>
                                handleClick(
                                  selectedOrders.id,
                                  "pending",
                                  selectedIndex
                                )
                              }
                              type="button"
                              className="btn btn-primary"
                            >
                              Pending
                            </button>{" "}
                          </div>
                          <div className="mini-item">
                            <button
                              onClick={() =>
                                handleClick(
                                  selectedOrders.id,
                                  "processing",
                                  selectedIndex
                                )
                              }
                              type="button"
                              className="btn btn-primary"
                            >
                              Processing
                            </button>{" "}
                          </div>
                          <div className="mini-item">
                            <button
                              onClick={() =>
                                handleClick(
                                  selectedOrders.id,
                                  "complete",
                                  selectedIndex
                                )
                              }
                              type="button"
                              className="btn btn-primary"
                            >
                              Complete
                            </button>{" "}
                          </div>
                        </div>
                      </div>
                    )} */}

                <Dialog
                  open={changeStatus.st && changeStatus.i == selectedIndex}
                  fullWidth={false}
                  className="poslix-modal"
                  onClose={() => handleShow(selectedIndex)}>
                  <DialogTitle className="poslix-modal text-primary">Change Status To</DialogTitle>
                  <DialogContent className="poslix-modal-content">
                    <div className="poslix-modal">
                      <div className="status-mini-modal-cont">
                        <div className="status-mini-modal">
                          <div className="mini-item">
                            <button
                              onClick={() =>
                                handleClick(selectedOrders.id, 'pending', selectedIndex)
                              }
                              type="button"
                              className="btn btn-primary">
                              Pending
                            </button>{' '}
                          </div>
                          <div className="mini-item">
                            <button
                              onClick={() =>
                                handleClick(selectedOrders.id, 'processing', selectedIndex)
                              }
                              type="button"
                              className="btn btn-primary">
                              Processing
                            </button>{' '}
                          </div>
                          <div className="mini-item">
                            <button
                              onClick={() =>
                                handleClick(selectedOrders.id, 'complete', selectedIndex)
                              }
                              type="button"
                              className="btn btn-primary">
                              Complete
                            </button>{' '}
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => handleShow(selectedIndex)}>Cancel</Button>
                  </DialogActions>
                </Dialog>

                <div className="order-details-items">
                  {selectedSizes.map((size, i) => {
                    return (
                      <div key={i + 1} className="order-details-item">
                        <span>{size.name == '_frm_name' ? 'name' : size.name}</span> <br />{' '}
                        {size.value}
                      </div>
                    );
                  })}
                </div>
                <div className="tailoring-notes">
                  <span>Note</span>
                  <br />
                  {tailoringNotes}
                </div>
                <div className="tailoring-notes">
                  <span>Additional</span>
                  <br />
                  {tailoringExtras.map((te, i: number) => {
                    return (
                      <p key={i}>
                        <span>{extras.find((ex: any) => ex.id == te.id)?.name}</span> {te.value}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="page-content-style card">
                <h5>Tailoring Orders</h5>
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
                  rows={orders}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10]}
                  components={{ Toolbar: CustomToolbar }}
                  initialState={{
                    columns: { columnVisibilityModel: { id: false } },
                  }}
                />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="d-flex justify-content-around">
          <Spinner animation="grow" />
        </div>
      )}
    </>
  );
};
export default OrdersTable;
