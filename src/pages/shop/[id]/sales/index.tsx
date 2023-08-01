import React, { useContext, useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbar,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { AdminLayout } from "@layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPenToSquare,
  faPlus,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { Button, ButtonGroup } from "react-bootstrap";
import { useRouter } from "next/router";
import AlertDialog from "src/components/utils/AlertDialog";
import { apiFetch, apiFetchCtr } from "src/libs/dbUtils";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { ILocationSettings, ITokenVerfy } from "@models/common-model";
import * as cookie from "cookie";
import {
  hasPermissions,
  keyValueRules,
  verifayTokens,
} from "src/pages/api/checkUtils";
import { UserContext } from "src/context/UserContext";
import { useReactToPrint } from "react-to-print";
import { Toastify } from "src/libs/allToasts";
import { ToastContainer } from "react-toastify";
import SalesListTable from "src/components/dashboard/SalesListTable";

export default function SalesList(props: any) {
  const { shopId, rules } = props;
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({
    value: 0,
    label: "",
    currency_decimal_places: 0,
    currency_code: "",
    currency_id: 0,
    currency_rate: 1,
    currency_symbol: "",
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [sales, setsales] = useState<any>([]);
  const router = useRouter();
  const [selectId, setSelectId] = useState(0);
  const [selectRow, setSelectRow] = useState<any>({});
  const [lines, setLines] = useState<any>([]);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(false);
  const [isLoadItems, setIsLoadItems] = useState(false);
  const [showViewPopUp, setShowViewPopUp] = useState(false);
  const [handleSearchTxt, setHandleSearchTxt] = useState("");
  const { setInvoicDetails, invoicDetails } = useContext(UserContext);

  console.log(locationSettings.currency_decimal_places);
  
  //table columns
  const columns: GridColDef[] = [
    { field: "id", headerName: "#", minWidth: 50 },
    { field: "customer_name", headerName: "Customer Name", flex: 1 },
    { field: "mobile", headerName: "Mobile", flex: 1, disableColumnMenu: true },
    { field: "sale_date", headerName: "Sale Date", flex: 1 },
    // { field: "total_price", headerName: "Final Total ", flex: 1 },
    { field: "total_price", headerName: "Final Total ", flex: 1,
    renderCell: ({ row }: Partial<GridRowParams>) => (
      <>{Number(+row.total_price).toFixed(locationSettings.currency_decimal_places)}</>
    ),
  
  },
    { field: "amount", headerName: "Amount paid", flex: 1 },
    {
      flex: 1,
      field: "TotalDue",
      headerName: "Total Due ",
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>{Number(+row.total_price - +row.amount).toFixed(locationSettings.currency_decimal_places)}</>
      ),
    },
    {
      flex: 1,
      field: "status",
      headerName: "Status",
      renderCell: ({ row }: Partial<GridRowParams>) => {
        if (Number(+row.total_price - +row.amount) === 0) {
          return (
            <>
              <div className="sty_Paid">Paid</div>
            </>
          );
        } else if (
          Number(+row.total_price - +row.amount) === Number(row.total_price)
        ) {
          return (
            <>
              <div className="sty_n_Paid">Not Paid</div>
            </>
          );
        } else {
          return (
            <>
              <div className="sty_p_Paid">Partially Paid</div>
            </>
          );
        }
      },
    },
    {
      flex: 1,
      field: "action",
      headerName: "Action ",
      filterable: false,
      sortable: false,
      disableExport: true,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <ButtonGroup className="mb-2 m-buttons-style">
            <Button
              onClick={() => {
                setEdit(true);
                onRowsSelectionHandler(row);
              }}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </Button>
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
                onRowsSelectionHandler(row);
              }}
            >
              <FontAwesomeIcon icon={faEye} />
            </Button>
          </ButtonGroup>
        </>
      ),
    },
  ];
  // console.log(sales);

  const componentRef = React.useRef(null);
  class ComponentToPrint extends React.PureComponent {
    render() {
      if (!selectRow) return;
      return (
        <div className="bill">
          <div className="brand-logo">
            <img src={invoicDetails.logo} />
          </div>
          <br />
          <div className="brand-name">{invoicDetails.name}</div>
          <div className="shop-details">{invoicDetails.tell}</div>
          <br />
          <div className="bill-details">
            <div className="flex justify-between">
              <div>
                {invoicDetails.txtCustomer}{" "}
                {invoicDetails.isMultiLang && invoicDetails.txtCustomer2}
              </div>
              <div>{selectRow.customer_name}</div>
            </div>
            <div className="flex justify-between">
              <div>
                {invoicDetails.orderNo}{" "}
                {invoicDetails.isMultiLang && invoicDetails.orderNo2}
              </div>
              <div>{selectRow.id}</div>
            </div>
            <div className="flex justify-between">
              <div>
                {invoicDetails.txtDate}{" "}
                {invoicDetails.isMultiLang && invoicDetails.txtDate2}
              </div>
              <div>{new Date().toISOString().slice(0, 10)}</div>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr className="header">
                <th>
                  {invoicDetails.txtQty}
                  <br />
                  {invoicDetails.isMultiLang && invoicDetails.txtQty2}
                </th>
                <th>
                  {invoicDetails.txtItem}
                  <br />
                  {invoicDetails.isMultiLang && invoicDetails.txtItem2}
                </th>
                <th></th>
                <th>
                  {invoicDetails.txtAmount}
                  <br />
                  {invoicDetails.isMultiLang && invoicDetails.txtAmount2}
                </th>
              </tr>
              {lines &&
                lines.map((line: any, index: number) => {
                  return (
                    <tr key={index}>
                      <td>{Number(line.qty)}</td>
                      <td>{line.name}</td>
                      <td></td>
                      <td>{line.price}</td>
                    </tr>
                  );
                })}
              <tr className="net-amount">
                <td></td>
                <td>
                  {invoicDetails.txtTax}{" "}
                  {invoicDetails.isMultiLang && invoicDetails.txtTax2}
                </td>
                <td></td>
                {/* <td>{(selectRow.total_price).toFixed(locationSettings.currency_decimal_places)}</td> */}
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className="txt-bold">
                  {invoicDetails.txtTotal}{" "}
                  {invoicDetails.isMultiLang && invoicDetails.txtTotal2}
                </td>
                <td></td>
                <td className="txt-bold">
                  {Number(selectRow.total_price).toFixed(
                    locationSettings.currency_decimal_places
                  )}
                </td>
              </tr>
            </thead>
          </table>
          <p className="recipt-footer">
            {invoicDetails.footer}
            {invoicDetails.isMultiLang && invoicDetails.footer2}
          </p>
          <p className="recipt-footer">{selectRow.notes}</p>
          <br />
        </div>
      );
    }
  }

  const componentRef2 = React.useRef(null);
  class ComponentToPrint2 extends React.PureComponent {
    render() {
      if (!selectRow) return;
      return (
        <div className="bill2">
          <div className="brand-logo">
            <img src={invoicDetails.logo} />
            <div className="invoice-print">
              INVOICE
              <div>
                <table className="GeneratedTable">
                  <tbody>
                    <tr>
                      <td className="td_bg">INVOICE NUMBER </td>
                      <td>{selectRow.id}</td>
                    </tr>
                    <tr>
                      <td className="td_bg">INVOICE DATE </td>
                      <td>{new Date().toISOString().slice(0, 10)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <br />
          {/* <div className="brand-name">
                        {invoicDetails.name}
                    </div> */}
          {/* <div className="shop-details">
                        {invoicDetails.tell}
                    </div> */}
          <div className="up_of_table flex justify-between">
            <div className="left_up_of_table">
              <div>Billed From</div>
              <div>Global Tech Projects</div>
              <div>info@poslix.com</div>
              <div>+986 2428 8077</div>
              <div>Office 21-22, Building 532, Mazoon St. Muscat, Oman</div>
              <div>VAT Number: OM1100270001</div>
            </div>
            <div className="right_up_of_table">
              <div>Billed To</div>
              <div>{selectRow.customer_name}</div>
              {/* <span>Billed To</span> */}
            </div>
          </div>
          <br />
          {/* <div className="bill-details">
                        <div className="flex justify-between">
                            <div>{invoicDetails.txtCustomer} {invoicDetails.isMultiLang && invoicDetails.txtCustomer2}</div>
                            <div>{selectRow.customer_name}</div>
                        </div>
                        <div className="flex justify-between">
                            <div>{invoicDetails.orderNo} {invoicDetails.isMultiLang && invoicDetails.orderNo2}</div>
                            <div>{selectRow.id}</div>
                        </div>
                        <div className="flex justify-between">
                            <div>{invoicDetails.txtDate} {invoicDetails.isMultiLang && invoicDetails.txtDate2}</div>
                            <div>{new Date().toISOString().slice(0, 10)}</div>
                        </div>
                    </div> */}

          <table className="GeneratedTable2">
            <thead>
              <tr>
                <th>Description</th>
                <th>
                  {" "}
                  {invoicDetails.txtQty}
                  <br />
                  {invoicDetails.isMultiLang && invoicDetails.txtQty2}
                </th>
                <th>Unit Price</th>
                {/* <th> {invoicDetails.txtItem}<br />{invoicDetails.isMultiLang && invoicDetails.txtItem2}</th> */}
                <th>Tax</th>
                <th>
                  {" "}
                  {invoicDetails.txtAmount}
                  <br />
                  {invoicDetails.isMultiLang && invoicDetails.txtAmount2}
                </th>
              </tr>
            </thead>
            {lines &&
              lines.map((line: any, index: number) => {
                return (
                  <tr key={index}>
                    <td>{line.name}</td>
                    <td>{Number(line.qty)}</td>
                    <td>{line.price}</td>
                    <td></td>
                    <td>{line.price * Number(line.qty)}</td>
                  </tr>
                );
              })}

            <tbody>
              <tr>
                {/* <td>{invoicDetails.txtTax} {invoicDetails.isMultiLang && invoicDetails.txtTax2}</td> */}
                <td colSpan={4} className="txt_bold_invoice">
                  Sub Total
                </td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={4} className="txt_bold_invoice">
                  {invoicDetails.txtTotal}{" "}
                  {invoicDetails.isMultiLang && invoicDetails.txtTotal2}
                </td>
                <td className="txt_bold_invoice">
                  {Number(selectRow.total_price).toFixed(
                    locationSettings.currency_decimal_places
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* <table className="table">
            <thead>
              <tr className="header">
                <th>
                  {invoicDetails.txtQty}<br />{invoicDetails.isMultiLang && invoicDetails.txtQty2}
                </th>
                <th>
                  {invoicDetails.txtItem}<br />{invoicDetails.isMultiLang && invoicDetails.txtItem2}
                </th>
                <th>
                </th>
                <th>
                  {invoicDetails.txtAmount}<br />{invoicDetails.isMultiLang && invoicDetails.txtAmount2}
                </th>
              </tr>
              {lines && lines.map((line: any, index: number) => {
                return (
                  <tr key={index}>
                    <td>{Number(line.qty)}</td>
                    <td>{line.name}</td>
                    <td></td>
                    <td>{line.price}</td>
                  </tr>
                );
              })}
              <tr className="net-amount">
                <td></td>
                <td>{invoicDetails.txtTax} {invoicDetails.isMultiLang && invoicDetails.txtTax2}</td>
                <td></td>
                <td>{(selectRow.total_price).toFixed(locationSettings.currency_decimal_places)}</td>
              </tr>
              <tr className="net-amount">
                <td></td>
                <td className='txt-bold'>{invoicDetails.txtTotal} {invoicDetails.isMultiLang && invoicDetails.txtTotal2}</td>
                <td></td>
                <td className='txt-bold'>{Number(selectRow.total_price).toFixed(locationSettings.currency_decimal_places)}</td>
              </tr>
            </thead>
          </table> */}
          <p className="recipt-footer">
            {invoicDetails.footer}
            <br />
            {invoicDetails.footersecond}
            {invoicDetails.isMultiLang && invoicDetails.footer2}
          </p>
          <p className="recipt-footer">{selectRow.notes}</p>
          <br />
        </div>
      );
    }
  }

  async function viewTransaction() {
    setShowViewPopUp(true);
    var result = await apiFetch({
      fetch: "getSellLinesByTransactionId",
      data: { id: selectId },
    });
    const { success, newdata } = result;
    if (success) {
      setLines(newdata.sellLines);
    }
  }
  // init sales data
  async function initDataPage() {
    const { success, newdata } = await apiFetchCtr({
      fetch: "transactions",
      subType: "getSales",
      shopId,
    });
    if (success) {
      setsales(newdata.data);
      if (newdata.invoiceDetails != null && newdata.invoiceDetails.length > 10)
        setInvoicDetails(JSON.parse(newdata.invoiceDetails));
    }
  }

  async function getItems(id: number) {
    setIsLoadItems(true);
    const { success, newdata } = await apiFetchCtr({
      fetch: "transactions",
      subType: "getSaleItems",
      shopId,
      id,
    });
    if (success) {
      setLines(newdata);
      setIsLoadItems(false);
    }
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
      const _data = [...sales];
      const idx = _data.findIndex((itm: any) => itm.id == selectId);
      console.log(idx, selectId);
      if (idx != -1) {
        _data.splice(idx, 1);
        setsales(_data);
      }
    }
    if (msg.length > 0) Toastify(result ? "success" : "error", msg);
    setShow(false);
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
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const handlePrint2 = useReactToPrint({
    content: () => componentRef2.current,
  });
  const onRowsSelectionHandler = (selectedRowsData: any) => {
    setSelectRow(selectedRowsData);
    setSelectId(selectedRowsData.id);
    getItems(selectedRowsData.id);
    setShowViewPopUp(true);
  };
  const handleSearch = (e: any) => {
    console.log(e.target.value);
    setHandleSearchTxt(e.target.value);
  };
  return (
    <AdminLayout shopId={shopId}>
      <SalesListTable shopId={shopId} rules={rules}/>
    </AdminLayout>
  );
}
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
          const { userRules, hasPermission } = hasPermissions(_stuf, "sales");
          _rule = hasPermission;
          _userRules = userRules;
        } else _rule = false;
      }
    }
  );
  if (!_isOk)
    return { redirect: { permanent: false, destination: "/user/login" } };
  if (!_rule)
    return { redirect: { permanent: false, destination: "/page403" } };
  return {
    props: { shopId: context.query.id, rules: _userRules },
  };
  //status ok
}
