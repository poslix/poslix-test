// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
var con = require('../../libs/myConnection');
import { QueryError, RowDataPacket } from 'mysql2';

type Data = {
    success: boolean,
    msg: String
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    console.log(req.body);
    if (req.body.type == 'deleteProduct') {
        console.log("del for servver2");
        const { id } = req.body;
        con.query(`DELETE FROM products WHERE id = ?`,[id],
            function (err: QueryError, prods: RowDataPacket[]) {
                if (err) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).json({ success: false, msg: 'error' + err, });
                    res.end();
                } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).json({ success: true, msg: 'Product Deleted!' });
                    res.end();
                }

            });

    } else {
        res.status(400).json({ success: false, msg: 'bad reqeust' });
    }
}
