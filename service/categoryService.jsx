import api from "./api";

const categoryService = {
  getCategories: async () => {
    const response = await api.get("/category");
    return response.data.result;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/category/${id}`);
    return response.data;
  },

  createCategory: async (data) => {
    const response = await api.post("/category", data);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await api.put(`/category/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/category/${id}`);
    return response.data;
  },
};

export default categoryService;
