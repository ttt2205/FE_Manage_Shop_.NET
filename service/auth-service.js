import api from "./api"
import ENDPOINTS from "../lib/api/endpoints"

const { AUTH } = ENDPOINTS;

export const login = async (username, password) => {
    try {
        const res = await api.post(AUTH.LOGIN, { username, password });
        console.log("res login: ", res);

        const token = res?.data?.token;
        const user = res?.data?.user;

        if (res.status === 200 && token && user) {
            localStorage.setItem("accessToken", token);
            localStorage.setItem("currentUser", JSON.stringify(user));
        }

        return res;

    } catch (error) {
        console.error("Login failed:", error);

        return {
            status: error?.response?.status || 500,
            data: error?.response?.data || { message: "Server error" }
        };
    }
};
