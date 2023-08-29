// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Data, ITax, ITokenVerfy } from '../../../models/common-model';
import { QueryError, RowDataPacket } from 'mysql2';
var { doConnect, doConnectMulti } = require('../../../libs/myConnection');
import {
  keyValueRules,
  locationPermission,
  makePerProuctArrayOfPrice,
  makePerVarationArrayOfPrice,
  redirection,
  verifayTokens,
} from '../checkUtils';
import { groupCalculation } from 'src/libs/calculationTax';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.body.method !== 'POST') {
  }

  try {
    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { shopId, subType } = req.body;

        if (locationPermission(repo.data.locs, shopId) != -1) {
          if (subType == 'getCateAndList') {
            var con = doConnect();

            let list: any = [];
            //get all taxes
            await con
              .promise()
              .query(
                `SELECT expenses_list.*,expenses.name AS category
                                FROM expenses_list 
                                    INNER JOIN expenses ON expenses.id =expenses_list.expense_id
                                    WHERE expenses_list.location_id = ? ORDER BY expenses_list.id desc`,
                [shopId]
              )
              .then((rows: any, fields: any) => {
                if (rows[0].length > 0) list = rows[0];
              })
              .catch((err: QueryError) => {});

            con.query(
              `SELECT id,name FROM expenses
                                        WHERE location_id = ? ORDER BY id;`,
              [shopId],
              function (err: QueryError, cate: any) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'error1' + err, newdata: [] });
                  res.end();
                  con.end();
                  return;
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: true, msg: 'its done', newdata: { cate, list } });
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
