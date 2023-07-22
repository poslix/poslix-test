// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { QueryError } from "mysql2";
var { doConnect } = require("../../../libs/myConnection");
import {
  ITax,
  Data,
  ITokenVerfy,
  ITailoringCustom,
} from "../../../models/common-model";
import {
  locationPermission,
  redirection,
  verifayTokens,
  increaseQtySold,
} from "../checkUtils";

function manageError(res: any, con: any, msg: string) {
  // con.rollback();
  redirection(403, con, res, msg);
  return;
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        console.log(req.body);

        const { shopId, subType } = req.body;
        console.log(shopId, repo.data.locs, subType);
        if (locationPermission(repo.data.locs, shopId) != -1) {
          if (subType == "addPurchase") {
            const { totalOrder, lines, expenses, taxes } = req.body.data;
    
            var transaction_id = 0;
            var con = doConnect();
            // await con.beginTransaction();
            if (totalOrder.purchaseStatus == "draft")
              totalOrder.paymentStatus = "due";
            await con
              .promise()
              .query(
                `insert into transactions(location_id,type,status,payment_status,contact_id,invoice_no,discount_type,discount_amount,total_price,total_taxes,taxes,created_by,created_at,currency_id)
                        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                  shopId,
                  "purchase",
                  totalOrder.purchaseStatus,
                  totalOrder.paymentStatus,
                  totalOrder.supplier_id,
                  totalOrder.ref_no,
                  totalOrder.discount_type,
                  totalOrder.discount_amount,
                  totalOrder.total_price,
                  totalOrder.total_tax,
                  JSON.stringify(taxes),
                  repo.data.id,
                  new Date().toISOString().slice(0, 19).replace('T', ' '),
               
                  totalOrder.currency_id,
                ]
              )
              .then((rows: any, fields: any) => {
                transaction_id = rows[0].insertId;
              })
              .catch((err: QueryError) => {
                manageError(res, con, "");
                return;
              });

            let sqlCondi =
              "INSERT INTO transactions_lines(transaction_id,product_id,variation_id,discount_type,discount_amount,qty,group_tax_id,cost_type,cost,price) VALUES ?";
            let sqlValues: any = [];
            let StockVal: any = []; // for add to stock
            lines.map((itm: any, idx: number) => {
              sqlValues.push([
                transaction_id,
                itm.product_id,
                itm.variation_id,
                null,
                0,
                itm.quantity,
                null,
                itm.costType,
                itm.cost,
                itm.price,
              ]);
              StockVal.push([
                transaction_id,
                0,
                itm.product_id,
                itm.variation_id,
                itm.quantity,
                0,
                0,
                repo.data.id,
                new Date().toISOString().slice(0, 19).replace('T', ' '),
              ]);
            });

            if (sqlValues.length > 0) {
              await con
                .promise()
                .query(sqlCondi, [sqlValues])
                .then((rows: any, fields: any) => {
                  console.log("lines ", rows);
                  for (let i = 0; i < rows[0].affectedRows; i++)
                    StockVal[i][1] = rows[0].insertId + i;
                })
                .catch((err: QueryError) => {
                  manageError(res, con, "");
                  return;
                });
            }
            //if purchase is rescived
            if (
              StockVal.length > 0 &&
              totalOrder.purchaseStatus == "received"
            ) {
              let stockSql =
                "INSERT INTO stock(transaction_id,transaction_lines_id,product_id,variation_id,qty_received,qty_sold,sold_at,created_by,created_at) VALUES ?";
              await con
                .promise()
                .query(stockSql, [StockVal])
                .then((rows: any, fields: any) => {
                  console.log("stocks ", rows);
                })
                .catch((err: QueryError) => {
                  manageError(res, con, "");
                  return;
                });
            }

            sqlCondi =
              "INSERT INTO expenses_values(location_id,transaction_id,name,value,entered_value,currency_id,currency_rate) VALUES ?";
            sqlValues = [];
            expenses.map((itm: any, idx: number) => {
              sqlValues.push([
                shopId,
                transaction_id,
                itm.label,
                itm.value,
                itm.enterd_value,
                itm.currency_id,
                itm.currency_rate,
              ]);
            });
            if (sqlValues.length > 0) {
              await con
                .promise()
                .query(sqlCondi, [sqlValues])
                .then((rows: any, fields: any) => {})
                .catch((err: QueryError) => {
                  manageError(res, con, "");
                  return;
                });
            }

            let affectedRows: boolean = false;

            if (totalOrder.purchaseStatus != "draft") {
              await con
                .promise()
                .query(
                  `INSERT INTO transaction_payments(transaction_id,payment_type,amount,created_by,created_at) VALUES (?,?,?,?,?)`,
                  [
                    transaction_id,
                    totalOrder.paymentType,
                    totalOrder.paid_amount,
                    repo.data.id,
                    new Date().toISOString().slice(0, 19).replace('T', ' '),
                  ]
                )
                .then((rows: any, fields: any) => {
                  affectedRows = rows[0].affectedRows > 0;
                  console.log(
                    "inserting purchase done! ",
                    rows[0].affectedRows
                  );
                })
                .catch((err: QueryError) => {
                  manageError(res, con, "");
                  return;
                });
            } else affectedRows = true;

            if (affectedRows) {
              res.setHeader("Content-Type", "application/json");
              res.status(200).json({ success: true, msg: "purchase inserted" });
              res.end();
              con.end();
              return;
            }

            console.log("inserting purchase error! ");
            res.setHeader("Content-Type", "application/json");
            res
              .status(200)
              .json({ success: false, msg: "purchase not inserted" });
            res.end();
            con.end();
            return;
          }

          if (subType == "addUpdateStockCheckList") {
            const { purchaseId, orderLines } = req.body.data;

            let sqlCondi =
              "INSERT INTO stock(transaction_id,transaction_lines_id,product_id,variation_id,qty_received,qty_sold,sold_at,created_by,created_at) VALUES ?";
            let sqlValues: any = [];
            let isReceived = true;
            orderLines.map((itm: any, idx: number) => {
              if (
                +Number(itm.qty).toFixed(2) !=
                +Number(
                  parseFloat(itm.qty_received) + parseFloat(itm.qty_entered)
                ).toFixed(2)
              )
                isReceived = false;
              if (itm.qty_entered > 0) {
                sqlValues.push([
                  purchaseId,
                  itm.id,
                  itm.product_id,
                  itm.variation_id,
                  itm.qty_entered,
                  0,
                  0,
                  repo.data.id,
                  new Date().toISOString().slice(0, 19).replace('T', ' '),
                ]);
              }
            });

            if (sqlValues.length > 0) {
              var con = doConnect();
              await con
                .promise()
                .query(sqlCondi, [sqlValues])
                .then((rows: any, fields: any) => {})
                .catch(console.log("erorrr1"));
              await con
                .promise()
                .query(
                  `UPDATE transactions SET status=? WHERE  id=? limit 1;`,
                  [isReceived ? "received" : "partially_received", purchaseId]
                )
                .then((rows: any, fields: any) => {})
                .catch(console.log("erorrr2"));
              con.end();
            }

            console.log("inserting stock done! ", isReceived);
            res.setHeader("Content-Type", "application/json");
            res
              .status(200)
              .json({
                success: true,
                msg: "stock inserted",
                newdata: isReceived ? "received" : "partially_received",
              });
            res.end();
            return;
          }

          if (subType == "addPayment") {
            const { data } = req.body;
            const { frm, totalLeft, purchaseId } = data;
            let _isOk = false,
              is_paid = false,
              transaction_id = 0;
            console.log("okkk_inja");

            var con = doConnect();
            await con
              .promise()
              .query(
                `INSERT INTO transaction_payments(transaction_id,payment_type,amount,created_by,created_at) VALUES (?,?,?,?,?)`,
                [
                  purchaseId,
                  frm.payment_type,
                  frm.amount,
                  repo.data.id,
                  new Date(),
                ]
              )
              .then((rows: any, fields: any) => {
                _isOk = true;
              })
              .catch(console.log("erorrr0"));

            if (_isOk) {
              if (
                +Number(frm.amount).toFixed(2) ==
                +Number(parseFloat(totalLeft).toFixed(2))
              )
                is_paid = true;

              await con
                .promise()
                .query(
                  `UPDATE transactions SET payment_status=? WHERE  id=? limit 1;`,
                  [is_paid ? "paid" : "partially_paid", purchaseId]
                )
                .then((rows: any, fields: any) => {
                  _isOk = true;
                  transaction_id = rows[0].insertId;
                })
                .catch(console.log("erorrr0"));

              console.log("inserting stock done! ", is_paid);
              res.setHeader("Content-Type", "application/json");
              res
                .status(200)
                .json({
                  success: true,
                  msg: "stock inserted",
                  newdata: {
                    status: is_paid ? "paid" : "partially_paid",
                    payment: {
                      id: transaction_id,
                      payment_type: frm.payment_type,
                      amount: frm.amount,
                      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    },
                  },
                });
              res.end();
              con.end();
              return;
            } else {
              console.log("add payment has error");
              res.setHeader("Content-Type", "application/json");
              res
                .status(200)
                .json({ success: false, msg: "stock inserted", newdata: "" });
              res.end();
              con.end();
              return;
            }
          }

          if (subType == "newPosSale") {
            const { data } = req.body;
            const { items, details, paymentRows, orderEditDetails, orderNote } =
              data;
            console.log(details);
            var con = doConnect();
            var transaction_id = 0;

            //for add payment
            const sqlForPayment =
              "INSERT INTO transaction_payments(transaction_id,payment_type,amount,notes,created_by,created_at) VALUES ?";
            const valueForPayment: any = [];

            if (details.isReturn > 0) {
              //update factor details
              transaction_id = details.isReturn;

              await con
                .promise()
                .query(
                  `UPDATE transactions SET total_price = ?,notes = ?, sub_type= ? WHERE id = ? limit 1`,
                  [
                    details.totalAmount,
                    orderNote,
                    "sell_return",
                    details.isReturn,
                  ]
                )
                .then((rows: any, fields: any) => {
                  console.log("updaedd");
                })
                .catch();

              let sign =
                details.totalAmount > orderEditDetails.total_price ? 1 : -1;
              paymentRows.map((pay: any) => {
                if (pay.amount > 0)
                  valueForPayment.push([
                    transaction_id,
                    pay.method,
                    Math.abs(pay.amount) * sign,
                    pay.notes,
                    repo.data.id,
                    new Date().toISOString().slice(0, 19).replace('T', ' '),
                  ]);
              });
            } else {
              await con
                .promise()
                .query(
                  `INSERT INTO transactions(location_id,type,contact_id,payment_status,notes,total_price,STATUS,created_at,created_by) VALUES (?,?,?,?,?,?,?,?,?)`,
                  [
                    shopId,
                    "sell",
                    details.customerId,
                    "paid",
                    orderNote,
                    details.totalAmount,
                    "received",
                    new Date().toISOString().slice(0, 19).replace('T', ' '),
                    repo.data.id,
                  ]
                )
                .then((rows: any, fields: any) => {
                  console.log("updaedd");
                  transaction_id = rows[0].insertId;
                })
                .catch();

              paymentRows.map((pay: any) => {
                if (pay.amount > 0)
                  valueForPayment.push([
                    transaction_id,
                    pay.method,
                    pay.amount,
                    pay.notes,
                    repo.data.id,
                    new Date().toISOString().slice(0, 19).replace('T', ' '),
                  ]);
              });
            }

            if (valueForPayment.length == 0) {
              console.log('nooooooooooooooooo');
              
              //error
              //return
            }

            let isExchange = details.totalAmount - orderEditDetails.total_price;
            console.log(isExchange);
            
            //pay when is not exchange(payment is zero)
            if (isExchange != 0) {
              await con
                .promise()
                .query(sqlForPayment, [valueForPayment])
                .then((rows: any, fields: any) => {
                  console.log("add successfuly payments");
                })
                .catch();
            }

            //for add new lines
            const sqlCondiForNew =
              "INSERT INTO transactions_lines(transaction_id,product_id,variation_id,qty,tax_amount,cost,price,stock_id,tailoring_txt,tailoring_custom,status,note,tailoring_link_num) VALUES ?";
            const sqlValuesForNew: any = [];
            //for add new tailoring user size
            const sqlCondiTailoringUser =
              "INSERT into `tailoring_user_sizes` (id,location_id,sizes,name,tailoring_type_id,create_by) VALUES ? as pt ON DUPLICATE KEY UPDATE location_id = pt.location_id,sizes = pt.sizes,name = pt.name,tailoring_type_id = pt.tailoring_type_id,create_by = pt.create_by;";
            const sqlValuesTailoringUser: any = [];
            //for update lines
            const sqlCondiForUpdate =
              "INSERT into `transactions_lines` (id,qty,qty_returned,tax_amount,tailoring_txt,note,tailoring_link_num) VALUES ? as pt ON DUPLICATE KEY UPDATE qty = transactions_lines.qty - pt.qty,qty_returned = transactions_lines.qty_returned + pt.qty_returned,tax_amount = pt.tax_amount,tailoring_txt = pt.tailoring_txt,note = pt.note,tailoring_link_num = pt.tailoring_link_num;";
            const sqlValuesForUpdate: any = [];
            //update over selling counter
            const sqlCandiUpdateOverSell =
              "INSERT into `products` (id,qty_over_sold) VALUES ? as pt ON DUPLICATE KEY UPDATE qty_over_sold = products.qty_over_sold - pt.qty_over_sold;";
            const sqlValuesUpdateOverSell: any = [];

            const sqlCondiUpdateStock =
              "INSERT into `stock` (id,qty_sold) VALUES ? as tb ON DUPLICATE KEY UPDATE qty_sold = stock.qty_sold - tb.qty_sold;";
            const sqlValuesUpdateStock: any = [];
            //update stock only for tailrong package
            const sqlUpdateStockTailoring =
              "INSERT into `stock` (id,qty_sold) VALUES ? as tb ON DUPLICATE KEY UPDATE qty_sold = stock.qty_sold - tb.qty_sold;";
            const valUpdateStockTailoring: any = [];

            //array for fabrics (decrease)
            let _tmpId = 0,
              _fabricQty: any = []; //{product_id:1,length:10}
            let _customTailringArray: ITailoringCustom[] = [],
              _tmpCutsom: any = null,
              packageIndex: number[] = [];
            //calculation
            items?.orders?.map(async (elt: any, idx: number) => {
              //insert update tailoring user sizes
              if (
                (elt.is_tailoring > 0 || elt.type == "tailoring_package") &&
                !elt.isEdit
              )
                sqlValuesTailoringUser.push([
                  items.quantity[idx].tailoringIsEdit,
                  shopId,
                  items.quantity[idx].tailoring,
                  items.quantity[idx].tailoringName,
                  elt.type == "tailoring_package"
                    ? elt.tailoring_type_id
                    : elt.is_tailoring,
                  repo.data.id,
                ]);
              //for decrease fabric
              if (
                elt.type == "tailoring_package" &&
                (elt.quantity2 > -1 || elt.quantity2 == undefined)
              ) {
                _customTailringArray.push(items.quantity[idx].tailoringCutsom);
                packageIndex.push(idx);
                _tmpCutsom = JSON.stringify(
                  items.quantity[idx].tailoringCutsom
                );
                _tmpId = items.quantity[idx].tailoringCutsom?.fabric_id!;
                _fabricQty.push({
                  product_id: _tmpId,
                  qty:
                    items.quantity[idx].tailoringCutsom?.fabric_length! *
                    items.quantity[idx].quantity,
                });
              } else _tmpCutsom = null;

              items.quantity[idx].prices.map(async (prs: any) => {
                if (items.quantity[idx].freezeQuantity == 0 && !elt.isEdit)
                  sqlValuesForNew.push([
                    transaction_id,
                    elt.product_id,
                    elt.variation_id > 0 ? elt.variation_id : 0,
                    prs.qty,
                    items.quantity[idx].taxAmount,
                    prs.cost,
                    prs.price,
                    prs.stock_id,
                    items.quantity[idx].tailoring,
                    _tmpCutsom,
                    "pending",
                    "",
                    items.quantity[idx].selectionColor,
                  ]);
                else if (
                  elt.quantity2 < 0 ||
                  elt.is_tailoring > 0 ||
                  elt.type == "tailoring_package"
                ) {
                  //for return only(update lines)
                  sqlValuesForUpdate.push([
                    elt.transaction_id,
                    Math.abs(elt.quantity2),
                    Math.abs(elt.quantity2),
                    items.quantity[idx].taxAmount,
                    items.quantity[idx].tailoring,
                    "",
                    items.quantity[idx].selectionColor,
                  ]);
                  if (elt.is_service == 0 && prs.stock_id > 0)
                    sqlValuesUpdateStock.push([
                      prs.stock_id,
                      Math.abs(elt.quantity2),
                    ]);
                  else if (
                    elt.is_service == 0 &&
                    (prs.stock_id == 0 || prs.stock_id == null) &&
                    elt.type != "tailoring_package"
                  )
                    sqlValuesUpdateOverSell.push([
                      elt.product_id,
                      Math.abs(elt.quantity2),
                    ]);
                  else if (elt.type == "tailoring_package") {
                    //full return stock (tailoring_package)

                    let ids =
                      items.quantity[
                        idx
                      ].freezeTailoringCutsom.stock_ids.reverse();
                    let _fabId =
                      items.quantity[idx].freezeTailoringCutsom.fabric_id;
                    let _totalAmount =
                      Math.abs(elt.quantity2) *
                      items.quantity[idx].freezeTailoringCutsom.fabric_length;
                    //thats mean more than one stock id for update
                    console.log("_totalAmount ", _totalAmount, "ids ", ids);

                    let _remaining = 0,
                      _tmp = 0;
                    for (let i3 = 0; i3 < ids.length; i3++) {
                      if (_totalAmount > 0) {
                        if (
                          +Number(ids[i3].increased_qty).toFixed(2) >=
                          +Number(_totalAmount).toFixed(2)
                        ) {
                          _tmp =
                            parseFloat(ids[i3].increased_qty) - _totalAmount; //for pricess \
                          ids[i3].increased_qty = _tmp;
                          if (ids[i3].stock_id != 0)
                            valUpdateStockTailoring.push([
                              ids[i3].stock_id,
                              _tmp,
                            ]);
                          else _remaining += _totalAmount;
                          _totalAmount = 0;
                        } else {
                          _totalAmount -= parseFloat(ids[i3].increased_qty);
                          if (ids[i3].stock_id != 0)
                            valUpdateStockTailoring.push([
                              ids[i3].stock_id,
                              parseFloat(ids[i3].increased_qty),
                            ]);
                          else _remaining += parseFloat(ids[i3].increased_qty);
                          ids[i3].increased_qty = -99;
                        }
                      }
                    }
                    console.log(
                      "_remaining",
                      _remaining,
                      " _totalAmount ",
                      _totalAmount,
                      " ids ",
                      ids
                    );
                    // let _newIDs = ids.reverse().filter((dd: any) => dd.increased_qty != -99)
                    items.quantity[idx].freezeTailoringCutsom.stock_ids = ids
                      .reverse()
                      .filter((dd: any) => dd.increased_qty != -99);
                    const trsa = await con
                      .promise()
                      .query(
                        "UPDATE transactions_lines SET tailoring_custom = ? WHERE id = ?",
                        [
                          JSON.stringify(
                            items.quantity[idx].freezeTailoringCutsom
                          ),
                          elt.transaction_id,
                        ]
                      );
                    if (_remaining > 0) {
                      const upda = await con
                        .promise()
                        .query(
                          "UPDATE products SET qty_over_sold = qty_over_sold - ? WHERE id = ?",
                          [_remaining, _fabId]
                        );
                    }
                  }
                }
              });
            });
            console.log("_fabricQty ", _fabricQty, " lines ", sqlValuesForNew);
            // return
            //exceute update query if has return products
            if (sqlValuesForUpdate.length > 0) {
              const upRetu = await con
                .promise()
                .query(sqlCondiForUpdate, [sqlValuesForUpdate]);

              if (sqlValuesUpdateStock.length > 0) {
                await con
                  .promise()
                  .query(sqlCondiUpdateStock, [sqlValuesUpdateStock])
                  .then((rows: any, fields: any) => {})
                  .catch((err: QueryError) => {});
              }

              if (sqlValuesUpdateOverSell.length > 0) {
                await con
                  .promise()
                  .query(sqlCandiUpdateOverSell, [sqlValuesUpdateOverSell])
                  .then((rows: any, fields: any) => {})
                  .catch((err: QueryError) => {});
              }
              if (valUpdateStockTailoring.length > 0) {
                await con
                  .promise()
                  .query(sqlUpdateStockTailoring, [valUpdateStockTailoring])
                  .then((rows: any, fields: any) => {})
                  .catch((err: QueryError) => {
                    console.log("errror return tail pack ", err);
                  });
              }
            }
            if (sqlValuesTailoringUser.length > 0) {
              await con
                .promise()
                .query(sqlCondiTailoringUser, [sqlValuesTailoringUser])
                .then((rows: any, fields: any) => {
                  console.log("insert tailoring sizes ", rows);
                })
                .catch((err: QueryError) => {
                  console.log(err);
                });
            }
            //exceute query for add lines
            const insertedIds: any = [];
            if (sqlValuesForNew.length > 0) {
              await con
                .promise()
                .query(sqlCondiForNew, [sqlValuesForNew])
                .then(async (rows: any) => {
                  //add only tailoring package
                  for (let i = 0; i < rows[0].affectedRows; i++)
                    insertedIds.push(rows[0].insertId + i);
                  //update stock
                  const sqlCondi =
                    "INSERT into `stock` (id,qty_sold) VALUES ? as tb ON DUPLICATE KEY UPDATE qty_sold = stock.qty_sold + tb.qty_sold;";
                  const sqlValues: any = [];
                  //update over sell counter
                  const sqlCondiOverSell =
                    "INSERT into `products` (id,qty_over_sold) VALUES ? as pt ON DUPLICATE KEY UPDATE qty_over_sold = products.qty_over_sold + pt.qty_over_sold;";
                  const sqlValueOverSell: any = [];
                  items.orders.map((elt: any, idx: number) => {
                    items.quantity[idx].prices.map((prs: any) => {
                      if (prs.stock_id > 0)
                        sqlValues.push([prs.stock_id, prs.qty]);
                      else if (elt.is_service == 0)
                        sqlValueOverSell.push([elt.product_id, prs.qty]);
                    });
                  });

                  await con
                    .promise()
                    .query(sqlCondi, [sqlValues])
                    .then((rows: any, fields: any) => {})
                    .catch((err: QueryError) => {
                      console.log("err11: ", err);
                    });

                  if (sqlValueOverSell.length > 0) {
                    await con
                      .promise()
                      .query(sqlCondiOverSell, [sqlValueOverSell])
                      .then((rows: any, fields: any) => {})
                      .catch((err: QueryError) => {
                        console.log("err21: ", err);
                      });
                  }
                })
                .catch((err: QueryError) => {
                  console.log("erre: ", err);
                });

              console.log(
                "_fabricQty ",
                _fabricQty,
                "insertedIds ",
                insertedIds,
                _customTailringArray
              );
              //if has tailoring package
              await Promise.all(
                _fabricQty.map(async (fb: any, i: number) => {
                  let _stockQtys: any = [];
                  await con
                    .promise()
                    .query(
                      `SELECT 
                                            s.id AS 'stock_id',
                                            pro.id AS 'product_id',
                                            if(pro.is_service = 1 OR pro.type = 'package' OR s.id IS NULL,pro.sell_price,transactions_lines.price) AS price,
                                            COALESCE(s.qty_received,0) AS qty_received,
                                            COALESCE(s.qty_sold,0) AS qty_sold,
                                            COALESCE(s.qty_received,0) - COALESCE(s.qty_sold,0) AS qty
                                            
                                            FROM products pro
                                                left JOIN stock s ON (s.product_id = pro.id AND s.variation_id = 0)
                                                LEFT JOIN transactions_lines ON transactions_lines.id = s.transaction_lines_id
                                                    WHERE pro.location_id = ? AND COALESCE(s.qty_received,0) > COALESCE(s.qty_sold,0) AND pro.id = ?
                                                    ORDER BY pro.id`,
                      [shopId, fb.product_id]
                    )
                    .then(async (rows: any, fields: any) => {
                      if (rows[0].length > 0) _stockQtys = rows[0];
                      else _stockQtys = null;
                    })
                    .catch((err: QueryError) => {});

                  if (_stockQtys != null) {
                    let [updatedProducts, remainingItems] = increaseQtySold(
                      _stockQtys,
                      parseFloat(fb.qty)
                    );
                    for (let ii = 0; ii < updatedProducts.length; ii++) {
                      await con
                        .promise()
                        .query(
                          "UPDATE stock SET qty_sold = qty_sold + ? WHERE id = ?",
                          [
                            updatedProducts[ii].increased_qty,
                            updatedProducts[ii].stock_id,
                          ]
                        )
                        .then((rows: any, fields: any) => {})
                        .catch((err: QueryError) => {
                          console.log("err ", err);
                        });
                    }
                    //update over stock for remaining amount
                    if (remainingItems > 0) {
                      updatedProducts.push({
                        stock_id: 0,
                        increased_qty: remainingItems,
                      });
                      await con
                        .promise()
                        .query(
                          "UPDATE products SET qty_over_sold = qty_over_sold + ? WHERE id = ?",
                          [remainingItems, fb.product_id]
                        )
                        .then((rows: any, fields: any) => {})
                        .catch((err: QueryError) => {
                          console.log("err ", err);
                        });
                    }
                    //update stock ids into lines (tailroing_packs)
                    _customTailringArray[i].stock_ids = updatedProducts;
                    await con
                      .promise()
                      .query(
                        "UPDATE transactions_lines SET tailoring_custom = ? WHERE id = ?",
                        [
                          JSON.stringify(_customTailringArray[i]),
                          insertedIds[packageIndex[i]],
                        ]
                      )
                      .then((rows: any, fields: any) => {})
                      .catch((err: QueryError) => {
                        console.log("err ", err);
                      });
                  } else {
                    //update stock ids into lines (tailroing_packs)
                    _customTailringArray[i].stock_ids = [
                      { stock_id: 0, increased_qty: parseFloat(fb.qty) },
                    ];
                    await con
                      .promise()
                      .query(
                        "UPDATE transactions_lines SET tailoring_custom = ? WHERE id = ?",
                        [
                          JSON.stringify(_customTailringArray[i]),
                          insertedIds[packageIndex[i]],
                        ]
                      )
                      .then((rows: any, fields: any) => {})
                      .catch((err: QueryError) => {
                        console.log("errtrrtt ", err);
                      });
                    //update over stock for remaining amount
                    await con
                      .promise()
                      .query(
                        "UPDATE products SET qty_over_sold = qty_over_sold + ? WHERE id = ?",
                        [parseFloat(fb.qty), fb.product_id]
                      )
                      .then((rows: any, fields: any) => {})
                      .catch((err: QueryError) => {
                        console.log("err ", err);
                      });
                  }
                })
              );
            }

            console.log("the 2 id ", transaction_id);
            res
              .status(200)
              .json({
                success: true,
                msg: "transaction is created",
                newdata: transaction_id,
              });
            res.end();
            con.end();
            return;
          }
          if (subType == "close") {
            const { data } = req.body;
            var con = doConnect();

            const { cash, card, hand, bankm, cheque, note } = data;
            const _total = cash + card + bankm + cheque + hand;

            con.query(
              `INSERT INTO cash_registers(location_id,user_id,STATUS,closed_at,closing_amount,total_card_slips,total_cash,total_cheques,total_bank,closing_note,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
              [
                shopId,
                repo.data.id,
                "close",
                new Date().toISOString().slice(0, 19).replace('T', ' '),
                _total,
                card,
                cash,
                cheque,
                bankm,
                note,
                new Date().toISOString().slice(0, 19).replace('T', ' '),
              ],
              function (err: QueryError, prods: any) {
                if (err) console.log(err);

                res.setHeader("Content-Type", "application/json");
                res.status(200).json({ success: true, msg: "closed" });
                res.end();
                con.end();
                return;
              }
            );
          }
        } else redirection(403, con, res, "you have not permissions");
      } else redirection(401, con, res, "login first!");
    });
  } catch (eer) {
    console.log("eer", eer);

    manageError(res, null, "");
    return;
  } finally {
    //await con.end();
  }
}
