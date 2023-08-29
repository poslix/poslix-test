import { apiFetch } from 'src/libs/dbUtils';

export async function FetchUserShops() {
  var userShops = await apiFetch({ fetch: 'userShops' });

  var shops = [];
  if (userShops.userShops && userShops.userShops.length > 0) {
    shops = userShops.userShops;
  }

  return shops;
}

//

export async function GetShopSubscription(shopID) {
  var userShops = await apiFetch({
    fetch: 'getShopSubscription',
    shopID: shopID,
  });

  var shops = [];
  if (userShops.userShops && userShops.userShops.length > 0) {
    shops = userShops.userShops;
  }

  return shops;
}

export async function GetShopActiveSubscription(shopID) {
  var userShops = await apiFetch({
    fetch: 'getShopActiveSubscription',
    shopID: shopID,
  });

  var shops = [];
  if (userShops.userShops && userShops.userShops.length > 0) {
    shops = userShops.userShops;
  }

  return shops;
}
