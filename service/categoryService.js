import api from "./api";

const categoryService = {
  getCategories: async () => {
    try {
      const response = await api.get("api/v1/category/all");
      return response;
    } catch (error) {
      console.error("Lỗi khi gọi API api/v1/category/all: ", error);
      throw error;
    }
  },

  getCategoriesPagination: async () => {
    const response = await api.get("api/v1/category");
    return response;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`api/v1/category/${id}`);
    return response;
  },

  createCategory: async (data) => {
    const response = await api.post("api/v1/category", data);
    return response;
  },

  updateCategory: async (id, data) => {
    const response = await api.put(`api/v1/category/${id}`, data);
    return response;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`api/v1/category/${id}`);
    return response;
  },
};

export default categoryService;
