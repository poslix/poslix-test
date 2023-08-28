// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { QueryError, RowDataPacket } from 'mysql2';
var { doConnect } = require('../../../libs/myConnection');
import { ITax, Data, ITokenVerfy } from '../../../models/common-model';
import { locationPermission, redirection, verifayTokens } from '../checkUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { shopId, subType } = req.body;

        if (locationPermission(repo.data.locs, shopId) != -1) {
          var con = doConnect();

          if (subType == 'insert_category') {
            const { data } = req.body;
            const { frmobj } = data;

            let is_never = 0;
            if (frmobj.tax == -1) {
              is_never = 1;
              frmobj.tax = null;
            }
            con.query(
              `INSERT INTO categories(name,location_id,parent_id,tax_id,never_tax,created_by,description) VALUES (?,?,?,?,?,?,?)`,
              [frmobj.name, shopId, 0, frmobj.tax, is_never, repo.data.id, frmobj.des],
              function (err: QueryError, prov: any) {
                if (err) {
                  redirection(503, con, res, err.message);
                  return;
                }
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: true, msg: 'category inserted' });
                res.end();
                con.end();
                return;
              }
            );
          }

          if (subType == 'insert_brand') {
            const { data } = req.body;
            const { frmobj } = data;
            let is_never = 0;
            if (frmobj.tax == -1) {
              is_never = 1;
              frmobj.tax = null;
            }
            con.query(
              `INSERT INTO brands(name,location_id,tax_id,never_tax,created_by,description) VALUES (?,?,?,?,?,?)`,
              [frmobj.name, shopId, frmobj.tax, is_never, repo.data.id, frmobj.des],
              function (err: QueryError, prov: any) {
                if (err) console.log(err);

                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: true, msg: 'products inserted' });
                res.end();
                con.end();
                return;
              }
            );
          }
        } else redirection(403, con, res, 'you have not permissions');
      } else redirection(401, con, res, 'login first!');
    });
  } catch (eer) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: false, msg: 'error2' });
    res.end();
    return;
  }
}
