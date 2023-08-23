// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Data, ITokenVerfy } from '../../../models/common-model';
import { QueryError } from 'mysql2';
var { doConnect } = require('../../../libs/myConnection');
import { redirection, verifayTokens } from '../checkUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { shopId, subType } = req.body;

        if (subType == 'getBusinessSettings') {
          var con = doConnect();
          con.query(
            `SELECT business.name,business.email_settings as 'email',business_types.name as 'business_type'
                                    FROM business 
                                        INNER JOIN business_types ON business_types.id = business.type_id
                                            WHERE business.owner_id = ? AND business.id = ?`,
            [repo.data.id, shopId],
            function (err: QueryError, genSettings: any) {
              con.query(
                `SELECT id,name,country,state,city,currency_id,decimal_places
                                        FROM business_locations
                                            WHERE owner_id = ? AND business_id = ?`,
                [repo.data.id, shopId],
                function (err: QueryError, locations: any) {
                  con.query(
                    `SELECT users.id as 'value',users.first_name as 'label',user_stuff.stuff,user_stuff.stuff_ids,user_stuff.location_id as 'locationId'
                                            FROM users
                                                INNER JOIN user_stuff ON user_stuff.user_id = users.id
                                                    WHERE users.owner_id = ?`,
                    [repo.data.id],
                    function (err: QueryError, users: any) {
                      con.query(
                        `SELECT users.id as 'value',users.first_name as 'label'
                                                FROM users WHERE users.owner_id = ?`,
                        [repo.data.id],
                        function (err: QueryError, allusers: any) {
                          con.query(
                            `SELECT id AS 'value',concat(country,' (',code,')') AS 'label' FROM currencies`,
                            function (err: QueryError, currencies: any) {
                              con.query(
                                `SELECT id AS 'value',name AS 'label' FROM stuffs where owner_id = ?`,
                                [repo.data.id],
                                function (err: QueryError, roles: any) {
                                  if (err) {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({ success: false, msg: 'error1' + err });
                                    res.end();
                                    con.end();
                                  } else {
                                    res.setHeader('Content-Type', 'application/json');
                                    res
                                      .status(200)
                                      .json({
                                        success: true,
                                        msg: 'its done',
                                        newdata: {
                                          general: genSettings,
                                          locations,
                                          users,
                                          allusers,
                                          currencies,
                                          roles,
                                        },
                                      });
                                    res.end();
                                    con.end();
                                  }
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
        if (subType == 'initAddLocation') {
          var con = doConnect();
          con.query(
            `SELECT id AS 'value',concat(country,' (',code,')') AS 'label',exchange_rate,symbol,code  FROM currencies`,
            [repo.data.id],
            function (err: QueryError, data: any) {
              if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: false, msg: 'error1' + err, newdata: [] });
                res.end();
                con.end();
                return;
              } else {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: true, msg: 'its done', newdata: data });
                res.end();
                con.end();
                return;
              }
            }
          );
        }
        if (subType == 'initAddBusiness') {
          var con = doConnect();
          con.query(
            `SELECT id AS 'value',concat(country,' (',code,')') AS 'label',exchange_rate,symbol,code FROM currencies`,
            [repo.data.id],
            function (err: QueryError, data: any) {
              if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: false, msg: 'error1' + err, newdata: [] });
                res.end();
                con.end();
                return;
              } else {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: true, msg: 'its done', newdata: data });
                res.end();
                con.end();
                return;
              }
            }
          );
        }
        if (subType == 'getUsersMyBusiness') {
          var con = doConnect();
          con.query(
            `SELECT id,first_name AS 'name',username,email,contact_number as 'mobile',password FROM users
                            WHERE users.owner_id = ?`,
            [repo.data.id],
            function (err: QueryError, myusers: any) {
              if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: false, msg: 'error1' + err });
                res.end();
                con.end();
                return;
              } else {
                res.setHeader('Content-Type', 'application/json');
                res
                  .status(200)
                  .json({ success: true, msg: 'its done', newdata: { myusers: myusers } });
                res.end();
                con.end();
                return;
              }
            }
          );
        }
        if (subType == 'getBusiness') {
          var con = doConnect();
          con.query(
            `SELECT business_locations.name AS 'loc_name',business_locations.state,business_locations.id AS 'loc_id',business.id AS 'business_id',business.name AS 'business_name'
                    ,business_types.name AS 'business_type'
                    FROM business_locations
                        inner JOIN business ON business_locations.business_id = business.id
                        inner JOIN business_types ON business_types.id = business.type_id
                            WHERE business.owner_id = ?`,
            [repo.data.id],
            function (err: QueryError, data: any) {
              if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: false, msg: 'error1' + err, newdata: [] });
                res.end();
                con.end();
              } else {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: true, msg: 'its done', newdata: data });
                res.end();
                con.end();
              }
            }
          );
        }
      } else redirection(401, con, res, 'login first!');
    });
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');

    res.status(200).json({ success: false, msg: 'error2', newdata: [] });
    res.end();
  }
}
