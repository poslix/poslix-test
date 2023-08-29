// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { QueryError, RowDataPacket } from 'mysql2';
var { doConnect } = require('../../../libs/myConnection');
import { ITax, Data, ITokenVerfy } from '../../../models/common-model';
import {
  escapeData,
  generateRandomString,
  locationPermission,
  redirection,
  verifayTokens,
  _validateEmail,
  _validateName,
  _validatePassword,
} from '../checkUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    const { subType } = req.body;
    if (subType == 'newRegister') {
      let { data } = req.body;
      data = escapeData(data);
      if (!_validateEmail(data.mail)) {
        redirection(400, null, res, 'Please Enter Valid Email Address');
        return;
      }
      if (!_validateName(data.name)) {
        redirection(400, null, res, 'Please Enter Valid Name');
        return;
      }
      if (
        data.name.trim().length == 0 ||
        data.phone.trim().length == 0 ||
        data.password.trim().length == 0
      ) {
        redirection(400, null, res, 'Please Data InCompelete!');
        return;
      }

      var con = doConnect();
      //check email address is exists or not
      await con
        .promise()
        .query(
          `SELECT id
                    FROM users
                    WHERE email = ?`,
          [data.mail]
        )
        .then((rows: any, fields: any) => {
          if (rows[0].length > 0) {
            redirection(400, con, res, 'The entered email address is already in use');
            return;
          }
        })
        .catch((err: QueryError) => {
          redirection(400, con, res, err.message);
          return;
        });

      const uname = generateRandomString();
      const _username =
        uname + Math.floor(Math.random() * (10 ** 4 - 10 ** (4 - 1)) + 10 ** (4 - 1));
      con.query(
        `INSERT INTO users(user_type,first_name,email,contact_number,password,username) VALUES (?,?,?,?,?,?)`,
        ['owner', data.name, data.mail, data.phone, data.password, _username],
        function (err: QueryError, reg: any) {
          if (err) {
            res.setHeader('Content-Type', 'application/json');
            res
              .status(200)
              .json({ success: false, msg: 'An error occurred, try again', newdata: [] });
            res.end();
            con.end();
            throw err;
          } else {
            res
              .status(200)
              .json({ success: true, msg: 'register is done!', newdata: { id: reg.insertId } });
            res.end();
            con.end();
            return;
          }
        }
      );
    } else if (subType == 'userNewBusiness') {
      var con = doConnect();

      const { data } = req.body;

      con.query(
        `INSERT INTO business(name,type_id,owner_id) VALUES (?,?,?)`,
        [data.name, data.businesstype, data.id],
        function (err: QueryError, reg: any) {
          if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ success: false, msg: 'error', newdata: [] });
            res.end();
            con.end();
            return;
          } else {
            con.query(
              `insert into business_locations(business_id,owner_id,name,country,currency_id,decimal_places)
                            VALUES (?,?,?,?,?,?)`,
              [reg.insertId, data.id, 'default', 'oman', 90, 3],
              function (err: QueryError, prods: any) {
                if (err) console.log(err);

                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: true, msg: 'business created!' });
                res.end();
                con.end();
                return;
              }
            );
          }
        }
      );
    }
  } catch (eer) {
    return;
  }
}
