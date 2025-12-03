import api from "./api"
import ENDPOINTS from "../lib/api/endpoints"

const { CUSTOMER } = ENDPOINTS

export const getPaginationCustomer = async ({ page, size, search = "" }) => {
    try {
        const res = await api.get(CUSTOMER.GET_PAGINATION, {
            params: {
                page,
                size,
                search
            }
        });
        console.log("res getPagination customer: ", res)
        return res;
    } catch (error) {
        console.error("Error getPaginationCustomer: ", error);
    }
}

export const createCustomer = async (data) => {
    try {
        const res = await api.post(CUSTOMER.CREATE, data);
        console.log("res createCustomer: ", res)
        return res;
    } catch (error) {
        console.error("Error createCustomer: ", error);
    }
}

export const updateCustomer = async (id, data) => {
    try {
        const res = await api.put(CUSTOMER.UPDATE(id), data);
        console.log("res updateCustomer: ", res)
        return res;
    } catch (error) {
        console.error("Error updateCustomer: ", error);
    }
}

export const deleteCustomer = async (id) => {
    try {
        const res = await api.delete(CUSTOMER.DELETE(id));
        console.log("res deleteCustomer: ", res)
        return res;
    } catch (error) {
        console.error("Error deleteCustomer: ", error);
    }
}