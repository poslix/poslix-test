import type { NextApiRequest, NextApiResponse } from 'next'
import { QueryError } from 'mysql2';
var { doConnect } = require('../../../libs/myConnection');
import { Data, ITokenVerfy } from '../../../models/common-model';
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
                    if (subType == 'insertPayment') {
                        const { data } = req.body;
                        var con = doConnect();
                        await con.promise().query(`DELETE FROM payment_method WHERE location_id = ?`,
                            [shopId])
                        for (let index = 0; index < data.length; index++) {
                            const method = data[index];
                            await con.promise().query(`INSERt INTO payment_method(name, location_id, enabled)
                                VALUES (?, ?, ?)`,
                                [method.name, shopId, method.enabled])
                        }
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).json({ success: true, msg: 'products submitted' });
                        res.end();
                        con.end();
                        return;
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
