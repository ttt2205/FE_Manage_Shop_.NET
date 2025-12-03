// src/services/orderService.ts
import api from "./api";

const orderService = {
  getAll: async () => {
    const response = await api.get("/api/v1/order"); // endpoint API lấy tất cả đơn hàng
    return response; // trả về { success, status, message, data }
  },

  getById: async (id) => {
    const response = await api.get(`/api/v1/order/${id}`);
    return response;
  },

  createOrder: async (data) => {
    const response = await api.post("/api/v1/order", data);
    return response;
  },

  updateOrder: async (id, data) => {
    const response = await api.put(`/api/v1/order/${id}`, data);
    return response;
  },

  deleteOrder: async (id) => {
    const response = await api.delete(`/api/v1/order/${id}`);
    return response;
  },

  getOrdersByDate: async (date) => {
    const response = await api.get(`/api/v1/order/by-date`, {
      params: { date }
    });
    return response;
  }
};

export default orderService;
