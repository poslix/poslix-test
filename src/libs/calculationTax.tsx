import { ITax, IreadyGroupTax } from "../models/common-model"
export function groupCalculation(taxGroup: ITax[]) {
    var co = -1;
    let newGroup = taxGroup.reduce((c: any, v: any) => {
        co++;
        c[v.parentId] = c[v.parentId] || {};
        c[v.parentId][co] = { id: v.id, name: v.name, amount: v.amount, amountType: v.amountType, taxType: v.taxType, isPrimary: v.isPrimary }
        return c;
    }, {});
    var readTaxGroup: { [key: string]: any } = {}
    for (var key in newGroup) {
        var _nonPrimary = 0, _primary = 0, _excises = 0, _servies_fixed = 0, _servies_percetage = 0;
        for (var iKey in newGroup[key]) {
            var obj: ITax = newGroup[key][iKey];
            if (obj.taxType == 'primary' && obj.isPrimary)
                _primary = obj.amount;
            else if (obj.taxType == 'primary')
                _nonPrimary += obj.amount;
            else if (obj.taxType == 'excise')
                _excises += obj.amount;
            else if (obj.taxType == 'service' && obj.amountType == 'percentage')
                _servies_percetage += obj.amount;
            else if (obj.taxType == 'service' && obj.amountType == 'fixed')
                _servies_fixed += obj.amount;
        }
        readTaxGroup[key] = { primary: _primary / 100, nonPrimary: _nonPrimary / 100, excises: _excises / 100, serviesFixed: _servies_fixed, servicesPercentage: _servies_percetage / 100 }
    }
    return readTaxGroup;
}
export function finalCalculation(readyGroup: IreadyGroupTax, priceItem: number) {
    if (!readyGroup)
        return priceItem;
    priceItem += (priceItem * readyGroup.excises)
    priceItem += (priceItem * (readyGroup.nonPrimary + readyGroup.servicesPercentage))
    priceItem += readyGroup.serviesFixed;
    priceItem += (priceItem * readyGroup.primary)
    return priceItem;
}