import classNames from 'classnames';
import { useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { MdAutorenew, MdInfoOutline, MdKeyboardArrowLeft } from 'react-icons/md';
import { useUser } from 'src/context/UserContext';
import { useGetSalesReport } from 'src/services/pos.service';
import OrderInfoTable from './OrderInfoTable';

export default function OrdersTable({ lang, shopId }) {
  const { locationSettings } = useUser();
  const [isOrderDetails, setIsOrderDetails] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string | number>('');

  const { isLoading, salesReport } = useGetSalesReport(shopId, null, {});

  console.log(salesReport, 'salesReport');

  const handleOrderInfo = (order_id: string | number) => {
    setOrderId(order_id);
    setIsOrderDetails(true);
  };

  const renderItems = () => {
    if (!salesReport?.data?.length) return <></>;

    return salesReport?.data.map((item) => (
      <tr key={item.id + 'some-random-text'}>
        <td>#{item.id}</td>
        <td>{item.user_name}</td>
        <td>{item.contact_mobile || '--- --- ---'}</td>
        <td>
          {Number(item.sub_total).toFixed(+locationSettings?.location_decimal_places)}{' '}
          <span style={{ fontSize: '10px' }}>{locationSettings?.currency_code}</span>
        </td>
        <td>
          <span className="d-flex flex-row gap-3">
            <Button variant="outline-info" disabled onClick={() => {}}>
              <MdAutorenew />
            </Button>
            <Button variant="outline-info" onClick={() => handleOrderInfo(item.id)}>
              <MdInfoOutline />
            </Button>
          </span>
        </td>
      </tr>
    ));
  };

  return (
    <>
      <div
        className="position-relative"
        style={{
          maxHeight: '60vh',
          overflowY: 'auto',
        }}>
        <Table
          responsive
          className={classNames({
            'd-none': isOrderDetails,
          })}>
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
          <tbody>{renderItems()}</tbody>

          {!isLoading && (
            <table className="table table-centered table-hover align-middle  mb-0">
              <tbody>
                {/* {filteredOrdersList.length > 0 &&
            [filteredOrdersList].map((ord: any, i) => {
              return (
                <tr key={i}>
             
                  <td>
                    <a
                      href="#"
                      className="px-1 fs-16 text-info"
                      onClick={() => {
                        // setJobType({
                        //   req: 3,
                        //   val: ord.id,
                        // });
                        // handleClose();
                      }}>
                      <i className="ri-edit-line" />
                    </a>
                  
                  </td>
                </tr>
              );
            })} */}
              </tbody>
            </table>
          )}
          {/* {!isLoadingDetails && (
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
                  <td>${Number(ord.price).toFixed(locationSettings?.location_decimal_places)}</td>
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
              // setIsLoadingDetails(true);
            }}>
            <i className="ri-arrow-left-fill me-1 align-middle" /> back
          </button>
        </div>
      </table>
    )} */}
        </Table>
      </div>
      <OrderInfoTable
        shopId={shopId}
        orderId={orderId}
        isOrderDetails={isOrderDetails}
        setIsOrderDetails={setIsOrderDetails}
      />
    </>
  );
}
