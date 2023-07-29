import { useEffect, useState } from "react";
import { Spinner } from 'react-bootstrap'
import { apiFetchCtr, apiInsertCtr } from "src/libs/dbUtils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowAltCircleLeft, faSave, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { Toastify } from "src/libs/allToasts";
const PurchasesQtyCheckList = (probs: any) => {

    const { shopId, purchaseId } = probs
    const [orderLines, setOrderLines] = useState<{ id: number, name: string, price: string, qty: string, qty_received: string, qty_left: string }[]>([])
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIndex, setSlectedIndex] = useState(-1);
    async function intPageData() {
        const { success, newdata, msg } = await apiFetchCtr({ fetch: 'transactions', subType: 'initCheckList', shopId, purchaseId })
        console.log(success);
        if (!success) {
            alert(msg)
            return
        }
        setIsLoading(false)
        setOrderLines(newdata)
    }
    async function addUpdateStock2() {
        const { success, newdata, msg } = await apiInsertCtr({ type: 'transactions', subType: 'addUpdateStockCheckList', shopId, data: { purchaseId, orderLines } })
        if (!success) {
            alert(msg)
            return
        }
        Toastify('success', 'successfully completed')
        probs.purchases[selectedIndex].status = newdata
        probs.setIsShowQtyManager(false)
    }
    const columns: GridColDef[] = [
        { field: "name", headerName: "Product Name", minWidth: 250 },
        { field: "cost", headerName: "Cost", minWidth: 150, },
        { field: "price", headerName: "Price", minWidth: 150, },
        {
            field: "qty", headerName: "Total Qty", minWidth: 150, renderCell: ({ row }: Partial<GridRowParams>) => (
                <>
                    {Number(row.qty).toFixed(2)}
                </>
            )
        },
        {
            field: "qty_received", headerName: "Qty Received", minWidth: 150,
            renderCell: ({ row }: Partial<GridRowParams>) => (
                <>
                    <div>{Number(row.qty_received).toFixed(2)} {row.qty - row.qty_received == 0 && <FontAwesomeIcon icon={faCircleCheck} />}</div>
                </>
            )
        },
        { field: "qty_entered", headerName: "Enter Qty", minWidth: 150, type: 'number', editable: true },
    ];
    const onRowsSelectionHandler = (params: any) => {
        const found = orderLines.findIndex(el => el.id === params.id);
        if (found > -1) {
            params.value = parseFloat(params.value) > 0 ? parseFloat(params.value) : 0
            var _datas: any = orderLines;
            _datas[found][params.field] = params.value > _datas[found].qty_left ? Number(_datas[found].qty_left).toFixed(2) : Number(params.value).toFixed(2)
            setOrderLines([..._datas])
        }

    };
    useEffect(() => {
        const f_index2 = probs.purchases.findIndex((itm: any) => { return itm.id == purchaseId })
        if (f_index2 > -1) {
            setOrderLines([])
            setSlectedIndex(f_index2)
            intPageData()
        } else {
            Toastify('error', 'somthing wrong!!');
            probs.setIsShowPayments(false)
        }
    }, [])

    return (
        <>
            {!isLoading ? <div className="page-content-style card">
                <div className='mb-4'>
                    <button className='btn m-btn btn-primary p-3' onClick={() => probs.setIsShowQtyManager(false)}><FontAwesomeIcon icon={faArrowAltCircleLeft} /> Back To List </button>
                </div>
                <h5>Purchase Quantity Manager List {probs.purchases[selectedIndex].status}</h5>
                <hr />
                <div className="quick-suppier-info">
                    <div>Supplier: {probs.purchases[selectedIndex].supplier}</div>
                    <div>Status: {probs.purchases[selectedIndex].status}</div>
                    <div>Total Price: {probs.purchases[selectedIndex].total_price}</div>
                </div>
                <hr />
                <DataGrid
                    className="datagrid-style"
                    sx={{
                        height: 300,
                        width: '100%',
                        '.MuiDataGrid-columnSeparator': {
                            display: 'none',
                        },
                        '&.MuiDataGrid-root': {
                            border: 'none',
                        }, '& .done': {
                            backgroundColor: '#cefeb6',
                            color: '#1a3e72',
                        }
                    }}
                    rows={orderLines}
                    columns={columns}
                    getRowClassName={(params) => {
                        if (params.row.qty - params.row.qty_received == 0)
                            return 'done'
                        return ''
                    }}
                    columnVisibilityModel={{ cost: false, price: false }}
                    pageSize={10}
                    isCellEditable={(params) => parseFloat(params.row.qty) != parseFloat(params.row.qty_received)}
                    rowsPerPageOptions={[10]}
                    onCellEditCommit={onRowsSelectionHandler}
                />
                <div className='mb-4'>
                    <button className='btn m-btn btn-primary p-3' onClick={() => addUpdateStock2()}>
                        <FontAwesomeIcon icon={faSave} /> Save List
                    </button>
                </div>
            </div> : <div className='d-flex justify-content-around' ><Spinner animation="grow" /></div>}
        </>
    )
}
export default PurchasesQtyCheckList;