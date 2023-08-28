// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
var { doConnect } = require('../../libs/myConnection');
import { QueryError, RowDataPacket } from 'mysql2';
import { locationPermission, redirection, verifayTokens } from './checkUtils';
import { Data, ITax, ITokenVerfy } from '../../models/common-model';

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  // console.log(req.body);

  try {
    if (req.body.type == 'editProduct') {
      const { data, img } = req.body;
      var con = doConnect();

      con.query(
        `UPDATE products SET 
                name = ?,subproductname = ?,business_id = ?,image = ?,tax = ?, tax_type = ?,sku = ?,barcode_type = ?, unit_id = ?, brand_id = ?,category_id = ?,alert_quantity = ?,created_by = ?,is_security = ?,supplier_id = ?,supplier = ?,purchase_price = ?,sell_price = ?
                WHERE id=?`,
        [
          data.productName,
          data.productName2,
          59,
          img,
          data.tax_id,
          'inclusive',
          data.sku,
          'EAN13',
          data.unit,
          data.brand,
          data.cat,
          data.alertQuantity,
          59,
          0,
          0,
          0,
          data.purchasePrice,
          data.sellPrice,
          data.id,
        ],
        function (err: QueryError, prods: RowDataPacket[]) {
          if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ success: false, msg: 'error' + err, newdata: [] });
            res.end();
          } else {
            res.setHeader('Content-Type', 'application/json');

            const newOne = { id: data.id, firstName: data.firstName, mobile: data.mobile };
            res.status(200).json({ success: true, msg: 'customer info edited', newdata: newOne });
            res.end();
          }
        }
      );
    }

    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { data } = req.body;
        if (locationPermission(repo.data.locs, data.shopId) != -1) {
          if (req.body.type == 'edit_category') {
            const { frmobj, shopId } = data;
            var con = doConnect();
            con.query(
              `UPDATE categories SET 
                            name = ?,description = ?,tax_id = ?
                                WHERE id=?`,
              [frmobj.name, frmobj.des, frmobj.tax, frmobj.id],
              function (err: QueryError, prods: RowDataPacket[]) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'error' + err, newdata: [] });
                  res.end();
                  con.end();
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: true, msg: 'record is edited!' });
                  res.end();
                  con.end();
                }
              }
            );
          }
          if (req.body.type == 'edit_brand') {
            const { frmobj, shopId } = data;
            var con = doConnect();

            con.query(
              `UPDATE brands SET 
                            name = ?,description = ?,tax_id = ?
                                WHERE id=?`,
              [frmobj.name, frmobj.des, frmobj.tax, frmobj.id],
              function (err: QueryError, prods: RowDataPacket[]) {
                if (err) {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: false, msg: 'error' + err, newdata: [] });
                  res.end();
                  con.end();
                } else {
                  res.setHeader('Content-Type', 'application/json');
                  res.status(200).json({ success: true, msg: 'record is edited!' });
                  res.end();
                  con.end();
                }
              }
            );
          }
        }
      }
    });

    if (req.body.fetch == 'editCustomerInfo') {
      var con = doConnect();
      con.query(
        `UPDATE contacts SET first_name = ?,last_name = ?,mobile = ?,city = ?,state = ?,country = ?,address_line_1 = ?,address_line_2 = ?,zip_code = ?,shipping_address = ? WHERE id=?`,
        [
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
          req.body.data.id,
        ],
        function (err: QueryError, prods: RowDataPacket[]) {
          if (err) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ success: false, msg: 'error' + err, newdata: [] });
            res.end();
            con.end();
            return;
          } else {
            res.setHeader('Content-Type', 'application/json');
            const newOne = {
              id: req.body.data.id,
              firstName: req.body.data.firstName,
              mobile: req.body.data.mobile,
            };
            res.status(200).json({ success: true, msg: 'customer info edited', newdata: newOne });
            res.end();
            con.end();
            return;
          }
        }
      );
    }
    //dashboard
    if (req.body.type == 'generalBusinessSettings') {
      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          const { genSettings, data } = req.body;
          var con = doConnect();
          con.query(
            `UPDATE business SET name= ?,email_settings = ? WHERE id = ? and owner_id = ? limit 1`,
            [genSettings.name, genSettings.email, data.businessId, repo.data.id],
            function (err: QueryError, prods: RowDataPacket[]) {
              if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: false, msg: 'error' + err, newdata: [] });
                res.end();
                con.end();
              } else {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: true, msg: 'settings is edited!' });
                res.end();
                con.end();
              }
            }
          );
        } else redirection(401, con, res, 'login first!');
      });
    }
    if (req.body.type == 'locationBusinessSettings') {
      verifayTokens(req, (repo: ITokenVerfy) => {
        if (repo.status === true) {
          const { locationSetting, data } = req.body;
          var con = doConnect();
          con.query(
            `UPDATE business_locations SET currency_id= ?,decimal_places = ? WHERE id = ? and owner_id = ? limit 1`,
            [
              locationSetting.currency_id,
              locationSetting.decimal_places,
              data.locationId,
              repo.data.id,
            ],
            function (err: QueryError, prods: RowDataPacket[]) {
              if (err) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: false, msg: 'error' + err, newdata: [] });
                res.end();
                con.end();
              } else {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({ success: true, msg: 'settings is edited!' });
                res.end();
                con.end();
              }
            }
          );
        } else redirection(401, con, res, 'login first!');
      });
    }
  } catch (eer) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: false, msg: 'error2' });
    res.end();
    return;
  }
}
