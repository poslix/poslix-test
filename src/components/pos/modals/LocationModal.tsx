import React, { useEffect, useState } from 'react'
import Select, { StylesConfig } from 'react-select';
import { ToastContainer } from 'react-toastify';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { apiInsertCtr } from 'src/libs/dbUtils';
import { Toastify } from 'src/libs/allToasts';

const LocationModal = ({showDialog, setShowDialog, locations, data, setData, shopId, value}) => {
    const [selectedShop, setSelectedShop] = useState(locations[value])
    useEffect(() => {
        setSelectedShop(locations[value])
    }, [value])
    
    const style = { minWidth: "500px" };
    const onSubmit = async () => {
        const { success, newdata } = await apiInsertCtr({ type: 'products', subType: 'addItemsToLocation', shopId,
            data: {newShopId: selectedShop.value, items: data}
        })
        if (!success) {
            Toastify('error', 'Error, Try Again')
            return;
        }
        Toastify('success', 'Items has been added to new location successfully...')
        setShowDialog(false)
        setData([])
        setSelectedShop(locations[value])
    }
  return (
    <>
      <ToastContainer />
      <Dialog open={showDialog} className="poslix-modal" sx={style}>
        <DialogTitle>Select Location</DialogTitle>
        <DialogContent className="poslix-modal-content">
          <div className="modal-body" style={{width: '500px', height: '150px'}}>
            {locations?.length > 1 && <Select
                className='mt-3'
                options={locations}
                value={selectedShop || locations[value]}
                onChange={(itm: any) => {
                    setSelectedShop(itm)
                    // setUser(itm)
                    // redirectToLogin('/shop/' + itm!.value + '/' + currentPageName)
                }}
                maxMenuHeight={100}
            />}
          </div>
          <div className="modal-footer">
            <a
              onClick={() => {
                setShowDialog(false);
                setSelectedShop(locations[value])
              }}
              href="#"
              className="btn btn-link link-success fw-medium"
            >
              <i className="ri-close-line me-1 align-middle" /> Close
            </a>
            <button
              type="button"
              className={
                `btn btn-label ${selectedShop?.value == shopId ? "pe-none opacity-75" : "pe-auto opacity-100"} right nexttab`
              }
              data-nexttab="pills-finish-tab"
              onClick={()=> {
                if(selectedShop?.value != shopId) onSubmit()
              }}
            >
              <i className="ri-shopping-basket-line label-icon align-middle fs-16 ms-2" />
              Send Items
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default LocationModal