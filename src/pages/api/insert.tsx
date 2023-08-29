// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { QueryError, RowDataPacket } from 'mysql2';
import { Data, ITokenVerfy } from '../../models/common-model';
var { doConnect } = require('../../libs/myConnection');
import { ITax } from '../../models/common-model';
import {
  getMessageByErrorCode,
  locationPermission,
  redirection,
  verifayTokens,
} from './checkUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    //register
    if (req.body.type == 'newRegister') {
      var con = doConnect();
      const { data } = req.body;
      con.query(
        `INSERT INTO users(user_type,first_name,business_type,email,contact_number,username,password,is_node_sms,is_security,is_sn,is_pwd) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        ['owner', data.name, 1, data.mail, data.phone, data.username, data.password, 0, 0, 0, 0],
        function (err: QueryError, reg: any) {
          if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ success: false, msg: 'error', newdata: [] });
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
    }
    if (req.body.type == 'userNewBusiness') {
      var con = doConnect();

      const { data } = req.body;
      con.query(
        `INSERT INTO business(name,currency_id,type_id,owner_id,stop_selling_before,weighing_scale_setting) VALUES (?,?,?,?,?,?)`,
        [data.name, 13, data.businesstype, data.id, 0, '0'],
        function (err: QueryError, reg: any) {
          if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ success: false, msg: 'error', newdata: [] });
            res.end();
            con.end();
            return;
          } else {
            con.query(
              `insert into business_locations(business_id,owner_id,name,country,city,state,zip_code,invoice_scheme_id,invoice_layout_id)
                            VALUES (?,?,?,?,?,?,?,?,?)`,
              [reg.insertId, data.id, 'default', 'oman', 'city', 'state', 'a', 0, 0],
              function (err: QueryError, prods: any) {
                if (err) res.setHeader('Content-Type', 'application/json');
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

    //pos
    if (req.body.type == 'customer') {
      var con = doConnect();
      con.query(
        `INSERT INTO contacts(business_id,location_id,type,first_name,last_name,mobile,city,state,country,address_line_1,address_line_2,zip_code,shipping_address,created_by,contact_type) 
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          59,
          1,
          'customer',
          req.body.data.firstName,
          req.body.data.lastName,
          req.body.data.mobile,
          req.body.data.city,
          req.body.data.state,
          req.body.data.country,
          req.body.data.addr1,
          req.body.data.addr2,
          req.body.data.zipCode,
          req.body.data.shipAddr,
          59,
          '0',
        ],
        function (err: QueryError, newCustomer: any) {
          if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ success: false, msg: 'error', newdata: [] });
            res.end();
            con.end();
            return;
          } else {
            var newOne = {
              value: newCustomer.insertId,
              label: req.body.data.firstName + ' | ' + req.body.data.mobile,
              mobile: req.body.data.mobile,
            };
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ success: true, msg: 'done!', newdata: newOne });
            res.end();
            con.end();
            return;
          }
        }
      );
    }
    if (req.body.type == 'transaction') {
      var con = doConnect();

      const { data } = req.body;
      const { items, details } = data;
      if (details.isReturn == 0) {
        //new Order
        con.query(
          `INSERT INTO transactions(business_id,contact_id,final_total,STATUS,transaction_date,expired_product_return_total_price,created_by) VALUES (?,?,?,?,?,?,?)`,
          [4, details.customerId, details.totalAmount, 'customer', new Date(), 0, 4],
          function (err: QueryError, prods: any) {
            if (err) {
              res.setHeader('Content-Type', 'application/json');
              res.status(200).json({ success: false, msg: 'error', newdata: [] });
              res.end();
              con.end();
              throw err;
            } else {
              const sqlCondi =
                'INSERT INTO transaction_sell_lines(transaction_id,product_id,variation_id,quantity,unit_price,item_tax,expired_product_return_qty,expired_product_return_unit_price,expired_product_return_total_price,expired_product_return_sell_line_note) VALUES ?';
              const sqlValues: any = [];
              items.orders.map((elt: any, idx: number) => {
                sqlValues.push([
                  prods.insertId,
                  elt.id,
                  elt.id,
                  items.quantity[idx].quantity,
                  Number(elt.price),
                  0.0,
                  0.0,
                  0.0,
                  0.0,
                  '0',
                ]);
              });
              con.query(
                sqlCondi,
                [sqlValues],
                function (err: QueryError, transLine: RowDataPacket[]) {
                  if (err) throw err;
                  if (err) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).json({ success: false, msg: 'error', newdata: [] });
                    res.end();
                    con.end();
                    return;
                  } else {
                    res
                      .status(200)
                      .json({ success: true, msg: 'transaction is created', newdata: [] });
                    res.end();
                    con.end();
                    return;
                  }
                }
              );
            }
          }
        );
      } else {
        //update factor details
        await con
          .promise()
          .query(`UPDATE transactions SET final_total = ?, sub_type= ? WHERE id = ? limit 1`, [
            details.totalAmount,
            'sell_return',
            details.isReturn,
          ])
          .then((rows: any, fields: any) => {})
          .catch();

        //updated exist items
        for (let idx = 0; idx < items.orders.length; idx++) {
          let sqlCondi = '';
          let sqlValues: any = [];
          if (items.orders[idx].isEdit) {
            if (items.quantity[idx].quantity == 0) {
              //full return
              sqlValues = [];
              sqlCondi = `update transaction_sell_lines set quantity = ?, quantity_returned = ? where product_id = ? and transaction_id = ?`;
              sqlValues.push([
                0,
                items.orders[idx].quantity,
                items.orders[idx].id,
                details.isReturn,
              ]);
            } else if (items.quantity[idx].quantity > items.orders[idx].quantity) {
              //increase Qty
              sqlValues = [];
              sqlCondi = `update transaction_sell_lines set quantity = ? where product_id = ? and transaction_id = ?`;
              sqlValues.push([
                items.quantity[idx].quantity,
                items.orders[idx].id,
                details.isReturn,
              ]);
            } else {
              //decrease Qty
              sqlValues = [];
              sqlCondi = `update transaction_sell_lines set quantity = ?,quantity_returned=? where product_id = ? and transaction_id = ?`;
              sqlValues.push([
                items.quantity[idx].quantity,
                items.orders[idx].quantity - items.quantity[idx].quantity,
                items.orders[idx].id,
                details.isReturn,
              ]);
            }

            await con
              .promise()
              .query(sqlCondi, sqlValues[0])
              .then((rows: any, fields: any) => {})
              .catch();
          }
        }

        //insert added items
        const sqlCondi =
          'INSERT INTO transaction_sell_lines(transaction_id,product_id,variation_id,quantity,unit_price,item_tax,expired_product_return_qty,expired_product_return_unit_price,expired_product_return_total_price,expired_product_return_sell_line_note) VALUES ?';
        const sqlValues: any = [];
        items.orders.map((elt: any, idx: number) => {
          if (!elt.isEdit)
            sqlValues.push([
              details.isReturn,
              elt.id,
              elt.id,
              items.quantity[idx].quantity,
              Number(elt.price),
              0.0,
              0.0,
              0.0,
              0.0,
              '0',
            ]);
        });

        if (sqlValues.length == 0) {
          res.status(200).json({ success: true, msg: 'transaction is updated', newdata: [] });
          res.end();
          con.end();
          return;
        }

        con.query(sqlCondi, [sqlValues], function (err: QueryError, transLine: RowDataPacket[]) {
          if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ success: false, msg: 'error', newdata: [] });
            res.end();
            con.end();
            throw err;
          } else {
            res.status(200).json({ success: true, msg: 'transaction is updated', newdata: [] });
            res.end();
            con.end();
            return;
          }
        });
      }
    }
    if (req.body.type == 'openRegister') {
      var con = doConnect();

      const { data } = req.body;
      con.query(
        `INSERT INTO cash_registers(business_id,location_id,user_id,status,closing_amount) VALUES (?,?,?,?,?)`,
        [59, 6, 1, 'open', data],
        function (err: QueryError, prods: any) {
          if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ success: false, msg: 'error', newdata: [] });
            res.end();
            con.end();
            throw err;
          } else {
            res.status(200).json({ success: true, msg: 'transaction is created', newdata: [] });
            res.end();
            con.end();
            return;
          }
        }
      );
    }

    //dashboad
    if (req.body.type == 'addLocation') {
      const { data } = req.body;

      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          var con = doConnect();
          con.query(
            `insert into business_locations(business_id,owner_id,name,country,state,city,zip_code,invoice_scheme_id,invoice_layout_id)
                            VALUES (?,?,?,?,?,?,?,?,?)`,
            [
              data.business_id,
              repo.data.id,
              data.name,
              data.country,
              data.city,
              data.state,
              'a',
              0,
              0,
            ],
            function (err: QueryError, prods: any) {
              if (err) res.setHeader('Content-Type', 'application/json');
              res.status(200).json({ success: true, msg: 'location inserted' });
              res.end();
              con.end();
              return;
            }
          );
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.status(200).json({ success: false, msg: 'login first!', newdata: [] });
          res.end();
          return;
        }
      });
    }

    if (req.body.type == 'createBusiness') {
      const { data } = req.body;

      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          var con = doConnect();
          con.query(
            `INSERT INTO business(name,currency_id,type_id,owner_id,stop_selling_before,weighing_scale_setting) VALUES (?,?,?,?,?,?)`,
            [data.name, 13, data.business_type, repo.data.id, 0, '0'],
            function (err: QueryError, reg: any) {
              if (err) {
              }
              con.query(
                `insert into business_locations(business_id,owner_id,name,country,city,state,zip_code,invoice_scheme_id,invoice_layout_id)
                            VALUES (?,?,?,?,?,?,?,?,?)`,
                [
                  reg.insertId,
                  repo.data.id,
                  'default',
                  data.country,
                  data.city,
                  data.state,
                  'a',
                  0,
                  0,
                ],
                function (err: QueryError, prods: any) {
                  if (err) res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: true, msg: 'business created!' });
                  res.end();
                  con.end();
                  return;
                }
              );
            }
          );
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.status(200).json({ success: false, msg: 'login first!', newdata: [] });
          res.end();
          return;
        }
      });
    }

    if (req.body.type == 'addupdateUserStuff') {
      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          const { businessId, locationId, data, isEdit } = req.body;

          if (locationPermission(repo.data.locs, Number(locationId)) != -1) {
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
          } else redirection(403, con, res, 'you have not permissions');
        } else redirection(401, con, res, 'login first!');
      });
    }
    if (req.body.type == 'addUpdatebusinessUsers') {
      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          const { data } = req.body;

          var con = doConnect();
          if (data.isNew) {
            con.query(
              `INSERT INTO users(first_name,username,password,contact_number,owner_id,business_type,is_node_sms,is_security,is_sn,is_pwd) VALUES (?,?,?,?,?,?,?,?,?,?)`,
              [
                data.name,
                data.username,
                data.password,
                data.mobile,
                repo.data.id,
                '-1',
                0,
                0,
                0,
                0,
              ],
              function (err: QueryError, usertuff: any) {
                if (err) {
                  redirection(400, con, res, getMessageByErrorCode(err.errno || 0));
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({
                    success: true,
                    msg: 'record is added!',
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
            con.query(
              `update user_stuff set stuff = ? where user_id = ? and location_id = ? and business_id = ?`,
              ['_userStuff', data.user, 'locationId', 'businessId'],
              function (err: QueryError, prods: RowDataPacket[]) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'error' + err, newdata: [] });
                  res.end();
                  con.end();
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: true, msg: 'record is edited!', newdata: {} });
                  res.end();
                  con.end();
                }
              }
            );
          }
        } else redirection(401, con, res, 'login first!');
      });
    }

    if (req.body.type == 'addUpdatebusinessRoles') {
      await verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          const { data, pages } = req.body.data;
          var _stuff = '';
          pages.map((pg: any) => {
            pg.stuffs.map((stuff: any) => {
              if (stuff.isChoose) _stuff += pg.value + '/' + stuff.value + ',';
            });
          });
          _stuff = _stuff.toLowerCase();
          var con = doConnect();
          if (data.isNew) {
            con.query(
              `INSERT INTO stuffs(owner_id,name,stuff) VALUES (?,?,?)`,
              [repo.data.id, data.name, _stuff],
              function (err: QueryError, newrole: any) {
                if (err) {
                  redirection(400, con, res, getMessageByErrorCode(err.errno || 0));
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({
                    success: true,
                    msg: 'record is added!',
                    newdata: { id: newrole.insertId, name: data.name, stuff: _stuff },
                  });
                  res.end();
                  con.end();
                  return;
                }
              }
            );
          } else {
            con.query(
              `update stuffs set name = ?, stuff = ? where id = ? and owner_id = ?`,
              [data.name, _stuff, data.id, repo.data.id],
              function (err: QueryError, prods: RowDataPacket[]) {
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
                    msg: 'record is edited!',
                    newdata: { stuff: _stuff, name: data.name },
                  });
                  res.end();
                  con.end();
                  return;
                }
              }
            );
          }
          return;
        } else redirection(401, con, res, 'login first!');
      });
      return;
    }

    if (req.body.type == 'insertPurchase') {
      const { data } = req.body;
      const { sup, lines, expenses } = data;

      //Insert Purchase
      var con = doConnect();
      con.query(
        `insert into transactions(business_id,location_id,contact_id,tax_id,total_before_tax,final_total,tax_amount,tax_selected,shipping_charges,shipping_details,status,type,ref_no,payment_status,transaction_date,created_by,expired_product_return_total_price)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          59,
          sup.location_id,
          sup.supplier_id,
          sup.taxs,
          sup.subTotal_price,
          sup.total_price + sup.total_expense,
          0,
          'non',
          sup.total_expense,
          JSON.stringify(expenses),
          'received',
          'purchase',
          sup.ref_no,
          'paid',
          sup.date.toString().slice(0, 10),
          59,
          0,
        ],
        function (err: QueryError, trans: any) {
          //Product lines

          const sqlCondi =
            'INSERT INTO purchase_lines(transaction_id,product_id,variation_id,cost_price,quantity,item_tax,sell_price) VALUES ?';
          const sqlValues: any = [];
          lines.map((itm: any, idx: number) => {
            sqlValues.push([trans.insertId, itm.id, itm.id, itm.cost, itm.quantity, 0, itm.price]);
          });
          con.query(sqlCondi, [sqlValues], function (err: QueryError, prods: RowDataPacket[]) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ success: true, msg: 'purchase inserted' });
            res.end();
            con.end();
            return;
          });
        }
      );
    }

    if (req.body.type == 'insetUpdateExpenes') {
      verifayTokens(req, async (repo: ITokenVerfy) => {
        if (repo.status === true) {
          const { businessId } = req.body;
          if (locationPermission(repo.data.locs, businessId) != -1) {
            const { data } = req.body;

            if (data.length == 0) {
              redirection(400, con, res, 'somthing wrong');
              return;
            }

            const sqlCondi = 'INSERT INTO expenses(business_id,name) VALUES ?';
            const sqlValues: any = [];
            data.map((itm: ITax) => {
              if (itm.isNew && itm.name.length > 1) sqlValues.push([businessId, itm.name]);
            });

            var con = doConnect();
            if (sqlValues.length) {
              await con
                .promise()
                .query(sqlCondi, [sqlValues])
                .then((rows: any, fields: any) => {})
                .catch();
            }

            for (let idx = 0; idx < data.length; idx++) {
              if (!data[idx].isNew && data[idx].name.length > 1) {
                con
                  .promise()
                  .query('UPDATE expenses SET name = ? WHERE id = ?', [
                    data[idx].name,
                    data[idx].id,
                  ])
                  .then((rows: any, fields: any) => {})
                  .catch();
              }
            }
            con.end();
            res.status(200).json({ success: true, msg: 'expenses Inserted' });
            res.end();
          } else redirection(403, con, res, 'you have not permissions');
        } else redirection(401, con, res, 'login first!');
      });
    }

    if (req.body.type == 'insetUpdatePrimaryTax') {
      verifayTokens(req, async (repo: ITokenVerfy) => {
        if (repo.status === true) {
          const { businessId } = req.body;
          if (locationPermission(repo.data.locs, businessId) != -1) {
            const { data } = req.body;

            if (data.length == 0) {
              redirection(400, con, res, 'somthing wrong');
              return;
            }

            const sqlCondi =
              'INSERT INTO tax_rates(business_id,name,amount,created_by,type,is_primary,tax_type) VALUES ?';
            const sqlValues: any = [];
            data.map((itm: ITax, idx: number) => {
              if (itm.isNew && itm.name.length > 1)
                sqlValues.push([
                  businessId,
                  itm.name,
                  Number(itm.amount),
                  repo.data.id,
                  itm.tax_type != 'service' ? 'percentage' : itm.type,
                  itm.is_primary,
                  itm.tax_type,
                ]);
            });

            var con = doConnect();
            if (sqlValues.length) {
              await con
                .promise()
                .query(sqlCondi, [sqlValues])
                .then((rows: any, fields: any) => {})
                .catch();
            }

            for (let idx = 0; idx < data.length; idx++) {
              if (!data[idx].isNew && data[idx].name.length > 1) {
                con
                  .promise()
                  .query(
                    'UPDATE tax_rates SET name = ?, amount = ?, is_primary = ?, type = ? WHERE id = ?',
                    [
                      data[idx].name,
                      data[idx].amount,
                      data[idx].is_primary,
                      data[idx].type,
                      data[idx].id,
                    ]
                  )
                  .then((rows: any, fields: any) => {})
                  .catch();
              }
            }

            con.end();
            res.status(200).json({ success: true, msg: 'Taxes Inserted 2' });
            res.end();
          } else redirection(403, con, res, 'you have not permissions');
        } else redirection(401, con, res, 'login first!');
      });
      return;
    }

    if (req.body.type == 'insertGroupTax') {
      verifayTokens(req, async (repo: ITokenVerfy) => {
        if (repo.status === true) {
          const { businessId } = req.body;
          if (locationPermission(repo.data.locs, businessId) != -1) {
            const { data, groupName, isDefault } = req.body;
            var con = doConnect();
            if (isDefault) {
              await con
                .promise()
                .query('UPDATE tax_rates SET is_primary = ? WHERE tax_type = ?', [0, 'group'])
                .then((rows: any, fields: any) => {})
                .catch();
            }
            con.query(
              `INSERT INTO tax_rates(business_id,name,amount,created_by,type,is_primary,tax_type) VALUES (?,?,?,?,?,?,?)`,
              [businessId, groupName, 0, repo.data.id, 'percentage', isDefault, 'group'],
              function (err: QueryError, prov: any) {
                if (err) {
                  return;
                }
                const sqlCondi = 'INSERT INTO tax_group(business_id,parent_id,tax_id) VALUES ?';
                const sqlValues: any = [];
                data.map((itm: any, idx: number) => {
                  if (itm.isChoosed) sqlValues.push([businessId, prov.insertId, itm.id]);
                });

                con.query(
                  sqlCondi,
                  [sqlValues],
                  function (err: QueryError, prods: RowDataPacket[]) {
                    res.setHeader('Content-Type', 'application/json');
                    res
                      .status(200)
                      .json({ success: true, msg: 'products inserted', data: prov.insertId });
                    res.end();
                    con.end();
                    return;
                  }
                );
              }
            );
          }
        }
      });
    }

    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { data } = req.body;
        if (locationPermission(repo.data.locs, data.shopId) != -1) {
          //start cover sec
          if (req.body.type == 'insert_category') {
            const { frmobj, shopId } = data;

            var con = doConnect();
            con.query(
              `INSERT INTO categories(name,business_id,location_id,parent_id,tax_id,created_by,description) VALUES (?,?,?,?,?,?,?)`,
              [frmobj.name, 1, shopId, 0, frmobj.tax, repo.data.id, frmobj.des],
              function (err: QueryError, prov: any) {
                if (err) {
                  redirection(503, con, res, err.message);
                  return;
                }
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: true, msg: 'category inserted' });
                res.end();
                con.end();
                return;
              }
            );
          }

          if (req.body.type == 'insert_brand') {
            const { data } = req.body;
            const { frmobj, shopId } = data;
            var con = doConnect();
            con.query(
              `INSERT INTO brands(name,business_id,location_id,tax_id,created_by,description) VALUES (?,?,?,?,?,?)`,
              [frmobj.name, 1, shopId, frmobj.tax, repo.data.id, frmobj.des],
              function (err: QueryError, prov: any) {
                if (err) console.log(err);

                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: true, msg: 'products inserted' });
                res.end();
                con.end();
                return;
              }
            );
          }

          if (req.body.type == 'insertProducts') {
            const { fdata, img } = data;

            var con = doConnect();
            con.query(
              `insert into products(name,subproductname,location_id,image,tax,sku,barcode_type, unit_id, brand_id,category_id,alert_quantity,created_by,cost_price,sell_price)
                                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
              [
                fdata.productName,
                fdata.productName2,
                data.shopId,
                img,
                fdata.tax_id,
                fdata.sku,
                fdata.barcodeType,
                fdata.unit,
                fdata.brand,
                fdata.cat,
                fdata.alertQuantity,
                repo.data.id,
                fdata.purchasePrice,
                fdata.sellPrice,
              ],
              function (err: QueryError, prods: any) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: true, msg: 'products inserted' });
                res.end();
                con.end();
                return;
              }
            );
          }

          if (req.body.type == 'transactionSale') {
            var con = doConnect();
            // const { data } = req.body;
            const { items, details } = data;
            //new Order

            con.query(
              `INSERT INTO transactions(business_id,contact_id,final_total,STATUS,transaction_date,expired_product_return_total_price,created_by,type,invoice_no,location_id) VALUES (?,?,?,?,?,?,?,?,?,?)`,
              [
                59,
                details.customerId,
                details.totalAmount,
                'customer',
                new Date(),
                0,
                4,
                'sell',
                1001,
                details.location_id,
              ],
              function (err: QueryError, prods: any) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'error', newdata: [] });
                  res.end();
                  con.end();
                  throw err;
                } else {
                  for (let i = 0; i < items.orders.length; i++) {
                    con.query(
                      `INSERT INTO transaction_sell_lines(transaction_id,product_id,variation_id,quantity,unit_price,item_tax,expired_product_return_qty,expired_product_return_unit_price,expired_product_return_total_price,expired_product_return_sell_line_note) 
                                            VALUES (?,?,?,?,?,?,?,?,?,?)`,
                      [
                        prods.insertId,
                        items.orders[i].id,
                        items.orders[i].id,
                        items.orders[i].quantity,
                        items.orders[i].price,
                        0,
                        0,
                        0,
                        0,
                        '0',
                      ],
                      function (err: QueryError, prods: any) {
                        if (err) throw err;
                        if (err) {
                          res.setHeader('Content-Type', 'application/json');
                          res.status(200).json({ success: false, msg: 'error', newdata: [] });
                          res.end();
                          con.end();
                          return;
                        } else {
                          res
                            .status(200)
                            .json({ success: true, msg: 'Transaction is created', newdata: [] });
                          res.end();
                          con.end();
                          return;
                        }
                      }
                    );
                  }
                }
              }
            );
          }
          //end
        } else {
          redirection(403, con, res, 'you have not permissions');
        }
      } else redirection(401, con, res, 'login first!');
    });
  } catch (eer) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: false, msg: 'error2' });
    res.end();
    return;
  }

  /*
    
    */
}
