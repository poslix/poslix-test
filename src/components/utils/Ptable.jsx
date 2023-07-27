import Table from 'react-bootstrap/Table';
const Ptable = ({ props }) => {
    const { rows } = props;
    <Table className="table table-hover" responsive>
        <thead className="thead-dark">
            <tr>
                <th style={{ width: '50%' }} >Name</th>
                <th style={{ width: '15%' }}>Amount (%)</th>
                <th style={{ width: '10%' }}>is Primary</th>
                <th >Action</th>
            </tr>
        </thead>
        <tbody>
            {
                rows.map((ex, i) => {
                    return (
                        <tr style={{ background: ex.isNew ? '#e2fdfb57' : '' }}>
                            <td><input type="text" name="tax-name" className="form-control p-2" placeholder="Enter New Tax Name" value={ex.name} onChange={(e) => { handleInputChange(e, i) }} /></td>
                            <td><input type="number" min={0} max={100} step={1} name="tax-value" className="form-control p-2" placeholder="Tax Value" value={ex.amount} onChange={(e) => { handleInputChange(e, i) }} /></td>
                            <td><Form.Check type="switch" id="custom-switch" className="custom-switch" checked={ex.is_primary ? true : false} onChange={(e) => { handleSwitchChange(e, i) }} /></td>
                            <td><ButtonGroup className="mb-2 m-buttons-style">
                                <Button onClick={() => handleDelete(i)}><FontAwesomeIcon icon={faTrash} /></Button>
                            </ButtonGroup></td>
                        </tr>)
                })
            }
        </tbody>
    </Table >
}
export default Ptable;
