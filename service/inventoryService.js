import api from "./api";

const inventoryService = {
  // Lấy danh sách tồn kho (có phân trang)
  getInventory: async (page = 1, pageSize = 10) => {
    try {
      const response = await api.get(`/inventory?page=${page}&pageSize=${pageSize}`);
      return response.data; // { success, status, message, result, meta }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      throw error;
    }
  },

  // Lấy tồn kho theo Product ID
  getInventoryByProductId: async (productId) => {
    try {
      const response = await api.get(`/inventory/product/${productId}`);
      return response.data; // { success, status, message, data }
    } catch (error) {
      console.error(`Error fetching inventory for product ${productId}:`, error);
      throw error;
    }
  },

  // Cập nhật số lượng tồn kho
  updateInventory: async (data) => {
    try {
      const response = await api.put("/inventory", data);
      return response.data;
    } catch (error) {
      console.error("Error updating inventory:", error);
      throw error;
    }
  },

  // Nhập hàng (thủ công)
  importInventory: async (data) => {
    try {
      const response = await api.post("/inventory/import", data);
      return response.data;
    } catch (error) {
      console.error("Error importing inventory:", error);
      throw error;
    }
  },

  // Nhập hàng từ Excel
  importFromExcel: async (file, userId) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      const response = await api.post("/inventory/import-excel", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error importing from Excel:", error);
      throw error;
    }
  },

  // Lấy báo cáo tồn kho
  getInventoryReport: async (startDate = null, endDate = null) => {
    try {
      let url = "/inventory/report";
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append("startDate", startDate);
      }
      if (endDate) {
        params.append("endDate", endDate);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);
      return response.data; // { success, status, message, data: [...] }
    } catch (error) {
      console.error("Error fetching inventory report:", error);
      throw error;
    }
  },
};

export default inventoryService;