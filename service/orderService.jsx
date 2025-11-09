// src/services/orderService.ts
import api from "./api";

const orderService = {
  getAll: async () => {
    const response = await api.get("/order"); // endpoint API lấy tất cả đơn hàng
    return response.data; // trả về { success, status, message, data }
  },

  getById: async (id) => {
    const response = await api.get(`/order/${id}`);
    return response.data;
  },

  createOrder: async (data) => {
    const response = await api.post("/order", data);
    return response.data;
  },

  updateOrder: async (id, data) => {
    const response = await api.put(`/order/${id}`, data);
    return response.data;
  },

  deleteOrder: async (id) => {
    const response = await api.delete(`/order/${id}`);
    return response.data;
  },
};

export default orderService;
