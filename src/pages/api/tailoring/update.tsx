// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Data, ITax, ITokenVerfy } from '../../../models/common-model';
import { QueryError, RowDataPacket } from 'mysql2';
var { doConnect, doConnectMulti } = require('../../../libs/myConnection');
import { locationPermission, redirection, verifayTokens } from '../checkUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.body.method !== 'POST') {
  }

  try {
    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { shopId, subType } = req.body;

        if (locationPermission(repo.data.locs, shopId) != -1) {
          var con = doConnectMulti();

          if (subType == 'tailoringedit') {
            const { data2, id } = req.body;
            const { data, selectedExtras } = data2;

            if (data.sizes.length == 0) {
              redirection(400, con, res, 'somthing wrong');
              return;
            }

            let _extras = '';
            if (selectedExtras != undefined && selectedExtras != null) {
              selectedExtras.map((sel) => {
                return (_extras += sel.value + ',');
              });
            }

            con.query(
              `update tailoring_type set name = ? ,multiple_value = ?,extras = ? where id = ?`,
              [data.name, data.multiple, _extras, id],
              async function (err: QueryError, tail: any) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'tailor type not added!!' });
                  res.end();
                  con.end();
                  return;
                }

                const sqlCondi =
                  'INSERT INTO tailoring_sizes(tailoring_type_id,name,is_primary) VALUES ?';
                const sqlValues: any = [];
                data.sizes.map(async (itm: ITax) => {
                  if (itm.isNew && itm.name.length > 0)
                    sqlValues.push([id, itm.name, itm.is_primary]);
                  else {
                    await con
                      .promise()
                      .query('update tailoring_sizes set name = ?, is_primary = ? where id = ?', [
                        itm.name,
                        itm.is_primary,
                        itm.id,
                      ])
                      .then((rows: any, fields: any) => {})
                      .catch();
                  }
                });

                if (sqlValues.length) {
                  await con
                    .promise()
                    .query(sqlCondi, [sqlValues])
                    .then((rows: any, fields: any) => {})
                    .catch();
                }

                con.end();
                res.status(200).json({ success: true, msg: 'tailoring Edited' });
                res.end();
                return;
              }
            );
          }
          if (subType == 'updateExtra') {
            const { data, id } = req.body;

            if (data.items.length == 0) {
              redirection(400, con, res, 'somthing wrong');
              return;
            }
            const _items = [];
            data.items.map((it: any) => {
              if (it.name.length > 0) _items.push(it);
            });

            con.query(
              `update tailoring_extra set name = ? ,is_required = ?,items = ? where id = ?`,
              [data.name, data.isRequired ? 1 : 0, JSON.stringify(_items), id],
              async function (err: QueryError, tail: any) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'extra not edited!!' });
                  res.end();
                  con.end();
                  return;
                }

                con.end();
                res.status(200).json({ success: true, msg: 'extra Edited' });
                res.end();
                return;
              }
            );
          }
          if (subType == 'changeStOrder') {
            const { stType, id } = req.body;
            if (stType != 'pending' && stType != 'processing' && stType != 'complete') {
              redirection(403, con, res, 'status type is wrong!!');
              return;
            }
            con.query(
              `UPDATE transactions_lines SET status=? WHERE id=? LIMIT 1`,
              [stType, id],
              async function (err: QueryError, tail: any) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'tailor type not added!!' });
                  res.end();
                  con.end();
                  return;
                }
                con.end();
                res.status(200).json({ success: true, msg: 'Order status changed!' });
                res.end();
                return;
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
