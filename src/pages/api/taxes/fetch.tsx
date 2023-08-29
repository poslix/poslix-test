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
  try {
    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { shopId, subType } = req.body;

        if (locationPermission(repo.data.locs, shopId) != -1) {
          if (subType == 'getTaxs') {
            var con = doConnect();
            con.query(
              `SELECT id,name,amount,type as 'amountType',IF(is_primary = 1,TRUE,FALSE) AS 'isPrimary',tax_type as 'taxType',false as 'isNew' FROM tax_rates
                        WHERE  location_id = ?;`,
              [shopId],
              function (err: QueryError, data: any) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: true, msg: 'its done', newdata: data });
                res.end();
                con.end();
                return;
              }
            );
          }
          if (subType == 'getGroupItems') {
            var con = doConnect();
            const { id } = req.body;
            con.query(
              `SELECT tax_rates.id as 'tax_id',tax_rates.name,tax_rates.amount,tax_rates.type,tax_rates.tax_type,tax_group.id
                                        FROM tax_rates
                                            INNER JOIN tax_group ON tax_group.tax_id = tax_rates.id
                                                WHERE tax_rates.location_id = ? AND tax_group.parent_id = ? ORDER BY tax_rates.id DESC;`,
              [shopId, id],
              function (err: QueryError, data: any) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'error1', newdata: [] });
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
  } catch (err) {}

  /*
    
    */
}
