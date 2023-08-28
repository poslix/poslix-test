import { QueryError, type Connection } from 'mysql2';
import type { NextApiRequest, NextApiResponse } from 'next';
import { doConnect } from '../../libs/myConnection';
import { generateAccessToken } from './checkUtils';

type Data = {
  success: boolean;
  msg: string;
  newdata?: object;
};

let con: Connection;

function returnWrong(status: number, con: any, res: NextApiResponse<Data>, msg = 'somthing Wrong') {
  res.setHeader('Content-Type', 'application/json');
  res.status(status).json({ success: false, msg });
  res.end();
  con.end();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.body.type == 'signin') {
    const { data } = req.body;
    con = doConnect();

    let _user: any = {};
    let _userStuffs: any = {};
    let _token = '';
    let _rules: any = '';
    let _myBusiness: any = '';
    const _UserBusiness: any = [];
    let _resObj: any = [];
    const _locs: any = [];
    const _types: any = [];
    // get user and his rules
    await con
      .promise()
      .query(
        `SELECT users.id,users.user_type,users.username,users.first_name as 'name',user_stuff.stuff_ids,user_stuff.location_id AS 'stuff_location',users.owner_id
            FROM users
                left JOIN user_stuff ON user_stuff.user_id = users.id
                    WHERE email = ? and password = ? limit 100`,
        [data.mail, data.password]
      )
      .then((rows: any) => {
        if (rows[0].length > 0) {
          _userStuffs = rows[0];
        } else {
          _userStuffs = null;
        }
      })
      .catch((err: QueryError) => {
        returnWrong(401, con, res);
      });

    if (_userStuffs != null) {
      _user = _userStuffs[0];
      const isOwner = _user.user_type == 'owner';
      const _finalRules: any = [];
      // get locations
      await con
        .promise()
        .query(
          `SELECT business_locations.id as 'value',business_locations.name as 'label',business_locations.currency_id,business_locations.decimal_places AS 'currency_decimal_places',currencies.code AS 'currency_code',currencies.symbol AS 'currency_symbol',currencies.exchange_rate AS 'currency_rate',business_types.name,business_types.hash_id AS 'typeid'
            FROM business_locations
                INNER JOIN currencies ON currencies.id = business_locations.currency_id
                INNER JOIN business ON business.id = business_locations.business_id
                INNER JOIN business_types ON business_types.id = business.type_id
                    WHERE business_locations.owner_id = ?`,
          [isOwner ? _user.id : _user.owner_id]
        )
        .then((rows: any) => {
          _myBusiness = rows[0];
        })
        .catch((err: QueryError) => {});

      if (!isOwner) {
        // get user permissions
        await con
          .promise()
          .query('SELECT id,name,stuff FROM stuffs WHERE owner_id = ?', [_user.owner_id])
          .then((rows: any) => {
            _rules = rows[0];
          })
          .catch((err: QueryError) => {});

        // get user rules
        // console.log('spliiiit');
        // console.log(_myBusiness);

        _rules.map((rls: any) => {
          _userStuffs.map((stuf: any, i: number) => {
            if (`,${stuf.stuff_ids}`.includes(`,${rls.id},`)) {
              _finalRules.push({ id: stuf.stuff_location, stuff: rls.stuff });
              _locs.push(stuf.stuff_location);
            }
          });
        });
        if (_finalRules.length == 0) {
          returnWrong(200, con, res, "you don't have permissions,contact your administrator");
          return;
        }
        // get business list
        _userStuffs.map((rls: any) => {
          _myBusiness.map((bus: any, i: number) => {
            if (bus.value == rls.stuff_location) {
              _UserBusiness.push(bus);
              _types.push({ id: bus.value, type: bus.typeid });
            }
          });
        });
      } else {
        for (const element of _myBusiness) {
          _locs.push(element.value);
          _types.push({
            id: element.value,
            type: element.typeid,
          });
        }
        _finalRules.push({ id: -2, stuff: 'owner' });
      }

      _token = generateAccessToken({
        id: _user.id,
        level: _user.user_type,
        locs: _locs,
        types: _types,
        rules: _finalRules,
        oid: _user.owner_id,
      });
      _resObj = {
        user: {
          name: _user.name,
          username: _user.username,
          level: _user.user_type,
        },
        token: _token,
        myBusiness: isOwner ? _myBusiness : _UserBusiness,
      };

      // send headers
      // console.log('final ', _finalRules, ' user ', _resObj);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({ success: true, msg: 'login ok', newdata: _resObj });
      res.end();
      con.end();
    } else {
      returnWrong(200, con, res, 'email or paswword is wrong');
    }
  } else {
    returnWrong(400, con, res, 'bad reqeust');
  }
}
