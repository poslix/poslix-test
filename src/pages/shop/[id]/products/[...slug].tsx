import type { NextPage } from 'next'
import Select from 'react-select';
import { useRouter } from 'next/router'
import Spinner from 'react-bootstrap/Spinner';
import { AdminLayout } from '@layout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NotifiModal from "../../../../components/utils/NotifiModal"
import { ButtonGroup, Card } from 'react-bootstrap'
import React, { useContext, useState, useEffect, useRef } from 'react'
import { apiDeleteCtr, apiFetchCtr, apiInsertCtr, apiUpdateCtr } from "../../../../libs/dbUtils"
import storage from "../../../../../firebaseConfig"
import { ref, deleteObject, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import * as cookie from 'cookie'
import { getRealWord, hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import { ITokenVerfy } from '@models/common-model';
import Link from 'next/link';
import Switch from '@mui/material/Switch';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, styled, Typography } from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { faInfoCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import Table from 'react-bootstrap/Table';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { ToastContainer } from 'react-toastify';
import { Toastify } from "src/libs/allToasts";
import DeleteIcon from "@mui/icons-material/Delete";
import { UserContext } from 'src/context/UserContext';
import { generateUniqueString, handleNumberKeyPress } from 'src/libs/toolsUtils';
import { productTypeData } from '@models/data';

const Product: NextPage = (probs: any) => {

    const { shopId, editId, iType } = probs;
    const [formObj, setFormObj] = useState<any>(
        {
            id: 0, img: '', productName: '', productName2: '', type: 'single',
            sku: '', barcodeType: "C128", tax_id: null, unit: 11, brand: 0, cat: 0, subCat: '',
            alertQuantity: 0, cost: 0, price: 0, isFabric: false, isService: false, isSellOverStock: false, isMultiPrice: false, isFifo: false, isTailoring: 0,
            variations: [{ name: '', name2: '', sku: '', cost: 0, price: 0, isNew: true }],
            tailoringPrices: [{ name: '', from: 0, to: 0, price: 0 }]
        })
    const [img, setImg] = useState<any>(null)
    const [previewUrl, setPreviewUrl] = useState<string>('')
    const [errorForm, setErrorForm] = useState({ productName: false, barcodeType: false, productName2: false, sku: false, img: false, isTailoring: false, fabs: false, rules: false, skuExist: false })
    const colourStyles = {
        control: (style: any, state: any) => (
            {
                ...style,
                borderRadius: '10px', background: '#f5f5f5', height: '50px',
                borderColor: state.isFocused ? '2px solid #045c54' : '#eaeaea', boxShadow: 'none',
                '&:hover': {
                    border: '2px solid #045c54 ',
                },
            }),
        menu: (provided: any, state: any) => (
            {
                ...provided,
                borderRadius: '10px',
                padding: '10px',
                border: '1px solid #c9ced2'
            }
        ), option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#e6efee' : 'white',
            color: '#2e776f',
            borderRadius: '10px',
            '&:hover': {
                backgroundColor: '#e6efee',
                color: '#2e776f',
                borderRadius: '10px'
            }
        }),

    }
    const [units, setUnits] = useState<{ value: number, label: string }[]>([])
    const [brands, setBrands] = useState<{ value: number, label: string }[]>([])
    const [cats, setCats] = useState<{ value: number, label: string }[]>([])
    const [tailoring, seTtailoring] = useState<{ value: number, label: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [taxGroup, setTaxGroup] = useState<{ value: number, label: string }[]>([])
    const [products, setProducts] = useState<{ value: number; label: string }[]>([]);
    const [allFabrics, setAllFabrics] = useState<{ value: number; label: string }[]>([]);
    const [producTypes, setProducTypes] = useState<{ value: string, label: string }[]>(productTypeData)
    const { locationSettings } = useContext(UserContext);
    const [selecetdId, setSelecetdId] = useState(0);
    const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
    const [removeDialogType, setRemoveDialogType] = useState<{ type: string, id: number, index: number }>({ type: "", id: 0, index: 0 });
    const [selectedProducts, setSelectedProducts] = useState<{ id: number, product_id: number, name: string, cost: number, price: number, quantity: number, isNew: boolean }[]>([]);
    const [selectedFabrics, setSelectedFabrics] = useState<{ id: number, product_id: number, value?: number, name: string, isNew: boolean }[]>([]);
    const [percent, setPercent] = useState(0);
    const router = useRouter()
    const [show, setShow] = useState(false);
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [open3, setOpen3] = useState(false);
    var errors = [];

    const barcodes = [
        { value: 'C39', label: 'C39' },
        { value: 'C128', label: 'C128' },
        { value: 'EAN13', label: 'EAN13' },
        { value: 'EAN8', label: 'EAN8' },
        { value: 'UPCA', label: 'UPCA' },
        { value: 'UPCE', label: 'UPCE' },
    ];

    const columns: GridColDef[] = [
        { field: "name", headerName: "Product Name", minWidth: 250 },
        { field: "price", headerName: "Price", minWidth: 150, editable: true, type: 'number', },
        {
            field: "action",
            headerName: "Action",
            minWidth: 100,
            sortable: false,
            disableExport: true,
            renderCell: ({ row }: Partial<GridRowParams>) => (
                <>
                    <Button variant="outlined"
                        onClick={() => {
                            setSelecetdId(row.product_id)
                            setOpenRemoveDialog(true);
                        }}>
                        <DeleteIcon />
                    </Button>
                </>
            ),
        }
    ];
    const columnsTailoringPackages: GridColDef[] = [
        { field: "name", headerName: "Product Name", minWidth: 250 },
        {
            field: "action",
            headerName: "Action",
            minWidth: 100,
            sortable: false,
            disableExport: true,
            renderCell: ({ rowIndex, row }: GridRenderCellParams | any) => (
                <>
                    <Button variant="outlined"
                        onClick={() => {
                            setOpenRemoveDialog(true);
                            setRemoveDialogType({ type: "tailoring_item", id: parseInt(row.product_id), index: rowIndex })
                        }}>
                        <DeleteIcon />
                    </Button>
                </>
            ),
        }
    ];
    var formObjRef = useRef<any>();
    formObjRef.current = formObj

    var imgRef = useRef<any>();
    imgRef.current = img

    var prevUrlRef = useRef<any>();
    prevUrlRef.current = previewUrl

    async function initDataPage(id = '0') {
        if (id != '0')
            setIsEdit(true);
        const { success, newdata } = await apiFetchCtr({ fetch: 'products', subType: 'initProductData', shopId, id });
        if (!success) {
            Toastify('error', 'error in fetching..')
            return;
        }

        if (iType != "Kianvqyqndr")
            setProducTypes(producTypes.filter(p => p.value != "tailoring_package"))

        setProducts(newdata.products)
        setUnits(newdata.units)
        setBrands(newdata.brands)
        setCats(newdata.categories)
        setAllFabrics(newdata.allFabrics)
        seTtailoring([{ value: null, label: 'Defualt' }, ...newdata.tailorings])
        setTaxGroup([{ value: null, label: 'Defualt Tax' }, { value: -1, label: 'Never Tax' }, ...newdata.taxes])
        if (newdata.pro.length > 0) {
            setSelectedProducts(newdata.packageItems);
            setSelectedFabrics(newdata.selectedFabrics);
            const itm = newdata.pro[0];
            setPreviewUrl(itm.image);
            setFormObj({
                ...formObj,
                id: itm.id,
                img: itm.image,
                type: itm.type,
                productName: itm.name,
                productName2: itm.subproductname,
                unit: itm.unit_id,
                brand: itm.brand_id,
                sku: itm.sku,
                barcodeType: itm.barcode_type,
                cat: itm.category_id,
                cost: Number(itm.cost_price).toFixed(locationSettings.currency_decimal_places),
                price: Number(itm.sell_price).toFixed(locationSettings.currency_decimal_places),
                alertQuantity: Number(itm.alert_quantity),
                tax_id: itm.never_tax == 1 ? -1 : itm.tax,
                isService: itm.is_service == 1,
                isFabric: itm.is_fabric == 1,
                isSellOverStock: itm.sell_over_stock == 1,
                isMultiPrice: itm.is_selling_multi_price == 1,
                isFifo: itm.is_fifo == 1,
                variations: [...newdata.variations, { name: '', name2: '', sku: '', cost: 0, price: 0, isNew: true }],
                isTailoring: itm.type == "tailoring_package" ? itm.tailoring_type_id : itm.is_tailoring == 1,
                tailoringPrices: (itm.prices_json + "").length > 8 ? [...JSON.parse(itm.prices_json), { name: '', from: 0, to: 0, price: 0 }] : [{ name: '', from: 0, to: 0, price: 0 }]
            })
        }
        setLoading(false)
    }

    async function handleUpload() {
        if (prevUrlRef.current.length < 2) {
            console.log("select first");
        } else {
            const storageRef = ref(storage, `/files/images/${generateUniqueString(12)}${shopId}`)
            const uploadTask = uploadBytesResumable(storageRef, img);
            uploadTask.on(
                "state_changed",
                (snapshot: any) => {
                    const percent = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    setPercent(percent);
                },
                (err) => console.log(err),
                async () => {
                    await getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                        isEdit ? editProduct(url) : insertProduct(url);
                    });
                }
            );
        }
    }

    async function insertProduct(url: string) {
        const { success, msg, code } = await apiInsertCtr({ type: 'products', subType: 'insertProducts', shopId, data: { fdata: formObjRef.current, img: url, selectedProducts, selectedFabrics } })
        if (success) {
            Toastify('success', 'Product Successfuly Created..')
            router.push('/shop/' + shopId + '/products')
        } else {
            Toastify('error', msg)
            if (code == 100)
                setErrorForm({ ...errorForm, skuExist: true })
            setIsSaving(false)
        }
    }
    async function editProduct(url = '') {
        const { success, msg, code } = await apiUpdateCtr({ type: 'products', subType: 'editProduct', shopId, img: url.length > 2 ? url : formObj.img, data: formObjRef.current, selectedProducts, selectedFabrics })
        if (success) {
            Toastify('success', 'Product Successfuly Edited..')
            router.push('/shop/' + shopId + '/products')
        }
        else {
            Toastify('error', msg)
            if (code == 100)
                setErrorForm({ ...errorForm, skuExist: true })
        }
        setIsSaving(false)

    }
    async function deleteFunction(delType = '', id = 0, index: number) {
        var result = await apiDeleteCtr({ type: 'products', subType: 'delete_items', shopId, delType, id })
        const { success, msg } = result;
        if (success) {
            Toastify('success', 'Product Successfuly Edited..')
            if (delType == "var_items") {
                const _rows: any = [...formObj.variations]
                _rows.splice(index, 1);
                setFormObj({ ...formObj, variations: _rows })
            }
        }
        else
            Toastify('error', 'Error, Try Again')
    }

    useEffect(() => {
        initDataPage(editId);
    }, [router.asPath])

    const imageChange = (e: any) => {
        if (e.target.files && e.target.files.length > 0) {
            console.log('inja image', e.target.files);

            setImg(e.target.files[0])
            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
        } else
            console.log('na image', e.target.files);

    };
    const checkboxHandleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.name == 'is_service')
            setFormObj({ ...formObj, isService: event.target.checked, isSellOverStock: false })
        else if (event.target.name == 'sell_over')
            setFormObj({ ...formObj, isSellOverStock: event.target.checked })
        else if (event.target.name == 'multi_price')
            setFormObj({ ...formObj, isMultiPrice: event.target.checked })
        else if (event.target.name == 'is_fifo')
            setFormObj({ ...formObj, isFifo: event.target.checked })
        else if (event.target.name == 'is_fabric')
            setFormObj({ ...formObj, isFabric: event.target.checked })

    }

    const handleTooltipClose = () => {
        setOpen(false);
        setOpen2(false);
        setOpen3(false);
    };

    const handleTooltipOpen = (type = "") => {
        if (type == 'tax') {
            setOpen(true);
            setTimeout(() => { setOpen(false) }, 2000)
        }
        else if (type == 'multi') {
            setOpen2(true);
            setTimeout(() => { setOpen2(false) }, 2000)
        } else if (type == 'msg') {
            setOpen3(true);
            setTimeout(() => { setOpen3(false) }, 2000)
        }

    };

    const handleInputChange = (e: any, i: number) => {
        const _rows: any = [...formObj.variations]
        const { name, value } = e.target;
        _rows[i][name] = value;

        var hasEmpty = false;
        for (var j = 0; j < _rows.length; j++)
            if (_rows[j].name.length == 0) hasEmpty = true

        if (!hasEmpty) _rows.push({ id: 0, name: '', name2: '', sku: '', cost: 0, price: 0, isNew: true })

        setFormObj({ ...formObj, variations: _rows })
    }
    const handleInputChangeTailoring = (e: any, i: number) => {
        const _rows: any = [...formObj.tailoringPrices]
        const { name, value } = e.target;
        _rows[i][name] = value;
        var hasEmpty = false;
        for (var j = 0; j < _rows.length; j++)
            if (_rows[j].name.length == 0) hasEmpty = true

        if (!hasEmpty) _rows.push({ name: '', from: 0, to: 0, price: 0 })

        setFormObj({ ...formObj, tailoringPrices: _rows })
    }
    const handleDeleteVariation = (i: number) => {
        if (formObj.variations.length > 1) {
            const _rows: any = [...formObj.variations]
            if (_rows[i].isNew) {
                _rows.splice(i, 1);
            } else {
                setOpenRemoveDialog(true)
                setRemoveDialogType({ type: "var_items", id: _rows[i].id, index: i })
            }
            setFormObj({ ...formObj, variations: _rows })
        }
    }
    const handleDeleteTailoringPrices = (i: number) => {
        if (formObj.tailoringPrices.length > 1) {
            setOpenRemoveDialog(true)
            setRemoveDialogType({ type: "tail_items", id: - 1, index: i })
        }
    }

    const saveToCell = (params: any) => {
        const found = selectedProducts.findIndex(el => el.product_id === params.id);
        if (found > -1) {
            var _datas: any = selectedProducts;
            _datas[found][params.field] = params.value
            setSelectedProducts([..._datas])
        }
    }
    const formatProductsOptions = (products: any) => (
        <div>
            <div>({products.sell_price})</div>
            <div style={{ opacity: "0.8" }}>
                <span>{products.name}</span>
            </div>
        </div>
    );
    const addPackageProducts = (e: any) => {
        const found = selectedProducts.some(el => el.product_id === e.value);
        if (!found) setSelectedProducts([...selectedProducts, { id: e.product_id, product_id: e.product_id, name: e.name, quantity: 1, cost: e.cost, price: e.price, isNew: true }])
        else Toastify('error', "already exists in list")
    }
    const addToTailoringPackage = (e: any) => {
        const found = selectedFabrics.some(el => el.product_id === e.value);
        if (!found) setSelectedFabrics([...selectedFabrics, { id: e.value, product_id: e.value, name: e.label, isNew: true }])
        else Toastify('error', "already exists in list")
    }
    const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
        <Tooltip {...props} classes={{ popper: className }} />
    ))({
        [`& .${tooltipClasses.tooltip}`]: {
            maxWidth: 500,
        },
    });
    useEffect(() => {
        if (formObj.type != 'package')
            return
        let sumCost = 0, sumPrice = 0;
        selectedProducts.map((sp) => {
            sumCost += Number(sp.cost)
            sumPrice += Number(sp.price)
        })
        setFormObj({ ...formObj, cost: sumCost, price: sumPrice })
    }, [selectedProducts])
    const handleRemoveImg = (e: any) => {
        if (!img) {
            const desertRef = ref(storage, formObj.img);
            deleteObject(desertRef).then(() => {
                setFormObj({ ...formObj, img: '' })
            }).catch((error: any) => {
                console.log(error);
                setFormObj({ ...formObj, img: '' })
            });
        }
        setImg(null)
        setPreviewUrl('')
        return
    }

    return (
        <>
            <AdminLayout shopId={shopId}>
                <ToastContainer />
                <NotifiModal alertShow={show} alertFun={(e: boolean) => setShow(e)} >
                    {isEdit ? 'Product Successfuly Edited..' : 'Product Successfuly Created..'}
                </NotifiModal>
                <div className="row"><div className='mb-4'><Link className='btn btn-primary p-3' href={'/shop/' + shopId + '/products'}>Back To List</Link></div></div>
                <Dialog
                    open={openRemoveDialog}
                    onClose={() => { setOpenRemoveDialog(false); }}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">
                        Delete Item
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you Sure You Want Remove This Item ?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setOpenRemoveDialog(false)}>
                            Cancel</Button>
                        <Button onClick={() => {
                            if (removeDialogType.type == "var_items") {
                                deleteFunction(removeDialogType.type, removeDialogType.id, removeDialogType.index)
                            } else if (removeDialogType.type == "tailoring_item") {
                                const _rows: any = [...selectedFabrics]
                                _rows.splice(removeDialogType.index, 1);
                                setSelectedFabrics(_rows)
                            } else if (removeDialogType.type == "tail_items") {
                                const _rows: any = [...formObj.tailoringPrices]
                                _rows.splice(removeDialogType.index, 1);
                                setFormObj({ ...formObj, tailoringPrices: _rows })
                            } else {
                                const rows = [...selectedProducts];
                                const _index = rows.findIndex((it: any) => it.product_id == selecetdId)
                                if (_index > -1)
                                    rows.splice(_index, 1);
                                setSelectedProducts(rows);
                            }
                            setOpenRemoveDialog(false)
                        }}>
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>
                <Card className="mb-4">
                    <Card.Header className="p-3 bg-white">
                        <h5>{isEdit ? 'Edit Product ' : 'Add New Product'} </h5>
                    </Card.Header>
                    <Card.Body>
                        {!loading ?
                            <div className="forms-style-parent">
                                <form className='form-style-products'>
                                    <div className='products-columns'>
                                        <div className="row">
                                            <div className="upload-dots-box">
                                                {(img || formObj?.img?.length > 2) ? <>
                                                    <img src={previewUrl} />
                                                    {!isSaving && <button className="btn btn-danger" onClick={(e) => { e.preventDefault(); handleRemoveImg(e); }}>Remove This Image</button>}
                                                </>
                                                    :
                                                    <>
                                                        <label htmlFor={'product-image'}>
                                                            <img src={'/images/dashboard/imageholder.jpg'} />
                                                            <br />
                                                            Drop Your Image Or <span>Click</span>
                                                            <p>Supports : JPG,PNG</p>
                                                        </label>
                                                    </>}

                                                <input type="file" accept="image/*" className="form-control" id='product-image' name='product-image' hidden onChange={imageChange}
                                                    onClick={(event) => { event.currentTarget.value = null }}
                                                />
                                                {errorForm.img && <p className='p-1 h6 text-danger '>Select Image </p>}
                                                {isSaving && <div className='uploader-bar-box'>
                                                    <p>{percent != 100 ? "Uploading Image..." : "Saveing Form Data..."}</p>
                                                    <div className="uploader-bar" style={{ width: `${percent}%` }}></div>
                                                </div>}
                                            </div>
                                        </div>
                                        <br />
                                        {!isSaving && <>
                                            {/* name  */}
                                            <div className="field-cover">
                                                <div className="field-section">
                                                    <p>Product/Service Name: <span className='text-danger'>*</span></p>
                                                </div>
                                                <div className="field-section">
                                                    <input type="text" className="form-control" placeholder="Product/Service Name"
                                                        value={formObj.productName}
                                                        onChange={(e) => { setFormObj({ ...formObj, productName: e.target.value }) }}
                                                    />
                                                    {errorForm.productName && <p className='p-1 h6 text-danger '>Enter Product name</p>}
                                                </div>
                                            </div>
                                            {/* second  */}
                                            <div className="field-cover">
                                                <div className="field-section">
                                                    <p>Product/Service Second Name:</p>
                                                </div>

                                                <div className="field-section">
                                                    <input type="text" className="form-control" placeholder="Product/Service Second Name"
                                                        value={formObj.productName2}
                                                        onChange={(e) => { setFormObj({ ...formObj, productName2: e.target.value }) }}
                                                    />
                                                </div>
                                            </div>
                                            {/* sku  */}
                                            <div className="field-cover">
                                                <div className="field-section">
                                                    <p>Sku: <span className='text-danger'>*</span></p>
                                                </div>
                                                <div className="field-section">
                                                    <input type="text" className="form-control" placeholder="Sku"
                                                        value={formObj.sku}
                                                        onChange={(e) => { setFormObj({ ...formObj, sku: e.target.value }) }} />
                                                    {errorForm.sku && <p className='p-1 h6 text-danger '>Enter Product Sku</p>}
                                                    {errorForm.skuExist && <p className='p-1 h6 text-danger '>Enter Product unique Sku</p>}
                                                </div>
                                            </div>
                                            {/* Barcode Type  */}
                                            <div className="field-cover">
                                                <div className="field-section">
                                                    <p>Barcode Type:</p>
                                                </div>
                                                <div className="field-section">
                                                    <Select
                                                        styles={colourStyles}
                                                        options={barcodes}
                                                        value={barcodes.filter((f: any) => { return f.value == formObj.barcodeType })}
                                                        onChange={(itm) => { setFormObj({ ...formObj, barcodeType: itm!.value }) }}
                                                    />
                                                    {errorForm.barcodeType && <p className='p-1 h6 text-danger '>Select One Option</p>}
                                                </div>
                                            </div>
                                            {/* Tailoring Type  */}
                                            {iType == "Kianvqyqndr" && <div className="field-cover">
                                                <div className="field-section">
                                                    <p>Tailoring Type: <span className='text-danger'>*</span></p>
                                                </div>

                                                <div className="field-section">
                                                    <Select
                                                        styles={colourStyles}
                                                        options={tailoring}
                                                        value={tailoring.filter((f: any) => { return f.value == formObj.isTailoring })}
                                                        onChange={(itm) => { setFormObj({ ...formObj, isTailoring: itm!.value }) }}
                                                    />
                                                </div>
                                            </div>}
                                            {errorForm.isTailoring && <p className='p-1 h6 text-danger '>You must select One</p>}
                                            {/* Unit */}
                                            <div className="field-cover">
                                                <div className="field-section">
                                                    <p>Unit:</p>
                                                </div>
                                                <div className="field-section">
                                                    <Select
                                                        styles={colourStyles}
                                                        options={units}
                                                        value={units.filter((f: any) => { return f.value == formObj.unit })}
                                                        onChange={(itm) => { setFormObj({ ...formObj, unit: itm!.value }) }}
                                                    />
                                                </div>
                                            </div>
                                            {/* is Fabric */}
                                            {iType == "Kianvqyqndr" && <div className="field-cover">
                                                <div className="field-section">
                                                    <p>Is Fabric:</p>
                                                </div>
                                                <div className="field-section">
                                                    <Switch name={'is_fabric'} checked={formObj.isFabric} onChange={checkboxHandleChange} />
                                                </div>
                                            </div>}
                                            {/* Brand */}
                                            <div className="field-cover">
                                                <div className="field-section">
                                                    <p>Brand:</p>
                                                </div>
                                                <div className="field-section">
                                                    <Select
                                                        styles={colourStyles}
                                                        options={brands}
                                                        value={brands.find((f: any) => { return f.value == formObj.brand })}
                                                        onChange={(itm) => { setFormObj({ ...formObj, brand: itm!.value }) }} />
                                                </div>
                                            </div>
                                            {/* Category */}
                                            <div className="field-cover">
                                                <div className="field-section">
                                                    <p>Category: <span className='text-danger'>*</span></p>
                                                </div>
                                                <div className="field-section">
                                                    <Select
                                                        styles={colourStyles}
                                                        options={cats}
                                                        value={cats.find((f: any) => { return f.value == formObj.cat })}
                                                        onChange={(itm) => { setFormObj({ ...formObj, cat: itm!.value }) }} />
                                                </div>
                                            </div>
                                            {/* ُSub Category */}
                                            <div className="field-cover" style={{ display: 'none' }}>
                                                <div className="field-section">
                                                    <p>Sub Category:</p>
                                                </div>
                                                <div className="field-section">
                                                    <Select
                                                        styles={colourStyles}
                                                    />
                                                </div>
                                            </div>
                                        </>}
                                        <br />
                                        {!isSaving && <button type="button" className="btn m-btn btn-primary p-2 "
                                            onClick={(e) => {
                                                e.preventDefault();
                                                errors = [];
                                                if (formObj.productName.length == 0) errors.push('error8')
                                                if (formObj.sku.length == 0) errors.push('error7')
                                                if (formObj.barcodeType == '0') errors.push('error6')
                                                if (formObj.type == "tailoring_package") {
                                                    if (formObj.tailoringPrices.length <= 1) errors.push('error5')
                                                    if (selectedFabrics.length == 0)
                                                        errors.push('error1')
                                                    if (formObj.tailoringPrices.length <= 1)
                                                        errors.push('error2')
                                                    if (formObj.isTailoring == null || formObj.isTailoring <= 0) {
                                                        errors.push('error3')
                                                        Toastify('error', ' Error,You must select One Item For Tailoring Type');
                                                        setErrorForm({ ...errorForm, isTailoring: true })
                                                    }
                                                }
                                                setErrorForm({
                                                    ...errorForm,
                                                    productName: formObj.productName.length == 0,
                                                    sku: formObj.sku.length == 0,
                                                    barcodeType: formObj.barcodeType == '0',
                                                    fabs: formObj.type == "tailoring_package" && selectedFabrics.length == 0,
                                                    rules: formObj.type == "tailoring_package" && formObj.tailoringPrices.length <= 1
                                                })

                                                if (errors.length == 0) {
                                                    setIsSaving(true)
                                                    if (isEdit)
                                                        img == null ? editProduct() : handleUpload()
                                                    else
                                                        img != null ? handleUpload() : insertProduct('n')
                                                }

                                                else
                                                    Toastify('error', 'Enter Requires Field');
                                            }} >{isEdit ? 'Edit' : 'Save'}
                                        </button>}
                                    </div>
                                    {!isSaving && <div className='products-columns'>
                                        <div className='first-gap'></div>
                                        {/* is service */}
                                        <div className="field-cover">
                                            <div className="field-section">
                                                <p>Is Service: <CustomWidthTooltip
                                                    PopperProps={{
                                                        disablePortal: true,
                                                    }}
                                                    placement="right-start"
                                                    onClose={handleTooltipClose}
                                                    open={open3}
                                                    disableFocusListener
                                                    disableHoverListener
                                                    disableTouchListener
                                                    title={
                                                        <React.Fragment>
                                                            <Typography color="inherit">Service Product</Typography>
                                                            {"This Product will be as service"}<br />
                                                            <em>{"without stock like massage etc.."}</em>
                                                        </React.Fragment>
                                                    }
                                                >
                                                    <span onClick={() => handleTooltipOpen('msg')}> <FontAwesomeIcon icon={faInfoCircle} className={'text-primary'} /></span>
                                                </CustomWidthTooltip></p>
                                            </div>
                                            <div className="field-section">
                                                <Switch name={'is_service'} checked={formObj.isService} onChange={checkboxHandleChange} />
                                            </div>
                                        </div>
                                        {/* Type */}
                                        <div className="field-cover">
                                            <div className="field-section">
                                                <p>Type:</p>
                                            </div>
                                            <div className="field-section">
                                                <Select
                                                    isDisabled={isEdit}
                                                    styles={colourStyles}
                                                    options={producTypes}
                                                    value={producTypes.find((f: any) => { return f.value == formObj.type })}
                                                    onChange={(itm) => { setFormObj({ ...formObj, type: itm!.value }) }} />
                                            </div>
                                        </div>
                                        {/* package content */}
                                        {formObj.type == 'package' && <div className="form-group mt-4">
                                            <Select
                                                formatOptionLabel={formatProductsOptions}
                                                styles={colourStyles}
                                                options={products}
                                                onChange={e => addPackageProducts(e)} />
                                            <br />
                                            <div style={{ height: 300, width: "100%" }}>
                                                <DataGrid
                                                    rows={selectedProducts}
                                                    columns={columns}
                                                    pageSize={10}
                                                    rowsPerPageOptions={[10]}
                                                    onCellEditCommit={saveToCell}
                                                />
                                            </div>

                                        </div>}
                                        {/* variable content */}
                                        {formObj.type == 'variable' && <div className="form-group mt-4">
                                            <Table className='table table-hover variation' style={{ maxWidth: '700px' }}>
                                                <thead>
                                                    <th>Name</th>
                                                    <th>Second Name</th>
                                                    <th>sku</th>
                                                    <th>cost</th>
                                                    <th>price</th>
                                                </thead>
                                                <tbody>
                                                    {
                                                        formObj.variations.map((vr: any, i: number) => {
                                                            return (
                                                                <tr key={i}>
                                                                    <td><input type="text" name="name" className="form-control p-2" placeholder="Enter Name" value={vr.name} onChange={(e) => { handleInputChange(e, i) }} /></td>
                                                                    <td><input type="text" name="name2" className="form-control p-2" placeholder="Enter second Name" value={vr.name2} onChange={(e) => { handleInputChange(e, i) }} /></td>
                                                                    <td><input type="text" name="sku" className="form-control p-2" placeholder="Enter sku" value={vr.sku} onChange={(e) => { handleInputChange(e, i) }} /></td>
                                                                    <td><input type="number" name="cost" min={0} className="form-control p-2" placeholder="Enter cost" value={vr.cost} onChange={(e) => { handleInputChange(e, i) }} /></td>
                                                                    <td><input type="number" name="price" min={0} className="form-control p-2" placeholder="Enter price" value={vr.price} onChange={(e) => { handleInputChange(e, i) }} /></td>
                                                                    <td><ButtonGroup className="mb-2 m-buttons-style">
                                                                        <Button onClick={() => handleDeleteVariation(i)}><FontAwesomeIcon icon={faTrash} /></Button>
                                                                    </ButtonGroup></td>
                                                                </tr>)
                                                        })
                                                    }
                                                </tbody>
                                            </Table>
                                        </div>}
                                        {/* Tailoring package content */}
                                        {formObj.type == 'tailoring_package' && iType == "Kianvqyqndr" && <div className="form-group mt-4">
                                            <p>Select Fabrics: *</p>
                                            <Select
                                                styles={colourStyles}
                                                options={allFabrics}
                                                onChange={e => addToTailoringPackage(e)} />
                                            <br />
                                            {errorForm.fabs && <p className='p-1 h6 text-danger '>Select One Option at Least</p>}
                                            <div style={{ height: 300, width: "100%" }}>
                                                <DataGrid
                                                    rows={selectedFabrics}
                                                    columns={columnsTailoringPackages}
                                                    pageSize={10}
                                                    rowsPerPageOptions={[10]}
                                                    onCellEditCommit={saveToCell}
                                                />
                                            </div>
                                            <p className='mt-4'>Enter The Prices</p>
                                            {errorForm.rules && <p className='p-1 h6 text-danger '>Enter The Price Rules</p>}
                                            <div className="form-group mt-4">
                                                <Table className='table table-hover variation' style={{ maxWidth: '700px' }}>
                                                    <thead>
                                                        <th>Name</th>
                                                        <th>From</th>
                                                        <th>To</th>
                                                        <th>price</th>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            formObj.tailoringPrices.map((vr: any, i: number) => {
                                                                return (
                                                                    <tr key={i}>
                                                                        <td><input type="text" name="name" className="form-control p-2" placeholder="Enter Name" value={vr.name} onChange={(e) => { handleInputChangeTailoring(e, i) }} /></td>
                                                                        <td><input type="number" name="from" min={0} className="form-control p-2" placeholder="Enter Start Length" value={vr.from} onChange={(e) => { handleInputChangeTailoring(e, i) }} /></td>
                                                                        <td><input type="number" name="to" min={0} className="form-control p-2" placeholder="Enter End Length" value={vr.to} onChange={(e) => { handleInputChangeTailoring(e, i) }} /></td>
                                                                        <td><input type="number" name="price" min={0} className="form-control p-2" placeholder="Enter Price" value={vr.price} onChange={(e) => { handleInputChangeTailoring(e, i) }} /></td>
                                                                        <td><ButtonGroup className="mb-2 m-buttons-style">
                                                                            <Button onClick={() => handleDeleteTailoringPrices(i)}><FontAwesomeIcon icon={faTrash} /></Button>
                                                                        </ButtonGroup></td>
                                                                    </tr>)
                                                            })
                                                        }
                                                    </tbody>
                                                </Table>
                                            </div>

                                        </div>}
                                        {/* cost */}
                                        {formObj.type == 'single' && <>
                                            <div className="field-cover">
                                                <div className="field-section">
                                                    <p>Cost: <span className='text-danger'>*</span></p>
                                                </div>
                                                <div className="field-section">
                                                    <input type="text" className="form-control" placeholder="Purchase Price"
                                                        value={formObj.cost}
                                                        onKeyPress={handleNumberKeyPress}
                                                        onChange={(e) => { setFormObj({ ...formObj, cost: e.target.value }) }} />
                                                </div>
                                            </div>
                                            {/* Price */}
                                            <div className="field-cover">
                                                <div className="field-section">
                                                    <p>Price: <span className='text-danger'>*</span></p>
                                                </div>
                                                <div className="field-section">
                                                    <input type="text" className="form-control" placeholder="Sell Price"
                                                        value={formObj.price}
                                                        onKeyPress={handleNumberKeyPress}
                                                        onChange={(e) => { setFormObj({ ...formObj, price: e.target.value }) }} />
                                                </div>
                                            </div>
                                        </>}
                                        {/* Alert Quantity */}
                                        {!formObj.isService && <div className="field-cover">
                                            <div className="field-section">
                                                <p>Alert Quantity: <span className='text-danger'>*</span></p>
                                            </div>
                                            <div className="field-section">
                                                <input type="number" className="form-control" placeholder="Alert Quantity"
                                                    value={formObj.alertQuantity}
                                                    min={0}
                                                    onChange={(e) => { setFormObj({ ...formObj, alertQuantity: Number(e.target.value) }) }} />
                                            </div>
                                        </div>}
                                        {formObj.isService == 0 && <>
                                            {/* Sell Over Stock */}
                                            <div className="field-cover">
                                                <div className="field-section">
                                                    <p>Sell Over Stock:</p>
                                                </div>
                                                <div className="field-section">
                                                    <Switch name={'sell_over'} checked={formObj.isSellOverStock} onChange={checkboxHandleChange} />
                                                </div>
                                            </div>
                                            {/* Enable Multi Price */}
                                            <div className="field-cover">
                                                <div className="field-section">
                                                    <p>Enable Multi Price: <CustomWidthTooltip
                                                        PopperProps={{
                                                            disablePortal: true,
                                                        }}
                                                        placement="right-start"
                                                        onClose={handleTooltipClose}
                                                        open={open2}
                                                        disableFocusListener
                                                        disableHoverListener
                                                        disableTouchListener
                                                        title={
                                                            <React.Fragment>
                                                                <Typography color="inherit">Multi Price</Typography>
                                                                {"A product can have several prices"}<br />
                                                                <em>{"It depends on the price of your purchases"}</em>
                                                            </React.Fragment>
                                                        }
                                                    >
                                                        <span onClick={() => handleTooltipOpen('multi')}> <FontAwesomeIcon icon={faInfoCircle} className={'text-primary'} /></span>
                                                    </CustomWidthTooltip></p>
                                                </div>
                                                <div className="field-section">
                                                    <Switch name={'multi_price'} checked={formObj.isMultiPrice} onChange={checkboxHandleChange} />
                                                </div>
                                            </div>
                                            {/* FIFO OR LIFO */}
                                            <div className="field-cover">
                                                <div className="field-section">
                                                    <p>FIFO OR LIFO:</p>
                                                </div>
                                                <div className="field-section">
                                                    <Switch name={'is_fifo'} checked={formObj.isFifo} onChange={checkboxHandleChange} />
                                                </div>
                                            </div>
                                        </>}
                                        {/* Custom Tax */}
                                        <div className="field-cover">
                                            <div className="field-section">
                                                <p>Custom Tax: <CustomWidthTooltip
                                                    PopperProps={{
                                                        disablePortal: true,
                                                    }}
                                                    placement="right-start"
                                                    onClose={handleTooltipClose}
                                                    open={open}
                                                    disableFocusListener
                                                    disableHoverListener
                                                    disableTouchListener
                                                    title={
                                                        <React.Fragment>
                                                            <Typography color="inherit">specific Group A Tax</Typography>
                                                            {"You can Choose a specific Group tax For this Product"}<br />
                                                            <em>{"For Create Group Tax, go to setting/taxes"}</em>
                                                        </React.Fragment>
                                                    }
                                                >
                                                    <span onClick={() => handleTooltipOpen('tax')}> <FontAwesomeIcon icon={faInfoCircle} className={'text-primary'} /></span>
                                                </CustomWidthTooltip></p>
                                            </div>
                                            <div className="field-section">
                                                <Select
                                                    styles={colourStyles}
                                                    options={taxGroup}
                                                    value={taxGroup.find((f: any) => { return f.value == formObj.tax_id })}
                                                    onChange={(itm) => { setFormObj({ ...formObj, tax_id: itm!.value }) }} />
                                            </div>
                                        </div>
                                    </div>}
                                </form>
                            </div>
                            : <div className='d-flex justify-content-around' ><Spinner animation="grow" /></div>}
                    </Card.Body>
                </Card>
            </AdminLayout >
        </>
    )
}
export default Product;
export async function getServerSideProps(context: any) {
    const parsedCookies = cookie.parse(context.req.headers.cookie || '[]');
    var _isOk = true, _rule = true, iType = '';
    //check page params
    var shopId = context.query.id;
    var _addOrEdit = context.query.slug[0];
    var _EditId = context.query.slug[1];

    if (shopId == undefined)
        _isOk = false
    if (_addOrEdit != 'add' && _addOrEdit != 'edit')
        _isOk = false

    if (!_isOk)
        return { redirect: { permanent: false, destination: "/page403" } }

    //check user permissions
    await verifayTokens({ headers: { authorization: 'Bearer ' + parsedCookies.tokend } }, (repo: ITokenVerfy) => {
        _isOk = repo.status;
        if (_isOk) {
            var _rules = keyValueRules(repo.data.rules || []);


            if (repo.data.types != undefined && repo.data.types.length > 0) {
                const item: any = repo.data.types.find((tp: any) => tp.id == shopId);
                if (item !== undefined)
                    iType = item.type
            }

            if (_rules[-2] != undefined && _rules[-2][0].stuff != undefined && _rules[-2][0].stuff == 'owner') {
                _rule = true;
            } else if (_isOk && _rules[shopId] != undefined) {
                var _stuf = '';
                _rules[shopId].forEach((dd: any) => _stuf += dd.stuff)
                _addOrEdit = getRealWord(_addOrEdit);
                const { hasPermission } = hasPermissions(_stuf, 'products', _addOrEdit)
                _rule = hasPermission
            } else
                _rule = false
        }

    })
    if (!_rule) return { redirect: { permanent: false, destination: "/page403" } }
    if (!_isOk || iType.length == 0) return { redirect: { permanent: false, destination: "/user/login" } }
    return {
        props: { shopId, editId: _addOrEdit == 'edit' ? _EditId : 0, iType },
    };
    //status ok


}