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
          const { id, section } = req.body;
          if (subType == 'deleteTax') {
            let _stm = '';
            if (section == 'group')
              _stm = `DELETE tax_rates,tax_group
                                        FROM tax_rates
                                            LEFT JOIN tax_group ON tax_group.parent_id = tax_rates.id
                                            WHERE 
                                                tax_rates.id = ?`;
            else
              _stm = `DELETE
                                FROM tax_rates
                                    WHERE 
                                    tax_rates.id = ? AND 
                                    NOT EXISTS (SELECT tax_id FROM tax_group WHERE tax_group.tax_id = ?)`;
            var con = doConnect();
            con.query(_stm, [id, id], async function (err: QueryError, data: any) {
              if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: false, msg: 'error1' + err, newdata: [] });
                res.end();
                con.end();
                return;
              } else {
                res.setHeader('Content-Type', 'application/json');
                if (data.affectedRows == 0)
                  res
                    .status(200)
                    .json({ success: false, msg: 'Error,This Item Used in Goup', newdata: [] });
                else res.status(200).json({ success: true, msg: 'its done', newdata: [] });
                res.end();
                con.end();
                return;
              }
            });
          }
        } else redirection(403, con, res, 'you have not permissions');
      } else redirection(401, con, res, 'login first!');
    });
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');

    res.status(200).json({ success: false, msg: 'error2', newdata: [] });
    res.end();
  }
}
