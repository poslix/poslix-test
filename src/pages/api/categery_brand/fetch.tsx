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
                    if (subType == 'initCateBrand') {
                        var con = doConnect();
                        const { id, type } = req.body;
                        var _taxs: any, _itm: any = [];
                        await con.promise().query(`SELECT id AS 'value', name AS 'label',amount
                        FROM tax_rates
                            WHERE  location_id = ? AND tax_type = 'group' ORDER BY id DESC;`, [shopId], function (err: QueryError, taxs: any) {
                        }).then((rows: any, fields: any) => {
                            _taxs = rows[0];
                        })
                            .catch()
                        await con.promise().query(`select * from ` + (type == 'category' ? 'categories' : 'brands') + ` where id = ? `, [id])
                            .then((rows: any, fields: any) => {
                                _itm = rows[0];
                            })
                            .catch()

                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).json({ success: true, msg: 'fetched!', newdata: { taxes: _taxs, itm: _itm } });
                        res.end();
                        con.end();
                        return;
                    }
                    else if (subType == 'getCatsAndBrands') {
                        var con = doConnect();
                        con.query(`SELECT categories.id,categories.name,tax_rates.name AS 'tax_name',categories.never_tax
                            FROM categories
                                LEFT JOIN tax_rates ON categories.tax_id = tax_rates.id
                                    WHERE categories.location_id = ? ORDER BY categories.id desc;`, [shopId], function (err: QueryError, cates: any) {
                            con.query(`SELECT brands.id,brands.name,tax_rates.name AS 'tax_name',brands.never_tax
                                    FROM brands
                                        LEFT JOIN tax_rates ON brands.tax_id = tax_rates.id
                                            WHERE brands.location_id = ? ORDER BY brands.id desc;`, [shopId], function (err: QueryError, brands: any) {

                                res.setHeader('Content-Type', 'application/json');
                                res.status(200).json({ success: true, msg: 'its done', newdata: { cates, brands } });
                                res.end();
                                con.end();
                                return;
                            });

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
