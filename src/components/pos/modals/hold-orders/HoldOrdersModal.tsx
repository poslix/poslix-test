import { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { useRecoilState } from 'recoil';
import { useUser } from 'src/context/UserContext';
import { useAppDispatch } from 'src/hooks';
import { setCart } from 'src/redux/slices/cart.slice';
import { apiFetchCtr } from '../../../../libs/dbUtils';
import { IHold } from '../../../../models/common-model';
import { cartJobType } from '../../../../recoil/atoms';
import HoldTable from './HoldTable';

export default function HoldOrdersModal({ shopId, lang }: any) {
  const dispatch = useAppDispatch();
  const { locationSettings } = useUser();
  const [, setJobType] = useRecoilState(cartJobType);

  const [ordersList, setOrdersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayOrder, setDisplayOrder] = useState([]);
  const [holdItems, setHoldItems] = useState<IHold[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [filteredOrdersList, setFilteredOrdersList] = useState([]);
  const [filteredDisplayOrder, setFilteredDisplayOrder] = useState([]);
  const [isShowOrdersModal, setIsShowOrdersModal] = useState<boolean>(false);

  const handleClose = () => setIsShowOrdersModal(false);
  const removeHoldItem = (item: any) => {
    const _holdItems = [...holdItems];
    const _newHoldItems = _holdItems.filter((hold) => hold.id !== item.id);
    setHoldItems(_newHoldItems);
    localStorage.setItem(`holdItems[${shopId}]`, JSON.stringify(_newHoldItems));
  };
  const restoreHoldItem = (item: any) => {
    const _holdItem = holdItems.find((hold) => hold.id === item.id);
    const cart = localStorage.getItem('cart');
    if (cart) {
      const _cart = JSON.parse(cart);
      const newCart = _cart.filter((item) => +item.location_id !== +shopId);
      dispatch(setCart([...newCart, _holdItem]));
    } else {
      dispatch(setCart([_holdItem]));
    }

    removeHoldItem(item);
    handleClose();
  };

  async function getOrders(barCodeId = -1) {
    setIsLoading(true);
    var result = await apiFetchCtr({ fetch: 'pos', subType: 'getLastOrders', barCodeId, shopId });
    if (result.success) {
      if (barCodeId == -1) {
        setOrdersList(result?.newdata);
        setFilteredOrdersList(result?.newdata);
        setIsLoading(false);
        setIsLoadingDetails(true);
      } else {
        setDisplayOrder(result?.newdata);
        setFilteredDisplayOrder(result?.newdata);
        setIsLoading(true);
        setIsLoadingDetails(false);
      }
    }
  }

  const handleFiltered = (e) => {
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
          (item) => item.id.toString().includes(query) || item.name.includes(query)
        )
      );
    } else {
      setFilteredOrdersList(ordersList);
    }
  };

  useEffect(() => {
    //! what is job type ?!

    if (isShowOrdersModal) setJobType({ req: 6, val: '' });

    const holdItemsFromStorage = localStorage.getItem(`holdItems[${shopId}]`);
    if (holdItemsFromStorage) setHoldItems(JSON.parse(holdItemsFromStorage).reverse());

    getOrders();
  }, []);

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsShowOrdersModal(true)}
        className="flex-grow-1"
        variant="info">
        {lang.cartComponent.orders}
      </Button>
      <Modal show={isShowOrdersModal} onHide={handleClose}>
        <Modal.Header className="poslix-modal-title text-primary text-capitalize" closeButton>
          Orders
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Search by Customer Name or Invoice Number"
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
          <Tabs defaultActiveKey="hold" id="order-tab-hold" className="mb-3" fill>
            <Tab eventKey="hold" title={lang.cartComponent.orderModal.hold}>
              <HoldTable
                lang={lang}
                items={holdItems}
                remove={removeHoldItem}
                restore={restoreHoldItem}
              />
            </Tab>
            <Tab eventKey="order" title={lang.cartComponent.orderModal.order}>
              <div className="table-responsive mt-2">
                {!isLoading && (
                  <table className="table table-centered table-hover align-middle  mb-0">
                    <thead className="text-muted table-light">
                      <tr>
                        <th
                          scope="col"
                          style={{
                            borderRadius: '12px 0px 0px 10px',
                          }}>
                          #
                        </th>
                        <th scope="col">{lang.cartComponent.orderModal.customer}</th>
                        <th scope="col">{lang.cartComponent.orderModal.mobile}</th>
                        <th scope="col">{lang.cartComponent.orderModal.price}</th>
                        <th
                          scope="col"
                          style={{
                            borderRadius: '0px 10px 10px 0px',
                          }}>
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
                                  +locationSettings?.location_decimal_places
                                )}{' '}
                                <span style={{ fontSize: '10px' }}>
                                  {locationSettings?.currency_code}
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
                                    handleClose();
                                  }}>
                                  <i className="ri-edit-line" />
                                </a>
                                <a
                                  href="#"
                                  className="px-1 fs-16"
                                  onClick={() => {
                                    getOrders(ord.id);
                                    setIsLoading(true);
                                  }}>
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
                                  locationSettings?.location_decimal_places
                                )}
                              </td>
                              <td>{Number(ord.qty).toFixed(0)}</td>
                            </tr>
                          );
                        })}
                      <tr>
                        <td></td>
                        <td style={{ fontWeight: '800' }}>Total</td>
                        <td style={{ fontWeight: '800' }}>$1500</td>
                        <td></td>
                      </tr>
                    </tbody>
                    <div className="row justify-content-center">
                      <button
                        className="btn btn-success fw-medium m-1"
                        onClick={() => {
                          setIsLoading(false);
                          setIsLoadingDetails(true);
                        }}>
                        <i className="ri-arrow-left-fill me-1 align-middle" /> back
                      </button>
                    </div>
                  </table>
                )}
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <a className="btn btn-link link-success fw-medium" onClick={handleClose}>
            <i className="ri-close-line me-1 align-middle" /> Close
          </a>
        </Modal.Footer>
      </Modal>
    </>
  );
}
