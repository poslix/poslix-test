import type { NextPage } from "next";
import Image from "next/image";
import { AdminLayout } from "@layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Spinner from "react-bootstrap/Spinner";
import {
  faTrash,
  faPenToSquare,
  faPlus,
  faTag,
  faBarcode,
} from "@fortawesome/free-solid-svg-icons";
import { Button, ButtonGroup, Card } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { apiFetchCtr } from "../../../../libs/dbUtils";
import { useRouter } from "next/router";
import AlertDialog from "src/components/utils/AlertDialog";
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
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { debounce } from "@mui/material/utils";
import TextField from "@mui/material/TextField";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "#", minWidth: 50 },
    {
      field: "image",
      headerName: "Image",
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <Image
          alt=""
          loader={myLoader}
          width={50}
          height={50}
          src={
            row.image && row.image.length > 0
              ? row.image
              : "/images/pos/placeholder.png"
          }
        />
      ),
    },
    { field: "type", headerName: "Type", flex: 0.5 },
    { field: "sku", headerName: "sku ", flex: 0.5 },
    { field: "name", headerName: "name ", flex: 1 },
    {
      field: "sell_price",
      headerName: "sell",
      flex: 1,
      renderCell: (params) =>
        Number(params.value).toFixed(locationSettings.currency_decimal_places),
    },
    { field: "category", headerName: "Category", flex: 1 },
    {
      field: "qty",
      headerName: "Qty",
      flex: 0.5,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <div
            className={
              row.qty > 0 && row.type != "package" ? "clickable-qty" : ""
            }
          >
            {row.type != "package" ? Number(row.qty).toFixed(0) : "---"}
            <span className="qty-over">
              [{Number(row.qty_over_sold).toFixed(0)}]
            </span>
          </div>
        </>
      ),
    },
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
                onClick={() => {
                  router.push("/shop/" + shopId + "/products/edit/" + row.id);
                }}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
            )}
            {rules.hasDelete && (
              <Button
                onClick={() => {
                  setSelectId(row.id);
                  setShow(true);
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            )}
            <Button
              onClick={() => {
                router.push("/shop/" + shopId + "/products/barcodes/");
              }}
            >
              <FontAwesomeIcon icon={faBarcode} />
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
    setFilteredProducts(data.products);
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
  const onRowsSelectionHandler = (ids: any) => {};
  const handleCellClick = (params, event) => {
    if (params.field === "qty") {
      console.log(params, params.rowIndex);
      let index = products.findIndex((p) => params.id == p.id);
      if (index == -1) return;
      if (products[index].type != "package" && products[index].qty > 0) {
        console.log("products[index].id ", products[index].id);

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
          subType="deleteProduct"
        >
          Are you Sure You Want Delete This Item ?
        </AlertDialog>
        <ShowPriceListModal
          shopId={shopId}
          productId={selectId}
          type={type}
          isOpenPriceDialog={isOpenPriceDialog}
          setIsOpenPriceDialog={() => setIsOpenPriceDialog(false)}
        />
        {/* start */}
        {!isLoading && rules.hasInsert && (
          <div className="mb-2 flex items-center justify-between">
            <button
              className="btn btn-primary p-3"
              onClick={() => router.push("/shop/" + shopId + "/products/add")}
            >
              <FontAwesomeIcon icon={faPlus} /> Add New Product{" "}
            </button>
            <TextField
              label="search name/sku"
              variant="filled"
              onChange={handleSearch}
            />
          </div>
        )}

        {!isLoading ? (
          <>
            <div className="page-content-style card">
              <h5>Product List</h5>
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
                rows={filteredProducts}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                onSelectionModelChange={(ids: any) =>
                  onRowsSelectionHandler(ids)
                }
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
