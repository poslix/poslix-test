import React, { useContext, useState, useEffect } from "react";
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { AdminLayout } from "@layout";

import { IconButton } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
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
import DatePicker from "src/components/filters/Date";

const pageSizeOptions = [10, 20, 50, 100];
export default function SalesReport(props: any) {
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
  const [filteredSales, setFilteredSales] = useState<any>([]);
  const [customersOptions, setCustomersOptions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const router = useRouter();
  const [selectId, setSelectId] = useState(0);
  const [selectRow, setSelectRow] = useState<any>({});
  const [lines, setLines] = useState<any>([]);
  const [show, setShow] = useState(false);
  const [isLoadItems, setIsLoadItems] = useState(false);
  const [showViewPopUp, setShowViewPopUp] = useState(false);
  const [handleSearchTxt, setHandleSearchTxt] = useState("");
  const [details, setDetails] = useState({ subTotal: 1, tax: 0, cost: 0 });
  const { setInvoicDetails, invoicDetails } = useContext(UserContext);

  //table columns
  const columns: GridColDef[] = [
    { field: "id", headerName: "#", maxWidth: 72 },
    { field: "created_at", headerName: "Date", flex: 1 },
    { field: "added_by", headerName: "Sold By", flex: 1 },
    { field: "customer_name", headerName: "Sold To", flex: 1 },
    {
      field: "tax_amount",
      headerName: "Tax",
      flex: 1,
      disableColumnMenu: true,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        Number(row.tax_amount).toFixed(
          locationSettings.currency_decimal_places
        ),
    },
    {
      field: "total_price",
      headerName: "Total",
      maxWidth: 72,
      renderCell: ({ row }: Partial<GridRowParams>) =>
        Number(row.total_price).toFixed(
          locationSettings.currency_decimal_places
        ),
    },
    { field: "notes", headerName: "Note", flex: 1, disableColumnMenu: true },
  ];

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

  useEffect(() => {
    const customers = [];
    sales.forEach((sale) => {
      if (!customers.includes(sale.customer_name))
        customers.push(sale.customer_name);
    });
    setCustomersOptions(customers);
  }, [sales]);
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
    var _locs = JSON.parse(localStorage.getItem("userlocs") || "[]");
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.value == shopId;
          })
        ]
      );

    const { success, data } = await apiFetchCtr({
      fetch: "reports",
      subType: "getSalesReport",
      shopId,
    });
    if (success) {
      setsales(data.sales);
      setFilteredSales(data.sales);
      setDetails(data.sums[0]);
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
  }, []);

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
  const onRowsSelectionHandler = (selectedRowsData: any) => {
    setSelectRow(selectedRowsData);
    setSelectId(selectedRowsData.id);
    getItems(selectedRowsData.id);
    setShowViewPopUp(true);
  };
  const handleSearch = (e: any) => {
    setHandleSearchTxt(e.target.value);
  };
  const [selectedRange, setSelectedRange] = useState(null);
  const [strSelectedDate, setStrSelectedDate] = useState([]);
  const [selectedDateVlaue, setSelectedDateValue] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);

  useEffect(() => {
    let localFilteredSales = [];
    if (strSelectedDate.length === 2) {
      const filteredList = sales.filter((sale) => {
        const dateCreated = sale.created_at.split(" ")[0];
        return (
          new Date(dateCreated).getDate() >= new Date(strSelectedDate[0]).getDate() 
          && new Date(dateCreated).getMonth() >= new Date(strSelectedDate[0]).getMonth() 
          && new Date(dateCreated).getFullYear() >= new Date(strSelectedDate[0]).getFullYear()
          && new Date(dateCreated).getDate() <= new Date(strSelectedDate[1]).getDate()
          && new Date(dateCreated).getMonth() <= new Date(strSelectedDate[1]).getMonth()
          && new Date(dateCreated).getFullYear() <= new Date(strSelectedDate[1]).getFullYear()
        );
      });
      setSelectedDateValue(`${strSelectedDate[0]} - ${strSelectedDate[1]}`);
      localFilteredSales = filteredList;
    } else if (strSelectedDate.length === 1) {
      const filteredList = sales.filter((sale) => {
        const dateCreated = sale.created_at.split(" ")[0];
        return new Date(dateCreated).getDate() === new Date(strSelectedDate[0]).getDate() && new Date(dateCreated).getMonth() === new Date(strSelectedDate[0]).getMonth() && new Date(dateCreated).getFullYear() === new Date(strSelectedDate[0]).getFullYear();


      });
      setSelectedDateValue(strSelectedDate[0]);
      localFilteredSales = filteredList;
    } else {
      localFilteredSales = sales;
    }
    if (selectedCustomer) {
      localFilteredSales = localFilteredSales.filter(
        (sale) => sale.customer_name === selectedCustomer
      );
    }
    //Eslam 19
    let totalPrice = 0;
    let taxAmount = 0;
    localFilteredSales.forEach((obj) => {
      const price = parseFloat(obj.total_price);
      const tax = parseFloat(obj.tax_amount);
      totalPrice += price;
      taxAmount += tax;
    });
    const totalPriceAndTax = totalPrice + taxAmount;
    setDetails({
      subTotal: totalPrice,
      tax: taxAmount,
      cost: totalPriceAndTax,
    });
    setFilteredSales(localFilteredSales);
  }, [strSelectedDate, selectedCustomer]);

  const handleChangeCustomer = (event: SelectChangeEvent<string>) => {
    setSelectedCustomer(event.target.value);
  };

  const resetFilters = () => {
    setFilteredSales(sales);
    setSelectedCustomer("");
    setSelectedRange(null);
    setStrSelectedDate([]);
    setPage(0);
  };

  const handlePageChange = (params) => {
    setPage(params.page);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(+event.target.value);
    setPage(0);
  };

  const handlePrevPageButtonClick = () => {
    setPage((prevPage) => prevPage - 1);
  };

  const handleNextPageButtonClick = () => {
    setPage((prevPage) => prevPage + 1);
  };

  return (
    <AdminLayout shopId={shopId}>
      <div className="flex" style={{ alignItems: "center" }}>
        <DatePicker
          {...{
            strSelectedDate,
            setStrSelectedDate,
            selectedRange,
            setSelectedRange,
          }}
        />
        <FormControl sx={{ m: 1, width: 220 }}>
          <InputLabel id="customer-select-label">Customer</InputLabel>
          <Select
            labelId="customer-select-label"
            id="customer-select"
            value={selectedCustomer}
            label="Customer"
            onChange={handleChangeCustomer}
          >
            {customersOptions.map((customer) => (
              <MenuItem key={customer} value={customer}>
                {customer}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          onClick={resetFilters}
          style={{ height: "56px", marginLeft: "auto" }}
        >
          CLEAR
        </Button>
      </div>
      <AlertDialog
        alertShow={show}
        alertFun={(e: boolean) => setShow(e)}
        id={selectId}
        type="deleteSale"
        products={filteredSales}
      >
        Are you Sure You Want Delete This Item ?
      </AlertDialog>
      {
        <div style={{ display: "none" }}>
          <ComponentToPrint ref={componentRef} />
        </div>
      }
      <div className="page-content-style card">
        <h5> Report Sales</h5>
        <div className="deatils_box">
          <div>
            <span>SubTotal: </span>
            {Number(details.subTotal).toFixed(3)}{" "}
            {locationSettings.currency_code}
          </div>
          <div>
            <span>Tax: </span>
            {Number(details.tax).toFixed(3)} {locationSettings.currency_code}
          </div>
          <div>
            <span>Total: </span>
            {Number(Number(details.subTotal) + Number(details.tax)).toFixed(
              3
            )}{" "}
            {locationSettings.currency_code}
          </div>
        </div>

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
          rows={filteredSales}
          columns={columns}
          components={{
            Toolbar: CustomToolbar,
            Footer: () => {
              const startingPage = page * pageSize + 1;
              const endPage =
                page * pageSize + pageSize > filteredSales.length
                  ? filteredSales.length
                  : page * pageSize + pageSize;
              let total = 0;
              filteredSales
                .slice(startingPage - 1, endPage)
                .forEach(
                  (filteredSale) => (total += Number(filteredSale.total_price))
                );
              return (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <span style={{ fontWeight: "bold" }}>Page Total: </span>
                    {total.toFixed(3)} {locationSettings.currency_code}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        marginRight: "16px",
                      }}
                    >
                      <span style={{ marginRight: "16px" }}>
                        Rows per page:
                      </span>
                      <Select value={pageSize} onChange={handlePageSizeChange}>
                        {pageSizeOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        marginRight: "16px",
                      }}
                    >
                      <IconButton
                        disabled={page === 0}
                        onClick={handlePrevPageButtonClick}
                      >
                        <KeyboardArrowLeft />
                      </IconButton>
                      <div style={{ marginLeft: "16px", marginRight: "16px" }}>
                        {startingPage} - {endPage} of {filteredSales.length}
                      </div>
                      <IconButton
                        disabled={
                          page >= Math.ceil(filteredSales.length / pageSize) - 1
                        }
                        onClick={handleNextPageButtonClick}
                      >
                        <KeyboardArrowRight />
                      </IconButton>
                    </div>
                  </div>
                </div>
              );
            },
          }}
          pagination
          page={page}
          pageSize={pageSize}
          rowCount={filteredSales.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          // initialState={{
          //   pagination: { pageSize: 5 },
          // }}
          // pageSizeOptions={[5, 10, 25]}
        />
      </div>
      {/* FOR VIEW ELEMENT */}
      <Dialog
        open={showViewPopUp}
        fullWidth={true}
        className="poslix-modal"
        onClose={handleClose}
      >
        <DialogTitle className="poslix-modal text-primary">
          Sale Details
        </DialogTitle>
        <DialogContent className="poslix-modal-content">
          <div className="poslix-modal">
            <div className="top-section-details">
              <img
                src={invoicDetails.logo}
                style={{ width: "80px", marginBottom: "10px" }}
              />
              <div className="item-sections">
                <div className="top-detials-invoice">
                  <div className="top-detials-item">
                    <p>Invoice No :</p>
                    <p>{selectRow.id}</p>
                  </div>
                  <div className="top-detials-item">
                    <p>Invoice Date :</p>
                    <p>{selectRow.sale_date}</p>
                  </div>
                  <div className="top-detials-item">
                    <p>Added By :</p>
                    <p>{selectRow.added_by}</p>
                  </div>
                </div>
                <div className="top-detials-invoice">
                  <div className="top-detials-item">
                    <p>Final Total :</p>
                    <p>{selectRow.total_price}</p>
                  </div>
                  <div className="top-detials-item">
                    <p>Customer Name :</p>
                    <p>{selectRow.customer_name}</p>
                  </div>
                  <div
                    className="top-detials-item"
                    style={{ fontSize: "13px" }}
                  >
                    <p>Order Note</p>
                    <p>{selectRow.notes}</p>
                  </div>
                </div>
              </div>
              <div>
                <Button
                  onClick={() => {
                    handlePrint();
                  }}
                >
                  Print Recipt
                </Button>{" "}
                <Button>Print Invoice</Button>
              </div>
            </div>
            {lines && !isLoadItems ? (
              <div className="row">
                <div className="invoice-items-container">
                  <div className="header-titles">
                    <div>Name</div>
                    <div>Qty</div>
                    <div>Amount</div>
                  </div>
                  {lines.map((line: any, index: number) => {
                    return (
                      <div className="header-items under_items" key={index}>
                        <div>{line.name}</div>
                        <div>{Number(line.qty)}</div>
                        <div>{line.price}</div>
                      </div>
                    );
                  })}
                  <div
                    className="header-titles under_items"
                    style={{ marginTop: "20px" }}
                  >
                    <div></div>
                    <div>Total</div>
                    <div>{selectRow.total_price}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div>laoding...</div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowViewPopUp(false);
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
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
