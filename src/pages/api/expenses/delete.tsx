// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Data, ITokenVerfy } from '../../../models/common-model';
import { QueryError } from 'mysql2';
var { doConnect } = require('../../../libs/myConnection');
import { areNumbers, locationPermission, redirection, verifayTokens } from '../checkUtils';
import { incorrectInput } from '../utils/data';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { shopId, subType, id } = req.body;
        if (!areNumbers([id, shopId])) {
          redirection(403, null, res, incorrectInput);
          return;
        }
        if (locationPermission(repo.data.locs, shopId) != -1) {
          if (subType == 'deleteExpense') {
            var con = doConnect();
            con.query(
              `DELETE from expenses_list WHERE 
                            id = ? AND location_id = ? `,
              [id, id],
              async function (err: QueryError, data: any) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'error1' + err, newdata: [] });
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
