// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Data, ITax, ITokenVerfy } from "../../../models/common-model"
import { QueryError, RowDataPacket } from 'mysql2';
var { doConnect, doConnectMulti } = require('../../../libs/myConnection');
import { keyValueRules, locationPermission, makePerProuctArrayOfPrice, makePerVarationArrayOfPrice, redirection, verifayTokens } from '../checkUtils'
import { groupCalculation } from 'src/libs/calculationTax';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.body.method !== 'POST') {

    }

    try {

        verifayTokens(req, async (repo: ITokenVerfy) => {
            if (repo.status === true) {
                const { shopId, subType } = req.body;

                if (locationPermission(repo.data.locs, shopId) != -1) {
                    var con = doConnectMulti();

                    if (subType == 'getList') {
                        let tailoring: any = [], extras: any = [];

                        //get last sales
                        await con.promise()
                            .query(`SELECT tt.id,tt.name AS 'type_name',tt.multiple_value,ts.is_primary,ts.name
                            FROM tailoring_type tt
                            INNER JOIN tailoring_sizes ts ON ts.tailoring_type_id =tt.id 
                            WHERE tt.location_id  = ? AND ts.is_primary = 1`, [shopId])
                            .then((rows: any, fields: any) => {
                                tailoring = rows[0]
                            })
                            .catch((err: QueryError) => { })

                        const _ext = await con.promise().query(`SELECT *
                            FROM tailoring_extra
                                WHERE tailoring_extra.location_id = ?`, [shopId])
                        extras = _ext[0]
                        //sen headers
                        res.setHeader('Content-Type', 'application/json');
                        res.json({
                            success: true, msg: 'done!',
                            data: { tailoring, extras }
                        });
                        res.end();
                        con.end()
                        return;
                    }
                    if (subType == 'getInitPage') {
                        const { id } = req.body;
                        let tailoring: any = [], sizes: any = [], extras: any = [];

                        //get extras
                        await con.promise()
                            .query(`SELECT name as 'label',id as value FROM tailoring_extra WHERE location_id  = ?`, [shopId])
                            .then((rows: any, fields: any) => {
                                extras = rows[0]
                            })
                            .catch((err: QueryError) => { })

                        if (id != "0") {
                            //get selected tailoring for edit
                            await con.promise()
                                .query(`SELECT * FROM tailoring_type WHERE tailoring_type.id  = ?`, [id])
                                .then((rows: any, fields: any) => {
                                    tailoring = rows[0]
                                })
                                .catch((err: QueryError) => { })

                            await con.promise()
                                .query(`SELECT id,name,is_primary as 'isPrimary' FROM tailoring_sizes WHERE tailoring_type_id  = ?`, [id])
                                .then((rows: any, fields: any) => {
                                    sizes = rows[0]
                                })
                                .catch((err: QueryError) => { })

                            console.log(tailoring);
                            console.log(sizes);
                        }
                        //send headers
                        res.setHeader('Content-Type', 'application/json');
                        res.json({
                            success: true, msg: 'done!',
                            data: { tailoring, sizes, extras }
                        });
                        res.end();
                        con.end()
                        return;
                    }
                    if (subType == 'getInitExtra') {
                        const { id } = req.body;
                        let extras: any = [];

                        //get extras
                        await con.promise()
                            .query(`SELECT * FROM tailoring_extra WHERE location_id  = ? and id = ?`, [shopId, id])
                            .then((rows: any, fields: any) => {
                                extras = rows[0]
                            })
                            .catch((err: QueryError) => { })

                        //send headers
                        res.setHeader('Content-Type', 'application/json');
                        res.json({
                            success: true, msg: 'done!',
                            data: extras
                        });
                        res.end();
                        con.end()
                        return;
                    }
                    if (subType == 'getOrders') {
                        const { id } = req.body;
                        let orders: any = [], extras: any = [];

                        await con.promise()
                            .query(`SELECT ts.id,ts.transaction_id,ts.product_id,ts.tailoring_txt,ts.tailoring_custom,ts.note,ts.status,s.created_at,tails.name as 'type_name',ts.tailoring_link_num,contacts.name AS 'contact_name',contacts.mobile AS 'contact_mobile'
                            FROM transactions_lines ts
                                INNER JOIN transactions s ON s.id=ts.transaction_id
                                LEFT JOIN tailoring_package tp ON tp.parent_id = ts.product_id
                                LEFT JOIN products ps ON ps.id = ts.product_id
                                LEFT JOIN tailoring_type tails ON (tails.id = tp.tailoring_type_id OR tails.id = ps.is_tailoring)
                                LEFT JOIN contacts ON contacts.id = s.contact_id
                                WHERE s.location_id = ? and LENGTH(ts.tailoring_txt) > 4
                                ORDER BY ts.id desc
                                LIMIT 10`, [shopId])
                            .then((rows: any, fields: any) => {
                                orders = rows[0]
                            })
                            .catch((err: QueryError) => {
                                redirection(403, con, res, 'Somthing Wrong...try Again')
                                return;
                            })

                        const _ext = await con.promise().query(`SELECT *
                            FROM tailoring_extra
                                WHERE tailoring_extra.location_id = ?`, [shopId])

                        extras = _ext[0]
                        //send headers
                        res.setHeader('Content-Type', 'application/json');
                        res.json({ success: true, msg: 'done!', data: { orders, extras } });
                        res.end();
                        con.end()
                        return;
                    }
                    if (subType == 'getFabric') {
                        const { fabricId, linkId } = req.body;
                        let orders: any = [], sqlCond = "", _id = 0;


                        if (fabricId != -1) {
                            sqlCond = "SELECT products.name,products.image FROM products WHERE id = ? limit 1";
                            _id = fabricId;
                        }
                        else if (linkId != -1) {
                            sqlCond = `SELECT products.name,products.image FROM products WHERE id = (
                                SELECT product_id FROM transactions_lines tl
                                    WHERE tl.tailoring_link_num = ?  AND tl.tailoring_txt is null) limit 1`;
                            _id = linkId;
                        }
                        else {
                            redirection(403, con, res, 'Somthing Wrong...try Again')
                            return;
                        }
                        await con.promise()
                            .query(sqlCond, [_id])
                            .then((rows: any, fields: any) => {
                                orders = rows[0]
                            })
                            .catch((err: QueryError) => {
                                redirection(403, con, res, 'Somthing Wrong...try Again')
                                return;
                            })

                        //send headers
                        res.setHeader('Content-Type', 'application/json');
                        res.json({ success: true, msg: 'done!', data: orders });
                        res.end();
                        con.end()
                        return;
                    }

                } else
                    redirection(403, con, res, 'you have not permissions')
            } else
                redirection(401, con, res, 'login first!')
        });

    } catch (err) {
        res.setHeader('Content-Type', 'application/json');
        console.log("errorr inja ", err);

        res.status(200).json({ success: false, msg: 'error2', newdata: [] });
        res.end();
    }



    /*
    
    */
}
