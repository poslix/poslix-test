import { AdminLayout } from '@layout'
import { ILocationSettings, ITokenVerfy } from '@models/common-model';
import React, { useEffect, useState } from 'react'
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import * as cookie from 'cookie'
import { Button, ButtonGroup, Spinner, ToastContainer } from 'react-bootstrap';
import { apiFetchCtr } from 'src/libs/dbUtils';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const PricingGroup = (props: any) => {
  const { shopId, rules } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({
    value: 0,
    label: '',
    currency_decimal_places: 0,
    currency_code: '',
    currency_id: 0,
    currency_rate: 1,
    currency_symbol: '',
  });
  const [products, setProducts] = useState()
  const columns: GridColDef[] = [
    { field: "id", headerName: "#", minWidth: 50 },
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: 'sell_price',
      headerName: 'Sell',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => {
        if(row.type == "single") return Number(row.sell_price).toFixed(locationSettings?.currency_decimal_places)
        else return(
          Number(row.min_price).toFixed(locationSettings?.currency_decimal_places)
          + ' - ' +
          Number(row.max_price).toFixed(locationSettings?.currency_decimal_places)
        )
      }
    },
    { field: "price", headerName: "Price", flex: 1,
      renderCell: ({row}: Partial<GridRowParams>) => (
        <input type='number' />
      )},
    {
      field: "action",
      headerName: "Action ",
      sortable: false,
      disableExport: true,
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <ButtonGroup className="mb-2 m-buttons-style">
            {rules.hasEdit && (
              <Button
                onClick={(event) => {
                  // router.push('/shop/' + shopId + '/customers/edit/' + row.id)
                  event.stopPropagation();
                }}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
            )}
          </ButtonGroup>
        </>
      ),
    },
  ];
  const onRowsSelectionHandler = (ids: any) => {
  };
  async function initDataPage() {
    const { success, data } = await apiFetchCtr({
      fetch: "products",
      subType: "getProducts",
      shopId,
    });
    if(success) setProducts(data.products);
    console.log(data.products);
    
    setIsLoading(false)
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
  }, []);
  return (
    <>
      <AdminLayout shopId={shopId}>
      <div>PricingGroup</div>
      <ToastContainer />
      {!isLoading ? (
            <>
              <div className="page-content-style card">
                <h5>Pricing Group List</h5>
                <DataGrid
                  className="datagrid-style"
                  sx={{
                    ".MuiDataGrid-columnSeparator": {
                      display: "none",
                    },
                    "&.MuiDataGrid-root": {
                      border: "none",
                    },
                  }}
                  rows={products}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10]}
                  onSelectionModelChange={(ids: any) =>
                    onRowsSelectionHandler(ids)
                  }
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
  )
}

export default PricingGroup
export async function getServerSideProps(context: any) {
  const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
  var _isOk = true, _rule = true;
  var customerId = context.query.customerId;
  var shopId = context.query.id;
  if (shopId == undefined)
    return { redirect: { permanent: false, destination: "/page403" } }
  var _userRules = {}
  await verifayTokens({ headers: { authorization: 'Bearer ' + parsedCookies.tokend } }, (repo: ITokenVerfy) => {
    _isOk = repo.status;
    if (_isOk) {
      var _rules = keyValueRules(repo.data.rules || []);
      if (_rules[-2] != undefined && _rules[-2][0].stuff != undefined && _rules[-2][0].stuff == 'owner') {
        _rule = true;
        _userRules = { hasDelete: true, hasEdit: true, hasView: true, hasInsert: true };
      }
      else if (_rules[shopId] != undefined) {
        var _stuf = '';
        _rules[shopId].forEach((dd: any) => _stuf += dd.stuff)
        const { userRules, hasPermission } = hasPermissions(_stuf, 'customers')
        _rule = hasPermission
        _userRules = userRules
      } else
        _rule = false
    }

  })
  if (!_isOk) return { redirect: { permanent: false, destination: "/user/login" } }
  if (!_rule) return { redirect: { permanent: false, destination: "/page403" } }

  //status ok
  return {
    props: { shopId, rules: _userRules },
  };

}