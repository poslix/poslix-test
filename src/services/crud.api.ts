import api from "src/utils/app-api"

export const findAllData = async (url) => {
    return await api.get(url)
}

export const createNewData = async (url, data) => {
    return await api.post(url, data)
}

export const updateData = async (url, id, data) => {
    return await api.put(`${url}/${id}`, data)
}

export const deleteData = async (url, id) => {
    return await api.delete(`${url}/${id}`)
}