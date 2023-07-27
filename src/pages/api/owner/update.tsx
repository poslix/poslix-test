// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Data, ITokenVerfy } from "../../../models/common-model"
import { QueryError, RowDataPacket } from 'mysql2';
var { doConnect } = require('../../../libs/myConnection');
import { redirection, verifayTokens } from '../checkUtils'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {

    try {
        verifayTokens(req, async (repo: ITokenVerfy) => {
            if (repo.status === true) {
                const { shopId, subType } = req.body;
                console.log(shopId, repo.data.locs);

                if (subType == 'generalBusinessSettings') {
                    const { genSettings, data } = req.body;
                    var con = doConnect();
                    con.query(`UPDATE business SET name= ?,email_settings = ? WHERE id = ? and owner_id = ? limit 1`,
                        [genSettings.name, genSettings.email, data.businessId, repo.data.id],
                        function (err: QueryError, prods: RowDataPacket[]) {
                            if (err) {
                                res.setHeader('Content-Type', 'application/json');
                                res.status(200).json({ success: false, msg: 'error' + err, newdata: [] });
                                res.end();
                                con.end();
                                return;
                            } else {
                                res.setHeader('Content-Type', 'application/json');
                                res.status(200).json({ success: true, msg: 'settings is edited!' });
                                res.end();
                                con.end();
                                return;
                            }
                        });
                }
                else if (subType == 'locationBusinessSettings') {

                    const { locationSetting, data } = req.body;
                    var con = doConnect();
                    con.query(`UPDATE business_locations SET currency_id= ?,decimal_places = ?,name = ? WHERE id = ? and owner_id = ? limit 1`,
                        [locationSetting.currency_id, locationSetting.decimal_places, locationSetting.name, data.locationId, repo.data.id],
                        function (err: QueryError, prods: RowDataPacket[]) {
                            if (err) {
                                res.setHeader('Content-Type', 'application/json');
                                res.status(200).json({ success: false, msg: 'error', newdata: [] });
                                res.end();
                                con.end();
                            } else {
                                res.setHeader('Content-Type', 'application/json');
                                res.status(200).json({ success: true, msg: 'settings is edited!' });
                                res.end();
                                con.end();
                            }
                        });

                }

            } else
                redirection(401, con, res, 'login first!')
        });

    } catch (err) {
        res.setHeader('Content-Type', 'application/json');
        console.log("errorr inja ", err);
        res.status(200).json({ success: false, msg: 'error2', newdata: [] });
        res.end();
    }

}
