// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { QueryError, RowDataPacket } from 'mysql2';
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
                console.log(req.body);

                const { shopId, subType } = req.body;
                console.log(shopId, repo.data.locs, subType);
                if (locationPermission(repo.data.locs, shopId) != -1) {
                    var con = doConnect();

                    if (subType == "tailoringadd") {

                        const { data2 } = req.body;
                        const { data, selectedExtras } = data2;

                        if (data.sizes.length == 0) {
                            redirection(400, con, res, 'somthing wrong')
                            return;
                        }

                        let _extras = "";
                        if (selectedExtras != undefined && selectedExtras != null) {
                            selectedExtras.map(sel => {
                                return _extras += sel.value + ",";
                            })
                        }
                        console.log('_extras ', _extras);

                        con.query(`INSERT INTO tailoring_type(location_id,name,multiple_value,created_by,extras) VALUES (?,?,?,?,?)`,
                            [shopId, data.name, data.multiple, repo.data.id, _extras],
                            async function (err: QueryError, tail: any) {
                                if (err) {
                                    console.log(err);
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: false, msg: 'tailor type not added!!' });
                                    res.end();
                                    con.end();
                                    return
                                }

                                const sqlCondi = 'INSERT INTO tailoring_sizes(tailoring_type_id,name,is_primary) VALUES ?'
                                const sqlValues: any = [];
                                data.sizes.map((itm: ITax) => {
                                    if (itm.isNew && itm.name.length > 0)
                                        sqlValues.push([tail.insertId, itm.name, itm.isPrimary])
                                });

                                console.log('log1');
                                if (sqlValues.length) {
                                    // await con.promise().query(sqlCondi, [sqlValues])
                                    //     .then((rows: any, fields: any) => {
                                    //         console.log('log2');
                                    //     })
                                    //     .catch()
                                    try {
                                        const ali = await con.promise().query(sqlCondi, [sqlValues]);
                                    } catch (e: any) {
                                        console.log('error ', e);

                                    }

                                }

                                console.log('log3');

                                con.end()
                                res.status(200).json({ success: true, msg: 'tailoring Inserted' });
                                res.end();
                                return;

                            });
                    }

                    if (subType == "addExtras") {

                        const { data } = req.body;

                        if (data.items.length == 0) {
                            redirection(400, con, res, 'somthing wrong')
                            return;
                        }
                        const _items = [];
                        data.items.map((it: any) => {
                            if (it.name.length > 0) _items.push(it)
                        })

                        con.query(`INSERT INTO tailoring_extra(location_id,name,is_required,items,created_at) VALUES (?,?,?,?,?)`,
                            [shopId, data.name, data.isRequired ? 1 : 0, JSON.stringify(_items), new Date()],
                            async function (err: QueryError, tail: any) {
                                if (err) {
                                    console.log(err);
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: false, msg: 'extra not added!!' });
                                    res.end();
                                    con.end();
                                    return
                                }
                                con.end()
                                res.status(200).json({ success: true, msg: 'extra Inserted' });
                                res.end();
                                return;

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
