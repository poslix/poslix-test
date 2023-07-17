import * as React from "react";
import { DataGrid, GridColDef, GridRowParams, GridToolbar, GridPrintExportOptions, GridValueGetterParams, GridToolbarContainer, GridToolbarExport, GridToolbarColumnsButton } from "@mui/x-data-grid";
import { AdminLayout } from "@layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Spinner from "react-bootstrap/Spinner";
import { faTrash, faPenToSquare, faPlus, } from "@fortawesome/free-solid-svg-icons";
import { Card } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AlertDialog from "src/components/utils/AlertDialog";
import { apiFetch } from "src/libs/dbUtils";
import { Avatar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, ListItemIcon, Menu, MenuItem, } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { IreadyGroupTax, ITax, ITokenVerfy } from "@models/common-model";
import { GridToolbarFilterButton } from "@mui/x-data-grid";
// import { ViewPanel } from "src/components/dashboard/quotations/ViewPanel";
import { hasPermissions, keyValueRules, verifayTokens } from "src/pages/api/checkUtils";
import * as cookie from 'cookie'

export default function Quotations(props: any) {

    const { shopId, rules } = props
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => { setAnchorEl(event.currentTarget); };
    const handleClose = () => { setAnchorEl(null); };
    const [quoations, setQuotations] = useState<
        {
            quotation_number: number;
            final_total: number;
            tax_total: number;
            customer: string;
            quotation_date: Date;
            expiry_date: Date;
            ref_no: string; status: string;
        }[]>([]);

    const router = useRouter();
    const [selectId, setSelectId] = useState(0);
    const [selectRow, setSelectRow] = useState<any>({});
    const [lines, setLines] = useState<any>([]);
    const [isToggle, setIsToggle] = useState(false);
    const [show, setShow] = useState(false);
    const [showViewPopUp, setShowViewPopUp] = useState(false);
    const [reloadTable, setReloadTable] = useState(false);

    //table columns
    const columns: GridColDef[] = [
        { field: "quotation_number", headerName: "Quotation #", minWidth: 150 },
        { field: "final_total", headerName: "Amount", minWidth: 150 },
        { field: "tax_amount", headerName: "Tax", minWidth: 120 },
        {
            field: "customer_name",
            headerName: "Customer",
            minWidth: 350,
        },
        {
            field: "quotation_date",
            headerName: "Date",
            minWidth: 150,
        },
        {
            field: "expiry_date",
            headerName: "Expiry Date",
            minWidth: 150,
        },
        {
            field: "ref_no",
            headerName: "Reference #",
            minWidth: 150,
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 120,
        },
        {
            field: "action",
            headerName: "Action ",
            minWidth: 100,
            sortable: false,

            disableExport: true,
            renderCell: ({ row }: Partial<GridRowParams>) => (
                <>
                    <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{ ml: 2 }}
                        aria-controls={open ? "account-menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? "true" : undefined}
                    >
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={open}
                        onClose={handleClose}
                        onClick={handleClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: "visible",
                                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                                mt: 1.5,
                                "& .MuiAvatar-root": {
                                    width: 30,
                                    height: 30,
                                    ml: -0.5,
                                    mr: 1,
                                },
                                "&:before": {
                                    content: '""',
                                    display: "block",
                                    position: "absolute",
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: "background.paper",
                                    transform: "translateY(-50%) rotate(45deg)",
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: "right", vertical: "top" }}
                        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    >
                        <MenuItem
                            onClick={() => {
                                console.log(selectId);
                                router.push("sales/edit/" + selectId);
                            }}
                        >
                            <ListItemIcon>
                                <EditIcon fontSize="small" />
                            </ListItemIcon>
                            Edit
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                viewTransaction();
                            }}
                        >
                            <ListItemIcon>
                                <VisibilityIcon fontSize="small" />
                            </ListItemIcon>
                            View
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                setShow(true);
                            }}
                        >
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" />
                            </ListItemIcon>
                            Delete
                        </MenuItem>
                    </Menu>
                </>
            ),
        },
    ];

    async function viewTransaction() {
        console.log(selectId);
        setShowViewPopUp(true);
        var result = await apiFetch({
            fetch: "getSellLinesByTransactionId",
            data: { id: selectId },
        });
        const { success, newdata } = result;
        if (success) {
            setLines(newdata.sellLines);
            console.log(result);
        }
    }
    // init sales data
    async function initDataPage() {
        const { success, newdata } = await apiFetch({ fetch: "getAllQuotations", data: { shopId } });
        console.log(success);
        if (success)
            setQuotations(newdata);
    }

    const handleReloadTable = () => {
        setQuotations([]);
        setIsToggle(false)
        setTimeout(() => {
            initDataPage()
        }, 1000);
    }

    useEffect(() => {
        initDataPage();
    }, []);

    useEffect(() => {
        viewTransaction();
    }, [selectId]);

    useEffect(() => {
        handleReloadTable();
    }, [reloadTable]);

    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarFilterButton />
                <GridToolbarExport />
                <GridToolbarColumnsButton />
            </GridToolbarContainer>
        );
    }

    const onRowsSelectionHandler = (ids: any) => {
        const selectedRowsData = ids.map((id: any) =>
            quoations.find((row: any) => row.id === id)
        );

        setSelectRow(selectedRowsData[0]);
        console.log(selectedRowsData);
        setSelectId(selectedRowsData[0].id);
        console.log(selectId)
        setIsToggle(true);
    };

    return (
        <AdminLayout shopId={shopId}>
            <AlertDialog alertShow={show} alertFun={(e: boolean) => setShow(e)} id={selectId} type="deleteSale" products={quoations}>
                Are you Sure You Want Delete This Item ?
            </AlertDialog>
            <button className="mb-3 btn btn-primary p-3" onClick={() => { router.push("/shop/" + shopId + "/quotations/add"); }}><FontAwesomeIcon icon={faPlus} /> Add New</button>
            <div className="page-content-style card">
                <h5>Quotation List</h5>
                <DataGrid
                    className="datagrid-style"
                    sx={{
                        '.MuiDataGrid-columnSeparator': {
                            display: 'none',
                        },
                        '&.MuiDataGrid-root': {
                            border: 'none',
                        },
                    }}
                    rows={quoations}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    onSelectionModelChange={(ids: any) =>
                        onRowsSelectionHandler(ids)
                    }
                    components={{ Toolbar: CustomToolbar }}
                />
                <div className="col-7">
                    {/* <ViewPanel details={selectRow} products={lines} reloadTable={() => setReloadTable(true)} /> */}
                </div>
            </div>
        </AdminLayout>
    );
}
export async function getServerSideProps(context: any) {
    const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
    var _isOk = true;
    //check page params
    var shopId = context.query.id;
    if (shopId == undefined)
        return { redirect: { permanent: false, destination: "/page403" } }

    //check user permissions
    var _userRules = {};
    await verifayTokens({ headers: { authorization: 'Bearer ' + parsedCookies.tokend } }, (repo: ITokenVerfy) => {
        _isOk = repo.status;
        var _rules = keyValueRules(repo.data.rules || []);
        if (_isOk && _rules[shopId] != undefined) {
            var _stuf = '';
            _rules[shopId].forEach((dd: any) => _stuf += dd.stuff)
            const { userRules, hasPermission } = hasPermissions(_stuf, 'quotations')
            _isOk = hasPermission
            _userRules = userRules
        } else
            _isOk = false
    })
    if (!_isOk) return { redirect: { permanent: false, destination: "/page403" } }
    return {
        props: { shopId: context.query.id, rules: _userRules },
    };
    //status ok


}
