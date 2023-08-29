import type { NextApiResponse } from 'next';
import { Data, IDataLogin, ITokenUserInfo, IPageRules } from '../../models/common-model';
import mysql from 'mysql2/promise';
const jwt = require('jsonwebtoken');
export function generateAccessToken(idata: IDataLogin) {
  return jwt.sign(idata, process.env.TOKEN_SECRET, { expiresIn: '86400s' });
}

export function verifayTokens(req: any, callback: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return callback({ status: false, data: {} });
  if (typeof process.env.TOKEN_SECRET !== 'undefined' && process.env.TOKEN_SECRET) {
    jwt.verify(token, process.env.TOKEN_SECRET, (err: any, user: ITokenUserInfo) => {
      if (err) {
        return callback({ status: false, data: {} });
      }
      return callback({ status: true, data: user });
    });
  } else {
    // console.log("stp 5");
    return callback({ status: false, data: {} });
  }
}

export function locationPermission(data: any, id: string | number) {
  if (data == undefined) return false;
  return data.findIndex((it: any) => Number(it).toFixed(0) === Number(id).toFixed(0));
}
export function getMessageByErrorCode(status: number) {
  if (status == 1062) return 'Username is Taken,Try New One';

  return 'The information sent is wrong,Try Again';
}
export function redirection(
  status: number,
  con: any,
  res: NextApiResponse<Data>,
  msg = 'somthing Wrong',
  errorCode = 0
) {
  res.setHeader('Content-Type', 'application/json');
  res.status(status).json({ success: false, msg: msg, code: errorCode });
  res.end();
  con != undefined && con.end();
  return;
}
export function keyValueRules(rules: object[]) {
  var co = -1;
  return rules.reduce((c: any, v: any) => {
    co++;
    c[v.id] = c[v.id] || [];
    c[v.id].push({ stuff: v.stuff });
    return c;
  }, {});
}

export function keyValueTailoringSrizes(sizes: object[]) {
  var co = -1;
  return sizes.reduce((c: any, v: any) => {
    co++;
    c[v.tailoring_type_id] = c[v.tailoring_type_id] || [];
    c[v.tailoring_type_id].push(v);
    return c;
  }, {});
}
export function makePerProuctArrayOfPrice(rowProducts: object[]) {
  rowProducts.push({});
  let tempPro = 0,
    if_single_price = 0;
  var tempRows: any = [];
  var total_qty = 0;
  let products_multi: any = [],
    products: any = [];
  rowProducts.reduce((c: any, v: any) => {
    if (tempPro != v.product_id) {
      tempPro = v.product_id;
      if_single_price = v.price;
      if (tempRows.length > 0) {
        //if single price
        if (tempRows[0].is_selling_multi_price == 0) {
          if_single_price = tempRows[0].is_fifo
            ? tempRows[tempRows.length - 1].price
            : tempRows[0].price;
          tempRows.map((tr: any) => (tr.price = if_single_price));
        }
        products_multi.push(tempRows[0].is_fifo ? tempRows.reverse() : tempRows);
        products.push({
          name: tempRows[0].name,
          sku: tempRows[0].sku,
          type: tempRows[0].type,
          total_qty: total_qty,
          category_id: tempRows[0].category_id,
          brand_id: tempRows[0].brand_id,
          product_id: tempRows[0].product_id,
          price: tempRows[0].price,
          product_price: tempRows[0].product_price,
          cost: tempRows[0].cost,
          product_cost: tempRows[0].product_cost,
          image: tempRows[0].image,
          sell_over_stock: tempRows[0].sell_over_stock,
          is_service: tempRows[0].is_service,
          is_tailoring: tempRows[0].is_tailoring,
          tailoring_type_id: tempRows[0].tailoring_type_id,
          is_fabric: tempRows[0].is_fabric,
        });
      }
      total_qty = 0;
      tempRows = [];
    }
    total_qty += parseFloat(v.qty);
    tempRows.push(v);
    return c;
  }, {});

  return { products_multi, products };
}
export function makePerVarationArrayOfPrice(rowProducts: object[]) {
  rowProducts.push({});
  let tempPro = 0,
    tempRows: any = [],
    total_qty = 0,
    if_single_price = 0;
  let variations_multi: any = [],
    variations: any = [];
  rowProducts.reduce((c: any, v: any) => {
    if (tempPro != v.variation_id) {
      tempPro = v.variation_id;
      if_single_price = v.price;
      if (tempRows.length > 0) {
        variations_multi.push(tempRows);
        variations.push({
          variation_id: tempRows[0].variation_id,
          name: tempRows[0].name,
          total_qty: total_qty,
          product_id: tempRows[0].product_id,
          price: tempRows[0].price > 0 ? tempRows[0].price : tempRows[0].variation_price,
          cost: tempRows[0].cost,
          variation_price: tempRows[0].variation_price,
          variation_cost: tempRows[0].variation_cost,
          image: tempRows[0].image,
          sell_over_stock: tempRows[0].sell_over_stock,
          is_service: tempRows[0].is_service,
        });
      }
      total_qty = 0;
      tempRows = [];
    }
    total_qty += parseFloat(v.qty);
    if (v.stock_id > 0 && v.is_selling_multi_price == 0)
      tempRows.push({ ...v, price: if_single_price });
    else tempRows.push(v);
    return c;
  }, {});

  return { variations_multi, variations };
}
//delete its for test
export function hasPermissions_(_stuffs: string, page: string, specificRule = '0'): IPageRules {
  var _userRules: IPageRules = {
    hasDelete: false,
    hasEdit: false,
    hasView: false,
    hasInsert: false,
  };

  if (specificRule == '0') {
    _userRules.hasView = _stuffs.includes(page + '/view');
    _userRules.hasInsert = _stuffs.includes(page + '/insert');
    _userRules.hasEdit = _stuffs.includes(page + '/edit');
    _userRules.hasDelete = _stuffs.includes(page + '/delete');
  } else {
    _userRules.hasView = _stuffs.includes(page + '/' + specificRule);
  }

  return _userRules;
}
export function hasPermissions(_stuffs: string, page: string, specificRule = '0') {
  var userRules: IPageRules = {
    hasDelete: false,
    hasEdit: false,
    hasView: false,
    hasInsert: false,
  };

  if (specificRule == '0') {
    userRules.hasView = _stuffs.includes(page + '/view');
    userRules.hasInsert = _stuffs.includes(page + '/insert');
    userRules.hasEdit = _stuffs.includes(page + '/edit');
    userRules.hasDelete = _stuffs.includes(page + '/delete');
  } else {
    userRules.hasView = _stuffs.includes(page + '/' + specificRule);
  }
  var hasPermission = true;
  if (!userRules.hasView && !userRules.hasEdit && !userRules.hasDelete && !userRules.hasInsert)
    hasPermission = false;
  return { userRules, hasPermission };
}
export function getRealWord(word: string) {
  switch (word) {
    case 'add':
      return 'insert';
    default:
      return word;
  }
}
export function increaseQtySold2(products: any, soldItems: number) {
  let remainingItems = soldItems;
  const updatedProducts = products.map((product: any) => {
    if (product.qty_received > product.qty_sold) {
      const soldQty = Math.min(product.qty_received - product.qty_sold, remainingItems);
      remainingItems -= soldQty;
      return {
        ...product,
        qty_sold: parseFloat(product.qty_sold) + soldQty,
      };
    } else {
      return product;
    }
  });
  return [updatedProducts, remainingItems];
}
export function increaseQtySold3(products: any, soldItems: number) {
  let remainingItems = soldItems;
  const updatedProducts = products
    .map((product: any) => {
      if (product.qty_received > product.qty_sold) {
        const soldQty = Math.min(product.qty_received - product.qty_sold, remainingItems);
        remainingItems -= soldQty;
        const increasedQty = parseFloat(product.qty_sold) + soldQty;
        return {
          stock_id: product.stock_id,
          increased_qty: soldQty,
        };
      } else {
        return null;
      }
    })
    .filter((product: any) => product !== null);
  return updatedProducts;
}
export function increaseQtySold(products: any, soldItems: number): any {
  let remainingItems = soldItems;
  const updatedProducts = products
    .map((product: any) => {
      if (product.qty_received > product.qty_sold) {
        const soldQty = Math.min(product.qty_received - product.qty_sold, remainingItems);
        remainingItems -= soldQty;
        const increasedQty = parseFloat(product.qty_sold) + soldQty;
        return {
          stock_id: product.stock_id,
          increased_qty: increasedQty - parseFloat(product.qty_sold),
        };
      } else {
        return null;
      }
    })
    .filter((product: any) => product !== null);

  return [updatedProducts, remainingItems];
}
export function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
// escap all data
export const escapeData = (data: any): any => {
  if (typeof data === 'string') {
    return mysql.escape(data).replace(/'/g, '');
  } else if (typeof data === 'number') {
    return data;
  } else if (typeof data === 'boolean') {
    return data;
  } else if (Array.isArray(data)) {
    return data.map((item: any) => escapeData(item));
  } else if (typeof data === 'object' && data !== null) {
    const escapedData: any = {};
    for (const key in data) {
      escapedData[key] = escapeData(data[key]);
    }
    return escapedData;
  }
  return data;
};
//validation
export function _validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
export function _validatePassword(password: string) {
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])[^/\\]{6,}$/;
  return passwordRegex.test(password);
}
export function _validateName(name: string) {
  const nameRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
  return nameRegex.test(name);
}
export function _validatePhoneNumber(phoneNumber: string) {
  const phoneNumberRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneNumberRegex.test(phoneNumber);
}
export function isNumber(value: any): boolean {
  return /^[0-9]+$/.test(value);
}
export function areNumbers(values: any[]): boolean {
  return values.every((value) => /^[0-9]+$/.test(value));
}
