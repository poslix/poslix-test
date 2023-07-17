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
                    var con = doConnectMulti();

                    if (subType == 'editPurchase') {

                        const { data } = req.body;
                        const { totalOrder, lines, expenses, taxes } = data;

                        let sqlInsertLines = 'INSERT INTO transactions_lines(transaction_id,product_id,variation_id,discount_type,discount_amount,qty,group_tax_id,cost_type,cost,price) VALUES ?'
                        let sqlValueLines: any = [];
                        lines.map(async (itm: any, idx: number) => {
                            if (itm.isNew)
                                sqlValueLines.push([totalOrder.id, itm.product_id, itm.variation_id, null, 0, itm.quantity, null, itm.costType, itm.cost, itm.price])
                            else {
                                await con.promise().query('UPDATE transactions_lines SET price = ?,cost = ?,cost_type = ?,qty = ? WHERE id = ?',
                                    [itm.price, itm.cost, itm.costType, itm.quantity, itm.trans_id])
                                    .then((rows: any, fields: any) => {
                                        console.log('lines ', rows)
                                    }).catch()
                            }
                        });
                        if (sqlValueLines.length > 0) {
                            await con.promise().query(sqlInsertLines, [sqlValueLines])
                                .then((rows: any, fields: any) => {
                                    console.log('lines ', rows)
                                }).catch()
                        }




                        await con.promise().query('UPDATE transaction_payments SET payment_type = ?,amount = ? WHERE id = ?',
                            [totalOrder.paymentType, totalOrder.paid_amount, totalOrder.payment_id])
                            .then((rows: any, fields: any) => {
                                console.log('update ', rows);
                            })
                            .catch()

                        con.query(`UPDATE transactions SET 
                        status = ?,payment_status = ?,contact_id = ?,invoice_no = ?,total_price = ?,exchange_rate = ?,total_taxes = ?,taxes = ?,currency_id = ?,created_at = ?
                                WHERE id=?`,
                            [totalOrder.purchaseStatus, totalOrder.paymentStatus, totalOrder.supplier_id, totalOrder.ref_no, totalOrder.total_price, totalOrder.currency_rate, totalOrder.total_tax, JSON.stringify(taxes), totalOrder.currency_id,
                            totalOrder.date.split('T')[0], totalOrder.id],
                            function (err: QueryError, prods: RowDataPacket[]) {
                                if (err) {
                                    console.log(err);

                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: false, msg: 'error' + err, newdata: [] });
                                    res.end();
                                } else {
                                    res.setHeader('Content-Type', 'application/json');
                                    console.log("ok edited...", prods);
                                    res.status(200).json({ success: true, msg: 'purchase info edited', newdata: [] });
                                    res.end();
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
        console.log("errorr inja ", err);

        res.status(200).json({ success: false, msg: 'error2', newdata: [] });
        res.end();
    }



    /*
    
    */
}
