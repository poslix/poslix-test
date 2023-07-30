import { getToken, redirectToLogin } from "./loginlib"
function redirectf(status) {
    console.log('what is status ', status);
    if (status == 401) {
        redirectToLogin()
    } else if (status == 403) {
        redirectToLogin('/page' + status)
    }
}
export const apiFetch = async (data) => {
    const response = await fetch('/api/getinfo', {
        method: 'Post',
        headers: {
            'content-type': 'application/json',
            'authorization': "Bearer " + getToken(),
        }, body: JSON.stringify(data)
    })
    // redirectf(response.status)
    return await response.json();
}
export const apiFetchCtr = async (data) => {
    const response = await fetch('/api/' + data.fetch + '/fetch', {
        method: 'Post',
        headers: {
            'content-type': 'application/json',
            'authorization': "Bearer " + getToken(),
        }, body: JSON.stringify(data)
    })
    //  redirectf(response.status)
    return await response.json();
}
export const apiDelete = async (data) => {
    const response = await fetch('/api/delete', {
        method: 'Post',
        headers: {
            'content-type': 'application/json'
        }, body: JSON.stringify(data)
    })
    return await response.json();
}
export const apiDeleteCtr = async (data) => {
    const response = await fetch('/api/' + data.type + '/delete', {
        method: 'Post',
        headers: {
            'content-type': 'application/json',
            'authorization': "Bearer " + getToken(),
        }, body: JSON.stringify(data)
    })
    return await response.json();
}

export const apiInsert = async (data) => {
    const response = await fetch('/api/insert', {
        method: 'Post',
        headers: {
            'content-type': 'application/json',
            'authorization': "Bearer " + getToken(),
        }, body: JSON.stringify(data)
    })
    return await response.json();
}

export const apiInsertCtr = async (data) => {
    const response = await fetch('/api/' + data.type + '/insert', {
        method: 'Post',
        headers: {
            'content-type': 'application/json',
            'authorization': "Bearer " + getToken(),
        }, body: JSON.stringify(data)
    })
    return await response.json();
}

export const apiUpdateCtr = async (data) => {
    const response = await fetch('/api/' + data.type + '/update', {
        method: 'Post',
        headers: {
            'content-type': 'application/json',
            'authorization': "Bearer " + getToken(),
        }, body: JSON.stringify(data)
    })
    return await response.json();
}
export const apiLogin = async (data) => {
    const response = await fetch('/api/authLogin', {
        method: 'Post',
        headers: {
            'content-type': 'application/json'
        }, body: JSON.stringify(data)
    })
    return await response.json();
}