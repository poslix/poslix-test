import type { NextPage } from 'next';
import Image from 'next/image';
import Table from 'react-bootstrap/Table';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { AdminLayout } from '@layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from 'react-bootstrap/Spinner';
import {
  faTrash,
  faPenToSquare,
  faPlus,
  faTag,
  faArrowRight,
  faArrowDown,
  faPencil,
  faArrowLeft,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import { apiFetchCtr, apiUpdateCtr } from '../../../../libs/dbUtils';
import { useRouter } from 'next/router';
import AlertDialog from 'src/components/utils/AlertDialog';
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
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import OrdersTable from 'src/components/dashboard/OrdersTable';
const Orders: NextPage = (probs: any) => {
  const { shopId, rules } = probs;

  // const myLoader = (img: any) => img.src;
  // const [locationSettings, setLocationSettings] = useState<ILocationSettings>({ value: 0, label: "", currency_decimal_places: 0, currency_code: '', currency_id: 0, currency_rate: 1, currency_symbol: '' })
  // const router = useRouter()
  // const [orders, setOrders] = useState<{ id: number, transaction_id: number, type_name: string, created_at: string, tailoring_txt: string, tailoring_custom: string, status: string, tailoring_link_num: number, tname: string, contact_mobile: string, contact_name: string }[]>([])
  // const [selectedOrders, setselectedOrders] = useState<{ id: number, transaction_id: number, type_name: string, created_at: string, tailoring_txt: string, tailoring_custom: string, status: string, tailoring_link_num: number, tname: string, contact_mobile: string, contact_name: string }>()
  // const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  // const [extras, setExtras] = useState<any[]>([])
  // const [show, setShow] = useState(false);
  // const [selectId, setSelectId] = useState(0);
  // const [type, setType] = useState('');
  // const [isLoading, setIsLoading] = useState(true);
  // const [selectedSizes, setSelectedSizes] = useState<{ name: string, value: string, is_primary: number }[]>([]);
  // const [isOpenPriceDialog, setIsOpenPriceDialog] = useState(false);
  // const [isShowDetails, setIsShowDetails] = useState(false);
  // const [tailoringNotes, setTailoringNotes] = useState('');
  // const [tailoringExtras, setTailoringExtras] = useState<{ id: number, value: string }[]>([]);
  // const [tailoringName, setTailoringName] = useState('');
  // const [searchtxt, setSearchtxt] = useState('');
  // const [changeStatus, setChangeStatus] = useState<{ st: Boolean, i: number }>({ st: false, i: 0 });
  // const [fabricDetails, setFabricDetails] = useState<{ name: string, image: string }>({ name: "", image: "" });

  // async function initDataPage() {
  //     const { success, data } = await apiFetchCtr({ fetch: 'tailoring', subType: 'getOrders', shopId })
  //     if (!success) {
  //         Toastify('error', 'Somthing wrong!!, try agian')
  //         return
  //     }
  //     let _data: any = [];
  //     data.orders.map((rt: any) => {
  //         let _jName = JSON.parse(rt.tailoring_txt);
  //         _data.push({ ...rt, tname: _jName[0][_jName[0].length - 1].value })
  //     })
  //     setExtras(data.extras)
  //     setOrders(_data)
  //     setIsLoading(false)
  // }
  // async function getFabric(fabricId: number, linkId: number) {
  //     const { success, data } = await apiFetchCtr({ fetch: 'tailoring', subType: 'getFabric', shopId, fabricId, linkId })
  //     if (!success) {
  //         Toastify('error', 'Somthing wrong!!, try agian')
  //         return
  //     }
  //     console.log(data);
  //     if (data.length > 0) {
  //         setFabricDetails(data[0]);
  //     } else {
  //         setFabricDetails({ name: "", image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png" });
  //     }

  // }
  // async function updateStatus(id: number, stType: string, index: number) {
  //     if (isLoading)
  //         return
  //     setIsLoading(true)
  //     const { success } = await apiUpdateCtr({ type: 'tailoring', subType: 'changeStOrder', id, stType, shopId })
  //     if (!success) {
  //         Toastify('error', 'Somthing wrong!!, try agian')
  //         return
  //     }
  //     orders[index].status = stType
  //     setOrders(orders)
  //     Toastify('success', 'Status successfully Changed')
  //     setIsLoading(false)
  //     setChangeStatus({ st: false, i: -1 })
  // }
  // useEffect(() => {
  //     var _locs = JSON.parse(localStorage.getItem('userlocs') || '[]');
  //     if (_locs.toString().length > 10)
  //         setLocationSettings(_locs[_locs.findIndex((loc: any) => { return loc.value == shopId })])
  //     else alert("errorr location settings")
  //     initDataPage();
  // }, [router.asPath])

  // const handleClick = (id: number, type: string, index: number) => {
  //     updateStatus(id, type, index);
  // }
  // const handleShow = (i: number) => {
  //     if (i == changeStatus.i)
  //         setChangeStatus({ st: !changeStatus.st, i: i })
  //     else
  //         setChangeStatus({ st: true, i: i })
  // }
  // const handleClickShowDetials2 = (index: number) => {

  // }
  // const handleClickShowDetials = (_ind: number) => {
  //     const index = orders.findIndex(or => or.id == _ind);
  //     if (index != -1) {
  //         let _data = JSON.parse(orders[index].tailoring_txt)[0];
  //         setSelectedSizes(_data)
  //         setselectedOrders(orders[index]);
  //         setSelectedIndex(index);
  //         if (orders[index].tailoring_custom != null && orders[index].tailoring_custom.length > 5) {
  //             //its package
  //             let _packs = JSON.parse(orders[index].tailoring_custom);
  //             console.log(_packs);
  //             setTailoringNotes(_packs.notes)
  //             setTailoringExtras(_packs.extras != undefined && _packs.extras.length > 3 ? JSON.parse(_packs.extras) : [])
  //             setTailoringName(orders[index].tname)
  //             //getFabric(_packs.fabric_id, -1);
  //         } else if (orders[index].tailoring_link_num != null) {
  //             //get fabric by link
  //             console.log("its fabric ",);
  //             //getFabric(-1, orders[index].tailoring_link_num);
  //         } else
  //             setFabricDetails({ name: "", image: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png" });

  //         setIsShowDetails(true)
  //     }

  // }
  // const classHandler = (status: string) => {
  //     switch (status) {
  //         case "pending":
  //             return "toolbar-tailoring order-pendeing-bg";
  //             break;
  //         case "processing":
  //             return "toolbar-tailoring order-processing-bg";
  //             break;
  //         case "complete":
  //             return "toolbar-tailoring order-complete-bg";
  //             break;
  //         default:
  //             return "toolbar-tailoring";
  //             break;
  //     }
  // }
  // const statusHandler = (status: string) => {
  //     switch (status) {
  //         case "pending":
  //             return "'t-status order-st-pendeing-bg";
  //             break;
  //         case "processing":
  //             return "'t-status order-st-processing-bg";
  //             break;
  //         case "complete":
  //             return "'t-status order-st-complete-bg";
  //             break;
  //         default:
  //             return "'t-status";
  //             break;
  //     }
  // }
  // function CustomToolbar() {
  //     return (
  //         <GridToolbarContainer>
  //             <GridToolbarExport />
  //             <GridToolbarColumnsButton />
  //             <GridToolbarQuickFilter />
  //         </GridToolbarContainer>
  //     );
  // }
  // const columns: GridColDef[] = [
  //     { field: "id", headerName: "id", minWidth: 40 },
  //     { field: "transaction_id", headerName: "Order ID", flex: 0.5 },
  //     {
  //         field: "tname", headerName: "Name", flex: 1,
  //         renderCell: ({ row }: Partial<GridRowParams>) => (
  //             <>
  //                 <p>{row.tname}<br /><span style={{ color: '#eaeaea' }}>{row.tname}</span></p>
  //             </>
  //         ),
  //     },
  //     { field: "type_name", headerName: "Type", flex: 0.5 },
  //     {
  //         field: "created_at", headerName: "Date", flex: 0.5,
  //         renderCell: ({ row }: Partial<GridRowParams>) => (
  //             row.created_at.split('T')[0]
  //         ),
  //     },
  //     {
  //         field: "status", headerName: "status", flex: 1,
  //         renderCell: ({ row }: Partial<GridRowParams>) => (
  //             <div className={statusHandler(row.status)}>{row.status}</div>
  //         ),
  //     },
  //     {
  //         field: "action",
  //         headerName: "Action ",
  //         sortable: false,
  //         disableExport: true,
  //         flex: 1,
  //         renderCell: ({ row }: Partial<GridRowParams>) => (
  //             <>
  //                 <ButtonGroup className="mb-2 m-buttons-style">
  //                     <Button onClick={() => {
  //                         console.log('inja ', row);
  //                         handleClickShowDetials(row.id)
  //                     }}><FontAwesomeIcon icon={faEye} /></Button>
  //                 </ButtonGroup>
  //             </>
  //         ),
  //     },
  // ];
  return (
    <>
      <AdminLayout shopId={shopId}>
        <OrdersTable shopId={shopId} rules={rules} />
      </AdminLayout>
    </>
  );
};
export default Orders;
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
          const { userRules, hasPermission } = hasPermissions(_stuf, 'orders');
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
}
