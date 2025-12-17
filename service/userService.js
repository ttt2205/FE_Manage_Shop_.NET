import api from "./api"
import ENDPOINTS from "../lib/api/endpoints"

const { USER } = ENDPOINTS

export const getPaginationUser = async ({ page, size, search = "" }) => {
    try {
        const res = await api.get(USER.GET_PAGINATION, {
            params: {
                page,
                size,
                search
            }
        });
        console.log("res getPagination user: ", res)
        return res;
    } catch (error) {
        console.error("Error getPaginationUser: ", error);
    }
}

export const createUser = async (data) => {
    try {
        const res = await api.post(USER.CREATE, data);
        console.log("res createUser: ", res)
        return res;
    } catch (error) {
        console.error("Error createUser: ", error);
        throw error;
    }
}

export const updateUser = async (id, data) => {
    try {
        console.log("data update user: ", data)
        const res = await api.put(USER.UPDATE(id), data);
        console.log("res updateUser: ", res)
        return res;
    } catch (error) {
        console.error("Error updateUser: ", error);
        throw error;
    }
}

export const deleteUser = async (id) => {
    try {
        const res = await api.delete(USER.DELETE(id));
        console.log("res deleteUser: ", res)
        return res;
    } catch (error) {
        console.error("Error deleteUser: ", error);
    }
}