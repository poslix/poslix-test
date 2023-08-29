import { Button } from "react-bootstrap";

const ProductItem = (props: any) => {
    const { product } = props;
    const { name, description, price, image } = product;
    return (
        <div className="digital-product-item">
            {/* <div className="digital-product-image"> */}
            <img className="digital-product-image" src={image} alt="" width={'100%'} height={'100%'} />
            {/* </div> */}
            <div className="digital-product-info">
                <div className="digital-product-title">
                    <h5>{name}</h5>
                </div>
                <div className="digital-product-price">
                    <p>
                        <span>$</span>
                        <span>{price}</span>
                    </p>
                </div>
                <div className="digital-product-description">
                    <p>{description}</p>
                </div>
            </div>
            <div className="digital-product-button">
                <Button variant="danger">Buy Now</Button>
            </div>
        </div>
    )
};

export default ProductItem;