import React, { useState, useContext, useEffect } from 'react'
import { apiFetchCtr } from '../../../libs/dbUtils'
import { useRecoilState } from 'recoil';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { cartJobType } from '../../../recoil/atoms';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';


import { IHold } from '../../../models/common-model';
import { UserContext } from 'src/context/UserContext';

const OrdersModal = (probs: any) => {

    const { openDialog, isShowModal, shopId, lang } = probs;
    const { locationSettings } = useContext(UserContext);
    const [selectdTab, setSelectdTab] = useState('hold');
    const [, setJobType] = useRecoilState(cartJobType);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);
    const [ordersList, setOrdersList] = useState([]);
    const [filteredOrdersList, setFilteredOrdersList] = useState([]);
    const [displayOrder, setDisplayOrder] = useState([]);
    const [filteredDisplayOrder, setFilteredDisplayOrder] = useState([]);
    const [holdItems, setHoldItems] = useState<IHold[]>([]);
    const removeElement = (i: number) => {
        const newItems = [...holdItems];
        newItems.splice(i, 1);
        setHoldItems(newItems);
        localStorage.setItem("holdItems" + shopId, JSON.stringify(newItems))
    }
    const RestoreElement = (val: any, index: number) => {
        setJobType({ req: 1, val: val, val2: index + "" })
        openDialog(false)
    }
    async function getOrders(barCodeId = -1) {
        setIsLoading(true)
        var result = await apiFetchCtr({ fetch: 'pos', subType: 'getLastOrders', barCodeId, shopId })
        if (result.success) {
            if (barCodeId == -1) {
                setOrdersList(result?.newdata);
                setFilteredOrdersList(result?.newdata);
                setIsLoading(false)
                setIsLoadingDetails(true)
            }
            else {
                setDisplayOrder(result?.newdata)
                setFilteredDisplayOrder(result?.newdata);
                setIsLoading(true)
                setIsLoadingDetails(false)
            }
        }
    }
    useEffect(() => {
        if (isShowModal)
            setJobType({ req: 6, val: "" })
        const holdItemsFromStorage = localStorage.getItem("holdItems" + shopId);
        if (holdItemsFromStorage)
            setHoldItems(JSON.parse(holdItemsFromStorage).reverse());
        getOrders()

    }, [])

    const handleFiltered = (e) =>{
        const query = e.target.value;
        if (query.length > 0) {
            setFilteredOrdersList(
              ordersList.filter(
                (item) =>
                  item.id.toString().includes(query) ||
                  item.name.includes(query) ||
                  item.mobile.includes(query)
              )
            );
            setFilteredDisplayOrder(
              displayOrder.filter(
                (item) =>
                  item.id.toString().includes(query) ||
                  item.name.includes(query)
              )
            );
        } else {
          setFilteredOrdersList(ordersList)
        }
    }
    return (
      <>
        <Dialog open={isShowModal} className="poslix-modal">
          <DialogTitle className="poslix-modal text-primary"></DialogTitle>
          <DialogContent className="poslix-modal-content">
            <div className="poslix-modal" style={{ minWidth: "500px" }}>
              <div className="modal-content">
                <div className="modal-body">
                  <ul
                    className="nav nav-pills arrow-navtabs nav-success mb-3"
                    role="tablist"
                  >
                    <li className="nav-item">
                      <a
                        className={`nav-link px-4 d-flex justify-content-center ${
                          selectdTab === "hold" ? "active" : ""
                        }`}
                        data-bs-toggle="tab"
                        href="#arrow-hold"
                        role="tab"
                        onClick={() => {
                          setSelectdTab("hold");
                        }}
                      >
                        <span className="">{lang.cartComponent.orderModal.hold}</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className={`nav-link px-4 d-flex justify-content-center ${
                          selectdTab === "final" ? "active" : ""
                        }`}
                        data-bs-toggle="tab"
                        href="#arrow-final"
                        role="tab"
                        onClick={() => {
                          setSelectdTab("final");
                        }}
                      >
                        <span className="">{lang.cartComponent.orderModal.order}</span>
                      </a>
                    </li>
                  </ul>

                  <InputGroup className="mb-3">
                    <Form.Control
                      placeholder='Search by Customer Name or Invoice Number'
                      aria-label="Text input with dropdown button"
                      onChange={handleFiltered}
                    />

                    {/* <DropdownButton
                      variant="outline-secondary"
                      title="Search By"
                      id="input-group-dropdown-2"
                      align="end"
                    >
                      <Dropdown.Item href="#">Order no</Dropdown.Item>
                      <Dropdown.Item href="#">Customer Name</Dropdown.Item>
                      <Dropdown.Item href="#">Customer Phone</Dropdown.Item>
                    </DropdownButton> */}
                  </InputGroup>

                  <div className="tab-content text-muted">
                    {selectdTab == "hold" ? (
                      <div
                        className="tab-pane active"
                        id="arrow-hold"
                        role="tabpanel"
                      >
                        <div className="table-responsive mt-2">
                          <table className="table table-centered table-hover align-middle  mb-0">
                            <thead className="text-muted order-head">
                              <tr>
                                <th
                                  scope="col"
                                  style={{ borderRadius: "12px 0px 0px 10px" }}
                                >
                                  #
                                </th>
                                <th scope="col">{lang.cartComponent.orderModal.holdName}</th>
                                <th
                                  scope="col"
                                  style={{ borderRadius: "0px 10px 10px 0px" }}
                                >
                                  {lang.cartComponent.orderModal.action}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {
                                //Holds List
                                holdItems.length > 0 &&
                                  holdItems.map((hi, i) => {
                                    if (hi.location_id == shopId) {
                                      return (
                                        <tr key={i}>
                                          <td>#{i + 1}</td>
                                          <td>
                                            ({hi.name})
                                            <span style={{ color: "#d7d5d5" }}>
                                              {" "}
                                              [{hi.length}]
                                            </span>
                                          </td>
                                          <td>
                                            <a
                                              href="#"
                                              className="px-1 fs-16"
                                              onClick={() => {
                                                RestoreElement(hi.data, i);
                                              }}
                                            >
                                              <i className="ri-restart-line" />
                                            </a>
                                            <a
                                              href="#"
                                              className="px-1 fs-16 text-danger"
                                              onClick={() => {
                                                removeElement(i);
                                              }}
                                            >
                                              <i className="ri-delete-bin-6-line" />
                                            </a>
                                          </td>
                                        </tr>
                                      );
                                    }
                                  })
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="tab-pane active"
                        id="arrow-final"
                        role="tabpanel"
                      >
                        <div className="table-responsive mt-2">
                          {!isLoading && (
                            <table className="table table-centered table-hover align-middle  mb-0">
                              <thead className="text-muted table-light">
                                <tr>
                                  <th
                                    scope="col"
                                    style={{
                                      borderRadius: "12px 0px 0px 10px",
                                    }}
                                  >
                                    #
                                  </th>
                                  <th scope="col">{lang.cartComponent.orderModal.customer}</th>
                                  <th scope="col">{lang.cartComponent.orderModal.mobile}</th>
                                  <th scope="col">{lang.cartComponent.orderModal.price}</th>
                                  <th
                                    scope="col"
                                    style={{
                                      borderRadius: "0px 10px 10px 0px",
                                    }}
                                  >
                                    {lang.cartComponent.orderModal.action}
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredOrdersList.length > 0 &&
                                  filteredOrdersList.map((ord: any, i) => {
                                    return (
                                      <tr key={i}>
                                        <td>#{ord.id}</td>
                                        <td>({ord.name})</td>
                                        <td>({ord.mobile})</td>
                                        <td>
                                          {Number(ord.total_price).toFixed(
                                            locationSettings.currency_decimal_places
                                          )}{" "}
                                          <span style={{ fontSize: "10px" }}>
                                            {locationSettings.currency_code}
                                          </span>
                                        </td>
                                        <td>
                                          <a
                                            href="#"
                                            className="px-1 fs-16 text-info"
                                            onClick={() => {
                                              setJobType({
                                                req: 3,
                                                val: ord.id,
                                              });
                                              openDialog(false);
                                            }}
                                          >
                                            <i className="ri-edit-line" />
                                          </a>
                                          <a
                                            href="#"
                                            className="px-1 fs-16"
                                            onClick={() => {
                                              getOrders(ord.id);
                                              setIsLoading(true);
                                            }}
                                          >
                                            <i className="ri-shopping-basket-2-line" />
                                          </a>
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          )}
                          {!isLoadingDetails && (
                            <table className="table table-centered table-hover align-middle  mb-0">
                              <thead className="text-muted table-light">
                                <tr>
                                  <th scope="col">#</th>
                                  <th scope="col">Name</th>
                                  <th scope="col">Rate</th>
                                  <th scope="col">Qny</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredDisplayOrder.length > 0 &&
                                  filteredDisplayOrder.map((ord: any, i) => {
                                    return (
                                      <tr key={i}>
                                        <td>#{i + 1}</td>
                                        <td>({ord.name})</td>
                                        <td>
                                          $
                                          {Number(ord.price).toFixed(
                                            locationSettings.currency_decimal_places
                                          )}
                                        </td>
                                        <td>{Number(ord.qty).toFixed(0)}</td>
                                      </tr>
                                    );
                                  })}
                                <tr>
                                  <td></td>
                                  <td style={{ fontWeight: "800" }}>Total</td>
                                  <td style={{ fontWeight: "800" }}>$1500</td>
                                  <td></td>
                                </tr>
                              </tbody>
                              <div className="row justify-content-center">
                                <button
                                  className="btn btn-success fw-medium m-1"
                                  onClick={() => {
                                    setIsLoading(false);
                                    setIsLoadingDetails(true);
                                  }}
                                >
                                  <i className="ri-arrow-left-fill me-1 align-middle" />{" "}
                                  back
                                </button>
                              </div>
                            </table>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <a
                    className="btn btn-link link-success fw-medium"
                    onClick={() => {
                      openDialog(false);
                    }}
                  >
                    <i className="ri-close-line me-1 align-middle" /> Close
                  </a>
                </div>
              </div>
              {/* /.modal-content */}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );

}

export default OrdersModal;