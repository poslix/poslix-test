import type { NextApiRequest, NextApiResponse } from 'next'
import { QueryError } from 'mysql2';
var { doConnect } = require('../../../libs/myConnection');
import { Data, ITokenVerfy } from '../../../models/common-model';
import { areNumbers, locationPermission, redirection, verifayTokens } from '../checkUtils'
import { incorrectInput } from '../utils/data';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    try {
        verifayTokens(req, async (repo: ITokenVerfy) => {
            if (repo.status === true) {
                const { shopId, subType } = req.body;
                if (!areNumbers([shopId])) {
                    redirection(403, null, res, incorrectInput)
                    return;
                }
                if (locationPermission(repo.data.locs, shopId) != -1) {
                    if (subType == 'insertProducts') {
                        const { data } = req.body;
                        const { fdata, img, selectedProducts, selectedFabrics } = data;

                        let never_tax = 0;
                        if (fdata.tax_id == -1) {
                            never_tax = 1;
                            fdata.tax_id = null
                        }

                        let _hasSku = false;
                        var con = doConnect();
                        await con.promise().query(`SELECT sku FROM products WHERE sku=? AND location_id= ? LIMIT 1`, [fdata.sku, shopId])
                            .then((rows: any, fields: any) => {
                                if (rows[0].length > 0)
                                    _hasSku = true
                            })
                            .catch()

                        if (_hasSku) {
                            redirection(403, con, res, 'The ' + fdata.sku + ' Already Exist,Use Another One', 100);
                            return;
                        }
                        con.query(`insert into products(name,subproductname,type,is_tailoring,location_id,image,tax,never_tax,sku,barcode_type, unit_id, brand_id,category_id,alert_quantity,created_by,cost_price,sell_price,is_service,is_fabric,sell_over_stock,is_selling_multi_price,is_fifo,qty_over_sold)
                                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                            [fdata.productName, fdata.productName2, fdata.type, fdata.type == "tailoring_package" ? 0 : fdata.isTailoring, shopId, img, fdata.tax_id, never_tax, fdata.sku, fdata.barcodeType, fdata.unit, fdata.brand, fdata.cat, fdata.alertQuantity, repo.data.id, fdata.cost, fdata.price, fdata.isService, fdata.isFabric, fdata.isSellOverStock, fdata.isMultiPrice, fdata.isFifo, 0],
                            async function (err: QueryError, prods: any) {
                                if (err) {
                                    console.log(err);
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: false, msg: 'somthing is Wrong,Error Code AP201' });
                                    res.end();
                                    con.end();
                                    return
                                }

                                if (fdata.type == "package") {

                                    const sqlAddPackageItems = 'INSERT into `package_items` (location_id,parent_id,product_id,price,created_by) VALUES ? '
                                    const ValueAddPackageItems: any = [];

                                    if (selectedProducts.length > 1) {
                                        selectedProducts.map((sp: any, idx: number) => {
                                            if (sp.isNew)
                                                ValueAddPackageItems.push([shopId, prods.insertId, sp.product_id, sp.price, repo.data.id])
                                        });
                                        if (ValueAddPackageItems.length > 0) {
                                            await con.promise().query(sqlAddPackageItems, [ValueAddPackageItems])
                                                .then((rows: any, fields: any) => { })
                                                .catch()
                                        }

                                    }

                                } else if (fdata.type == "variable") {

                                    const sqlAddVariation = 'INSERT into `product_variations` (location_id,parent_id,name,name2,sku,cost,price,sell_over_stock,is_selling_multi_price,is_service,created_by) VALUES ? '
                                    const valueAddVariation: any = [];

                                    if (fdata.variations.length > 1) {
                                        fdata.variations.map((sp: any, idx: number) => {
                                            if (sp.isNew && sp.name.length > 0)
                                                valueAddVariation.push([shopId, prods.insertId, sp.name, sp.name2, sp.sku, sp.cost, sp.price, fdata.isSellOverStock, fdata.isMultiPrice, fdata.isService, repo.data.id])
                                        });
                                        //insert
                                        if (valueAddVariation.length > 0) {
                                            await con.promise().query(sqlAddVariation, [valueAddVariation])
                                                .then((rows: any, fields: any) => { })
                                                .catch()
                                        } else {
                                            await con.promise().query(`DELETE from products WHERE id  = ? LIMIT 1`, [prods.insertId])
                                                .then((rows: any, fields: any) => { })
                                                .catch()
                                            redirection(400, con, res, 'incorrect data, try agian', 400)
                                            return;
                                        }

                                    }
                                } else if (fdata.type == "tailoring_package") {

                                    let _prices: any = [];
                                    fdata.tailoringPrices.map((d: any) => {
                                        if (d.from >= 0 && d.to > 0) _prices.push(d)
                                    })
                                    let _fabs = "";
                                    selectedFabrics.map((d: any) => _fabs += d.product_id + ",")
                                    if (_prices.length == 0) {
                                        redirection(403, con, res, 'Price Rules Are Not Enterd, Please Enter The Prices')
                                        return;
                                    }
                                    if (_fabs.length == 0) {
                                        redirection(403, con, res, 'Error,You have to select fabric(s)')
                                        return;
                                    }
                                    const sqlAddVariation = `insert into tailoring_package(location_id,parent_id,tailoring_type_id,prices_json,fabric_ids,created_by) 
                                    VALUES (?,?,?,?,?,?)`;
                                    await con.promise().query(sqlAddVariation, [shopId, prods.insertId, fdata.isTailoring, JSON.stringify(_prices), _fabs, repo.data.id])
                                        .then((rows: any, fields: any) => {
                                            console.log('inserted package tailoring ', rows);
                                        })
                                        .catch((err: QueryError) => {
                                            console.log("err ", err);
                                        })
                                }
                                res.setHeader('Content-Type', 'application/json');
                                res.status(200).json({ success: true, msg: 'products inserted' });
                                res.end();
                                con.end();
                                return;

                            });
                    } else if (subType == 'addItemsToLocation') {
                        var con = doConnect();
                        await con.promise().query(`insert into products (name,subproductname,type,is_tailoring,location_id,image,tax,never_tax,sku,barcode_type, unit_id, brand_id,category_id,alert_quantity,created_by,cost_price,sell_price,is_service,is_fabric,sell_over_stock,is_selling_multi_price,is_fifo,qty_over_sold)
                                select name,subproductname,type,is_tailoring,?,image,tax,never_tax,sku,barcode_type, unit_id, brand_id,category_id,0,created_by,cost_price,sell_price,is_service,is_fabric,sell_over_stock,is_selling_multi_price,is_fifo,qty_over_sold
                                from products
                                where id IN (?)
                                `, [req.body.data.newShopId, req.body.data.items])
                            .then()
                            .catch()
                        res.setHeader('Content-Type', 'application/json');
                        res.json({
                            success: true, msg: 'done!',
                            data: {
                            }
                        });
                        res.end();
                        // con.end()
                        return; 
                    } else if (subType == 'importFromFile') {
                        var con = doConnect();
                        for (let index = 0; index < req.body.data.length; index++) {
                            const element = req.body.data[index];
                            let category_id;
                            await con.promise().query(`SELECT id FROM categories WHERE name = ? `, [element.category])
                                .then((data) => category_id = data[0][0].id)
                                .catch()
                            await con.promise().query(`insert into products (name,type,location_id,sku,category_id,sell_price)
                                VALUES (?,?,?,?,?,?)
                                `, [element.name,element.type,element.location_id,element.sku,category_id,element.sell])
                            .then()
                            .catch()
                        }
                        res.setHeader('Content-Type', 'application/json');
                        res.json({
                            success: true, msg: 'done!',
                            data: {
                            }
                        });
                        res.end();
                        // con.end()
                        return; 
                    }
                } else
                    redirection(403, con, res, 'you have not permissions')
            } else
                redirection(401, con, res, 'login first!')
        })

    } catch (eer) {
        console.log('error happen...');
        console.log(eer);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ success: false, msg: 'error2' });
        res.end();
        return;
    }
}
