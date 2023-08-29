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
                    if (subType == 'getPayments') {
                        var con = doConnect();
                        con.query(`SELECT name, enabled
                            FROM payment_method
                            WHERE location_id = ?`, [shopId],
                            function (err: QueryError, payments: any) {
                                if (err) {
                                    redirection(401, con, res, 'error fetching...' + err.message)
                                } else {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: true, msg: 'its done', data: { payments } });
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
        return;
    }
}
