import Select, { StylesConfig } from 'react-select';
export function TableExpeseRows({ rowsData, curencise, selData, deleteTableRows, handleChange }) {
    return (

        selData.map((data, index) => {
            return (
                <tr key={index}>
                    {data.isNew && <td><Select name='label' options={rowsData} onChange={(evnt) => (handleChange(index, evnt, data.isNew))} /></td>}
                    {!data.isNew && <td><input type="text" value={data.label} name="value" disabled={true} placeholder="value" className="form-control" /></td>}
                    <td><Select name='currency' isDisabled={!data.isNew} options={curencise} value={curencise.filter((cu) => cu.value == data.currency_id)} onChange={(evnt) => (handleChange(index, evnt, data.isNew))} /></td>
                    <td><input type="number" defaultValue={0} min={0} step=".1" value={data.enterd_value} onChange={(evnt) => (handleChange(index, evnt, data.isNew))} name="enterd_value" placeholder="value" className="form-control" /> </td>
                    <td><input type="number" disabled={true} defaultValue={0} value={data.enterd_value * data.currency_rate} name="value" placeholder="value" className="form-control" /> </td>
                    <td><button className="btn btn-outline-danger" onClick={() => (deleteTableRows(index))}>x</button></td>
                </tr>
            )
        })

    )

}
export function TableTaxRows({ rowsData, deleteTableRows, handleChange, curencise }) {
    return (

        rowsData.map((data, index) => {
            // const { label, value } = data;
            return (
                <tr key={index}>
                    <td><input type="text" value={data.label} onChange={(evnt) => (handleChange(index, evnt))} name="label" placeholder="Tax Name" className="form-control" /></td>
                    <td><Select name='currency' options={curencise} value={curencise.filter((cu) => cu.value == data.currency_id)} onChange={(evnt) => (handleChange(index, evnt))} /></td>
                    <td><input type="number" defaultValue={0} min={0} step=".1" value={data.value} onChange={(evnt) => (handleChange(index, evnt))} name="value" placeholder="value" className="form-control" /> </td>
                    <td><input type="number" defaultValue={0} value={data.value * data.currency_rate} disabled={true} name="value" placeholder="value" className="form-control" /> </td>
                    <td><button className="btn btn-outline-danger" onClick={() => (deleteTableRows(index))}>x</button></td>
                </tr>
            )
        })

    )

}

