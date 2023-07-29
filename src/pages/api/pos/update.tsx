// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Data, ITokenVerfy } from "../../../models/common-model"
import { QueryError } from 'mysql2';
var { doConnect } = require('../../../libs/myConnection');
import { areNumbers, locationPermission, redirection, verifayTokens } from '../checkUtils'
import { incorrectInput } from '../utils/data';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    try {
        verifayTokens(req, async (repo: ITokenVerfy) => {
            if (repo.status === true) {
                const { shopId, subType } = req.body;
                if (!areNumbers([shopId])) {
                    redirection(403, null, res, incorrectInput)
                    return;
                }
                if (locationPermission(repo.data.locs, shopId) != -1) {
                    if (subType == 'EditAppearance') {
                        const { data } = req.body;
                        const { formObj, url } = data;
                        if (url.length > 3)
                            formObj.logo = url;
                        var con = doConnect();
                        await con.promise()
                            .query(`update business_locations set invoice_details = ? where id = ? and  owner_id = ?`,
                                [JSON.stringify(formObj), shopId, Number(repo.data.oid!) > 0 ? repo.data.oid! : repo.data.id])
                            .then((rows: any, fields: any) => {
                            })
                            .catch((err: QueryError) => {
                                console.log(err);
                                redirection(403, con, res, 'Somthing is wrong!!')
                                return;
                            })

                        res.setHeader('Content-Type', 'application/json');
                        res.json({ success: true, msg: 'done!', });
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
