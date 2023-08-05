// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Data, ITokenVerfy } from "../../../models/common-model"
import { QueryError } from 'mysql2';
var { doConnect } = require('../../../libs/myConnection');
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
                    const { id } = req.body;
                    var con = doConnect();
                    if (subType == "delete_items") {
                        con.query(`DELETE pv
                            FROM product_variations pv
                                WHERE 
                                  pv.id = ? AND 
                                  NOT EXISTS (SELECT id FROM stock WHERE stock.variation_id = ?) AND
                                  NOT EXISTS (SELECT id FROM transactions_lines WHERE transactions_lines.variation_id = ?)`,
                            [id, id, id], async function (err: QueryError, data: any) {
                                if (err) {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: false, msg: 'error1' + err, newdata: [] });
                                    res.end();
                                    con.end();
                                    return;
                                } else {
                                    if (data.affectedRows == 0) {
                                        await con.promise()
                                            .query(`UPDATE product_variations SET is_active='0' WHERE id = ?;`, [id])
                                            .then((rows: any, fields: any) => {
                                            })
                                            .catch((err: QueryError) => { })
                                    }
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: true, msg: 'its done', newdata: [] });
                                    res.end();
                                    con.end();
                                    return;
                                }

                            });
                    }
                    else if (subType == "deleteProduct") {
                        con.query(`DELETE ps
                        FROM products ps
                            WHERE 
                              ps.id = ? AND 
                              NOT EXISTS (SELECT id FROM stock WHERE stock.product_id = ?) AND
                              NOT EXISTS (SELECT id FROM transactions_lines WHERE transactions_lines.product_id = ?)`,
                            [id, id, id], async function (err: QueryError, data: any) {
                                if (err) {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: false, msg: 'error1' + err, newdata: [] });
                                    res.end();
                                    con.end();
                                    return;
                                } else {
                                    if (data.affectedRows == 0) {
                                        await con.promise()
                                            .query(`UPDATE products SET is_disabled='1' WHERE id = ?;`, [id])
                                            .then((rows: any, fields: any) => {
                                            })
                                            .catch((err: QueryError) => { })
                                    }
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: true, msg: 'its done', newdata: [] });
                                    res.end();
                                    con.end();
                                    return;
                                }

                            });
                    } else if (subType == "deleteProducts") {
                        console.log(id);
                        
                        con.query(`DELETE ps
                        FROM products ps
                            WHERE 
                              ps.id IN ? AND 
                              NOT EXISTS (SELECT id FROM stock WHERE stock.product_id IN ?) AND
                              NOT EXISTS (SELECT id FROM transactions_lines WHERE transactions_lines.product_id IN ?)`,
                            [[id], [id], [id]], async function (err: QueryError, data: any) {
                                if (err) {
                                    console.log(err);
                                    
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: false, msg: 'error1' + err, newdata: [] });
                                    res.end();
                                    con.end();
                                    return;
                                } else {
                                    if (data.affectedRows == 0) {
                                        await con.promise()
                                            .query(`UPDATE products SET is_disabled='1' WHERE id = ?;`, [id])
                                            .then((rows: any, fields: any) => {
                                            })
                                            .catch((err: QueryError) => { })
                                    }
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: true, msg: 'its done', newdata: [] });
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
        });

    } catch (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ success: false, msg: 'error2', newdata: [] });
        res.end();
    }
}
