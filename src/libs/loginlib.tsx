import Router from 'next/router'

export const getToken = () => {
    const ownToken = localStorage.getItem('userinfo');
    if (ownToken != null)
        return ownToken;
    else
        return 'none';
}
export const getUsername = () => {
    const ownToken = localStorage.getItem('username');
    if (ownToken != null)
        return ownToken;
    else
        return 'none';
}
export const isLogin = () => {
    const ownToken = localStorage.getItem('userinfo');
    if (ownToken == null)
        return false

    return true
}
export const redirectToLogin = (url = '') => {
    Router.push(url == '' ? `/user/register` : url)
}
export const getMyShopId = (myQuery: any) => {
    if (typeof myQuery.id != undefined)
        return +Number(myQuery.id).toFixed(0);
    return 0;
}
export const getmyUsername = (qury: any): string => {
    if (typeof qury.username != undefined)
        return qury.username;
    return '0';
}