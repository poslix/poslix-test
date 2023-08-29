import { NextPage } from "next";
import { Button, Card, Form, InputGroup } from "react-bootstrap";
import {Button as MButton} from "@mui/material"
import ProductItem from "src/components/digital/product-item";
import DigitalCart from "src/components/digital/digital-cart";
const Products: NextPage = (props: any) => {
    const products = [
        {
            name: "Digital Product Title",
            image: "https://firebasestorage.googleapis.com/v0/b/qrlixx.appspot.com/o/files%2FProdImgs%2Fcozy-2fb7985286e65203389d004aff46cefa?alt=media&token=58c9c17e-bf79-4a18-8c4f-38bf3f3ffea7",
            price: "100",
            description: "Digital Product Description"
        },
        {
            name: "Digital Product Title",
            image: "https://firebasestorage.googleapis.com/v0/b/qrlixx.appspot.com/o/files%2FProdImgs%2Fcozy-2fb7985286e65203389d004aff46cefa?alt=media&token=58c9c17e-bf79-4a18-8c4f-38bf3f3ffea7",
            price: "100",
            description: "Digital Product Description"
        },
        {
            name: "Digital Product Title",
            image: "https://firebasestorage.googleapis.com/v0/b/qrlixx.appspot.com/o/files%2FProdImgs%2Fcozy-2fb7985286e65203389d004aff46cefa?alt=media&token=58c9c17e-bf79-4a18-8c4f-38bf3f3ffea7",
            price: "100",
            description: "Digital Product Description"
        },
        {
            name: "Digital Product Title",
            image: "https://firebasestorage.googleapis.com/v0/b/qrlixx.appspot.com/o/files%2FProdImgs%2Fcozy-2fb7985286e65203389d004aff46cefa?alt=media&token=58c9c17e-bf79-4a18-8c4f-38bf3f3ffea7",
            price: "100",
            description: "Digital Product Description"
        },
        {
            name: "Digital Product Title",
            image: "https://firebasestorage.googleapis.com/v0/b/qrlixx.appspot.com/o/files%2FProdImgs%2Fcozy-2fb7985286e65203389d004aff46cefa?alt=media&token=58c9c17e-bf79-4a18-8c4f-38bf3f3ffea7",
            price: "100",
            description: "Digital Product Description"
        },
        {
            name: "Digital Product Title",
            image: "https://firebasestorage.googleapis.com/v0/b/qrlixx.appspot.com/o/files%2FProdImgs%2Fcozy-2fb7985286e65203389d004aff46cefa?alt=media&token=58c9c17e-bf79-4a18-8c4f-38bf3f3ffea7",
            price: "100",
            description: "Digital Product Description"
        },
        {
            name: "Digital Product Title",
            image: "https://firebasestorage.googleapis.com/v0/b/qrlixx.appspot.com/o/files%2FProdImgs%2Fcozy-2fb7985286e65203389d004aff46cefa?alt=media&token=58c9c17e-bf79-4a18-8c4f-38bf3f3ffea7",
            price: "100",
            description: "Digital Product Description"
        },
        {
            name: "Digital Product Title",
            image: "https://firebasestorage.googleapis.com/v0/b/qrlixx.appspot.com/o/files%2FProdImgs%2Fcozy-2fb7985286e65203389d004aff46cefa?alt=media&token=58c9c17e-bf79-4a18-8c4f-38bf3f3ffea7",
            price: "100",
            description: "Digital Product Description"
        }
    ];
    return (
        <div className="digital-products-main">
            <div className="digital-products-header">
                <h1>Digital Products</h1>
            </div>
            <div className="digital-products-container">
                <div className="digital-products">
                    <div className="digital-product-filtre">
                        <Form.Control type="text" placeholder="Filter" />
                    </div>
                    <div className="digital-product-list">                                                
                        {products.map((product, ind) => <ProductItem product={product} key={ind}/>)}
                    </div>
                </div>
                <DigitalCart/>
                <div className="digital-cart-small"></div>
            </div>
        </div>
    );
} 

export default Products; 