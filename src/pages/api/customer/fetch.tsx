// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Data, ITokenVerfy } from '../../../models/common-model';
import { QueryError, RowDataPacket } from 'mysql2';
var { doConnect } = require('../../../libs/myConnection');
import { locationPermission, redirection, verifayTokens } from '../checkUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { shopId, subType } = req.body;

        if (locationPermission(repo.data.locs, shopId) != -1) {
          if (subType == 'getCustomerInfo') {
            const { theId } = req.body;
            var con = doConnect();
            con.query(
              `SELECT id,first_name,last_name,city,state,country,address_line_1 AS 'addr1',address_line_2 AS 'addr2' ,mobile,country,zip_code,shipping_address
                            FROM contacts
                                WHERE id = ?`,
              [theId],
              function (err: QueryError, prods: RowDataPacket[]) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'error', newdata: [] });
                  res.end();
                  con.end();
                  return;
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: true, msg: 'done!', newdata: prods });
                  res.end();
                  con.end();
                  return;
                }
              }
            );
          }
          if (subType == 'getCustomerlist') {
            var con = doConnect();
            con.query(
              `SELECT id,CONCAT_WS(' ',first_name,last_name) AS 'name',mobile
                            FROM contacts WHERE contacts.location_id = ? ORDER BY id desc`,
              [shopId],
              function (err: QueryError, prods: RowDataPacket[]) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'error', newdata: [] });
                  res.end();
                  con.end();
                  return;
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: true, msg: 'done!', newdata: prods });
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
  } catch (err) {}

  /*
    
    */
}
