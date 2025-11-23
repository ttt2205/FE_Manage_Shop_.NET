import api from "./api";

const supplierService = {
  // Lấy danh sách nhà cung cấp (có phân trang)
  getSuppliers: async (page = 1, pageSize = 10) => {
    try {
      const response = await api.get(`/supplier?page=${page}&pageSize=${pageSize}`);
      return response.data; // { success, status, message, result, meta }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
  },

  // Lấy tất cả nhà cung cấp (không phân trang)
  getAllSuppliers: async () => {
    try {
      const response = await api.get("/supplier?page=1&pageSize=1000");
      return response.data.result || [];
    } catch (error) {
      console.error("Error fetching all suppliers:", error);
      throw error;
    }
  },

  // Lấy nhà cung cấp theo ID
  getSupplierById: async (id) => {
    try {
      const response = await api.get(`/supplier/${id}`);
      return response.data; // { success, status, message, data }
    } catch (error) {
      console.error(`Error fetching supplier ${id}:`, error);
      throw error;
    }
  },

  // Tạo nhà cung cấp mới
  createSupplier: async (data) => {
    try {
      const response = await api.post("/supplier", data);
      return response.data; // { success, status, message, data }
    } catch (error) {
      console.error("Error creating supplier:", error);
      throw error;
    }
  },

  // Cập nhật nhà cung cấp
  updateSupplier: async (id, data) => {
    try {
      const response = await api.put(`/supplier/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating supplier ${id}:`, error);
      throw error;
    }
  },

  // Xóa nhà cung cấp
  deleteSupplier: async (id) => {
    try {
      const response = await api.delete(`/supplier/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting supplier ${id}:`, error);
      throw error;
    }
  },
};

export default supplierService;