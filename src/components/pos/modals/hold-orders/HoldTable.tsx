import { Button, Table } from 'react-bootstrap';
import { MdAutorenew, MdDeleteForever } from 'react-icons/md';

export default function HoldTable({ lang, items, remove, restore }) {
  const renderItems = () => {
    if (!items?.length)
      return (
        <tr>
          <td colSpan={3} className="text-center">
            No Items in hold
          </td>
        </tr>
      );
    else
      return items.map((item, i) => (
        <tr key={item.id}>
          <td>#{i + 1}</td>
          <td>
            <span className="d-flex flex-row justify-content-between pe-4">
              <span>({item.name})</span>
              <span style={{ color: '#d7d5d5' }}> [{item.length}]</span>
            </span>
          </td>
          <td>
            <span className="d-flex flex-row gap-3">
              <Button variant="outline-info" onClick={() => restore(item)}>
                <MdAutorenew />
              </Button>
              <Button variant="outline-danger" onClick={() => remove(item)}>
                <MdDeleteForever />
              </Button>
            </span>
          </td>
        </tr>
      ));
  };

  return (
    <Table responsive>
      <thead className="text-muted order-head">
        <tr>
          <th scope="col">#</th>
          <th scope="col">{lang.cartComponent.orderModal.holdName}</th>
          <th scope="col">{lang.cartComponent.orderModal.action}</th>
        </tr>
      </thead>
      <tbody>{renderItems()}</tbody>
    </Table>
  );
}
