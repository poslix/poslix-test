// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Data, ITokenVerfy } from "../../../models/common-model"
import { QueryError, RowDataPacket } from 'mysql2';
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

                    if (subType == 'editExpense') {
                        const { data } = req.body;
                        var con = doConnect();
                        await con.promise()
                            .query(`update expenses_list set name = ?, amount = ? ,expense_id = ?,attach = ?,date = ? where location_id= ? and  id=?`,
                                [data.name, data.amount, data.expense_id, data.attach, data.date.split('T')[0], shopId, data.id])
                            .then((rows: any, fields: any) => {
                            })
                            .catch((err: QueryError) => {
                                console.log(err);

                            })

                        res.setHeader('Content-Type', 'application/json');
                        res.json({
                            success: true, msg: 'done!',
                        });
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
        res.status(200).json({ success: false, msg: 'error2', newdata: [] });
        res.end();
    }



    /*
    
    */
}
