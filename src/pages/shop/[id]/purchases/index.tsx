import type { NextPage } from 'next';
import Table from 'react-bootstrap/Table';
import { AdminLayout } from '@layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from 'react-bootstrap/Spinner';
import {
  faTrash,
  faPenToSquare,
  faPlus,
  faDollarSign,
  faCheckDouble,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiFetchCtr } from 'src/libs/dbUtils';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import { ILocationSettings, ITokenVerfy } from '@models/common-model';
import * as cookie from 'cookie';
import PurchasesQtyCheckList from 'src/components/dashboard/PurchasesQtyCheckList';
import PurchasePaymentsList from 'src/components/dashboard/PurchasePaymentsList';
import { ToastContainer } from 'react-toastify';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';

const Purchases: NextPage = (probs: any) => {
  const { shopId } = probs;
  const [purchases, setPurchases] = useState<{ id: number; name: string; sku: string }[]>([]);
  const [isloading, setIsloading] = useState(true);
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({
    value: 0,
    label: '',
    currency_decimal_places: 0,
    currency_code: '',
    currency_id: 0,
    currency_rate: 1,
    currency_symbol: '',
  });
  const [isShowQtyManager, setIsShowQtyManager] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isShowPayments, setIsShowPayments] = useState(false);
  const [purchaseId, setPurchaseId] = useState(0);
  const router = useRouter();

  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    { field: 'supplier', headerName: 'Supplier', flex: 0.5 },
    {
      field: 'status',
      headerName: 'Stock Status',
      flex: 0.5,
      renderCell: ({ row }: Partial<GridRowParams>) => getStatusStyle(row.status),
    },
    {
      field: 'payment_status',
      headerName: 'Payment Status',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => getStatusStyle(row.payment_status),
    },

    {
      field: 'total_price',
      headerName: 'Total Price',
      flex: 1,
      renderCell: (params) =>
        Number(params.value).toFixed(locationSettings.currency_decimal_places),
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
              disabled={row.status == 'draft'}
              onClick={() => {
                console.log('row ', row);
                setPurchaseId(row.id);
                setIsShowQtyManager(!isShowQtyManager);
              }}>
              <FontAwesomeIcon icon={faListCheck} />
            </Button>
            <Button
              disabled={row.status == 'draft'}
              onClick={() => {
                setPurchaseId(row.id);
                setIsShowPayments(!isShowPayments);
              }}>
              <FontAwesomeIcon icon={faDollarSign} />
            </Button>
            <Button onClick={() => router.push('/shop/' + shopId + '/purchases/edit/' + row.id)}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </Button>
            <Button>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </ButtonGroup>
        </>
      ),
    },
  ];
  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
        <GridToolbarColumnsButton />
      </GridToolbarContainer>
    );
  }
  async function initDataPage() {
    const { success, newdata } = await apiFetchCtr({
      fetch: 'transactions',
      subType: 'getAll',
      shopId,
    });
    if (success) {
      setPurchases(newdata);
      setIsloading(false);
    }
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
  function getStatusStyle(status: string) {
    switch (status) {
      case 'paid':
        return (
          <div className="">
            <span className="purchase-satus-style">{status}</span>
          </div>
        );
      case 'received':
        return (
          <div className="">
            <span className="purchase-satus-style">{status}</span>
          </div>
        );
      default:
        return status;
    }
  }

  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        {isShowQtyManager && (
          <PurchasesQtyCheckList
            selectedIndex={selectedIndex}
            purchases={purchases}
            locationSettings={locationSettings}
            shopId={shopId}
            purchaseId={purchaseId}
            setIsShowQtyManager={setIsShowQtyManager}
          />
        )}
        {isShowPayments && (
          <PurchasePaymentsList
            selectedIndex={selectedIndex}
            purchases={purchases}
            shopId={shopId}
            purchaseId={purchaseId}
            setIsShowPayments={setIsShowPayments}
          />
        )}
        {!isShowQtyManager && !isShowPayments && (
          <div className="row">
            <div className="col-md-12">
              {!isloading && (
                <div className="mb-4">
                  <button
                    className="btn m-btn btn-primary p-3"
                    onClick={() => {
                      router.push('/shop/' + shopId + '/purchases/add');
                    }}>
                    <FontAwesomeIcon icon={faPlus} /> New Purchase{' '}
                  </button>
                </div>
              )}
              {!isloading ? (
                <>
                  <div className="page-content-style card">
                    <h5>Product List</h5>
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
                      rows={purchases}
                      columns={columns}
                      pageSize={10}
                      rowsPerPageOptions={[10]}
                      components={{ Toolbar: CustomToolbar }}
                    />
                  </div>
                </>
              ) : (
                <div className="d-flex justify-content-around">
                  <Spinner animation="grow" />
                </div>
              )}
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};
export default Purchases;
export async function getServerSideProps(context: any) {
  const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
  var _isOk = true,
    _hasPer = true;
  //check page params
  var shopId = context.query.id;
  if (shopId == undefined) return { redirect: { permanent: false, destination: '/page403' } };

  //check user permissions
  var _userRules = {};
  await verifayTokens(
    { headers: { authorization: 'Bearer ' + parsedCookies.tokend } },
    (repo: ITokenVerfy) => {
      _isOk = repo.status;
      var _rules = keyValueRules(repo.data.rules || []);
      if (
        _rules[-2] != undefined &&
        _rules[-2][0].stuff != undefined &&
        _rules[-2][0].stuff == 'owner'
      ) {
        _hasPer = true;
        _userRules = { hasDelete: true, hasEdit: true, hasView: true, hasInsert: true };
      } else if (_isOk && _rules[shopId] != undefined) {
        var _stuf = '';
        _rules[shopId].forEach((dd: any) => (_stuf += dd.stuff));
        const { userRules, hasPermission } = hasPermissions(_stuf, 'purchases');
        _isOk = hasPermission;
        _userRules = userRules;
      } else _hasPer = false;
    }
  );
  if (!_isOk) return { redirect: { permanent: false, destination: '/user/auth' } };
  if (!_hasPer) return { redirect: { permanent: false, destination: '/page403' } };
  return {
    props: { shopId: context.query.id, rules: _userRules },
  };
  //status ok
}
