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
                    if (subType == 'editCustomerInfo') {
                        const { data } = req.body;
                        console.log('data',data);
                        var con = doConnect();
                        con.query(`UPDATE contacts SET first_name = ?,last_name = ?,mobile = ?,city = ?,state = ?,country = ?,address_line_1 = ?,address_line_2 = ?,zip_code = ?,shipping_address = ? WHERE id=?`,
                            [data.firstName, data.lastName, data.mobile, data.city, data.state, data.country, data.addr1, data.addr2, data.zipCode, data.shipAddr, data.id],
                            function (err: QueryError, prods: RowDataPacket[]) {
                                if (err) {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: false, msg: 'error' , newdata: [] });
                                    res.end();
                                    con.end();
                                    return;
                                } else {
                                    res.setHeader('Content-Type', 'application/json');
                                    const newOne = { id: data.id, firstName: data.firstName, mobile: data.mobile }
                                    res.status(200).json({ success: true, msg: 'customer info edited', newdata: newOne });
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



    /*
    
    */
}
