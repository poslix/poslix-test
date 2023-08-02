import React, { useState, useContext } from "react";
import { IPackItem, IproductInfo } from "../../../models/common-model";
import { useRecoilState } from 'recoil';
import { productDetails } from "../../../recoil/atoms";
import { ProductContext } from "src/context/ProductContext";
import PackageItemsModal from "../modals/PackageItemsModal";
import { UserContext } from "src/context/UserContext";


export const ItemCard = (props: any) => {
  const [productInfo, setProducInfo] = useRecoilState(productDetails);
  const { packageItems, products } = useContext(ProductContext);
  const [packItems, setPackItems] = useState([])
  const [filterdItems, setFilterdItems] = useState<IPackItem[]>([])
  const [isOpenDialog, setIsOpenDialog] = useState(false)
  const { items } = props;
  const { locationSettings } = useContext(UserContext);

  const handleShowPackageItems = (packId: number) => {
    var filterd: IPackItem[] = packageItems.filter((pi: IPackItem) => pi.parent_id == packId)
    setFilterdItems(filterd)
    var onlyIds = filterd.map((itm: any) => { return itm.product_id; });
    setPackItems(products.products.filter((pro: IproductInfo) => onlyIds.includes(pro.product_id)))
    setIsOpenDialog(!isOpenDialog)
  }
  return (
    <>
      <div className="product-img" onClick={() => {
        setProducInfo({ product_id: false });
        setTimeout(() => { setProducInfo(items); }, 100)
      }}>
        <div className="img-container"><img src={items.image?.length > 10 ? items.image : '/images/pos/placeholder.png'} alt={items.name} className="img-fluid" /></div>
      </div>
      <h5 className="item-name">{items.name}</h5>
      <div className="item-price">{!items.type?.includes('variable') ? Number(items.price).toFixed(3) + locationSettings.currency_code : '--'}</div>
      {(!items.is_service && !items.type?.includes('variable') && !items.type?.includes('package') && items.total_qty == 0 && !items.sell_over_stock) && <div className="out-of-stock">Out Of Stock</div>}
      <div className="item-icons">
        {(!items.is_service && items.sell_over_stock == true) && <div className="inner-icon"><img src="/images/pos/card/over_sell.png" /></div>}
        {(items.type == 'package') && <div className="inner-icon" onClick={() => handleShowPackageItems(items.product_id)}><img src="/images/pos/card/packages.png" /></div>}
      </div>
      {isOpenDialog && <PackageItemsModal filterdItems={filterdItems} packItems={packItems} isOpenDialog={isOpenDialog} setIsOpenDialog={setIsOpenDialog} />}
    </>
  );
};
