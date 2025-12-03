import api from "./api";

const productService = {
  getProducts: async ({ page = 1, pageSize = 10, search = "" } = {}) => {
    const response = await api.get("/api/v1/product", {
      params: { page, pageSize, search },
    });
    return response;
  },

  getAll: async () => {
    try {
      const response = await api.get("/api/v1/product/all");
      return response;
    } catch (error) {
      console.error("Error with get all product: ", error);
    }
  },

  getProductById: async (id) => {
    const response = await api.get(`/api/v1/product/detail/${id}`);
    return response;
  },

  createProduct: async (data) => {
    const response = await api.post("/api/v1/product", data);
    return response;
  },

  updateProduct: async (id, data) => {
    const response = await api.put(`/api/v1/product/${id}`, data);
    return response;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/api/v1/product/${id}`);
    return response;
  },
};

export default productService;
