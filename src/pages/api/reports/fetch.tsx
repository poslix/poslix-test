// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Data, ITax, ITokenVerfy } from '../../../models/common-model';
import { QueryError, RowDataPacket } from 'mysql2';
var { doConnect } = require('../../../libs/myConnection');
import { locationPermission, redirection, verifayTokens } from '../checkUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { shopId, subType } = req.body;

        if (locationPermission(repo.data.locs, shopId) != -1) {
          if (subType == 'getItemsReport') {
            let sales: any = [],
              sums: any = [];
            var con = doConnect();
            //get last sales
            await con
              .promise()
              .query(
                `SELECT tl.id,tl.product_id,tl.tax_amount,tl.variation_id,CONCAT_WS(' ',s.name,pv.name) AS 'name',ts.notes,s.type,s.is_service,tl.stock_id,tl.qty,tl.cost,tl.price,ts.contact_id,ts.total_price,CONCAT_WS(' ',cont.first_name,cont.last_name) AS 'contact_name',s.is_fabric,tl.note,DATE_FORMAT(ts.created_at, '%Y-%m-%d %H:%i:%s') AS created_at
                            FROM transactions_lines tl
                                left JOIN products s ON s.id = tl.product_id
                                left JOIN product_variations pv ON (pv.id = tl.variation_id AND pv.parent_id = tl.product_id)
                                left JOIN transactions ts ON ts.id = tl.transaction_id
                                left JOIN contacts cont ON cont.id = ts.contact_id
                               WHERE ts.location_id = ? AND ts.type = "sell" and ts.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                                          AND ts.created_at < CURDATE();`,
                [2, 100]
              )
              .then((rows: any, fields: any) => {
                sales = rows[0];
              })
              .catch((err: QueryError) => {});

            await con
              .promise()
              .query(
                `SELECT sum(tl.tax_amount) AS tax,sum(tl.cost) AS cost,sum(tl.price) AS price,sum(ts.total_price) AS subTotal
                            FROM transactions_lines tl
                                left JOIN products s ON s.id = tl.product_id
                                left JOIN product_variations pv ON (pv.id = tl.variation_id AND pv.parent_id = tl.product_id)
                                left JOIN transactions ts ON ts.id = tl.transaction_id
                                left JOIN contacts cont ON cont.id = ts.contact_id
                                
                                 WHERE ts.location_id = ? AND ts.type = "sell" and ts.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                                          AND ts.created_at < CURDATE()`,
                [2, 100]
              )
              .then((rows: any, fields: any) => {
                sums = rows[0];
              })
              .catch((err: QueryError) => {});

            //sen headers
            res.setHeader('Content-Type', 'application/json');
            res.json({
              success: true,
              msg: 'done!',
              data: { sales, sums },
            });
            res.end();
            con.end();
            return;
          } else if (subType == 'getSalesReport') {
            let sales: any = [],
              sums: any = [];
            var con = doConnect();
            //get last sales
            await con
              .promise()
              .query(
                `SELECT   transactions.id ,
                            DATE_FORMAT(transactions.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
                            transactions.total_price,
                            transactions.tax_amount,
                            transactions.notes,
                            CONCAT_WS(' ',contacts.first_name,contacts.last_name) as customer_name,
                            CONCAT(COALESCE(users.first_name, ''),' ',COALESCE(users.last_name,'')) as added_by
                            
                              FROM transactions
                                LEFT JOIN contacts ON transactions.contact_id = contacts.id
                                LEFT JOIN users ON transactions.created_by = users.id
                                    WHERE transactions.location_id = ? 
                                          AND transactions.type = 'sell' 
                                              ORDER BY id DESC`,
                [shopId]
              )
              .then((rows: any, fields: any) => {
                sales = rows[0];
              })
              .catch((err: QueryError) => {});

            await con
              .promise()
              .query(
                `SELECT sum(transactions.total_price) AS subTotal,
                            sum(transactions.tax_amount) AS tax
                              FROM transactions
                                    WHERE transactions.location_id = ? 
                                          AND transactions.type = 'sell' 
                                              ORDER BY id DESC LIMIT 500 ;`,
                [shopId]
              )
              .then((rows: any, fields: any) => {
                sums = rows[0];
              })
              .catch((err: QueryError) => {});

            //sen headers
            res.setHeader('Content-Type', 'application/json');
            res.json({
              success: true,
              msg: 'done!',
              data: { sales, sums },
            });
            res.end();
            con.end();
            return;
          } else if (subType == 'getOpens') {
            let users: any = [];
            var con = doConnect();
            await con
              .promise()
              .query(
                `SELECT cr.*,CONCAT_WS(' ',users.first_name,users.last_name) AS 'name'
                            FROM cash_registers cr
                                inner JOIN users ON users.id = cr.user_id
                                WHERE cr.location_id = ?  ORDER BY id desc`,
                [shopId]
              )
              .then((rows: any, fields: any) => {
                users = rows[0];
              })
              .catch((err: QueryError) => {});

            //sen headers
            res.setHeader('Content-Type', 'application/json');
            res.json({
              success: true,
              msg: 'done!',
              data: { users },
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
