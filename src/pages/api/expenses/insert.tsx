import { QueryError } from 'mysql2';
import type { NextApiRequest, NextApiResponse } from 'next'
var { doConnect } = require('../../../libs/myConnection');
import { ITax, Data, ITokenVerfy } from '../../../models/common-model';
import { locationPermission, redirection, verifayTokens } from '../checkUtils'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    try {
        verifayTokens(req, async (repo: ITokenVerfy) => {
            if (repo.status === true) {
                const { shopId, subType } = req.body;
                if (locationPermission(repo.data.locs, shopId) != -1) {


                    if (subType == "insetUpdateExpenes") {
                        const { data } = req.body;

                        if (data.length == 0) {
                            redirection(400, con, res, 'somthing wrong')
                            return;
                        }

                        const sqlCondi = 'INSERT INTO expenses(location_id,name) VALUES ?'
                        const sqlValues: any = [];
                        const insertedIds = [];
                        data.map((itm: ITax) => {
                            if (itm.isNew && itm.name.length > 1)
                                sqlValues.push([shopId, itm.name])
                        });

                        var con = doConnect();
                        if (sqlValues.length) {
                            await con.promise().query(sqlCondi, [sqlValues])
                                .then((rows: any, fields: any) => {
                                    for (let i = 0; i < rows[0].affectedRows; i++)
                                        insertedIds.push(rows[0].insertId + i);
                                })
                                .catch()
                        }

                        for (let idx = 0; idx < data.length; idx++) {
                            if (!data[idx].isNew && data[idx].name.length > 1) {
                                con.promise().query('UPDATE expenses SET name = ? WHERE id = ?', [data[idx].name, data[idx].id])
                                    .then((rows: any, fields: any) => {
                                        console.log(rows);
                                    })
                                    .catch()
                            }

                        }
                        con.end()
                        res.status(200).json({ success: true, msg: 'expenses Inserted', data: insertedIds });
                        res.end();
                    }
                    if (subType == "addExpenseList") {
                        const { data } = req.body;
                        var con = doConnect();
                        con.query(`INSERT INTO expenses_list(location_id,name,amount,expense_id,attach,date,created_by,created_at) VALUES (?,?,?,?,?,?,?,?)`,
                            [shopId, data.name, data.amount, data.expense_id, '', data.date, repo.data.id, new Date()], function (err: QueryError, reg: any) {
                                if (err) {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: false, msg: 'error', newdata: [] });
                                    res.end();
                                    con.end();
                                    return;
                                } else {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: true, msg: 'Expense Added', newdata: reg.insertId });
                                    res.end();
                                    con.end();
                                    return;
                                }
                            });
                    }

                } else
                    redirection(403, con, res, 'you have not permissions')
            } else
                redirection(401, con, res, 'login first!')
        })

    } catch (eer) {
        console.log('error happen...');

        console.log(eer);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ success: false, msg: 'error2' });
        res.end();
        return;
    }
}
