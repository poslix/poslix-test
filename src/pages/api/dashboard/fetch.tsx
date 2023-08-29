// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Data, ITokenVerfy } from '../../../models/common-model';
import { QueryError } from 'mysql2';
var { doConnect, doConnectMulti } = require('../../../libs/myConnection');
import { locationPermission, redirection, verifayTokens } from '../checkUtils';
import moment from 'moment';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { shopId, subType } = req.body;

        if (locationPermission(repo.data.locs, shopId) != -1) {
          if (subType == 'initDash') {
            var con = doConnectMulti();
            let factors_lsit: any = [],
              productsOverSold: any = [],
              salse_list: any = [];
            //get top box sales
            let _sales: any = [];
            const profit_sales: any = [];
            await con
              .promise()
              .query(
                `SELECT sum(total_price) as total FROM transactions
                                WHERE location_id = ?  AND type = 'sell' AND DATE(created_at) = CURRENT_DATE();

                            SELECT sum(total_price) as total FROM transactions WHERE location_id = ?  AND type = 'sell'
                            AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1);                         

                            SELECT sum(total_price) as total FROM transactions
                            WHERE location_id = ?  AND type = 'sell' AND YEAR(created_at) = YEAR(CURRENT_DATE()) AND MONTH(created_at) = MONTH(CURRENT_DATE());

                            SELECT sum(total_price) as total FROM transactions
                            WHERE location_id = ?  AND type = 'sell' AND YEAR(created_at) = YEAR(CURRENT_DATE());`,
                [shopId, shopId, shopId, shopId]
              )
              .then((rows: any, fields: any) => {
                _sales = rows[0];
              })
              .catch((err: QueryError) => {});
            profit_sales.push(_sales[0][0].total == null ? 0 : _sales[0][0].total);
            profit_sales.push(_sales[1][0].total == null ? 0 : _sales[1][0].total);
            profit_sales.push(_sales[2][0].total == null ? 0 : _sales[2][0].total);
            profit_sales.push(_sales[3][0].total == null ? 0 : _sales[3][0].total);

            //get top box expnese
            let _expense: any = [];
            const profit_expense: any = [];
            await con
              .promise()
              .query(
                `SELECT sum(amount) as total FROM expenses_list 
                            WHERE location_id = ? AND DATE(created_at) = CURRENT_DATE();

                            SELECT sum(amount) as total FROM expenses_list 
                            WHERE location_id = ? AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1);
                            
                            SELECT sum(amount) as total FROM expenses_list 
                            WHERE location_id = ? AND YEAR(created_at) = YEAR(CURRENT_DATE()) AND MONTH(created_at) = MONTH(CURRENT_DATE());
                            
                            SELECT sum(amount) as total FROM expenses_list 
                            WHERE location_id = ? AND YEAR(created_at) = YEAR(CURRENT_DATE());`,
                [shopId, shopId, shopId, shopId]
              )
              .then((rows: any, fields: any) => {
                _expense = rows[0];
              })
              .catch((err: QueryError) => {});
            profit_expense.push(_expense[0][0].total == null ? 0 : _expense[0][0].total);
            profit_expense.push(_expense[1][0].total == null ? 0 : _expense[1][0].total);
            profit_expense.push(_expense[2][0].total == null ? 0 : _expense[2][0].total);
            profit_expense.push(_expense[3][0].total == null ? 0 : _expense[3][0].total);

            //get top box count orders
            let _purchase: any = [];
            const purchases: any = [];
            await con
              .promise()
              .query(
                `SELECT sum(total_price) as total FROM transactions
                                WHERE location_id = ?  AND type = 'purchase' AND DATE(created_at) = CURRENT_DATE();

                            SELECT sum(total_price) as total FROM transactions WHERE location_id = ?  AND type = 'purchase'
                            AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1);                         

                            SELECT sum(total_price) as total FROM transactions
                            WHERE location_id = ?  AND type = 'purchase' AND YEAR(created_at) = YEAR(CURRENT_DATE()) AND MONTH(created_at) = MONTH(CURRENT_DATE());

                            SELECT sum(total_price) as total FROM transactions
                            WHERE location_id = ?  AND type = 'purchase' AND YEAR(created_at) = YEAR(CURRENT_DATE());`,
                [shopId, shopId, shopId, shopId]
              )
              .then((rows: any, fields: any) => {
                _purchase = rows[0];
              })
              .catch((err: QueryError) => {});

            purchases.push(_purchase[0][0].total == null ? 0 : _purchase[0][0].total);
            purchases.push(_purchase[1][0].total == null ? 0 : _purchase[1][0].total);
            purchases.push(_purchase[2][0].total == null ? 0 : _purchase[2][0].total);
            purchases.push(_purchase[3][0].total == null ? 0 : _purchase[3][0].total);

            //get top box count contacts
            let _contacts: any = [];
            const count_contacts: any = [];
            await con
              .promise()
              .query(
                `SELECT count(id) AS total FROM contacts
                            WHERE location_id = ?
                            AND DATE(created_at) = CURRENT_DATE();

                            SELECT count(id) AS total FROM contacts
                            WHERE location_id = ?
                            AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1);                         

                            SELECT count(id) AS total FROM contacts
                            WHERE location_id = ? 
                            AND YEAR(created_at) = YEAR(CURRENT_DATE()) AND MONTH(created_at) = MONTH(CURRENT_DATE());

                            SELECT count(id) AS total FROM contacts
                            WHERE location_id = ? 
                            AND YEAR(created_at) = YEAR(CURRENT_DATE());`,
                [shopId, shopId, shopId, shopId]
              )
              .then((rows: any, fields: any) => {
                _contacts = rows[0];
              })
              .catch((err: QueryError) => {});

            count_contacts.push(_contacts[0][0].total == null ? 0 : _contacts[0][0].total);
            count_contacts.push(_contacts[1][0].total == null ? 0 : _contacts[1][0].total);
            count_contacts.push(_contacts[2][0].total == null ? 0 : _contacts[2][0].total);
            count_contacts.push(_contacts[3][0].total == null ? 0 : _contacts[3][0].total);

            //get chart bar
            const month1 = moment().format('MMMM');
            const month2 = moment().subtract(1, 'months').format('MMMM');
            const month3 = moment().subtract(2, 'months').format('MMMM');
            let _months: any = [],
              months_name = [month1, month2, month3];
            await con
              .promise()
              .query(
                `SELECT sum(total_price) AS total FROM transactions
                        WHERE location_id = ? AND month(created_at) = month(DATE_SUB(CURRENT_DATE(), INTERVAL ? MONTH))
                        AND year(created_at) = year(DATE_SUB(CURRENT_DATE(), INTERVAL ? MONTH));
                        SELECT sum(total_price) AS total FROM transactions
                        WHERE location_id = ? AND month(created_at) = month(DATE_SUB(CURRENT_DATE(), INTERVAL ? MONTH))
                        AND year(created_at) = year(DATE_SUB(CURRENT_DATE(), INTERVAL ? MONTH));
                        SELECT sum(total_price) AS total FROM transactions
                        WHERE location_id = ? AND month(created_at) = month(DATE_SUB(CURRENT_DATE(), INTERVAL ? MONTH))
                        AND year(created_at) = year(DATE_SUB(CURRENT_DATE(), INTERVAL ? MONTH));`,
                [shopId, 0, 0, shopId + 800, 1, 1, shopId, 2, 2]
              )
              .then((rows: any, fields: any) => {
                _months = rows[0];
              })
              .catch((err: QueryError) => {});
            const profit_months: any = [];
            profit_months.push(_months[0][0].total == null ? 0 : _months[0][0].total);
            profit_months.push(_months[1][0].total == null ? 0 : _months[1][0].total);
            profit_months.push(_months[2][0].total == null ? 0 : _months[2][0].total);

            //get last 10 lasstet invoices
            await con
              .promise()
              .query(
                `SELECT transactions.id,transactions.total_price,contacts.name AS 'contact_name',users.first_name AS 'created_by',transactions.created_at
                                FROM transactions
                                    INNER JOIN contacts ON contacts.id = transactions.contact_id
                                    INNER JOIN users ON users.id = transactions.created_by
                                    WHERE transactions.location_id = ? AND transactions.type='sell'
                                    ORDER BY transactions.id
                                    limit 10`,
                [shopId]
              )
              .then((rows: any, fields: any) => {
                factors_lsit = rows[0];
              })
              .catch((err: QueryError) => {});

            let top_down_pros: any = [],
              upPro: any = [],
              downPro: any = [];
            await con
              .promise()
              .query(
                `SELECT 
                                    min(tl.product_id),min(tl.variation_id),
                                    sum(tl.qty) as total_qty_sold,
                                    p.name
                                    FROM
                                    transactions_lines tl
                                    inner JOIN transactions t ON tl.transaction_id = t.id
                                    INNER JOIN products p ON p.id = tl.product_id
                                    WHERE
                                    t.location_id = ? AND
                                    t.type = 'sell' AND
                                    t.status = 'received' AND
                                    t.created_at >= DATE_SUB(NOW(), INTERVAL 1 year)
                                    GROUP by tl.product_id,tl.variation_id
                                    ORDER BY total_qty_sold DESC LIMIT 7;
                                    
                                    SELECT 
                                    min(tl.product_id),min(tl.variation_id),
                                    sum(tl.qty) as total_qty_sold,
                                    p.name
                                    FROM
                                    transactions_lines tl
                                    inner JOIN transactions t ON tl.transaction_id = t.id
                                    INNER JOIN products p ON p.id = tl.product_id
                                    WHERE
                                    t.location_id = ? AND
                                    t.type = 'sell' AND
                                    t.status = 'received' AND
                                    t.created_at >= DATE_SUB(NOW(), INTERVAL 1 year)
                                    GROUP by tl.product_id,tl.variation_id
                                    ORDER BY total_qty_sold LIMIT 7;`,
                [shopId, shopId]
              )
              .then((rows: any, fields: any) => {
                top_down_pros = rows[0];
                upPro = rows[0][0];
                downPro = rows[0][1];
              })
              .catch((err: QueryError) => {});

            await con
              .promise()
              .query(
                `SELECT 
                            RAND() * 10 as id,CONCAT_WS(' ',products.name,product_variations.name) AS 'name',transactions.id AS transactions_id ,transactions_lines.id AS transactions_lines_id,transactions_lines.product_id,transactions_lines.variation_id,transactions.type,transactions.contact_id,
                            transactions_lines.cost,transactions_lines.price,transactions_lines.qty
                            FROM transactions
                            INNER JOIN transactions_lines ON transactions_lines.transaction_id = transactions.id
                            LEFT JOIN products ON products.id = transactions_lines.product_id
                            LEFT JOIN product_variations ON product_variations.id = transactions_lines.variation_id
                                WHERE transactions.location_id = ? AND transactions.type='sell'
                                ORDER BY transactions_lines.id desc
                                LIMIT 40`,
                [shopId]
              )
              .then((rows: any, fields: any) => {
                salse_list = rows[0];
              })
              .catch((err: QueryError) => {});

            //sen headers
            res.setHeader('Content-Type', 'application/json');
            res.json({
              success: true,
              msg: 'done!',
              data: {
                factors_lsit,
                productsOverSold,
                upPro,
                downPro,
                salse_list,
                profit_months,
                months_name,
                profit_sales,
                count_contacts,
                profit_expense,
                purchases,
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
