import type { NextPage } from "next";
import Image from "next/image";
import Table from "react-bootstrap/Table";
import { AdminLayout } from "@layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Spinner from "react-bootstrap/Spinner";
import {
  faTrash,
  faPenToSquare,
  faPlus,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { Button, ButtonGroup, Card } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { apiFetchCtr } from "../../../../libs/dbUtils";
import { useRouter } from "next/router";
import AlertDialog from "src/components/utils/AlertDialog";
import { redirectToLogin } from "../../../../libs/loginlib";
import {
  ILocationSettings,
  IPageRules,
  ITokenVerfy,
} from "@models/common-model";
import {
  hasPermissions,
  keyValueRules,
  verifayTokens,
} from "src/pages/api/checkUtils";
import * as cookie from "cookie";
import ShowPriceListModal from "src/components/dashboard/modal/ShowPriceListModal";
import { Toastify } from "src/libs/allToasts";
import { ToastContainer } from "react-toastify";
import Transfermodal from "../../../../components/pos/modals/Transfermodal";
const Product: NextPage = (probs: any) => {
  const { shopId, rules } = probs;
  const myLoader = (img: any) => img.src;
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({
    value: 0,
    label: "",
    currency_decimal_places: 0,
    currency_code: "",
    currency_id: 0,
    currency_rate: 1,
    currency_symbol: "",
  });
  const router = useRouter();
  const [products, setProducts] = useState<
    { id: number; name: string; sku: string; type: string; qty: number }[]
  >([]);
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [type, setType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenPriceDialog, setIsOpenPriceDialog] = useState(false);

  async function initDataPage() {
    const { success, data } = await apiFetchCtr({
      fetch: "products",
      subType: "getProducts",
      shopId,
    });
    if (!success) {
      Toastify("error", "Somthing wrong!!, try agian");
      return;
    }
    setProducts(data.products);
    setIsLoading(false);
  }

  useEffect(() => {
    var _locs = JSON.parse(localStorage.getItem("userlocs") || "[]");
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.value == shopId;
          })
        ]
      );
    else alert("errorr location settings");
    initDataPage();
  }, [router.asPath]);

  const [customerIsModal, setCustomerIsModal] = useState<boolean>(false);
  const customerModalHandler = (status: any) => {
    setCustomerIsModal(false);
    initDataPage();
  };

  const handleClick = (index: number) => {
    if (products[index].type != "package" && products[index].qty > 0) {
      setSelectId(products[index].id);
      setType(products[index].type);
      setIsOpenPriceDialog(true);
    }
  };
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
    if (msg.length > 0) Toastify(result ? "success" : "error", msg);
    setShow(false);
  };

  const customersList = [
    {
      id: 4888,
      name: "Eslam ",
      transactions: "30",
      paid: "20",
      unpaid: "10",
    },
    {
      id: 4803,
      name: "Azza Al Marhoobi",
      transactions: "22",
      paid: "10",
      unpaid: "12",
    },
  ];

  const columns: GridColDef[] = [
    { field: "id", headerName: "#", minWidth: 50 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "transactions", headerName: "Transactions", flex: 1 },
    { field: "paid", headerName: "Paid invoices", flex: 1 },
    { field: "unpaid", headerName: "Unpaid invoices", flex: 1 },
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
                //   router.push("/shop/" + shopId + "/customers/" + row.id);
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
          subType="deleteProduct"
        >
          Are you Sure You Want Delete This Item ?
        </AlertDialog>
        {!isLoading && rules.hasInsert && (
          <div className="mb-2">
            <button
              className="btn btn-primary p-3"
              onClick={() => {
                setCustomerIsModal(true);
              }}
            >
              <FontAwesomeIcon icon={faPlus} /> Add New Transfer{" "}
            </button>
          </div>
        )}
        {!isLoading ? (
          <div className="page-content-style card">
            <h5>Transfers List</h5>
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
              components={{ Toolbar: CustomToolbar }}
            />
          </div>
        ) : (
          <div className="d-flex justify-content-around">
            <Spinner animation="grow" />
          </div>
        )}
      </AdminLayout>
      <Transfermodal
        shopId={shopId}
        showType={"add"}
        userdata={{}}
        customers={{}}
        statusDialog={customerIsModal}
        openDialog={customerModalHandler}
      />
    </>
  );
};
export default Product;
export async function getServerSideProps(context: any) {
  const parsedCookies = cookie.parse(context.req.headers.cookie || "[]");
  var _isOk = true,
    _rule = true;
  //check page params
  var shopId = context.query.id;
  if (shopId == undefined)
    return { redirect: { permanent: false, destination: "/page403" } };

  //check user permissions
  var _userRules = {};
  await verifayTokens(
    { headers: { authorization: "Bearer " + parsedCookies.tokend } },
    (repo: ITokenVerfy) => {
      _isOk = repo.status;

      if (_isOk) {
        var _rules = keyValueRules(repo.data.rules || []);
        console.log(_rules);
        if (
          _rules[-2] != undefined &&
          _rules[-2][0].stuff != undefined &&
          _rules[-2][0].stuff == "owner"
        ) {
          _rule = true;
          _userRules = {
            hasDelete: true,
            hasEdit: true,
            hasView: true,
            hasInsert: true,
          };
        } else if (_rules[shopId] != undefined) {
          var _stuf = "";
          _rules[shopId].forEach((dd: any) => (_stuf += dd.stuff));
          const { userRules, hasPermission } = hasPermissions(
            _stuf,
            "products"
          );
          _rule = hasPermission;
          _userRules = userRules;
        } else _rule = false;
      }
    }
  );
  console.log("_isOk22    ", _isOk);
  if (!_isOk)
    return { redirect: { permanent: false, destination: "/user/login" } };
  if (!_rule)
    return { redirect: { permanent: false, destination: "/page403" } };
  return {
    props: { shopId: context.query.id, rules: _userRules },
  };
  //status ok
}
