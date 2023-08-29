// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Data, ITax, ITokenVerfy } from '../../models/common-model';
import { QueryError, RowDataPacket } from 'mysql2';
var { doConnect, doConnectMulti } = require('../../libs/myConnection');
import { groupCalculation } from '../../libs/calculationTax';
import { keyValueRules, locationPermission, redirection, verifayTokens } from './checkUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    if (req.body.fetch === 'checkwt') {
      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          repo.data.rules = keyValueRules(repo.data.rules || []);
          res.setHeader('Content-Type', 'application/json');
          res.status(200).json({ success: true, msg: 'its ok', newdata: repo.data });
          res.end();
          return;
        } else redirection(403, con, res, 'you have not permissions');
      });
      return;
    }

    if (req.body.fetch == 'getPosData') {
      var con = doConnect();
      const bId = 59;
      //get products
      con.query(
        `SELECT
            products.id,variations.id AS 'varId',products.sku,variations.default_sell_price AS 'price',products.tax AS 'product_tax',
            categories.tax_id AS 'category_tax',
            brands.tax_id AS 'brand_tax',
            products.name,products.image,products.business_id,products.brand_id,products.category_id,IF(products.tax > 0 or categories.tax_id > 0 or brands.tax_id > 0 ,false, TRUE) AS 'def_tax'
            FROM products
                INNER JOIN variations ON variations.id = products.id
                INNER JOIN categories ON categories.id = products.category_id
                INNER JOIN brands ON brands.id = products.brand_id
                    where length(image) > 3 And products.business_id = ? 
                            LIMIT 500`,
        [bId],
        function (err: QueryError, prods: RowDataPacket[]) {
          if (err) throw err;
          //get catgories
          con.query(
            `SELECT categories.id,categories.name 
                            FROM categories
                                WHERE categories.business_id = ?`,
            [bId],
            function (err: QueryError, cats: RowDataPacket[]) {
              if (err) throw err;
              //get brands
              con.query(
                `SELECT brands.id,brands.name 
                                FROM brands
                                    WHERE brands.business_id = ?`,
                [bId],
                function (err: QueryError, brands: RowDataPacket[]) {
                  if (err) throw err;
                  //get contacts
                  con.query(
                    `SELECT contacts.id as 'value',CONCAT_WS(' | ',CONCAT_WS(' ',contacts.first_name,contacts.last_name),contacts.mobile) AS 'label',contacts.mobile
                                    FROM contacts
                                        WHERE contacts.business_id = ? AND contacts.type = 'customer' ORDER BY RAND()`,
                    [bId],
                    function (err: QueryError, custo: RowDataPacket[]) {
                      if (err) throw err;
                      //get group default Tax if has
                      con.query(
                        `SELECT id,name,amount,type AS 'amountType',tax_type as 'taxType',is_primary as 'isPrimary'
                                FROM tax_rates 
                                    WHERE id IN ((SELECT tax_id FROM tax_group 
                                            WHERE parent_id = (SELECT id FROM tax_rates where business_id = ? AND is_primary = 1 AND tax_type ='group')));`,
                        [bId],
                        function (err: QueryError, taxes: RowDataPacket[]) {
                          if (err) throw err;
                          //
                          con.query(
                            `SELECT tax_rates.id,tax_rates.name,tax_rates.amount,tax_rates.tax_type as 'taxType', tax_rates.is_primary as'isPrimary',tax_rates.type AS 'amountType',p.parent_id as 'parentId' FROM tax_rates
                                    INNER JOIN (SELECT tax_id,parent_id,business_id FROM tax_group where business_id = ?) AS p ON p.tax_id=tax_rates.id
                                        WHERE p.business_id = ?`,
                            [bId, bId],
                            function (err: QueryError, taxGroup: ITax[]) {
                              if (err) throw err;
                              var readTaxGroup = groupCalculation(taxGroup);

                              con.query(
                                `SELECT id,status,closing_amount FROM cash_registers WHERE user_id = 1 ORDER BY id desc LIMIT 1`,
                                [bId, bId],
                                function (err: QueryError, cash: ITax[]) {
                                  if (err) throw err;

                                  res.setHeader('Content-Type', 'application/json');
                                  res.json({
                                    success: true,
                                    msg: 'done!',
                                    data: {
                                      prods: prods,
                                      cats: cats,
                                      brands: brands,
                                      customers: custo,
                                      taxes: taxes,
                                      tax_group: readTaxGroup,
                                      cash: cash,
                                    },
                                  });
                                  res.end();
                                  con.end();
                                  return;
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
      );
    }
    if (req.body.fetch == 'getCustomerInfo') {
      var con = doConnect();
      con.query(
        `SELECT id,first_name,last_name,city,state,country,address_line_1 AS 'addr1',address_line_2 AS 'addr2' ,mobile,country,zip_code,shipping_address
            FROM contacts
                WHERE id = ?`,
        [req.body.recordId],
        function (err: QueryError, prods: RowDataPacket[]) {
          if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ success: false, msg: 'error', newdata: [] });
            res.end();
            con.end();
            return;
          } else {
            res.setHeader('Content-Type', 'application/json');

            res.status(200).json({ success: true, msg: 'done!', newdata: prods });
            res.end();
            con.end();
            return;
          }
        }
      );
    }

    if (req.body.fetch == 'getLastOrders') {
      var con = doConnect();
      const getAll = `SELECT 
                transactions.id,CONCAT_WS(' ',contacts.first_name,contacts.last_name) AS 'name',contacts.id AS 'customer_id',transactions.business_id,transactions.final_total,transactions.status,transactions.transaction_date,transactions.expired_product_return_total_price,transactions.created_by 
                    FROM transactions 
                        INNER JOIN contacts ON transactions.contact_id = contacts.id
                            WHERE Length(contacts.first_name)>0
                                ORDER BY transaction_date desc LIMIT 10`;
      const getOne = `SELECT transaction_sell_lines.id,transaction_sell_lines.product_id,products.name,transaction_sell_lines.quantity,transaction_sell_lines.unit_price,transactions.contact_id,contacts.name AS 'contact_name'
            FROM transaction_sell_lines
                INNER JOIN products ON products.id = transaction_sell_lines.product_id
                INNER JOIN transactions ON transactions.id = transaction_sell_lines.transaction_id
                INNER JOIN contacts ON contacts.id = transactions.contact_id
                    WHERE transaction_sell_lines.transaction_id = ?`;
      con.query(
        req.body.recordId == -1 ? getAll : getOne,
        [req.body.recordId],
        function (err: QueryError, prods: RowDataPacket[]) {
          if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ success: false, msg: 'error', newdata: [] });
            res.end();
            con.end();
            return;
          } else {
            res.setHeader('Content-Type', 'application/json');

            res.status(200).json({ success: true, msg: 'orders from server', newdata: prods });
            res.end();
            con.end();
            return;
          }
        }
      );
    }
    if (req.body.fetch == 'getCloseRegisterInfo') {
      var con = doConnect();
      con.query(
        `SELECT 
                transactions.id,CONCAT_WS(' ',contacts.first_name,contacts.last_name) AS 'name',contacts.id AS 'customer_id',transactions.business_id,transactions.final_total,transactions.status,transactions.transaction_date,transactions.expired_product_return_total_price,transactions.created_by 
                    FROM transactions 
                        INNER JOIN contacts ON transactions.contact_id = contacts.id
                            WHERE Length(contacts.first_name)>0
                                ORDER BY transaction_date desc LIMIT 10`,
        [req.body.recordId],
        function (err: QueryError, prods: RowDataPacket[]) {
          if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ success: false, msg: 'error', newdata: [] });
            res.end();
            con.end();
            return;
          } else {
            res.setHeader('Content-Type', 'application/json');

            res.status(200).json({ success: true, msg: 'orders from server', newdata: prods });
            res.end();
            con.end();
            return;
          }
        }
      );
    }
    //End POS

    //owner dash
    if (req.body.fetch == 'getBusiness') {
      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
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
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.status(200).json({ success: false, msg: 'login first!', newdata: [] });
          res.end();
          //con.end();
        }
      });

      return;
    }
    if (req.body.fetch == 'getBusinessSettings') {
      var con = doConnect();

      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          const { businessId } = req.body;
          con.query(
            `SELECT business.name,business.email_settings as 'email',business_types.name as 'business_type'
                                FROM business 
                                    INNER JOIN business_types ON business_types.id = business.type_id
                                        WHERE business.owner_id = ? AND business.id = ?`,
            [repo.data.id, businessId],
            function (err: QueryError, genSettings: any) {
              con.query(
                `SELECT id,name,country,state,city,currency_id,decimal_places
                            FROM business_locations
                                WHERE owner_id = ? AND business_id = ?`,
                [repo.data.id, businessId],
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
        } else {
        }
      });

      return;
    }
    if (req.body.fetch == 'getUsersMyBusiness') {
      var con = doConnect();

      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          con.query(
            `SELECT first_name AS 'name',username,email,contact_number as 'mobile',password FROM users
                    WHERE users.owner_id = ?`,
            [repo.data.id],
            function (err: QueryError, myusers: any) {
              if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: false, msg: 'error1' + err });
                res.end();
                con.end();
              } else {
                res.setHeader('Content-Type', 'application/json');
                res
                  .status(200)
                  .json({ success: true, msg: 'its done', newdata: { myusers: myusers } });
                res.end();
                con.end();
              }
            }
          );
        } else {
        }
      });

      return;
    }
    if (req.body.fetch == 'getStuffsMyBusiness') {
      var con = doConnect();

      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          con.query(
            `SELECT * FROM stuffs
                        WHERE owner_id = ?`,
            [repo.data.id],
            function (err: QueryError, myStuffs: any) {
              if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: false, msg: 'error1' + err });
                res.end();
                con.end();
              } else {
                res.setHeader('Content-Type', 'application/json');
                res
                  .status(200)
                  .json({ success: true, msg: 'its done', newdata: { myStuffs: myStuffs } });
                res.end();
                con.end();
              }
            }
          );
        } else {
        }
      });

      return;
    }

    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { data } = req.body;

        if (locationPermission(repo.data.locs, data.shopId) != -1) {
          //init add/edit pages
          if (req.body.fetch == 'initProductData') {
            var con = doConnect();
            con.query(
              `SELECT id as 'value',name as 'label' FROM barcodes WHERE barcodes.business_id = 59`,
              function (err: QueryError, reps_bars: any) {
                con.query(
                  `SELECT id as 'value',short_name as 'label' FROM units WHERE units.business_id = 59;`,
                  function (err: QueryError, reps_unit: any) {
                    con.query(
                      `SELECT id as 'value',name as 'label' FROM brands WHERE brands.business_id = 59;`,
                      function (err: QueryError, reps_brands: any) {
                        con.query(
                          `SELECT id as 'value',name as 'label' FROM categories WHERE categories.business_id = 59 ORDER BY id desc`,
                          function (err: QueryError, reps_cats: any) {
                            con.query(
                              `SELECT id as 'value',name as 'label' FROM business_locations WHERE business_locations.business_id = 59 ORDER BY id desc`,
                              function (err: QueryError, reps_locs: any) {
                                con.query(
                                  `SELECT id AS 'value', name AS 'label',amount
                                                        FROM tax_rates
                                                            WHERE  business_id = ? AND tax_type = 'group' ORDER BY id DESC;`,
                                  [59],
                                  function (err: QueryError, tax: any) {
                                    if (req.body.id != 0) {
                                      con.query(
                                        `SELECT * FROM products WHERE products.id = ? ORDER BY id desc`,
                                        [req.body.id],
                                        function (err: QueryError, proDetails: any) {
                                          res.setHeader('Content-Type', 'application/json');
                                          res
                                            .status(200)
                                            .json({
                                              success: true,
                                              msg: 'its done1',
                                              newdata: {
                                                barcodes: reps_bars,
                                                units: reps_unit,
                                                brands: reps_brands,
                                                cats: reps_cats,
                                                locations: reps_locs,
                                                pro: proDetails,
                                                taxes: tax,
                                              },
                                            });
                                          res.end();
                                          con.end();
                                          return;
                                        }
                                      );
                                    } else {
                                      res.setHeader('Content-Type', 'application/json');
                                      res
                                        .status(200)
                                        .json({
                                          success: true,
                                          msg: 'its done2',
                                          newdata: {
                                            barcodes: reps_bars,
                                            units: reps_unit,
                                            brands: reps_brands,
                                            cats: reps_cats,
                                            locations: reps_locs,
                                            taxes: tax,
                                            pro: [],
                                          },
                                        });
                                      res.end();
                                      con.end();
                                      return;
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
          if (req.body.fetch == 'initPurchases') {
            var con = doConnect();
            con.query(
              `SELECT id as 'value',name as 'label',id,name,sku,sell_price,purchase_price as 'cost_price'
                        FROM products
                            WHERE business_id = ? ORDER BY id DESC;`,
              [59],
              function (err: QueryError, pros: any) {
                con.query(
                  `SELECT id AS 'value', NAME AS 'label'
                            FROM business_locations
                                WHERE  business_locations.business_id= ?  ORDER BY id DESC;`,
                  [59],
                  function (err: QueryError, locations: any) {
                    con.query(
                      `SELECT id AS 'value', CONCAT(' ',NAME,supplier_business_name) AS 'label'
                                FROM contacts
                                    WHERE  contacts.business_id = ? AND contacts.type = 'supplier' ORDER BY id DESC;`,
                      [59],
                      function (err: QueryError, supps: any) {
                        con.query(
                          `SELECT id AS 'value', name AS 'label',Round(amount/100,2) as 'amount'
                                    FROM tax_rates
                                        WHERE  business_id = ? AND tax_type = 'group' ORDER BY id DESC;`,
                          [59],
                          function (err: QueryError, taxs: any) {
                            con.query(
                              `SELECT id AS 'value', name AS 'label'
                                    FROM expenses
                                        WHERE  business_id = 59 ORDER BY id DESC;`,
                              [59],
                              function (err: QueryError, expenses: any) {
                                con.query(
                                  `SELECT tax_rates.id,tax_rates.name,tax_rates.amount,tax_rates.tax_type as 'taxType', tax_rates.is_primary as'isPrimary',tax_rates.type AS 'amountType',p.parent_id as 'parentId' FROM tax_rates
                                            INNER JOIN (SELECT tax_id,parent_id,business_id FROM tax_group where business_id = ?) AS p ON p.tax_id=tax_rates.id
                                                WHERE p.business_id = ?`,
                                  [59, 59],
                                  function (err: QueryError, rwoGroupData: ITax[]) {
                                    var readTaxGroup = groupCalculation(rwoGroupData);

                                    res.setHeader('Content-Type', 'application/json');
                                    res.status(200).json({
                                      success: true,
                                      msg: 'its done',
                                      newdata: {
                                        products: pros,
                                        locations: locations,
                                        suppliers: supps,
                                        taxs: taxs,
                                        expenses: expenses,
                                        tax_group: readTaxGroup,
                                      },
                                    });
                                    res.end();
                                    con.end();
                                    return;
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
          if (req.body.fetch == 'initCateBrand') {
            var con = doConnect();
            const { id, type } = req.body;
            var _taxs: any,
              _itm: any = [];
            await con
              .promise()
              .query(
                `SELECT id AS 'value', concat(NAME,' (',Round(amount,2),')') AS 'label',amount
                        FROM tax_rates
                            WHERE  business_id = ? AND tax_type = 'group' ORDER BY id DESC;`,
                [59],
                function (err: QueryError, taxs: any) {}
              )
              .then((rows: any, fields: any) => {
                _taxs = rows[0];
              })
              .catch();
            await con
              .promise()
              .query(
                `select * from ` +
                  (type == 'category' ? 'categories' : 'brands') +
                  ` where id = ? `,
                [id]
              )
              .then((rows: any, fields: any) => {
                _itm = rows[0];
              })
              .catch();

            res.setHeader('Content-Type', 'application/json');
            res
              .status(200)
              .json({ success: true, msg: 'fetched!', newdata: { taxes: _taxs, itm: _itm } });
            res.end();
            con.end();
            return;
          }
          if (req.body.fetch == 'getSales') {
            var con = doConnect();
            con.query(
              `SELECT transactions.id ,
                            transactions.transaction_date ,
                            transactions.payment_status ,
                            transactions.final_total,
                            transactions.tax_amount,
                            transactions.discount_amount,
                            transactions.discount_type,
                            transactions.total_before_tax,
                            transactions.additional_notes,
                            transactions.shipping_custom_field_1,
                            transactions.shipping_custom_field_2,
                            transactions.shipping_custom_field_3,
                            transactions.shipping_custom_field_4,
                            transactions.shipping_custom_field_5,
                            DATE_FORMAT(transactions.transaction_date, "%Y/%m/%d") as sale_date,
                            contacts.name as customer_name,
                            contacts.name as supplier_business_name,
                            CONCAT(COALESCE(users.surname, ''),' ',COALESCE(users.first_name, ''),' ',COALESCE(users.last_name,'')) as added_by,
                            transactions.invoice_no FROM transactions
                            LEFT JOIN contacts
                            ON transactions.contact_id = contacts.id
                            LEFT JOIN users
                            ON transactions.created_by = users.id
                            WHERE transactions.business_id = 59 AND transactions.type = 'sell' ORDER BY id DESC LIMIT 500 ;`,
              [],
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
          if (req.body.fetch == 'initSalesData') {
            var con = doConnectMulti();
            con.query(
              `SELECT products.id,variations.id AS 'varId',products.sku,variations.default_sell_price AS 'price',products.tax AS 'product_tax' ,products.name AS 'product', categories.tax_id AS 'category_tax',
                                brands.tax_id AS 'brand_tax',
                                product_locations.location_id AS 'location',
                                products.name,products.image,products.business_id,products.brand_id,products.sell_price,products.category_id,IF(products.tax > 0 or categories.tax_id > 0 or brands.tax_id > 0 ,false, TRUE) AS 'def_tax'
                                FROM products
                                    INNER JOIN variations ON variations.id = products.id
                                    INNER JOIN categories ON categories.id = products.category_id
                                    INNER JOIN brands ON brands.id = products.brand_id
                                    INNER JOIN product_locations ON product_locations.product_id = products.id
                                    And products.business_id = ?`,
              [data.shopId],
              function (err: QueryError, products: any) {
                con.query(
                  `SELECT id as 'value', name as 'label' FROM contacts WHERE contacts.business_id = 59 AND contacts.type ='customer' ORDER BY id desc ;`,
                  function (err: QueryError, customers: any) {
                    con.query(
                      `SELECT tax_rates.id,tax_rates.name,tax_rates.amount,tax_rates.tax_type, tax_rates.is_primary,tax_rates.type AS 'amount_type',p.parent_id FROM tax_rates INNER JOIN (SELECT tax_id,parent_id,business_id FROM tax_group where business_id = ?) AS p ON p.tax_id=tax_rates.id WHERE p.business_id = ?`,
                      [59, 59],
                      function (err: QueryError, rwoGroupData: ITax[]) {
                        var readTaxGroup = groupCalculation(rwoGroupData);
                        //get group default Tax if has
                        con.query(
                          `SELECT id,name,amount,type AS 'amountType',tax_type as 'taxType',is_primary as 'isPrimary'
                                                            FROM tax_rates 
                                                                WHERE id IN ((SELECT tax_id FROM tax_group 
                                                                        WHERE parent_id = (SELECT id FROM tax_rates where business_id = ? AND is_primary = 1 AND tax_type ='group')));`,
                          [59],
                          function (err: QueryError, taxes: RowDataPacket[]) {
                            res.status(200).json({
                              success: true,
                              msg: 'its done1',
                              newdata: {
                                customers,
                                taxes,
                                products,
                                transaction: [],
                                tax_group: readTaxGroup,
                              },
                            });
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
          if (req.body.fetch == 'getAllQuotations') {
            var con = doConnect();
            con.query(
              `SELECT transactions.id, transactions.quotation_no AS 'quotation_number', transactions.discount_amount, transactions.total_adjusted_price AS 'total_adjustments', transactions.total_before_tax AS 'sub_total', transactions.final_total, transactions.tax_amount, business.name AS 'business_name', business_locations.email AS 'business_email',currencies.code AS 'currency',
                            CONCAT_WS(' ',contacts.first_name, contacts.last_name) AS 'customer_name', 
                            CONCAT_WS(' ',business_locations.city, business_locations.state, business_locations.country, business_locations.zip_code) AS 'business_address', 
                            CONCAT_WS(' / ',business_locations.mobile, business_locations.alternate_number) AS 'business_contact',
                            CONCAT_WS(' / ',users.first_name, users.last_name) AS 'sales_agent',
                            DATE_FORMAT(transactions.transaction_date, "%Y/%m/%d") AS 'quotation_date',
                            DATE_FORMAT(transactions.quotation_expiry_date, "%Y/%m/%d") as 'expiry_date', transactions.ref_no, transactions.status
                            FROM transactions 
                                INNER JOIN contacts ON transactions.contact_id = contacts.id
                                INNER JOIN business ON transactions.business_id = business.id
                                INNER JOIN business_locations ON transactions.location_id = business_locations.id
                                LEFT JOIN users ON business.owner_id = users.id
                                LEFT JOIN currencies ON transactions.currency_id = currencies.id
                            WHERE transactions.is_quotation = 1 AND transactions.business_id = 6 ORDER BY transactions.id DESC LIMIT 500;`,
              [],
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
          if (req.body.fetch == 'initQuotationData') {
            var con = doConnect();
            con.query(
              `SELECT id as 'value', code as 'label' FROM currencies ORDER BY id desc`,
              function (err: QueryError, currencies: any) {
                con.query(
                  `SELECT
                                        products.id,products.id as 'value',variations.id AS 'varId',products.sku,variations.default_sell_price AS 'price',products.tax AS 'product_tax',
                                        categories.tax_id AS 'category_tax',
                                        brands.tax_id AS 'brand_tax',
                                        products.name, products.name as 'label',products.image,products.business_id,products.brand_id,products.category_id,IF(products.tax > 0 or categories.tax_id > 0 or brands.tax_id > 0 ,false, TRUE) AS 'def_tax'
                                        FROM products
                                            INNER JOIN variations ON variations.product_id = products.id
                                            INNER JOIN categories ON categories.id = products.category_id
                                            INNER JOIN brands ON brands.id = products.brand_id
                                                where products.business_id = ? 
                                        `,
                  [59],
                  function (err: QueryError, products: any) {
                    con.query(
                      `SELECT id as 'value', location_id as 'label' FROM business_locations WHERE business_locations.business_id = 6 ORDER BY id desc`,
                      function (err: QueryError, locations: any) {
                        con.query(
                          `SELECT id as 'value', name as 'label', contact_id as 'contact_id', email FROM contacts WHERE contacts.business_id = 6;`,
                          function (err: QueryError, customers: any) {
                            con.query(
                              `SELECT id as 'value',name as 'label' FROM invoice_schemes WHERE invoice_schemes.business_id = 6;`,
                              function (err: QueryError, invoice_schemes: any) {
                                //def group
                                con.query(
                                  `SELECT id,name,amount,type AS 'amountType',tax_type as 'taxType',is_primary as 'isPrimary'
                                        FROM tax_rates 
                                            WHERE id IN ((SELECT tax_id FROM tax_group 
                                                    WHERE parent_id = (SELECT id FROM tax_rates where business_id = 59 AND is_primary = 1 AND tax_type ='group')));`,
                                  function (err: QueryError, def_taxes: any) {
                                    //
                                    con.query(
                                      `SELECT tax_rates.id,tax_rates.name,tax_rates.amount,tax_rates.tax_type as 'taxType', tax_rates.is_primary as'isPrimary',tax_rates.type AS 'amountType',p.parent_id as 'parentId' FROM tax_rates
                                            INNER JOIN (SELECT tax_id,parent_id,business_id FROM tax_group where business_id = ?) AS p ON p.tax_id=tax_rates.id
                                                WHERE p.business_id = ?`,
                                      [59, 59],
                                      function (err: QueryError, allGroup_taxes: any) {
                                        var readTaxGroup = groupCalculation(allGroup_taxes);

                                        res.setHeader('Content-Type', 'application/json');
                                        res.status(200).json({
                                          success: true,
                                          msg: 'its done1',
                                          newdata: {
                                            locations: locations,
                                            customers: customers,
                                            invoice_schemes: invoice_schemes,
                                            taxes: def_taxes,
                                            readTaxGroup: readTaxGroup,
                                            products: products,
                                            transaction: [],
                                            currencies: currencies,
                                          },
                                        });
                                        res.end();
                                        return;
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
            );
          }
        } else redirection(403, con, res, 'you have not permissions');
      } else redirection(401, con, res, 'login first!');
    });

    //Fetch List
    if (req.body.fetch == 'getProducts') {
      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          const { businessId } = req.body;

          var con = doConnect();
          con.query(
            `SELECT products.id,products.name,products.business_id,products.image,products.sku,products.barcode_type,products.alert_quantity,products.cost_price,products.sell_price,
                    units.actual_name AS 'unit',
                    brands.name AS 'brand',
                    categories.name AS 'category'
                        FROM products
                            INNER JOIN units ON units.id = products.unit_id
                            INNER JOIN brands ON brands.id = products.brand_id
                            INNER JOIN categories ON categories.id = products.category_id
                            INNER JOIN business_locations ON business_locations.id = products.location_id
                                WHERE products.location_id = ? AND business_locations.owner_id = ? ORDER BY id DESC;`,
            [businessId, repo.data.oid! > 0 ? repo.data.oid! : repo.data.id],
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
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.status(200).json({ success: false, msg: 'login first!', newdata: [] });
          res.end();
          con.end();
          return;
        }
      });
    }
    if (req.body.fetch == 'getPurchases') {
      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          const { businessId } = req.body;

          if (locationPermission(repo.data.locs, businessId) != -1) {
            var con = doConnect();
            con.query(
              `SELECT transactions.created_at,transactions.id,CONCAT(' ',contacts.first_name,contacts.last_name) AS 'supplier',transactions.total_price,transactions.ref_no,STATUS,payment_status
                        FROM transactions
                            INNER JOIN contacts ON contacts.id = transactions.contact_id
                                WHERE transactions.type = 'purchase' and transactions.location_id = ? ORDER BY id DESC;`,
              [businessId],
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
          } else redirection(403, con, res, 'you have not permissions');
        } else redirection(401, con, res, 'login first!');
      });
    }
    if (req.body.fetch == 'getExpense') {
      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          const { businessId } = req.body;
          if (locationPermission(repo.data.locs, businessId) != -1) {
            var con = doConnect();
            con.query(
              `SELECT id,name FROM expenses
                            WHERE  business_id = ? ORDER BY id DESC;`,
              [businessId],
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
          } else redirection(403, con, res, 'you have not permissions');
        } else redirection(401, con, res, 'login first!');
      });
    }
    if (req.body.fetch == 'getTaxs') {
      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          const { businessId } = req.body;
          if (locationPermission(repo.data.locs, businessId) != -1) {
            var con = doConnect();
            con.query(
              `SELECT id,name,amount,type as 'amountType',IF(is_primary = 1,TRUE,FALSE) AS 'isPrimary',tax_type as 'taxType',false as 'isNew' FROM tax_rates
                            WHERE  business_id = ?;`,
              [businessId],
              function (err: QueryError, data: any) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: true, msg: 'its done', newdata: data });
                res.end();
                con.end();
                return;
              }
            );
          } else redirection(403, con, res, 'you have not permissions');
        } else redirection(401, con, res, 'login first!');
      });
    }
    if (req.body.fetch == 'getCatsAndBrands') {
      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          const { businessId } = req.body;

          if (locationPermission(repo.data.locs, businessId) != -1) {
            var con = doConnect();
            con.query(
              `SELECT id,name
                                    FROM categories
                                            WHERE location_id = ? ORDER BY id desc;`,
              [businessId],
              function (err: QueryError, cates: any) {
                con.query(
                  `SELECT id,name
                                FROM brands
                                    WHERE  location_id = ? ORDER BY id desc;`,
                  [businessId],
                  function (err: QueryError, brands: any) {
                    res.setHeader('Content-Type', 'application/json');
                    res
                      .status(200)
                      .json({
                        success: true,
                        msg: 'its done',
                        newdata: { cates: cates, brands: brands },
                      });
                    res.end();
                    con.end();
                  }
                );
              }
            );
          } else redirection(403, con, res, 'you have not permissions');
        } else redirection(401, con, res, 'login first!');
      });
    }

    //fetch One
    if (req.body.fetch == 'getOneProduct') {
      var con = doConnect();
      con.query(
        `SELECT 
                products.id,products.name,products.business_id,products.image,products.sku,products.barcode_type,products.alert_quantity,
                units.actual_name AS 'unit',
                brands.name AS 'brand',
                categories.name AS 'category'
                FROM products
                    INNER JOIN units ON units.id = products.unit_id
                    INNER JOIN brands ON brands.id = products.brand_id
                    INNER JOIN categories ON categories.id = products.category_id
                WHERE products.business_id = 59 ORDER BY id DESC;`,
        [59],
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

    if (req.body.fetch == 'getGroupItems') {
      var con = doConnect();
      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          const { businessId } = req.body;
          if (locationPermission(repo.data.locs, businessId) != -1) {
            const { id } = req.body;
            con.query(
              `SELECT tax_rates.id as 'tax_id',tax_rates.name,tax_rates.amount,tax_rates.type,tax_rates.tax_type,tax_group.id
                            FROM tax_rates
                                INNER JOIN tax_group ON tax_group.tax_id = tax_rates.id
                                    WHERE tax_rates.business_id = ? AND tax_group.parent_id = ? ORDER BY tax_rates.id DESC;`,
              [businessId, id],
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
          } else redirection(403, con, res, 'you have not permissions');
        } else redirection(401, con, res, 'login first!');
      });
    }
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');

    res.status(200).json({ success: false, msg: 'error2', newdata: [] });
    res.end();
  }

  /*
    
    */
}
