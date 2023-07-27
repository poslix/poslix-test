// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Data, ITax, ITokenVerfy } from "../../../models/common-model"
import { QueryError, RowDataPacket } from 'mysql2';
var { doConnectMulti } = require('../../../libs/myConnection');
import { keyValueTailoringSrizes, locationPermission, makePerProuctArrayOfPrice, makePerVarationArrayOfPrice, redirection, verifayTokens } from '../checkUtils'
import { groupCalculation } from 'src/libs/calculationTax';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {

    try {
        verifayTokens(req, (repo: ITokenVerfy) => {
            if (repo.status === true) {
                const { shopId, subType } = req.body;

                if (locationPermission(repo.data.locs, shopId) != -1) {
                    var con = doConnectMulti();

                    if (subType == 'getPosInit') {

                        const bId = shopId;
                        //get cash_registers
                        let sqlCondis = `SELECT categories.id,categories.name 
                                        FROM categories
                                            WHERE categories.location_id = ?;
                                        SELECT brands.id,brands.name 
                                        FROM brands
                                            WHERE brands.location_id = ?;
                                        SELECT contacts.id as 'value',CONCAT_WS(' | ',CONCAT_WS(' ',contacts.first_name,contacts.last_name),contacts.mobile) AS 'label',contacts.mobile
                                        FROM contacts
                                            WHERE contacts.location_id = ? AND contacts.type = 'customer' ORDER BY RAND();SELECT id,status,closing_amount FROM cash_registers WHERE location_id = ? ORDER BY id desc LIMIT 1`


                        con.query(sqlCondis, [[bId], [bId], [bId], [bId], [bId, bId]], function (err: QueryError, initDatas: any) {
                            if (err) throw err;

                            //get default group tax
                            con.query(`SELECT tax_rates.id,tax_rates.name,tax_rates.amount,tax_rates.tax_type as 'taxType', tax_rates.is_primary as'isPrimary',tax_rates.type AS 'amountType',p.parent_id as 'parentId' FROM tax_rates
                            INNER JOIN (SELECT tax_id,parent_id,location_id FROM tax_group where location_id = ?) AS p ON p.tax_id=tax_rates.id
                                WHERE p.location_id = ?`, [bId, bId], function (err: QueryError, initTaxes: any) {
                                if (err) throw err;

                                //products(single,package) has in stock
                                //products(single,package) is service
                                con.query(`SELECT 
                                s.id AS 'stock_id',
                                pro.id AS 'product_id',
                                pro.sell_over_stock,
                                pro.is_fifo,
                                pro.type,
                                pro.name,
                                pro.image,
                                pro.is_service,
                                pro.is_fabric,
                                pro.subproductname AS 'nameScond',
                                pro.sku,
                                pro.is_tailoring,
                                pro.alert_quantity,
                                pro.tax AS 'product_tax',
                                categories.tax_id AS 'category_tax',
                                brands.tax_id AS 'brand_tax',
                                IF(pro.tax > 0 or categories.tax_id > 0 or brands.tax_id > 0 ,false, TRUE) AS 'def_tax',
                                IF(pro.never_tax > 0 or categories.never_tax > 0 or brands.never_tax > 0 ,true, false) AS 'never_tax',
                                pro.category_id,
                                pro.brand_id,
                                pro.is_selling_multi_price,
                                pro.cost_price AS product_cost,
                                if(pro.is_service = 1 OR pro.type = 'package' OR s.id IS NULL,pro.cost_price,transactions_lines.cost) AS cost,
                                pro.sell_price AS product_price,
                                if(pro.is_service = 1 OR pro.type = 'package' OR s.id IS NULL,pro.sell_price,transactions_lines.price) AS price,
                                COALESCE(s.qty_received,0) - COALESCE(s.qty_sold,0) AS qty,
                                tp.prices_json,
                                tp.fabric_ids,
                                tp.tailoring_type_id,
                                tp.product_ids
                            
                                FROM products pro
                                    LEFT JOIN stock s ON (s.product_id = pro.id AND s.variation_id = 0)
                                    LEFT JOIN tailoring_package tp ON tp.parent_id = pro.id
                                    LEFT JOIN transactions_lines ON transactions_lines.id = s.transaction_lines_id
                                    LEFT JOIN categories ON categories.id = pro.category_id
                                    LEFT JOIN brands ON brands.id = pro.brand_id
                                        WHERE pro.location_id = ? AND pro.is_disabled = 0 AND (COALESCE(s.qty_received,0) > COALESCE(s.qty_sold,0) OR s.id IS NULL  OR  pro.is_service = 1)
                                        ORDER BY pro.id`, [bId], function (err: QueryError, rowProducts: any) {
                                    if (err) throw err;



                                    //products(single,package) get out of stocks only
                                    con.query(`SELECT 
                                    MAX(stock.id) AS 'stock_id',
                                    products.id AS 'product_id',
                                    products.sell_over_stock,
                                    products.is_fifo,
                                    products.type,
                                    products.name,
                                    products.image,
                                    products.is_service,
                                    products.is_fabric,
                                    products.subproductname AS 'nameScond',
                                    products.sku,
                                    products.is_tailoring,
                                    products.alert_quantity,
                                    products.tax AS 'product_tax',
                                    categories.tax_id AS 'category_tax',
                                    brands.tax_id AS 'brand_tax',
                                    IF(products.tax > 0 or categories.tax_id > 0 or brands.tax_id > 0 ,false, TRUE) AS 'def_tax',
                                    IF(products.never_tax > 0 or categories.never_tax > 0 or brands.never_tax > 0 ,true, false) AS 'never_tax',
                                    products.category_id,
                                    products.brand_id,
                                    products.is_selling_multi_price,
                                    products.cost_price AS product_cost,
                                    if(products.is_service = 1 OR products.type = 'package' OR MAX(stock.id) IS NULL,products.cost_price,MAX(transactions_lines.cost)) AS cost,
                                    products.sell_price AS product_price,
                                    if(products.is_service = 1,products.sell_price,MAX(transactions_lines.price)) AS price,
                                        COALESCE(MAX(stock.qty_received),0) - COALESCE(MAX(stock.qty_sold),0) AS qty
                                
                                    FROM products
                                        LEFT JOIN stock ON (stock.product_id = products.id AND stock.variation_id = 0)
                                        LEFT JOIN transactions_lines ON transactions_lines.id = stock.transaction_lines_id
                                        LEFT JOIN categories ON categories.id = products.category_id
                                        LEFT JOIN brands ON brands.id = products.brand_id
                                            WHERE products.location_id = ? AND products.is_disabled = 0 AND products.type IN ('single','package')
                                            
                                            AND  (COALESCE(stock.qty_received,0) - COALESCE(stock.qty_sold,0) = 0 AND stock.id IS NOT NULL)
                                            GROUP BY products.id
                                            ORDER BY products.id`, [bId], function (err: QueryError, outRowProducts: any) {
                                        if (err) throw err;

                                        //get all vars
                                        con.query(`SELECT 
                                        pv.id AS variation_id,pv.parent_id AS product_id,s.id AS stock_id,pv.name,pv.sell_over_stock,pv.cost as variation_cost,tl.cost,tl.price,p.is_fabric,
                                        pv.price AS variation_price,s.qty_received,s.qty_sold,COALESCE(s.qty_received,0) - COALESCE(s.qty_sold,0) AS qty,
                                          0 AS "image",pv.is_selling_multi_price,pv.is_service,
                                          p.tax AS 'product_tax',
                                          c.tax_id AS 'category_tax',
                                          b.tax_id AS 'brand_tax',
                                          IF(p.tax > 0 or c.tax_id > 0 or b.tax_id > 0 ,false, TRUE) AS 'def_tax',
                                          IF(p.never_tax > 0 or c.never_tax > 0 or b.never_tax > 0 ,true, false) AS 'never_tax'
                                           FROM product_variations pv
                                           LEFT JOIN stock s ON s.variation_id = pv.id
                                           LEFT JOIN transactions_lines tl ON tl.id = s.transaction_lines_id
                                           LEFT JOIN products p ON p.id = pv.parent_id
                                           LEFT JOIN categories c ON c.id = p.category_id
                                           LEFT JOIN brands b ON b.id = p.brand_id
                                           WHERE pv.is_active = 1 and pv.location_id = ? and s.qty_received > s.qty_sold
                                           UNION all
                                            SELECT pv.id AS variation_id,pv.parent_id,s.id AS stock_id, pv.name,pv.sell_over_stock, pv.cost as variation_cost,p.is_fabric,NULL AS cost,
                                            0 AS price ,
                                            pv.price AS variation_price, s.qty_received, s.qty_sold,COALESCE(s.qty_received,0) - COALESCE(s.qty_sold,0) AS qty,0 AS "image",pv.is_selling_multi_price,pv.is_service,
                                            p.tax AS 'product_tax',
                                            c.tax_id AS 'category_tax',
                                            b.tax_id AS 'brand_tax',
                                            IF(p.tax > 0 or c.tax_id > 0 or b.tax_id > 0 ,false, TRUE) AS 'def_tax',
                                            IF(p.never_tax > 0 or c.never_tax > 0 or b.never_tax > 0 ,true, false) AS 'never_tax'
                                            FROM product_variations pv
                                            LEFT JOIN stock s ON s.variation_id = pv.id
                                            LEFT JOIN products p ON p.id = pv.parent_id
                                            LEFT JOIN categories c ON c.id = p.category_id
                                            LEFT JOIN brands b ON b.id = p.brand_id
                                            WHERE pv.is_active = 1 and s.id IS NULL and pv.location_id = ?
                                            ORDER BY variation_id,stock_id DESC`, [bId, bId, bId], async function (err: QueryError, vars: any) {
                                            if (err) throw err;

                                            let noStockVars: any = [];
                                            //get tailoring sizes
                                            await con.promise()
                                                .query(`SELECT pv.id AS variation_id,pv.parent_id as product_id,min(s.id) AS stock_id, pv.name,pv.sell_over_stock, pv.cost as variation_cost,p.is_fabric,NULL AS cost,
                                                0 AS price ,
                                                pv.price AS variation_price, max(s.qty_received) as qty_received, max(s.qty_sold) as qty_sold,max(COALESCE(s.qty_received,0)) - max(COALESCE(s.qty_sold,0)) AS qty,0 AS "image",pv.is_selling_multi_price,pv.is_service,
                                                p.tax AS 'product_tax',
                                                c.tax_id AS 'category_tax',
                                                b.tax_id AS 'brand_tax',
                                                IF(p.tax > 0 or c.tax_id > 0 or b.tax_id > 0 ,false, TRUE) AS 'def_tax',
                                                IF(p.never_tax > 0 or c.never_tax > 0 or b.never_tax > 0 ,true, false) AS 'never_tax'
                                                FROM product_variations pv
                                                LEFT JOIN stock s ON s.variation_id = pv.id
                                                LEFT JOIN products p ON p.id = pv.parent_id
                                                LEFT JOIN categories c ON c.id = p.category_id
                                                LEFT JOIN brands b ON b.id = p.brand_id
                                                WHERE pv.is_active = 1 and (s.qty_sold >= s.qty_received) and pv.location_id = ?
                                                GROUP BY s.variation_id
                                                ORDER BY variation_id,stock_id DESC`, [shopId])
                                                .then((rows: any, fields: any) => {
                                                    if (rows[0].length > 0)
                                                        noStockVars = rows[0]
                                                })
                                                .catch((err: QueryError) => { })


                                            // console.log('noStockVars ', noStockVars);
                                            // console.log('vars ', vars);

                                            var idsVars = new Set(vars.map((d: any) => d.variation_id));
                                            // console.log('idsVars ', idsVars);
                                            var mergedVard = [...vars, ...noStockVars.filter((d: any) => !idsVars.has(d.variation_id))];


                                            var ids = new Set(rowProducts.map((d: any) => d.product_id));
                                            //console.log('ids', ids);

                                            var merged = [...rowProducts, ...outRowProducts.filter((d: any) => !ids.has(d.product_id))];

                                            var stockedProducts = makePerProuctArrayOfPrice(merged)
                                            var variations = makePerVarationArrayOfPrice(mergedVard)
                                            var readTaxGroup = groupCalculation(initTaxes)
                                            //console.log("single pro ", stockedProducts.products);
                                            //console.log("multi pro ", stockedProducts.products_multi);
                                            var packageItems: any = [], default_tax: any = [], sizes_: any = [], invoiceDetails: any = [], tailoring_extras: any = [];
                                            // console.log(readTaxGroup);

                                            //get package items
                                            await con.promise()
                                                .query(`SELECT parent_id,product_id,price
                                                            FROM package_items
                                                            WHERE location_id = ?`, [shopId])
                                                .then((rows: any, fields: any) => {
                                                    if (rows[0].length > 0)
                                                        packageItems = rows[0]
                                                })
                                                .catch((err: QueryError) => { })

                                            //get extra for tailoring types
                                            await con.promise()
                                                .query(`SELECT * FROM tailoring_extra WHERE location_id = ?`, [shopId])
                                                .then((rows: any, fields: any) => {
                                                    if (rows[0].length > 0)
                                                        tailoring_extras = rows[0]
                                                })
                                                .catch((err: QueryError) => { })



                                            //get all taxes
                                            await con.promise()
                                                .query(`SELECT id,name,amount,type AS 'amountType',tax_type as 'taxType',is_primary as 'isPrimary'
                                                FROM tax_rates 
                                                    WHERE id IN ((SELECT tax_id FROM tax_group 
                                                            WHERE parent_id = (SELECT id FROM tax_rates where location_id = ? AND is_primary = 1 AND tax_type ='group')));`, [shopId])
                                                .then((rows: any, fields: any) => {
                                                    if (rows[0].length > 0)
                                                        default_tax = rows[0]
                                                })
                                                .catch((err: QueryError) => { })

                                            //get tailoring sizes
                                            await con.promise()
                                                .query(`SELECT ts.*,tp.multiple_value,tp.extras
                                                    FROM tailoring_sizes ts
                                                    INNER JOIN tailoring_type tp ON tp.id = ts.tailoring_type_id
                                                        WHERE tp.location_id = ?`, [shopId])
                                                .then((rows: any, fields: any) => {
                                                    if (rows[0].length > 0)
                                                        sizes_ = rows[0]
                                                })
                                                .catch((err: QueryError) => { })
                                            //get invoice details
                                            await con.promise()
                                                .query(`SELECT invoice_details FROM business_locations WHERE business_locations.id = ? AND owner_id = ?`, [shopId, Number(repo.data.oid!) > 0 ? repo.data.oid! : repo.data.id])
                                                .then((rows: any, fields: any) => {
                                                    if (rows[0].length > 0)
                                                        invoiceDetails = rows[0][0].invoice_details;
                                                })
                                                .catch((err: QueryError) => { })

                                            var AllSizes = keyValueTailoringSrizes(sizes_)
                                            // console.log("default_tax", default_tax);
                                            // console.log('AllSizes', AllSizes);
                                            // console.log("variations ", variations.variations);
                                            // console.log("variations_multi ", variations.variations_multi);
                                            // console.log("invoiceDetails: ", invoiceDetails);

                                            //sen headers
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json({
                                                success: true, msg: 'done!', data: { stockedProducts, variations, packageItems, cats: initDatas[0], brands: initDatas[1], customers: initDatas[2], taxes: default_tax, tax_group: readTaxGroup, cash: initDatas[3], AllSizes, invoiceDetails, tailoring_extras }
                                            });
                                            res.end();
                                            con.end()
                                            return;
                                        });
                                        //

                                    });

                                });


                            });

                        });
                    }
                    if (subType == 'getLastOrders') {
                        const getAll = `SELECT transactions.id,CONCAT_WS(' ',contacts.first_name,contacts.last_name) AS 'name',contacts.id AS 'customer_id', contacts.mobile AS mobile, transactions.location_id,transactions.total_price,transactions.status,transactions.created_at,transactions.created_by 
                        FROM transactions 
                            left JOIN contacts ON transactions.contact_id = contacts.id
                            WHERE transactions.location_id = ? AND transactions.type = 'sell'
                                    ORDER BY created_at desc LIMIT 10`;

                        //get one
                        const getOne = `SELECT tl.id,tl.product_id,tl.tax_amount,tl.variation_id,CONCAT_WS(' ',s.name,pv.name) AS 'name',ts.notes,s.type,s.is_service,tl.stock_id,tl.qty,tl.cost,tl.price,ts.contact_id,ts.total_price,CONCAT_WS(' ',cont.first_name,cont.last_name) AS 'contact_name',s.is_fabric,tl.tailoring_txt,tl.note,s.is_tailoring,tl.tailoring_custom,COALESCE(tl.tailoring_link_num,0) as tailoring_link_num,tl.discount_type,tl.discount_amount
                        FROM transactions_lines tl
                            left JOIN products s ON s.id = tl.product_id
                            left JOIN product_variations pv ON (pv.id = tl.variation_id AND pv.parent_id = tl.product_id)
                            left JOIN transactions ts ON ts.id = tl.transaction_id
                            left JOIN contacts cont ON cont.id = ts.contact_id
                                WHERE tl.transaction_id = ?`;
                        con.query((req.body.barCodeId == -1 ? getAll : getOne), [req.body.barCodeId == -1 ? shopId : req.body.barCodeId], function (err: QueryError, prods: RowDataPacket[]) {
                            if (err) {
                                res.setHeader('Content-Type', 'application/json');
                                res.status(200).json({ success: false, msg: 'error', newdata: [] });
                                res.end();
                                con.end();
                                return;
                            } else {
                                res.setHeader('Content-Type', 'application/json');
                                res.status(200).json({ success: true, msg: 'orders from server', newdata: prods });
                                res.end();
                                con.end();
                                return;
                            }

                        });

                    }
                    if (subType == 'initTailoringUserSizes') {

                        const { typeId } = req.body;
                        con.query(`SELECT id,id as value,sizes ,name AS 'label' FROM tailoring_user_sizes WHERE location_id = ? AND tailoring_type_id = ?`,
                            [shopId, typeId], function (err: QueryError, userSizes: RowDataPacket[]) {
                                if (err) {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: false, msg: 'error', newdata: [] });
                                    res.end();
                                    con.end();
                                    return;
                                } else {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: true, msg: 'User Sizes', newdata: userSizes });
                                    res.end();
                                    con.end();
                                    return;
                                }
                            });
                    }
                    if (subType == "getAppearance") {
                        //get all details from invoice
                        con.query(`SELECT invoice_details FROM business_locations WHERE business_locations.id = ? AND owner_id = ?`, [shopId, Number(repo.data.oid!) > 0 ? repo.data.oid! : repo.data.id], function (err: QueryError, prods: RowDataPacket[]) {
                            if (err) {
                                res.setHeader('Content-Type', 'application/json');
                                res.status(200).json({ success: false, msg: 'error', newdata: [] });
                                res.end();
                                con.end();
                                return;
                            } else {
                                res.setHeader('Content-Type', 'application/json');
                                const details = prods.length == 1 ? prods[0].invoice_details : null;
                                res.status(200).json({ success: true, msg: 'invoice details Done!', data: { details } });
                                res.end();
                                con.end();
                                return;
                            }

                        });
                    }
                } else
                    redirection(403, con, res, 'you have not permissions')
            } else
                redirection(401, con, res, 'login first!')
        });

    } catch (err) {
        redirection(401, null, res, 'error catch' + err.message)
        return
    }
}
