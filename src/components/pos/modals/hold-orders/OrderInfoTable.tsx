import classNames from 'classnames';
import { Button, Table } from 'react-bootstrap';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { useGetItemsSalesReport } from 'src/services/pos.service';

export default function OrderInfoTable({ isOrderDetails, setIsOrderDetails, orderId, shopId }) {
  useGetItemsSalesReport(shopId, orderId, {
    onSuccess: (data) => {
      console.log(data, 'data');
    },
  });

  return (
    <div
      className={classNames({
        'd-none': !isOrderDetails,
      })}>
      <Table responsive>
        {' '}
        <thead className="text-muted table-light">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Rate</th>
            <th scope="col">Qny</th>
          </tr>
        </thead>
      </Table>
      <Button
        variant="primary"
        onClick={() => setIsOrderDetails(false)}
        className="d-flex flex-row gap-3 justify-content-center align-items-center">
        <MdKeyboardArrowLeft size="20" /> Go Back to the list
      </Button>
    </div>
  );
}
