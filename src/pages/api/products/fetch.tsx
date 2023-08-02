// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Data, ITokenVerfy } from "../../../models/common-model"
import { QueryError } from 'mysql2';
var { doConnect } = require('../../../libs/myConnection');
import { locationPermission, redirection, verifayTokens } from '../checkUtils'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {

    try {

        verifayTokens(req, async (repo: ITokenVerfy) => {
            if (repo.status === true) {
                const { shopId, subType } = req.body;

                if (locationPermission(repo.data.locs, shopId) != -1) {
                    if (subType == 'getProducts') {
                        var con = doConnect();
                        con.query(`SELECT
                        products.id,
                        products.type,
                        products.name,
                        products.image,
                        products.sku,
                        products.alert_quantity,
                        products.sell_price,
                        products.qty_over_sold,
                        categories.name AS 'category',
                        COALESCE(SUM(stock.qty_received - stock.qty_sold), 0) AS 'qty',
                        MIN(product_variations.price) AS 'min_price',
                        MAX(product_variations.price) AS 'max_price'
                    FROM products
                    LEFT JOIN categories ON categories.id = products.category_id
                    LEFT JOIN business_locations ON business_locations.id = products.location_id
                    LEFT JOIN stock ON stock.product_id = products.id
                    LEFT JOIN product_variations ON product_variations.parent_id = products.id
                    WHERE products.location_id = ? 
                        AND business_locations.owner_id = ? 
                        AND products.is_disabled = 0
                    GROUP BY products.id
                    ORDER BY products.id DESC;`, [shopId, Number(repo.data.oid!) > 0 ? repo.data.oid! : repo.data.id],
                            function (err: QueryError, products: any) {
                                if (err) {
                                    redirection(401, con, res, 'error fetching...' + err.message)
                                } else {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: true, msg: 'its done', data: { products } });
                                    res.end();
                                    con.end();
                                    return;
                                }

                            });
                    }
                    else if (subType == 'getPrices') {
                        var con = doConnect();
                        let pricesList: any = [];
                        const { productId, type } = req.body;
                        const sqlForRegularPrices = `SELECT 
                        stock.id AS 'stock_id',
                        COALESCE(stock.qty_received,0) - COALESCE(stock.qty_sold,0) AS qty_left,
                          COALESCE(stock.qty_sold,0) AS qty_sold,
                         transactions_lines.cost,
                         transactions_lines.price,
                         Date(stock.created_at) AS 'created_at'
                        FROM products
                            LEFT JOIN stock ON (stock.product_id = products.id AND stock.variation_id = 0)
                            LEFT JOIN transactions_lines ON transactions_lines.id = stock.transaction_lines_id
                                WHERE products.location_id = ? and products.id = ? AND (COALESCE(stock.qty_received,0) > COALESCE(stock.qty_sold,0)) ORDER BY products.id`
                        const sqlForVariation = `SELECT 
                        s.id AS stock_id,pv.name,
                        tl.cost,
                        tl.price,
                          s.qty_sold,s.qty_received - s.qty_sold AS qty_left,
                        s.created_at
                          FROM product_variations pv
                          INNER JOIN stock s ON s.variation_id = pv.id
                          INNER JOIN transactions_lines tl ON tl.id = s.transaction_lines_id
                          WHERE pv.location_id = ? AND (s.qty_received > s.qty_sold) AND pv.parent_id = ?`;

                        await con.promise()
                            .query(type != 'variable' ? sqlForRegularPrices : sqlForVariation,
                                [shopId, productId])
                            .then((rows: any, fields: any) => {
                                pricesList = rows[0]
                            })
                            .catch((err: QueryError) => { })



                        //sen headers
                        res.setHeader('Content-Type', 'application/json');
                        res.json({
                            success: true, msg: 'done!',
                            data: {
                                pricesList
                            }
                        });
                        res.end();
                        con.end()
                        return;
                    }
                    else if (subType == 'initProductData') {
                        var con = doConnect();
                        const { id } = req.body;
                        let units: any = [], brands: any = [], tailorings: any = [], categories: any = [], taxes: any = [], pro: any, products: any = [], packageItems: any = [], variations: any = [], allFabrics: any = [], selectedFabrics: any = [];
                        //get units
                        await con.promise()
                            .query(`SELECT id as 'value',CONCAT(NAME," (",unit,")") as 'label' FROM units`,
                                [shopId])
                            .then((rows: any, fields: any) => {
                                units = rows[0]
                            })
                            .catch((err: QueryError) => { })

                        //get tailoring types
                        await con.promise()
                            .query(`SELECT id as 'value',name as 'label' FROM tailoring_type WHERE location_id = ?`,
                                [shopId])
                            .then((rows: any, fields: any) => {
                                tailorings = rows[0]
                            })
                            .catch((err: QueryError) => { })

                        //get products for package
                        await con.promise()
                            .query(`SELECT id as 'value',name as 'label',type,id as product_id,name,sku,sell_price AS price,cost_price as cost,qty_over_sold AS 'qty_sold'
                                FROM products 
                                    WHERE type NOT IN ('package','tailoring_package') AND products.is_service = 0 and location_id = ? ORDER BY id DESC;`,
                                [shopId])
                            .then((rows: any, fields: any) => {
                                products = rows[0]
                            })
                            .catch((err: QueryError) => { })

                        //brands
                        await con.promise()
                            .query(`SELECT id as 'value',name as 'label' FROM brands WHERE brands.location_id = ?;`,
                                [shopId])
                            .then((rows: any, fields: any) => {
                                brands = rows[0]
                            })
                            .catch((err: QueryError) => { })

                        //categories
                        await con.promise()
                            .query(`SELECT id as 'value',name as 'label' FROM categories WHERE categories.location_id = ? ORDER BY id desc`,
                                [shopId])
                            .then((rows: any, fields: any) => {
                                categories = rows[0]
                            })
                            .catch((err: QueryError) => { })

                        //taxes
                        await con.promise()
                            .query(`SELECT id AS 'value', name AS 'label',amount
                            FROM tax_rates
                                WHERE  location_id = ? AND tax_type = 'group' ORDER BY id DESC;`,
                                [shopId])
                            .then((rows: any, fields: any) => {
                                taxes = rows[0]
                            })
                            .catch((err: QueryError) => { })

                        //get fabrics
                        await con.promise()
                            .query(`SELECT id AS 'value', name AS 'label'
                            FROM products
                                WHERE  location_id = ? AND is_fabric = 1 ORDER BY id DESC;`,
                                [shopId])
                            .then((rows: any, fields: any) => {
                                allFabrics = rows[0]
                            })
                            .catch((err: QueryError) => { })


                        //get product (For Edit)
                        await con.promise()
                            .query(`SELECT products.*,tailoring_package.tailoring_type_id,tailoring_package.prices_json,tailoring_package.fabric_ids
                                    FROM products 
                                    left JOIN tailoring_package ON tailoring_package.parent_id = products.id
                                        WHERE products.location_id = ? and products.id = ? ORDER BY id desc`,
                                [shopId, id])
                            .then((rows: any, fields: any) => {
                                pro = rows[0]
                            })
                            .catch((err: QueryError) => { })

                        //if for edit only
                        if (pro.length > 0) {
                            await con.promise()
                                .query(`select package_items.product_id,package_items.product_id as id,package_items.id AS pack_id,package_items.price,products.name,1 AS quantity,false as 'isNew'
                                FROM package_items 
                                    inner join products on products.id = package_items.product_id
                                        WHERE package_items.location_id = ? AND package_items.parent_id = ?`,
                                    [shopId, id])
                                .then((rows: any, fields: any) => {
                                    packageItems = rows[0]
                                })
                                .catch((err: QueryError) => { })

                            await con.promise().query(`SELECT * FROM product_variations WHERE location_id = ? AND parent_id = ? and is_active = 1`,
                                [shopId, id])
                                .then((rows: any, fields: any) => {
                                    variations = rows[0]
                                })
                                .catch((err: QueryError) => { })

                            await con.promise().query(`SELECT id as product_id,id,name,false as 'isNew'
                                    FROM products
                                    WHERE FIND_IN_SET(id,(SELECT fabric_ids FROM tailoring_package WHERE parent_id = ?)) > 0`,
                                [id])
                                .then((rows: any, fields: any) => {
                                    selectedFabrics = rows[0]
                                })
                                .catch((err: QueryError) => { })
                        }

                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).json({
                            success: true, msg: 'its done1', newdata: { units, tailorings, brands, categories, pro, taxes, products, packageItems, variations, allFabrics, selectedFabrics }
                        });
                        res.end();
                        con.end();
                        return;

                    }
                    else if (subType == 'initBarcodePage') {
                        var con = doConnect();
                        let products: any = [], variations: any = [];
                        //get products for package
                        await con.promise()
                            .query(`SELECT s.id as 'value',s.name as 'label',s.type,s.id as product_id,s.name,s.sku,s.sell_price AS price,s.cost_price as cost,categories.name AS 'category'
                            FROM products s
                           LEFT JOIN categories ON categories.id =s.category_id 
                                WHERE type NOT IN ('package','tailoring_package') AND s.is_service = 0 and s.location_id = ? ORDER BY s.id DESC;`,
                                [shopId])
                            .then((rows: any, fields: any) => {
                                products = rows[0]
                            })
                            .catch((err: QueryError) => { })

                        await con.promise().query(`SELECT 
                            pv.sku,pv.id AS variation_id,pv.parent_id AS product_id,s.id AS stock_id,pv.name,pv.sell_over_stock,pv.cost as variation_cost,tl.cost,tl.price,p.is_fabric,
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
                                SELECT pv.sku,pv.id AS variation_id,pv.parent_id,s.id AS stock_id, pv.name,pv.sell_over_stock, pv.cost as variation_cost,p.is_fabric,NULL AS cost,
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
                                UNION ALL
                                SELECT pv.sku,pv.id AS variation_id,pv.parent_id,min(s.id) AS stock_id, pv.name,pv.sell_over_stock, pv.cost as variation_cost,p.is_fabric,NULL AS cost,
                                0 AS price ,
                                pv.price AS variation_price, max(s.qty_received), max(s.qty_sold),max(COALESCE(s.qty_received,0)) - max(COALESCE(s.qty_sold,0)) AS qty,0 AS "image",pv.is_selling_multi_price,pv.is_service,
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
                                ORDER BY variation_id,stock_id DESC`,
                            [shopId, shopId, shopId])
                            .then((rows: any, fields: any) => {
                                variations = rows[0]
                            })
                            .catch((err: QueryError) => { })

                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).json({
                            success: true, msg: 'its done1', data: { products, variations }
                        });
                        res.end();
                        con.end();
                        return;

                    }
                } else
                    redirection(403, con, res, 'you have not permissions')
            } else
                redirection(401, con, res, 'login first!')
        });

    } catch (err) {
        res.setHeader('Content-Type', 'application/json');
        console.log("errorr inja ", err);
        res.status(200).json({ success: false, msg: 'error2', newdata: [] });
        res.end();
        return;
    }
}
