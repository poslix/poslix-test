// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Data, ITokenVerfy } from '../../../models/common-model';
import { QueryError } from 'mysql2';
var { doConnect } = require('../../../libs/myConnection');
import { locationPermission, redirection, verifayTokens } from '../checkUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { shopId, subType } = req.body;

        if (locationPermission(repo.data.locs, shopId) != -1) {
          const { id } = req.body;
          var con = doConnect();
          if (subType == 'delTailoring') {
            con.query(
              `DELETE t1, t2 
                        FROM tailoring_type t1 LEFT JOIN tailoring_sizes t2 ON t1.id = t2.tailoring_type_id 
                        WHERE t1.id = ? AND NOT EXISTS (SELECT id FROM products WHERE products.is_tailoring = ?)
                        AND NOT EXISTS (SELECT id FROM tailoring_package WHERE tailoring_package.tailoring_type_id = ?)`,
              [id, id, id],
              async function (err: QueryError, data: any) {
                if (err || data.affectedRows == 0) {
                  res.setHeader('Content-Type', 'application/json');
                  res
                    .status(200)
                    .json({
                      success: false,
                      msg: 'Error,This Item Already Used, Cannot Delete',
                      newdata: [],
                    });
                  res.end();
                  con.end();
                  return;
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: true, msg: 'its done', newdata: [] });
                  res.end();
                  con.end();
                  return;
                }
              }
            );
          } else if (subType == 'deleteSizeItem') {
            con.query(
              `DELETE FROM tailoring_sizes WHERE id = ? LIMIT 1`,
              [id],
              async function (err: QueryError, data: any) {
                if (err || data.affectedRows == 0) {
                  res.setHeader('Content-Type', 'application/json');
                  res
                    .status(200)
                    .json({
                      success: false,
                      msg: 'Error,This Item Already Used, Cannot Delete',
                      newdata: [],
                    });
                  res.end();
                  con.end();
                  return;
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: true, msg: 'its done', newdata: [] });
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
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: false, msg: 'error2', newdata: [] });
    res.end();
  }

  /*
    
    */
}
