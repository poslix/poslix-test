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
                const { shopId, subType } = req.body;
                console.log(shopId, repo.data.locs, subType);
                if (locationPermission(repo.data.locs, shopId) != -1) {
                    if (subType == 'addCustomer') {
                        const { data } = req.body;

                        let _hasSku = false;
                        var con = doConnect();
                        await con.promise().query(`SELECT id FROM contacts WHERE mobile = ? AND location_id = ? LIMIT 1`, [data.mobile, shopId])
                            .then((rows: any, fields: any) => {
                                if (rows[0].length > 0)
                                    _hasSku = true
                            })
                            .catch()

                        if (_hasSku) {
                            redirection(403, con, res, 'The ' + data.mobile + ' Already Exist', 100);
                            return;
                        }


                        con.query(`INSERT INTO contacts(location_id,type,first_name,last_name,mobile,city,state,country,address_line_1,address_line_2,zip_code,shipping_address,created_by,created_at) 
                            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                            [shopId, 'customer', data.firstName, data.lastName, data.mobile, data.city, data.state,
                                data.country, data.addr1, data.addr2, data.zipCode, data.shipAddr, repo.data.id, new Date()], function (err: QueryError, newCustomer: any) {
                                    if (err) {
                                        console.log("error", err);
                                        res.setHeader('Content-Type', 'application/json');
                                        res.status(200).json({ success: false, msg: 'error', newdata: [] });
                                        res.end();
                                        con.end();
                                        return;
                                    } else {
                                        console.log("done!!!", newCustomer.insertId);
                                        var newOne = { value: newCustomer.insertId, label: req.body.data.firstName + ' | ' + req.body.data.mobile, mobile: req.body.data.mobile }
                                        res.setHeader('Content-Type', 'application/json');
                                        res.status(200).json({ success: true, msg: 'done!', newdata: newOne });
                                        res.end();
                                        con.end();
                                        return;
                                    }
                                });
                    }
                    if (subType == 'opens') {
                        const { cashHand } = req.body;
                        var con = doConnect();
                        con.query(`INSERT INTO cash_registers(location_id,user_id,STATUS,closing_amount,created_at) VALUES(?,?,?,?,?)`,
                            [shopId, repo.data.id, 'open', cashHand, new Date()],
                            function (err: QueryError, newCustomer: any) {
                                if (err) {
                                    console.log("error", err);
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: false, msg: 'error', newdata: [] });
                                    res.end();
                                    con.end();
                                    return;
                                } else {
                                    console.log("done!!");
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: true, msg: 'done!' });
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
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ success: false, msg: 'error2' });
        res.end();
        return;
    }
}
