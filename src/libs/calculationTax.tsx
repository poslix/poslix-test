import { ITax, IreadyGroupTax } from '../models/common-model';
export function groupCalculation(taxGroup: ITax[]) {
  var co = -1;
  let newGroup = taxGroup.reduce((c: any, v: any) => {
    co++;
    c[v.parentId] = c[v.parentId] || {};
    c[v.parentId][co] = {
      id: v.id,
      name: v.name,
      amount: v.amount,
      amountType: v.type,
      taxType: v.tax_type,
      is_primary: v.is_primary,
    };
    return c;
  }, {});
  var readTaxGroup: { [key: string]: any } = {};
  for (var key in newGroup) {
    var _nonPrimary = 0,
      _primary = 0,
      _excises = 0,
      _servies_fixed = 0,
      _servies_percetage = 0;
    for (var iKey in newGroup[key]) {
      var obj: ITax = newGroup[key][iKey];
      if (obj.tax_type == 'primary' && obj.is_primary) _primary = obj.amount;
      else if (obj.tax_type == 'primary') _nonPrimary += obj.amount;
      else if (obj.tax_type == 'excise') _excises += obj.amount;
      else if (obj.tax_type == 'service' && obj.type == 'percentage')
        _servies_percetage += obj.amount;
      else if (obj.tax_type == 'service' && obj.type == 'fixed') _servies_fixed += obj.amount;
    }
    readTaxGroup[key] = {
      primary: _primary / 100,
      nonPrimary: _nonPrimary / 100,
      excises: _excises / 100,
      serviesFixed: _servies_fixed,
      servicesPercentage: _servies_percetage / 100,
    };
  }
  return readTaxGroup;
}
export function finalCalculation(readyGroup: IreadyGroupTax, priceItem: number) {
  if (!readyGroup) return priceItem;
  priceItem += priceItem * readyGroup.excises;
  priceItem += priceItem * (readyGroup.nonPrimary + readyGroup.servicesPercentage);
  priceItem += readyGroup.serviesFixed;
  priceItem += priceItem * readyGroup.primary;
  return priceItem;
}
