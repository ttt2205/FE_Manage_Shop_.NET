// src/services/OrderService.ts
import api from "./api";

const OrderService = {
  getAll: async () => {
    const response = await api.get("/api/v1/Order"); // endpoint API lấy tất cả đơn hàng
    return response; // trả về { success, status, message, data }
  },

  getById: async (id) => {
    const response = await api.get(`/api/v1/Order/${id}`);
    return response;
  },

  createOrder: async (data) => {
    try {
      const response = await api.post("/api/v1/Order", data);
      return response;
    } catch (error) {
      console.error("Error creating order: ", error);
      throw error;
    }
  },

  updateOrder: async (id, data) => {
    const response = await api.put(`/api/v1/Order/${id}`, data);
    return response;
  },

  deleteOrder: async (id) => {
    const response = await api.delete(`/api/v1/Order/${id}`);
    return response;
  },

  getOrdersByDate: async (date) => {
    const response = await api.get(`/api/v1/Order/by-date`, {
      params: { date }
    });
    return response;
  }
};

export default OrderService;
