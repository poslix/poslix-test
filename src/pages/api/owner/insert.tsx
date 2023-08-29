import type { NextApiRequest, NextApiResponse } from 'next';
import { QueryError, RowDataPacket } from 'mysql2';
var { doConnect } = require('../../../libs/myConnection');
import { ITax, Data, ITokenVerfy } from '../../../models/common-model';
import {
  generateAccessToken,
  getMessageByErrorCode,
  locationPermission,
  redirection,
  verifayTokens,
} from '../checkUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { subType, locationId } = req.body;
        if (subType == 'AddLocation') {
          var con = doConnect();
          const { data, businessId } = req.body;
          con.query(
            `insert into business_locations(business_id,owner_id,currency_id,name,state,decimal_places)
                            VALUES (?,?,?,?,?,?)`,
            [
              businessId,
              repo.data.id,
              data.currency_id,
              data.name,
              data.state,
              data.decimal_places,
            ],
            async function (err: QueryError, location: any) {
              if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: false, msg: 'products not inserted' });
                res.end();
                con.end();
                return;
              }

              //update token
              let _token: string = '';
              let _locas: any[] = repo.data.locs == undefined ? [] : repo.data.locs;
              _locas.push(location.insertId);
              let _current_type: any;
              await con
                .promise()
                .query(
                  `SELECT hash_id
                                FROM business_types
                                JOIN business
                                ON business_types.id = business.type_id
                                WHERE business.id = ?`,
                  [businessId]
                )
                .then((rows: any, fields: any) => {
                  _current_type = rows[0][0];
                });

              let _types = [...data.types, { id: location.insertId, type: _current_type.hash_id }];
              _token = generateAccessToken({
                id: repo.data.id,
                level: repo.data.level,
                locs: _locas,
                types: _types,
                rules: repo.data.rules!,
                oid: repo.data.oid?.toString(),
              });
              res.setHeader('Content-Type', 'application/json');
              res.status(200).json({ success: true, msg: 'new location added', newdata: _token });
              res.end();
              con.end();
              return;
            }
          );
        } else if (subType == 'createBusiness') {
          const { data } = req.body;
          var con = doConnect();
          con.query(
            `INSERT INTO business(name,type_id,owner_id,email_settings,sms_settings) VALUES (?,?,?,?,?)`,
            [data.name, data.business_type, repo.data.id, data.email, data.mobile],
            function (err: QueryError, reg: any) {
              if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: false, msg: 'error', newdata: [] });
                res.end();
                con.end();
                return;
              } else {
                con.query(
                  `insert into business_locations(business_id,owner_id,currency_id,name,state,decimal_places) VALUES (?,?,?,?,?,?)`,
                  [
                    reg.insertId,
                    repo.data.id,
                    data.country,
                    'default',
                    data.state,
                    data.decimal_places,
                  ],
                  async function (err: QueryError, location: any) {
                    if (err) return;

                    let _token: string = '';
                    let _locas: any[] = repo.data.locs == undefined ? [] : repo.data.locs;
                    let _current_type: any;
                    await con
                      .promise()
                      .query(
                        `SELECT id
                                            FROM business_types
                                            WHERE id = ?`,
                        [data.business_type]
                      )
                      .then((rows: any, fields: any) => {
                        _current_type = rows[0][0];
                      });
                    let _types = [
                      ...data.types,
                      { id: location.insertId, type: _current_type.hash_id },
                    ];

                    _locas.push(location.insertId);
                    _token = generateAccessToken({
                      id: repo.data.id,
                      level: repo.data.level,
                      locs: _locas,
                      types: _types,
                      rules: repo.data.rules!,
                      oid: repo.data.oid?.toString(),
                    });

                    res.setHeader('Content-Type', 'application/json');
                    res
                      .status(200)
                      .json({ success: true, msg: 'business created!', newdata: _token });
                    res.end();
                    con.end();
                    return;
                  }
                );
              }
            }
          );
        } else if (subType == 'addUpdatebusinessUsers') {
          const { data } = req.body;
          var con = doConnect();
          if (data.isNew) {
            let _hasSku = false;
            await con
              .promise()
              .query(`SELECT email FROM users WHERE email = ? LIMIT 1`, [data.email])
              .then((rows: any, fields: any) => {
                if (rows[0].length > 0) _hasSku = true;
              })
              .catch();

            if (_hasSku) {
              redirection(
                403,
                con,
                res,
                'The ' + data.email + ' Already Exist,Use Another One',
                100
              );
              return;
            }

            con.query(
              `INSERT INTO users(first_name,email,password,contact_number,owner_id) VALUES (?,?,?,?,?)`,
              [data.name, data.email, data.password, data.mobile, repo.data.id],
              function (err: QueryError, usertuff: any) {
                if (err) {
                  redirection(400, con, res, getMessageByErrorCode(err.errno || 0));
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({
                    success: true,
                    msg: 'record is added!',
                    data: usertuff.insertId,
                    userObject: {
                      isNew: true,
                      name: data.name,
                      username: data.username,
                      password: data.password,
                      mobile: '',
                      email: '',
                    },
                  });
                  res.end();
                  con.end();
                  return;
                }
              }
            );
          } else {
            let _mail = '',
              _isOke = true;
            await con
              .promise()
              .query(`SELECT email FROM users WHERE id = ? LIMIT 1`, [data.id])
              .then((rows: any, fields: any) => {
                if (rows[0].length > 0) {
                  _mail = rows[0][0]['email'];
                }
              })
              .catch();

            if (_mail != data.email) {
              await con
                .promise()
                .query(`SELECT email FROM users WHERE email = ? LIMIT 1`, [data.email])
                .then((rows: any, fields: any) => {
                  if (rows[0].length > 0) {
                    _isOke = false;
                  }
                })
                .catch();
            }
            if (!_isOke) {
              redirection(
                403,
                con,
                res,
                'The ' + data.email + ' Already Exist,Use Another One',
                100
              );
              return;
            }
            con.query(
              `update users set first_name = ?,email = ?,password = ?,contact_number = ? where id = ? and owner_id = ?`,
              [data.name, data.email, data.password, data.mobile, data.id, repo.data.id],
              function (err: QueryError, prods: RowDataPacket[]) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'error', newdata: [] });
                  res.end();
                  con.end();
                  return;
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res
                    .status(200)
                    .json({ success: true, msg: 'user is edited!', data: data.id, newdata: {} });
                  res.end();
                  con.end();
                  return;
                }
              }
            );
          }
        } else if (locationPermission(repo.data.locs, Number(locationId)) != -1) {
          if (subType == 'addupdateUserStuff') {
            const { businessId, data, isEdit } = req.body;
            var _userStuff = '';
            if (data.stuffs.length > 0) {
              data.stuffs.map((st: any) => {
                _userStuff += st.value + ',';
              });
            }
            var con = doConnect();
            if (!isEdit) {
              con.query(
                `INSERT INTO user_stuff(business_id,location_id,user_id,stuff_ids) VALUES (?,?,?,?)`,
                [businessId, locationId, data.user, _userStuff],
                function (err: QueryError, usertuff: any) {
                  if (err) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).json({ success: false, msg: 'error' + err, newdata: [] });
                    res.end();
                    con.end();
                    return;
                  } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).json({
                      success: true,
                      msg: 'record is added!',
                      newdata: {
                        value: data.user,
                        label: '',
                        stuff_ids: _userStuff,
                        locationId: locationId,
                      },
                    });
                    res.end();
                    con.end();
                    return;
                  }
                }
              );
            } else {
              con.query(
                `update user_stuff set stuff_ids = ? where user_id = ? and location_id = ? and business_id = ?`,
                [_userStuff, data.user, locationId, businessId],
                function (err: QueryError, prods: RowDataPacket[]) {
                  if (err) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).json({ success: false, msg: 'error' + err, newdata: [] });
                    res.end();
                    con.end();
                  } else {
                    res.setHeader('Content-Type', 'application/json');
                    res
                      .status(200)
                      .json({ success: true, msg: 'record is edited!', newdata: _userStuff });
                    res.end();
                    con.end();
                  }
                }
              );
            }
          }
        } else redirection(403, con, res, 'you have not permissions');
      } else redirection(401, con, res, 'login first!');
    });
  } catch (eer) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: false, msg: 'error' });
    res.end();
    return;
  }
}
