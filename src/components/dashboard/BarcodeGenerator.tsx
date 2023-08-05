import React from "react";
import Barcode from "react-barcode";

const BarcodeGenerator = ({ sku }) => {
    return (
        <div>
            <Barcode value={sku + ""} height={30} width={3} fontSize={10} />
        </div>
    );
};

export default BarcodeGenerator;
