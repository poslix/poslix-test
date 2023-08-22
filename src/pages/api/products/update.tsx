import type { NextApiRequest, NextApiResponse } from 'next';
import { Data, ITokenVerfy } from '../../../models/common-model';
import { QueryError, RowDataPacket } from 'mysql2';
var { doConnect } = require('../../../libs/myConnection');
import { areNumbers, locationPermission, redirection, verifayTokens } from '../checkUtils';
import { incorrectInput } from '../utils/data';
import { join } from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { shopId, subType } = req.body;
        if (!areNumbers([shopId])) {
          redirection(403, null, res, incorrectInput);
          return;
        }
        if (locationPermission(repo.data.locs, shopId) != -1) {
          if (subType == 'editProduct') {
            const { data, img, selectedProducts, selectedFabrics } = req.body;

            let _hasSku = false;
            var con = doConnect();
            await con
              .promise()
              .query(`SELECT sku FROM products WHERE sku=? AND location_id= ? LIMIT 1`, [
                data.sku,
                shopId,
              ])
              .then((rows: any, fields: any) => {
                if (rows[0].length > 0) _hasSku = true;
              })
              .catch();

            // if (_hasSku) {
            //     redirection(403, con, res, 'The ' + data.sku + ' Already Exist,Use Another One', 100);
            //     return;
            // }

            if (data.type == 'package') {
              const sqlAddPackageItems =
                'INSERT into `package_items` (location_id,parent_id,product_id,price,created_by) VALUES ? ';
              const ValueAddPackageItems: any = [];

              if (selectedProducts.length > 1) {
                selectedProducts.map((sp: any, idx: number) => {
                  if (sp.isNew)
                    ValueAddPackageItems.push([
                      shopId,
                      data.id,
                      sp.product_id,
                      sp.price,
                      repo.data.id,
                    ]);
                });
                if (ValueAddPackageItems.length > 0) {
                  await con
                    .promise()
                    .query(sqlAddPackageItems, [ValueAddPackageItems])
                    .then((rows: any, fields: any) => {})
                    .catch();
                }
                for (let idx = 0; idx < selectedProducts.length; idx++) {
                  if (selectedProducts[idx].isNew == 0 && selectedProducts[idx].price > 0) {
                    await con
                      .promise()
                      .query('UPDATE package_items SET price = ? WHERE id = ?', [
                        parseFloat(selectedProducts[idx].price),
                        parseInt(selectedProducts[idx].pack_id),
                      ])
                      .then((rows: any, fields: any) => {})
                      .catch();
                  }
                }
              }
            } else if (data.type == 'variable') {
              const sqlAddVariation =
                'INSERT into `product_variations` (location_id,parent_id,name,name2,sku,cost,price,sell_over_stock,is_selling_multi_price,is_service,created_by) VALUES ? ';
              const valueAddVariation: any = [];

              if (data.variations.length > 1) {
                data.variations.map((sp: any, idx: number) => {
                  if (sp.isNew && sp.name.length > 0)
                    valueAddVariation.push([
                      shopId,
                      data.id,
                      sp.name,
                      sp.name2,
                      sp.sku,
                      sp.cost,
                      sp.price,
                      data.isSellOverStock,
                      data.isMultiPrice,
                      data.isService,
                      repo.data.id,
                    ]);
                });
                //insert
                if (valueAddVariation.length > 0) {
                  await con
                    .promise()
                    .query(sqlAddVariation, [valueAddVariation])
                    .then((rows: any, fields: any) => {})
                    .catch();
                }
                //update
                for (let idx = 0; idx < data.variations.length; idx++) {
                  if (!data.variations[idx].isNew && data.variations[idx].price > 0) {
                    await con
                      .promise()
                      .query(
                        'UPDATE product_variations SET name = ?, name2 = ?,sku = ?,cost = ?,price = ?,sell_over_stock = ?,is_service = ? WHERE id = ?',
                        [
                          data.variations[idx].name,
                          data.variations[idx].name2,
                          data.variations[idx].sku,
                          data.variations[idx].cost,
                          data.variations[idx].price,
                          data.isSellOverStock,
                          data.isService,
                          data.variations[idx].id,
                        ]
                      )
                      .then((rows: any, fields: any) => {})
                      .catch();
                  }
                }
              }
            } else if (data.type == 'tailoring_package') {
              let _prices: any = [];
              data.tailoringPrices.map((d: any) => {
                if (d.from >= 0 && d.to > 0) _prices.push(d);
              });
              let _fabs = '';
              selectedFabrics.map((d: any) => (_fabs += d.product_id + ','));
              if (_prices.length == 0) {
                redirection(403, con, res, 'price is incomplete!!!');
                return;
              }
              if (_fabs.length == 0) {
                redirection(403, con, res, 'you have to select fabric(s)');
                return;
              }
              const sqlAddVariation =
                'UPDATE `tailoring_package` set tailoring_type_id = ?,prices_json = ?,fabric_ids = ? where location_id = ? and parent_id = ?';
              await con
                .promise()
                .query(sqlAddVariation, [
                  data.isTailoring,
                  JSON.stringify(_prices),
                  _fabs,
                  shopId,
                  data.id,
                ])
                .then((rows: any, fields: any) => {})
                .catch((err: QueryError) => {});

              data.isTailoring = 0;
            }

            let isNever = 0;
            if (data.tax_id == -1) {
              isNever = 1;
              data.tax_id = null;
            }
            con.query(
              `UPDATE products SET 
                            name = ?,subproductname = ?,type = ?,image = ?,tax = ?,never_tax = ?,sku = ?,barcode_type = ?, unit_id = ?, brand_id = ?,category_id = ?,alert_quantity = ?,sell_price = ?,cost_price = ?,
                            is_service = ?,is_fabric = ?,sell_over_stock = ?,is_selling_multi_price =?,is_fifo=?,is_tailoring=?
                            WHERE id=?`,
              [
                data.productName,
                data.productName2,
                data.type,
                img,
                data.tax_id,
                isNever,
                data.sku,
                data.barcodeType,
                data.unit,
                data.brand,
                data.cat,
                data.alertQuantity,
                data.price,
                data.cost,
                data.isService,
                data.isFabric,
                data.isSellOverStock,
                data.isMultiPrice,
                data.isFifo,
                data.isTailoring,
                data.id,
              ],
              function (err: QueryError, prods: RowDataPacket[]) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'error' + err, newdata: [] });
                  res.end();
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  const newOne = { id: data.id, firstName: data.firstName, mobile: data.mobile };
                  res
                    .status(200)
                    .json({ success: true, msg: 'customer info edited', newdata: newOne });
                  res.end();
                  return;
                }
              }
            );
          } else if (subType == 'getPrices') {
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
                                WHERE products.location_id = ? and products.id = ? AND (COALESCE(stock.qty_received,0) > COALESCE(stock.qty_sold,0)) ORDER BY products.id`;
            const sqlForVariation = `SELECT 
                        s.id AS stock_id,pv.name,
                        if(s.id is not NULL,tl.cost,pv.cost) AS cost,
                        if(s.id is not NULL,tl.price,pv.price) AS price,
                          s.qty_sold,COALESCE(s.qty_received,0) - COALESCE(s.qty_sold,0) AS qty_left,pv.is_service,s.qty_sold,
                        s.created_at
                          FROM product_variations pv
                          LEFT JOIN stock s ON s.variation_id = pv.id
                          LEFT JOIN transactions_lines tl ON tl.id = s.transaction_lines_id
                          WHERE pv.location_id = ? AND (s.qty_received > s.qty_sold OR s.id IS NULL)`;

            await con
              .promise()
              .query(type != 'variable' ? sqlForRegularPrices : sqlForVariation, [
                shopId,
                productId,
              ])
              .then((rows: any, fields: any) => {
                pricesList = rows[0];
              })
              .catch((err: QueryError) => {});

            //sen headers
            res.setHeader('Content-Type', 'application/json');
            res.json({
              success: true,
              msg: 'done!',
              data: {
                pricesList,
              },
            });
            res.end();
            con.end();
            return;
          }
        } else redirection(403, con, res, 'you have not permissions');
      } else redirection(401, con, res, 'login first!');
    });
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');

    res.status(200).json({ success: false, msg: 'error2', newdata: [] });
    res.end();
  }

  /*
    
    */
}
