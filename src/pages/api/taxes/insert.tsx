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
          if (subType == 'insetUpdatePrimaryTax') {
            var con = doConnect();
            const { data } = req.body;
            if (data.length == 0) {
              redirection(400, con, res, 'somthing wrong');
              return;
            }
            const sqlCondi =
              'INSERT INTO tax_rates(location_id,name,amount,created_by,type,is_primary,tax_type) VALUES ?';
            const sqlValues: any = [];
            data.map((itm: ITax, idx: number) => {
              if (itm.isNew && itm.name.length > 1)
                sqlValues.push([
                  shopId,
                  itm.name,
                  Number(itm.amount),
                  repo.data.id,
                  itm.tax_type != 'service' ? 'percentage' : itm.type,
                  itm.is_primary,
                  itm.tax_type,
                ]);
            });

            var con = doConnect();
            const insertedIds = [];
            for (let idx = 0; idx < data.length; idx++) {
              if (!data[idx].isNew && data[idx].name.length > 1) {
                con
                  .promise()
                  .query(
                    'UPDATE tax_rates SET name = ?, amount = ?, is_primary = ?, type = ? WHERE id = ?',
                    [
                      data[idx].name,
                      data[idx].amount,
                      data[idx].isPrimary,
                      data[idx].type,
                      data[idx].id,
                    ]
                  )
                  .then((rows: any, fields: any) => {})
                  .catch();
              }
            }
            if (sqlValues.length) {
              await con
                .promise()
                .query(sqlCondi, [sqlValues])
                .then((rows: any, fields: any) => {
                  for (let i = 0; i < rows[0].affectedRows; i++)
                    insertedIds.push(rows[0].insertId + i);
                })
                .catch();
            }
            con.end();
            res.status(200).json({ success: true, msg: 'Taxes Inserted', data: insertedIds });
            res.end();
            return;
          }
          if (subType == 'insertGroupTax') {
            const { data, gname, isDefault, id } = req.body;
            var con = doConnect();

            if (isDefault) {
              await con
                .promise()
                .query(
                  'UPDATE tax_rates SET is_primary = ? WHERE tax_type = ? and location_id = ?',
                  [0, 'group', shopId]
                )
                .then((rows: any, fields: any) => {})
                .catch();
            }
            if (id != 0) {
              //its edit
              await con
                .promise()
                .query('UPDATE tax_rates SET is_primary = ?,name=? WHERE id = ?', [
                  isDefault ? 1 : 0,
                  gname,
                  id,
                ])
                .then((rows: any, fields: any) => {})
                .catch();
              const sqlValues: any = [];
              const sqlValuesDel: any = [];
              data.map((itm: any, idx: number) => {
                if (itm.isChoosed)
                  sqlValues.push({ location_id: shopId, parent_id: id, tax_id: itm.id });
                else if (itm.id > 0) sqlValuesDel.push(itm.id);
              });
              //delete if unchecked
              if (sqlValuesDel.length > 0) {
                const placeholders = sqlValuesDel.map(() => '?').join(','); // generates ?, ?, ?
                const sqlCondiDel = `DELETE tax_group FROM tax_group WHERE parent_id = ? AND tax_id IN (${placeholders})`;
                sqlValuesDel.unshift(id);
                await con
                  .promise()
                  .query(sqlCondiDel, sqlValuesDel)
                  .then((rows: any, fields: any) => {})
                  .catch();
              }
              //insert new items
              if (sqlValues.length > 0) {
                sqlValues.map(async (obj: any) => {
                  await con
                    .promise()
                    .query(
                      `INSERT INTO tax_group (location_id, parent_id, tax_id)
                                                    SELECT ?, ?, ?
                                                        WHERE NOT EXISTS (
                                                            SELECT 1 FROM tax_group WHERE location_id = ? AND parent_id = ? AND tax_id = ?);`,
                      [
                        obj.location_id,
                        obj.parent_id,
                        obj.tax_id,
                        obj.location_id,
                        obj.parent_id,
                        obj.tax_id,
                      ]
                    )
                    .then((rows: any, fields: any) => {})
                    .catch();
                });
              }

              res.setHeader('Content-Type', 'application/json');
              res.status(200).json({ success: true, msg: 'group edited', data: id });
              res.end();
              con.end();
              return;
            } else {
              con.query(
                `INSERT INTO tax_rates(location_id,name,amount,created_by,type,is_primary,tax_type) VALUES (?,?,?,?,?,?,?)`,
                [shopId, gname, 0, repo.data.id, 'percentage', isDefault, 'group'],
                function (err: QueryError, prov: any) {
                  if (err) {
                    return;
                  }
                  const sqlCondi = 'INSERT INTO tax_group(location_id,parent_id,tax_id) VALUES ?';
                  const sqlValues: any = [];
                  data.map((itm: any, idx: number) => {
                    if (itm.isChoosed) sqlValues.push([shopId, prov.insertId, itm.id]);
                  });

                  con.query(
                    sqlCondi,
                    [sqlValues],
                    function (err: QueryError, prods: RowDataPacket[]) {
                      res.setHeader('Content-Type', 'application/json');
                      res
                        .status(200)
                        .json({ success: true, msg: 'products inserted', data: prov.insertId });
                      res.end();
                      con.end();
                      return;
                    }
                  );
                }
              );
            }
          }
        } else redirection(403, con, res, 'you have not permissions');
      } else redirection(401, con, res, 'login first!');
    });
  } catch (eer) {
    redirection(401, null, res, 'error happen!');
    return;
  }
}
