import api from "./api";

const productService = {
  getProducts: async () => {
    const response = await api.get("/product");
    return response.data.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/product/${id}`);
    return response.data;
  },

  createProduct: async (data) => {
    const response = await api.post("/product", data);
    return response.data;
  },

  updateProduct: async (id, data) => {
    const response = await api.put(`/product/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
  },
};

export default productService;
