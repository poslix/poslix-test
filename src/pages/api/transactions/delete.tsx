// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Data, ITokenVerfy } from "../../../models/common-model";
import { QueryError, RowDataPacket } from "mysql2";
var { doConnect, doConnectMulti } = require("../../../libs/myConnection");
import { locationPermission, redirection, verifayTokens } from "../checkUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    verifayTokens(req, async (repo: ITokenVerfy) => {
      if (repo.status === true) {
        const { shopId, subType, id } = req.body;
        if (locationPermission(repo.data.locs, shopId) != -1) {
          if (subType == "deleteSale") {
            var con = doConnect();
            con.query(
              `DELETE FROM transactions WHERE id = ?`,
              [id],
              function (err: QueryError, prods: RowDataPacket[]) {
                if (err) {
                  res.setHeader("Content-Type", "application/json");
                  res.status(200).json({ success: false, msg: "error" + err });
                  res.end();
                } else {
                  res.setHeader("Content-Type", "application/json");
                  res
                    .status(200)
                    .json({ success: true, msg: "Salse Deleted!" });
                  res.end();
                }
              }
            );
          }
        } else redirection(403, con, res, "you have not permissions");
      } else redirection(401, con, res, "login first!");
    });
  } catch (err) {
    console.log("error somthing wrong!");
    return;
  }
}
