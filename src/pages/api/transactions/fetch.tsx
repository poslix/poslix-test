// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Data, ITokenVerfy } from '../../../models/common-model';
import { QueryError } from 'mysql2';
var { doConnect, doConnectMulti } = require('../../../libs/myConnection');
import { locationPermission, redirection, verifayTokens } from '../checkUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { shopId, subType, purchaseId } = req.body;
        if (locationPermission(repo.data.locs, shopId) != -1) {
          if (subType == 'getAll') {
            var con = doConnect();
            con.query(
              `SELECT transactions.created_at,transactions.id,CONCAT(' ',contacts.first_name,contacts.last_name) AS 'supplier',transactions.total_price,transactions.ref_no,status,payment_status
                        FROM transactions
                            INNER JOIN contacts ON contacts.id = transactions.contact_id
                                WHERE transactions.type = 'purchase' and transactions.location_id = ? ORDER BY id DESC;`,
              [shopId],
              function (err: QueryError, data: any) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'error1' + err, newdata: [] });
                  res.end();
                  con.end();
                  return;
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: true, msg: 'its done', newdata: data });
                  res.end();
                  con.end();
                  return;
                }
              }
            );
          } else if (subType == 'initCheckList') {
            var con = doConnect();
            con.query(
              `SELECT
                                    tl.id,
                                    p.name,
                                    CONCAT_WS(' ', p.name, pv.name) AS 'name',
                                    tl.transaction_id,
                                    tl.cost,
                                    tl.price,
                                    tl.qty,
                                    tl.product_id,
                                    tl.variation_id,
                                    COALESCE(SUM(s.qty_received),0) AS qty_received,
                                    COALESCE((tl.qty - COALESCE(SUM(s.qty_received),0)),0) AS qty_left,
                                    0 AS 'qty_entered'
                                FROM transactions_lines tl
                                LEFT JOIN stock s ON s.transaction_lines_id = tl.id
                                LEFT JOIN products p ON p.id = tl.product_id
                                LEFT JOIN product_variations pv ON pv.id = tl.variation_id
                                WHERE tl.transaction_id = ?
                                GROUP BY tl.id, tl.product_id, tl.variation_id;`,
              [purchaseId],
              function (err: QueryError, data: any) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'error1' + err, newdata: [] });
                  res.end();
                  con.end();
                  return;
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: true, msg: 'its done', newdata: data });
                  res.end();
                  con.end();
                  return;
                }
              }
            );
          } else if (subType == 'initPurchase') {
            var con = doConnectMulti();
            const { id } = req.body;
            con.query(
              `SELECT id as 'value',name as 'label',type,id as product_id,name,sku,sell_price,cost_price,qty_over_sold AS 'qty_sold'
                            FROM products 
                                WHERE type NOT IN ('package','tailoring_package') AND products.is_service = 0 and location_id = ? ORDER BY id DESC;`,
              [shopId],
              function (err: QueryError, products: any) {
                con.query(
                  `SELECT id AS 'value', CONCAT(first_name,' ',last_name) AS 'label'
                                    FROM contacts
                                        WHERE  contacts.location_id = ? AND contacts.type = 'supplier' ORDER BY id DESC;`,
                  [shopId],
                  function (err: QueryError, suppliers: any) {
                    con.query(
                      `SELECT id AS 'value', name AS 'label'
                                        FROM expenses
                                            WHERE  location_id = ? ORDER BY id DESC;SELECT id AS 'value',concat(country,' (',code,')') AS 'label',exchange_rate,symbol,code  FROM currencies`,
                      [shopId],
                      async function (err: QueryError, exp_currency: any) {
                        var allVariations: any = [];
                        await con
                          .promise()
                          .query(
                            `SELECT 
                                        product_variations.id AS 'variation_id',
                                        product_variations.parent_id AS 'product_id',
                                        product_variations.name,
                                        product_variations.sell_over_stock,
                                        product_variations.price AS 'variation_price',
                                        product_variations.cost AS 'variation_cost'
                                            FROM product_variations
                                                WHERE product_variations.location_id = ?`,
                            [shopId]
                          )
                          .then((rows: any, fields: any) => {
                            if (rows[0].length > 0) allVariations = rows[0];
                          })
                          .catch((err: QueryError) => {});

                        ///get purchase for edit
                        var purchase: any = [],
                          selected_expnses: any = [],
                          selected_payment: any = [],
                          selected_lines: any = [];
                        if (id > 0) {
                          //get invoice detials
                          await con
                            .promise()
                            .query(
                              `SELECT * FROM transactions WHERE location_id = ? and id = ? LIMIT 1`,
                              [shopId, id]
                            )
                            .then((rows: any, fields: any) => {
                              if (rows[0].length > 0) purchase = rows[0];
                            })
                            .catch((err: QueryError) => {});
                          //get expnses
                          await con
                            .promise()
                            .query(
                              `SELECT 
                                            expenses_values.id,expenses_values.expense_id,expenses_values.value,expenses_values.entered_value AS enterd_value,expenses.name AS 'label',expenses_values.currency_id,expenses_values.currency_rate
                                                FROM expenses_values 
                                                    INNER JOIN expenses ON expenses.id = expenses_values.expense_id
                                                WHERE expenses.location_id = ? and expenses_values.transaction_id = ?`,
                              [shopId, id]
                            )
                            .then((rows: any, fields: any) => {
                              if (rows[0].length > 0) selected_expnses = rows[0];
                            })
                            .catch((err: QueryError) => {});
                          //get payment
                          await con
                            .promise()
                            .query(
                              `SELECT * FROM transaction_payments WHERE transaction_id = ?  ORDER BY id ASC LIMIT 1 `,
                              [id]
                            )
                            .then((rows: any, fields: any) => {
                              if (rows[0].length > 0) selected_payment = rows[0];
                            })
                            .catch((err: QueryError) => {});
                          //get lines
                          await con
                            .promise()
                            .query(
                              `SELECT 
                                            tl.id AS trans_id,tl.product_id as id,tl.product_id,tl.variation_id,tl.qty AS quantity,tl.price,tl.cost,tl.cost_type,CONCAT_WS(' ',p.name,pv.name) as 'name',(tl.price*tl.qty) AS lineTotal
                                                 FROM transactions_lines tl
                                                     left JOIN products p ON p.id = tl.product_id
                                                     left JOIN product_variations pv ON pv.id = tl.variation_id
                                                    WHERE tl.transaction_id = ?`,
                              [id]
                            )
                            .then((rows: any, fields: any) => {
                              if (rows[0].length > 0) selected_lines = rows[0];
                            })
                            .catch((err: QueryError) => {});
                        }

                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).json({
                          success: true,
                          msg: 'its done',
                          newdata: {
                            products,
                            allVariations,
                            suppliers,
                            expenses: exp_currency[0],
                            currencies: exp_currency[1],
                            purchase,
                            selected_expnses,
                            selected_payment,
                            selected_lines,
                          },
                        });
                        res.end();
                        con.end();
                        return;
                      }
                    );
                  }
                );
              }
            );
          } else if (subType == 'getPurchasePayments') {
            var con = doConnect();
            con.query(
              `SELECT * FROM transaction_payments WHERE transaction_id = ?`,
              [purchaseId],
              function (err: QueryError, data: any) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'error1' + err, newdata: [] });
                  res.end();
                  con.end();
                  return;
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: true, msg: 'its done', newdata: data });
                  res.end();
                  con.end();
                  return;
                }
              }
            );
          } else if (subType == 'getSales') {
            var con = doConnect();
            let invoiceDetails: any = [];
            await con
              .promise()
              .query(
                `SELECT invoice_details FROM business_locations WHERE business_locations.id = ? AND owner_id = ?`,
                [shopId, Number(repo.data.oid!) > 0 ? repo.data.oid! : repo.data.id]
              )
              .then((rows: any, fields: any) => {
                if (rows[0].length > 0) invoiceDetails = rows[0][0].invoice_details;
              })
              .catch((err: QueryError) => {});

            con.query(
              `SELECT transactions.id ,
                        transactions.created_at ,
                        transactions.payment_status ,
                        transaction_payments.amount,
                        transactions.total_price,
                        transactions.tax_amount,
                        transactions.discount_amount,
                        transactions.discount_type,
                        transactions.notes,
                        DATE_FORMAT(transactions.created_at, "%Y/%m/%d") as sale_date,
                        CONCAT_WS(' ',contacts.first_name,contacts.last_name) as customer_name,
                        contacts.mobile,
                        CONCAT(COALESCE(users.first_name, ''),' ',COALESCE(users.last_name,'')) as added_by,
                        transactions.invoice_no FROM transactions
                        LEFT JOIN transaction_payments
                        ON transactions.id = transaction_payments.transaction_id
                        LEFT JOIN contacts
                        ON transactions.contact_id = contacts.id
                        LEFT JOIN users
                        ON transactions.created_by = users.id
                        WHERE transactions.location_id = ? AND transactions.type = 'sell' ORDER BY id DESC LIMIT 500 ;`,
              [shopId],
              function (err: QueryError, data: any) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({
                    success: false,
                    msg: 'error1' + err,
                    newdata: [],
                  });
                  res.end();
                  con.end();
                  return;
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({
                    success: true,
                    msg: 'its done',
                    newdata: { data, invoiceDetails },
                  });
                  res.end();
                  con.end();
                  return;
                }
              }
            );
          } else if (subType == 'getSaleItems') {
            var con = doConnect();
            const { id } = req.body;
            con.query(
              `SELECT tl.id,tl.product_id,tl.tax_amount,tl.variation_id,CONCAT_WS(' ',s.name,pv.name) AS 'name',ts.notes,s.type,s.is_service,tl.stock_id,tl.qty,tl.cost,tl.price,ts.contact_id,ts.total_price,CONCAT_WS(' ',cont.first_name,cont.last_name) AS 'contact_name',s.is_fabric,tl.tailoring_txt,tl.note,s.is_tailoring,tl.tailoring_custom,COALESCE(tl.tailoring_link_num,0) as tailoring_link_num
                        FROM transactions_lines tl
                            left JOIN products s ON s.id = tl.product_id
                            left JOIN product_variations pv ON (pv.id = tl.variation_id AND pv.parent_id = tl.product_id)
                            left JOIN transactions ts ON ts.id = tl.transaction_id
                            left JOIN contacts cont ON cont.id = ts.contact_id
                                WHERE tl.transaction_id = ?`,
              [id],
              function (err: QueryError, data: any) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'error', newdata: [] });
                  res.end();
                  con.end();
                  return;
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: true, msg: 'its done', newdata: data });
                  res.end();
                  con.end();
                  return;
                }
              }
            );
          } else if (subType == 'getclose') {
            var con = doConnect();

            let sdate = new Date();
            let edate = new Date().toISOString();
            await con
              .promise()
              .query(
                `SELECT id, status, created_at FROM cash_registers WHERE location_id = ? ORDER BY id DESC LIMIT 1`,
                [shopId]
              )
              .then((rows: any, fields: any) => {
                if (rows[0].length > 0) {
                  sdate = rows[0][0].created_at;
                }
              })
              .catch((err: QueryError) => {});

            // 2023-06-01T22:03:18.000Z  2023-06-01T22:03:18.000Z
            // console.log('start sdate', sdate);

            let fda = sdate.toISOString().split('T');
            const fda2 = fda[0] + ' ' + fda[1].substring(0, 8);

            let ed1 = edate.split('T');
            const ed2 = ed1[0] + ' ' + ed1[1].substring(0, 8);

            con.query(
              `SELECT SUM(ts.total_price) AS price,tp.payment_type,max(ts.id)
                        FROM transactions ts
                        INNER JOIN transaction_payments tp ON ts.id = tp.transaction_id
                           WHERE ts.location_id = ? AND ts.type = "sell"
                           AND ts.created_at > ? AND ts.created_at < ?
                                                    GROUP BY tp.payment_type`,
              [shopId, fda2, ed2],
              function (err: QueryError, data: any) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'error', newdata: [] });
                  res.end();
                  con.end();
                  return;
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: true, msg: 'its done', newdata: data });
                  res.end();
                  con.end();
                  return;
                }
              }
            );
          }
        } else redirection(403, con, res, 'you have not permissions');
      } else redirection(401, con, res, 'login first!');
    });
  } catch (err) {
    return;
  }
}
