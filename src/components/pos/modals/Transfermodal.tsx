import React, { useState, useContext, useEffect } from "react";
import {
  apiFetch,
  apiUpdateCtr,
  apiInsertCtr,
  apiFetchCtr,
} from "../../../libs/dbUtils";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { ProductContext } from "../../../context/ProductContext";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import SnakeAlert from "../utils/SnakeAlert";
import mStyle from "../../../styles/Customermodal.module.css";
import { Toastify } from "src/libs/allToasts";
import { Button, ButtonGroup } from "react-bootstrap";
import { DataGrid, GridColDef, GridRowParams, GridSelectionModel } from "@mui/x-data-grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
 faSearch
} from "@fortawesome/free-solid-svg-icons";
import { debounce } from "@mui/material";
import { ITransferItem } from "@models/common-model";
// const [locations, setLocations] = useState<{ value: number, label: string }[]>([])

const Transfermodal = (probs: any) => {
  const { openDialog, statusDialog, userdata, showType, shopId } = probs;


  
  
  const [products, setProducts] = useState<
    {
      id: number;
      name: string;
      qty?: number;
      unitPrice?: number;
      subtotal?: number;
    }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [moreInfo, setMoreInfo] = useState(false);
  const [transferInfo, setTransferInfo] = useState<ITransferItem>({
    id:0,
    date: '',
    refNo: 0,
    status: '',
    loctionFrom: 0,
    loctionTo: 0,
    charges:0,
    notes: "",
    product:{
      id:0,
      name:'',
      qty:0,
      sell:0,
      totalPrice:0
    }
  });
  console.log(transferInfo);
  const { customers, setCustomers } = useContext(ProductContext);
  const [open, setOpen] = useState(false);
  // JSON.parse(localStorage.getItem('userlocs') || '[]')
  const [locations, setLocations] = useState<
    { value: number; label: string }[]
  >([]);
  console.log("locationssssssssssss ", locations);

  const [isLoading, setIsLoading] = useState(false);
  const [openSnakeBar, setOpenSnakeBar] = useState(false);
  const handleClose = () => {
    setOpen(false);
    openDialog(transferInfo);
  };
  useEffect(() => {
    if (!statusDialog) return;
    // setTransferInfo(transferTemplte);
    setOpen(statusDialog);
    if (userdata !== undefined && showType != "add" && statusDialog){}
      // getCustomerInfo(userdata.value);
    var _locs = JSON.parse(localStorage.getItem("userlocs") || "[]");
    setLocations(_locs);
  }, [statusDialog]);

  useEffect(() => {
    initDataPage();
  }, []);

  // async function insertCustomerInfo() {
  //   const { success, msg, code, newdata } = await apiInsertCtr({
  //     type: "customer",
  //     subType: "addCustomer",
  //     shopId,
  //     data: transferInfo,
  //   });
  //   if (success) {
  //     setCustomers([...customers, newdata]);
  //     handleClose();
  //     Toastify("success", "Successfully Created");
  //   } else if (code == 100) Toastify("error", msg);
  //   else Toastify("error", "Has Error, Try Again...");
  // }
  // async function getCustomerInfo(theId: any) {
  //   setIsLoading(true);
  //   setTransferInfo(transferTemplte);
  //   var result = await apiFetchCtr({
  //     fetch: "customer",
  //     subType: "getCustomerInfo",
  //     theId,
  //     shopId,
  //   });
  //   if (result.success) {
  //     console.log(result?.newdata[0]);
  //     const selCustomer = result?.newdata[0];
  //     setTransferInfo({
  //       ...transferInfo,
  //       id: theId,
  //       mobile: selCustomer.mobile,
  //       firstName: selCustomer.first_name,
  //       lastName: selCustomer.last_name,
  //       city: selCustomer.city,
  //       state: selCustomer.state,
  //       addr1: selCustomer.addr1,
  //       addr2: selCustomer.addr2,
  //       zipCode: selCustomer.zip_code,
  //       country: selCustomer.country,
  //       shipAddr: selCustomer.shipping_address,
  //     });
  //     setIsLoading(false);
  //     console.log(result.newdata[0].mobile);
  //   } else {
  //     Toastify("error", "has error, Try Again...");
  //   }
  // }

  // async function editCustomerInfo() {
  //   var result = await apiUpdateCtr({
  //     type: "customer",
  //     subType: "editCustomerInfo",
  //     shopId,
  //     data: transferInfo,
  //   });
  //   if (result.success) {
  //     const cinx = customers.findIndex(
  //       (customer) => customer.value === transferInfo.id
  //     );
  //     if (cinx > -1) {
  //       const upCustomer = [...customers];
  //       upCustomer[cinx] = {
  //         ...upCustomer[cinx],
  //         value: transferInfo.id,
  //         label:
  //           transferInfo.firstName +
  //           " " +
  //           transferInfo.lastName +
  //           " | " +
  //           transferInfo.mobile,
  //         mobile: result.newdata.mobile,
  //       };
  //       setCustomers(upCustomer);
  //     }
  //     handleClose();
  //     Toastify("success", "Successfully Edited");
  //   } else Toastify("error", "has error, Try Again...");
  // }
  const makeShowSnake = (val: any) => {
    setOpenSnakeBar(val);
  };

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

    
    // console.log(data.products);
    var products = data.products.map(ele => {
      const subtotal = ele.sell_price * 1;
      return {id: ele.id, name: ele.name, subtotal: subtotal, unitPrice: ele.sell_price, qty: 1}
    })
    console.log(products);
    
    setProducts(products);
    setFilteredProducts(products);
    setIsLoading(false);
  }


  const handelChangeQty = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const value = event.target.value;
    let prods = [...products];
    let idx = prods.findIndex(ele => ele.id == id);
    prods[idx].qty = +value;
    prods[idx].subtotal = +value * prods[idx].unitPrice
    setProducts(prods);
    if(id == transferInfo.product.id){
      setTransferInfo({...transferInfo, product: {id: prods[idx].id, name: prods[idx].name, qty: prods[idx].qty, sell: prods[idx].unitPrice, totalPrice: prods[idx].subtotal}})
    }
  } 
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
    { field: "id", headerName: "#", minWidth: 50 },
    { field: "name", headerName: "name ", flex: 1 },
    {
      field: "qty",
      headerName: "Quantity",
      flex: 0.5,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <input
            type="number"
            name="qty"
            className="form-control"
            value={row.qty}
            min={1}
            onChange={(e => {
              handelChangeQty(e, row.id)
            })}
          />
        </>
      ),
    },
    {
      field: "unitPrice",
      headerName: "Unit Price",
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <input
          disabled
            type="number"
            name="unit-price"
            className="form-control"
            value={row.unitPrice}
          />
        </>
      ),
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <input
          disabled
            type="number"
            name="subtotal"
            className="form-control"
            value={row.subtotal}
            // onChange={(e) =>
            //   setTransferInfo({
            //     ...transferInfo,
            //     firstName: e.target.value,
            //   })
            // }
          />
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
            <Button
            // onClick={() => {
            //   setSelectId(row.id);
            //   setShow(true);
            // }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </ButtonGroup>
        </>
      ),
    },
  ];


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
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filteredList);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const onRowsSelectionHandler = (ele: any)=>{
    console.log(ele);
    const idx = products.findIndex(e => e.id == ele)
    setTransferInfo({...transferInfo, product:{id: products[idx].id, name: products[idx].name, qty: products[idx].qty, sell: products[idx].unitPrice, totalPrice: products[idx].subtotal}})
  }
  return (
    <>
      <Dialog
        open={open}
        className="poslix-modal"
        onClose={handleClose}
        maxWidth={"xl"}
      >
        <DialogTitle className="poslix-modal-title text-primary">
          {showType + " stock transfer"}
        </DialogTitle>
        <DialogContent>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                margin: "20px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <div className="poslix-modal">
              <div className="modal-content">
                <div className="modal-body">
                  <fieldset disabled={showType == "show" ? true : false}>
                    <div className="row">
                      <div className="col-lg-4 mb-3">
                        <label>Date</label>
                        <input
                          type="datetime-local"
                          name="date"
                          className="form-control"
                          value={transferInfo.date}
                          onChange={(e) =>
                            setTransferInfo({
                              ...transferInfo,
                              date: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-lg-4 mb-3">
                        <label>Refrence No</label>
                        <input
                          type="number"
                          name="refrence-no"
                          className="form-control"
                          placeholder="Transactions"
                          min={1}
                          value={transferInfo.refNo}
                          onChange={(e) =>
                            setTransferInfo({
                              ...transferInfo,
                              refNo: +e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-lg-4 mb-3">
                        <label>Status</label>
                        <select className="form-select" defaultValue={transferInfo.status} onChange={(e) =>
                            setTransferInfo({
                              ...transferInfo,
                              status: e.target.value,
                            })}>
                          <option value={'Draft'}>Draft</option>
                          <option value={'Processing'}>Processing</option>
                          <option value={'Received'}>Received</option>
                        </select>
                      </div>
                      <div className="col-lg-6 mb-3">
                        <label>Location from</label>
                        <select className="form-select" onChange={(e) =>
                            setTransferInfo({
                              ...transferInfo,
                              loctionFrom: +e.target.value,
                            })}>
                          {locations.map((el, i) => {
                            return <option key={el.value} value={el.value}>{el.label}</option>;
                          })}
                        </select>
                      </div>
                      <div className="col-lg-6 mb-3">
                        <label>Location to</label>
                        <select className="form-select" onChange={(e) =>
                            setTransferInfo({
                              ...transferInfo,
                              loctionTo: +e.target.value,
                            })}>
                          {locations.map((el, i) => {
                            return <option key={el.value} value={el.value}>{el.label}</option>;
                          })}
                        </select>
                      </div>
                      <div className="col-lg-8 input-group mb-3">
                        <span className="input-group-text" id="basic-addon1">
                        <FontAwesomeIcon icon={faSearch} />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search"
                          onChange={handleSearch}
                        />
                      </div>
                      <div style={{ height: 350, width: '100%' }}>
                        <DataGrid
                          // checkboxSelection
                          className="datagrid-style"
                          sx={{
                            ".MuiDataGrid-columnSeparator": {
                              display: "none",
                            },
                            "&.MuiDataGrid-root": {
                              border: "none",
                            },
                          }}
                          checkboxSelection
                          hideFooter
                          disableSelectionOnClick
                          rows={searchTerm.length > 0 ? filteredProducts : []}
                          columns={columns}
                          // pageSize={10}
                          // rowsPerPageOptions={[10]}
                          
                          onSelectionModelChange={(ids: GridSelectionModel) =>
                            {
                              let lastId = [...ids].pop()
                            onRowsSelectionHandler(lastId)
                            // console.log('idddddddddd', ids);
                            }
                            
                          }
                          // onCellClick={handleCellClick}
                          // components={{ Toolbar: CustomToolbar }}
                        />
                      </div>

                      <div className="col-lg-6 mb-3">
                        <label>Shipping Charges: </label>
                        <input
                          type="number"
                          name="charge"
                          className="form-control"
                          value={transferInfo.charges}
                          onChange={(e) =>
                            setTransferInfo({
                              ...transferInfo,
                              charges: +(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="col-lg-6 mb-3">
                        <label htmlFor="notes" className="form-label">
                          Example textarea
                        </label>
                        <textarea
                          className="form-control"
                          id="notes"
                          rows={3}
                          value={transferInfo.notes}
                          onChange={(e) =>
                            setTransferInfo({
                              ...transferInfo,
                              notes: e.target.value,
                            })}
                        ></textarea>
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div className="modal-footer">
                  <a
                    className="btn btn-link link-success fw-medium"
                    onClick={() => handleClose()}
                  >
                    <i className="ri-close-line me-1 align-middle" /> Close
                  </a>
                  {showType != "show" && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      // onClick={() => {
                      //   console.log(transferInfo);
                      //   if (showType == "edit") editCustomerInfo();
                      //   else insertCustomerInfo();
                      // }}
                      onClick={handleClose}
                    >
                      {showType} Transfer
                    </button>
                  )}
                </div>
              </div>
              {/* /.modal-content */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Transfermodal;
