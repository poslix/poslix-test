import React, { useState, useEffect, useContext } from 'react'
import { useRecoilState } from 'recoil';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { cartJobType } from 'src/recoil/atoms';
import Select from 'react-select';
import { apiFetchCtr } from 'src/libs/dbUtils';
import { ProductContext } from 'src/context/ProductContext';
import { ITailoringExtra, ITailoringPackagePrice } from '@models/common-model';
import { Toastify } from 'src/libs/allToasts';
const TailoringModal = (probs: any) => {
    const { selectedProduct, isOpenTailoringDialog, setIsOpenTailoringDialog, tailoringsData, shopId, tailoringExtras } = probs;
    const { products } = useContext(ProductContext);
    const [, setJobType] = useRecoilState(cartJobType);
    const [sizes, setSizes] = useState([])
    const [selectedSizes, setSelectedSizes] = useState<any>([[]])
    const [fabrics, setFabrics] = useState<any>([])
    const [selectedFab, setSelectedFab] = useState<number[]>([])
    const [extras, setExtras] = useState<ITailoringExtra[]>([])
    const [selectedExtras, setSelectedExtras] = useState<{ id: number, value: string }[]>([])
    const [selectedProductExtras, setSelectedProductExtras] = useState<number[]>([])
    const [selectedUserSizeId, setSelectedUserSizeId] = useState<number>(0)
    const [multipleValue, setMultipleValue] = useState<number>(0)
    const [primaryValue, setPrimaryValue] = useState<number>(0)
    const [priceLogics, setPriceLogics] = useState<ITailoringPackagePrice[]>([])
    const [lineTotal, setLineTotal] = useState<number>(-1)
    const [userSizes, setUserSizes] = useState<any>([])
    const [isEdit, setIsEdit] = useState(false)
    const [isPackage, setIsPackage] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [txtNote, setTxtNote] = useState("")


    const colourStyles = {
        control: (style: any) => ({
            ...style,
            fontSize: '12px',
            border: '1px solid #eaeaea',
            borderRadius: '15px',
            minHeight: '50px',
            marginBottom: '25px',
            paddingLeft: '10px'
        })
    }
    const colourStylesExtra = {
        control: (style: any) => ({
            ...style,
            fontSize: '12px',
            border: '1px solid #eaeaea',
            borderRadius: '15px',
            minWidth: '200px',
            minHeight: '50px',
            marginBottom: '0px',
            paddingLeft: '10px'
        })
    }

    async function initDataPage(typeId = '0') {
        const { success, newdata } = await apiFetchCtr({ fetch: 'pos', subType: 'initTailoringUserSizes', shopId, typeId });
        if (!success) {
            alert("error in fetching..")
            return;
        }
        setUserSizes(newdata)
        setIsLoading(false)
    }
    useEffect(() => {
        console.log(selectedProduct);
        let id = selectedProduct.product != undefined && selectedProduct.product.type == "tailoring_package" ? selectedProduct.product.tailoring_type_id : selectedProduct.tailoring_id
        initDataPage(id)
    }, [])
    useEffect(() => {
        if (selectedProduct.product != undefined && selectedProduct.product.type == "tailoring_package") {
            //package inly : edit mode
            setIsPackage(true)
            let selectedFab = -1;
            if (selectedProduct.tailoringCustom != undefined) {
                selectedFab = parseInt(selectedProduct.tailoringCustom.fabric_id)
                setSelectedExtras(selectedProduct.tailoringCustom.extras != undefined && selectedProduct.tailoringCustom.extras.length > 3 ? JSON.parse(selectedProduct.tailoringCustom.extras) : [])
            }

            if (selectedProduct.value.length > 4) {
                var _datas: any = JSON.parse(selectedProduct.value);
                for (let iddx = 0; iddx < _datas[0].length; iddx++) {
                    if (_datas[0][iddx].is_primary == 1) {
                        let _val = parseFloat(_datas[0][iddx].value)
                        setPrimaryValue(_val)
                        let dd = priceLogics.findIndex(p => _val >= p.from && _val <= p.to)
                        setLineTotal(dd == -1 ? -1 : priceLogics[dd].price)
                    }
                }
                setIsEdit(true)
                setSizes(_datas[0])
                setSelectedSizes(_datas)
                setTxtNote(selectedProduct.tailoringCustom.notes)
                setMultipleValue(parseFloat(selectedProduct.tailoringCustom.multiple))
            } else {
                console.log(tailoringsData);

                const _sizes = JSON.parse(JSON.stringify(tailoringsData[selectedProduct.product.tailoring_type_id]))
                console.log(_sizes);
                if (_sizes == undefined || _sizes.length == 0) {
                    alert("error in fetching..")
                    return;
                }
                const extraIds = "," + _sizes[0].extras;
                console.log('extraIds ', extraIds);

                if (tailoringExtras != undefined && tailoringExtras.length > 0) {
                    setExtras(tailoringExtras.filter(te => extraIds.includes(te.id + ",")));
                }

                setMultipleValue(parseFloat(_sizes[0].multiple_value))
                setSizes(_sizes)
                var _items = [..._sizes, { "id": 0, "tailoring_type_id": 0, "name": "_frm_name", "is_primary": 0 }];
                setSelectedSizes([_items])
            }
            const _fabric_ids = selectedProduct.product.fabric_ids.split(",").map((str: any) => parseInt(str));
            const filtered_products = products.products.filter((product: any) => _fabric_ids.includes(product.product_id));
            if (filtered_products.length == 0) {
                alert("error in fetching..")
                return;
            }
            if (selectedFab == -1)
                setSelectedFab(Array(filtered_products.length).fill(0))
            else {
                let arrayFill: number[] = [];
                for (let idx = 0; idx < filtered_products.length; idx++)
                    arrayFill.push(selectedFab == _fabric_ids[idx] ? 1 : 0)
                setSelectedFab(arrayFill)
            }
            setFabrics(filtered_products)
            //for extras product
            if (selectedProduct.product.product_ids != null && selectedProduct.product.product_ids.length > 1) {
                const _extra_ids = selectedProduct.product.product_ids.split(",").map((str: any) => parseInt(str));
                const _extra_filters = products.products.filter((product: any) => _extra_ids.includes(product.product_id));
                if (_extra_filters.length == 0) {
                    alert("error in fetching..")
                    return;
                }
                // setSelectedProductExtras(Array(_extra_filters.length).fill(0))
                // setExtras(_extra_filters)
            }
            setPriceLogics(JSON.parse(selectedProduct.product.prices_json))
        } else {
            if (selectedProduct.value.length > 4) {
                var _datas: any = JSON.parse(selectedProduct.value);
                setIsEdit(true)
                setSizes(_datas[0])
                setSelectedSizes(_datas)
            } else {
                var _sizes = tailoringsData[selectedProduct.tailoring_id];
                if (_sizes == undefined)
                    return;
                setIsEdit(false)
                setMultipleValue(parseFloat(_sizes[0].multiple_value))
                setSizes(_sizes)
                let newItems = JSON.parse(JSON.stringify(_sizes))
                newItems.map((d: any) => d['value'] = "")
                var _items = [...newItems, { "id": 0, "tailoring_type_id": 0, "name": "_frm_name", "is_primary": 0 }];
                setSelectedSizes([_items])
            }
        }
    }, [userSizes])

    const handleClick = () => {
        let _data: any = [], isFullFilled = true;
        selectedSizes[0].map((sd: any) => {
            if (sd.value != undefined && sd.value.length > 0)
                _data.push({ name: sd.name, value: sd.value, is_primary: sd.is_primary })
            else isFullFilled = false
        })
        if (!isFullFilled) {
            Toastify('error', 'Error,Fill The Form Correctly')
            return
        }
        let choosedFabric = selectedFab.findIndex(sb => sb == 1)
        if (isPackage && choosedFabric == -1) {
            Toastify('error', 'Error,You Must Select One Fabric')
            return
        }
        if (isPackage && lineTotal <= 0) {
            Toastify('error', 'Error,Enter Right Digit For Primary Value')
            return
        }
        setJobType({
            req: 5,
            val: JSON.stringify([_data]),
            val2: isEdit ? selectedProduct.tailoring_cart_index : -1,
            val3: selectedUserSizeId,
            custom: {
                isPackage,
                price: lineTotal,
                fabric_id: isPackage ? selectedProduct.product.fabric_ids.split(",")[choosedFabric] : 0,
                multiple: multipleValue,
                fabric_length: (multipleValue * primaryValue),
                notes: txtNote,
                extras: JSON.stringify(selectedExtras)

            }
        })
        setIsOpenTailoringDialog(false)
    }
    const handleAddMore = () => {
        var _data = [...selectedSizes];
        let newItems = JSON.parse(JSON.stringify(sizes))
        newItems.map((d: any) => d['value'] = "")
        if (selectedProduct.value.length > 4)
            _data.push([...newItems])
        else
            _data.push([...newItems, { "id": 0, "tailoring_type_id": 0, "name": "size name", "is_primary": 0 }])
        setSelectedSizes(_data)
        console.log('add more');
    }
    const handleChange = (evt: any, parentI: number, index: number) => {
        var _data: any = [...selectedSizes];
        let _val = evt.target.value
        _data[parentI][index].value = _val
        if (_data[parentI][index].is_primary == 1) {
            _val = parseFloat(_val)
            setPrimaryValue(_val)
            let dd = priceLogics.findIndex(p => _val >= p.from && _val <= p.to)
            setLineTotal(dd == -1 ? -1 : priceLogics[dd].price)
        }
        setSelectedSizes(_data)
    }
    const handleFabricSelect = (i: number) => {
        let _data = [...selectedFab]
        for (let j = 0; j < _data.length; j++)
            _data[j] = 0
        _data[i] = 1;
        setSelectedFab(_data)
    }
    const handleExtrasSelect = (i: number) => {
        let _data = [...selectedProductExtras]
        _data[i] = _data[i] == 0 ? 1 : 0;
        setSelectedProductExtras(_data)
    }
    const handleExtraOnChange = (selectedOption: any) => {
        console.log(`Selected option for`, selectedOption);
        const _index = selectedExtras.findIndex(se => se.id == selectedOption.id);
        let _data: any = [...selectedExtras];
        if (_index == -1) {
            _data.push({ id: selectedOption.id, value: selectedOption.value })

        } else {
            _data[_index].id = selectedOption.id
            _data[_index].value = selectedOption.value
        }
        setSelectedExtras(_data)
    };
    const handleDefValue = (traId: number) => {
        const ind = selectedExtras.findIndex(sf => sf.id == traId);
        if (ind > -1)
            return { value: selectedExtras[ind].value, label: selectedExtras[ind].value, id: selectedExtras[ind].id }
        else
            return { value: "", label: "", id: -1 }

    }
    return (
        <>
            <Dialog
                open={isOpenTailoringDialog}
                className="poslix-modal">
                <DialogTitle className='poslix-modal-title text-primary'>
                    Complete The Form
                </DialogTitle>
                <DialogContent className="poslix-modal-content" >
                    {!isLoading ? <div className="poslix-modal">
                        <div className="modal-content">
                            <div className="modal-body">
                                <Select
                                    styles={colourStyles}
                                    options={userSizes}
                                    placeholder="select from previous"
                                    onChange={(itm: any) => {
                                        let _datas = JSON.parse(itm.sizes);
                                        setSelectedSizes(_datas)
                                        for (let iddx = 0; iddx < _datas[0].length; iddx++) {
                                            if (_datas[0][iddx].is_primary == 1) {
                                                let _val = parseFloat(_datas[0][iddx].value)
                                                setPrimaryValue(_val)
                                                let dd = priceLogics.findIndex(p => _val >= p.from && _val <= p.to)
                                                setLineTotal(dd == -1 ? -1 : priceLogics[dd].price)
                                            }
                                        }
                                        setSelectedUserSizeId(itm.value)
                                    }}
                                />
                                {
                                    selectedSizes.map((Isizes: any, i: number) => {
                                        return (
                                            <div key={i + 99} className="container-tailoring">
                                                {Isizes.map((se: any, ix: number) => {
                                                    return (<div key={i + ix + 1} className="tailor-item" > <input type={se.name != '_frm_name' ? 'number' : 'text'} min={0} className={se.is_primary == 1 ? 'iskey' : ''} placeholder={se.name == '_frm_name' ? 'Size Name' : se.name} value={se.value} name={'valname' + (i + ix)} onChange={(e) => handleChange(e, i, ix)} /></div>)
                                                })}
                                            </div>)
                                    })
                                }
                            </div>
                            {/* for package only */}
                            {isPackage && <>
                                <h5 className='tailoring-pack-title'>Select A Fabric</h5>
                                <div className="packitems-container">
                                    {
                                        fabrics.map((fab: any, i: number) => {
                                            return (
                                                <div key={i} className={`packitems ${selectedFab[i] == 1 ? 'active' : ''}`} onClick={() => handleFabricSelect(i)}>
                                                    <img src={fab.image} />
                                                    <h5>{fab.name}</h5>
                                                    <h6>{Number(fab.price).toFixed(3)}</h6>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                {/* <hr />
                                <div className="packitems-container">
                                    {
                                        extras.map((fab: any, i: number) => {
                                            return (<div className={`packitems ${selectedProductExtras[i] == 1 ? 'active' : ''}`} onClick={() => handleExtrasSelect(i)}><h5>{fab.name}</h5></div>)
                                        })
                                    }
                                </div> */}
                                <hr />
                                {
                                    extras.map(tra => {
                                        const options = JSON.parse(tra.items).map(item => ({
                                            value: item.name,
                                            label: item.name,
                                            id: tra.id
                                        }));
                                        return (
                                            <>
                                                <h5 className='tailoring-pack-title mt-4'>{tra.name}</h5>
                                                <div className="packitems-container">
                                                    <Select
                                                        styles={colourStylesExtra}
                                                        options={options}
                                                        placeholder="select"
                                                        onChange={handleExtraOnChange}
                                                        value={handleDefValue(tra.id)}
                                                    />
                                                </div>
                                            </>
                                        )
                                    })
                                }
                            </>}
                            <h5 className='tailoring-pack-title mt-4'>Additional Note</h5>
                            <div className="packitems-container">
                                <textarea className='tailoring-notes' value={txtNote} onChange={(e) => setTxtNote(e.target.value)}></textarea>
                            </div>
                            {isPackage && <h5 className="status-price">Line Total: <span className='text-primary'>{lineTotal < 0 ? 'select first' : lineTotal + ' {locationSettings.currency_code}'} </span></h5>}
                            <div className="modal-footer">
                                <a
                                    href="#"
                                    className="btn btn-link link-success fw-medium"
                                    onClick={() => setIsOpenTailoringDialog(false)}>
                                    Cancel <i className="ri-close-line me-1 align-middle" />
                                </a>
                                <button type="button" className="popup-btn btn btn-primary" onClick={handleClick}>Save</button>
                            </div>

                        </div>
                        {/* /.modal-content */}
                    </div> : 'loading'}
                </DialogContent >
            </Dialog >

        </>
    )

}

export default TailoringModal;