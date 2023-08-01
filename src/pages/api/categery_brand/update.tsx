// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Data, ITax, ITokenVerfy } from "../../../models/common-model"
import { QueryError, RowDataPacket } from 'mysql2';
var { doConnect, doConnectMulti } = require('../../../libs/myConnection');
import { locationPermission, redirection, verifayTokens } from '../checkUtils'

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
                console.log(shopId, repo.data.locs);

                if (locationPermission(repo.data.locs, shopId) != -1) {
                    var con = doConnect();

                    if (subType == 'edit_category') {

                        const { data } = req.body;
                        const { frmobj } = data;

                        let is_never = 0;
                        if (frmobj.tax == -1) {
                            frmobj.tax = 0;
                            is_never = 1;
                        }

                        con.query(`UPDATE categories SET 
                            name = ?,description = ?,tax_id = ?,never_tax = ?
                                WHERE id=?`,
                            [frmobj.name, frmobj.des, frmobj.tax, is_never, frmobj.id],
                            function (err: QueryError, prods: RowDataPacket[]) {
                                if (err) {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: false, msg: 'error' + err, newdata: [] });
                                    res.end();
                                    con.end();
                                } else {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: true, msg: 'record is edited!' });
                                    res.end();
                                    con.end();
                                }
                            });
                    }
                    else if (subType == 'edit_brand') {

                        const { data } = req.body;
                        const { frmobj } = data;

                        let is_never = 0;
                        if (frmobj.tax == -1) {
                            frmobj.tax = 0;
                            is_never = 1;
                        }
                        con.query(`UPDATE brands SET 
                            name = ?,description = ?,tax_id = ?,never_tax = ?
                                WHERE id=?`,
                            [frmobj.name, frmobj.des, frmobj.tax, is_never, frmobj.id],
                            function (err: QueryError, prods: RowDataPacket[]) {
                                if (err) {
                                    console.log(err);
                                    
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: false, msg: 'error' + err, newdata: [] });
                                    res.end();
                                    con.end();
                                } else {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: true, msg: 'record is edited!' });
                                    res.end();
                                    con.end();
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
        console.log("errorr inja ", err);

        res.status(200).json({ success: false, msg: 'error2', newdata: [] });
        res.end();
    }



    /*
    
    */
}
