import type { NextPage } from 'next'
import { AdminLayout } from '@layout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Spinner from 'react-bootstrap/Spinner';
import { faTrash, faPenToSquare, faPlus, faTag, faBarcode ,faEye } from '@fortawesome/free-solid-svg-icons'
import { Button, ButtonGroup } from 'react-bootstrap'
import React, { useState, useEffect, useContext } from 'react'
import { apiFetchCtr } from "../../../../libs/dbUtils";
import { useRouter } from 'next/router'
import AlertDialog from 'src/components/utils/AlertDialog';
import { ILocationSettings, ITokenVerfy } from '@models/common-model';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import * as cookie from 'cookie'
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
import { DataGrid, GridColDef, GridRowParams, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { ProductContext } from "../../../../context/ProductContext";
import Customermodal from "../../../../components/pos/modals/Customermodal";

const Product: NextPage = (props: any) => {

  const { shopId, rules } = props;
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({ value: 0, label: "", currency_decimal_places: 0, currency_code: '', currency_id: 0, currency_rate: 1, currency_symbol: '' })
  const router = useRouter()
  const [customersList, setCustomers] = useState<{ id: number, name: string, mobile: string }[]>([])
  
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [showType, setShowType] = useState(String);
  const [customer, setCustomer] = useState<{
    value: string;
    label: string;
    isNew: boolean;
  }>({ value: "1", label: "walk-in customer", isNew: false });
  const { customers } = useContext(ProductContext);

  const [customerIsModal, setCustomerIsModal] = useState<boolean>(false);
  const customerModalHandler = (status: any) => {
    setCustomerIsModal(false);
    initDataPage();
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "#", minWidth: 50 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "mobile", headerName: "Mobile", flex: 1 },
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
                  setCustomer({
                    value: row.id,
                    label: "walk-in customer",
                    isNew: false,
                  });
                  setShowType("edit");
                  setCustomerIsModal(true);
                }}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
            )}
            {rules.hasDelete && (
              <Button
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectId(row.id);
                  setShow(true);
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>

            )}
            <Button
              onClick={() => {
                router.push(
                    "/shop/" + shopId + "/customers/" + row.id
                  )
              }}
            >
              <FontAwesomeIcon icon={faEye} />
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
    const { success, newdata } = await apiFetchCtr({ fetch: 'customer', subType: 'getCustomerlist', shopId })
    if (!success) {
      Toastify('error', 'Somthing wrong!!, try agian')
      return
    }
    setCustomers(newdata)
    setIsLoading(false)
  }

  useEffect(() => {
    var _locs = JSON.parse(localStorage.getItem('userlocs') || '[]');
    if (_locs.toString().length > 10)
      setLocationSettings(_locs[_locs.findIndex((loc: any) => { return loc.value == shopId })])
    else alert("errorr location settings")
    initDataPage();
  }, [router.asPath])

  const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
    if (result) {
      const _data = [...customersList]
      const idx = _data.findIndex((itm: any) => itm.id == selectId);
      console.log(idx, selectId);
      if (idx != -1) {
        _data.splice(idx, 1);
        setCustomers(_data)
      }
    }
    if (msg.length > 0)
      Toastify(result ? 'success' : 'error', msg)
    setShow(false)
  }
  const onRowsSelectionHandler = (ids: any) => {
  };
  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        <AlertDialog
          alertShow={show}
          alertFun={handleDeleteFuc}
          shopId={shopId}
          id={selectId}
          type="customer"
          subType="deleteCustomer"
        >
          Are you Sure You Want Delete This Customer ?
        </AlertDialog>
        {/* start */}
        {/* router.push('/shop/' + shopId + '/customers/add') */}
        {!isLoading && rules.hasInsert && (
          <div className="mb-2">
            <button
              className="btn btn-primary p-3"
              onClick={() => {
                setShowType("add");
                setCustomerIsModal(true);
              }}
            >
              <FontAwesomeIcon icon={faPlus} /> Add New Customer{" "}
            </button>
          </div>
        )}
        {!isLoading ? (
          <>
            <div className="page-content-style card">
              <h5>Customer List</h5>
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
                rows={customersList}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                onSelectionModelChange={(ids: any) =>
                  onRowsSelectionHandler(ids)
                }
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
      <Customermodal
        shopId={shopId}
        showType={showType}
        userdata={customer}
        customers={customers}
        statusDialog={customerIsModal}
        openDialog={customerModalHandler}
      />
    </>
  );
}
export default Product;
export async function getServerSideProps(context: any) {
  const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
  var _isOk = true, _rule = true;
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