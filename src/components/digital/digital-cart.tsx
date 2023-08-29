import { Button } from "@mui/material"


const DigitalCart = (props: any) => {
    return (
        <div className="digital-cart">
            <div className="digital-cart-items-container">
                <h4>YOUR ORDER</h4>
                <div className="digital-cart-items-list">
                    <p className="empty">Cart is empty</p>
                </div>
            </div>
            <div className="digital-cart-checkout">
                <Button variant="contained" color="error">Checkout 0.000 OMR</Button>
                <Button color="error">APPLY COUPON</Button>
            </div>
        </div>
    )
}

export default DigitalCart;