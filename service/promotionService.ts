import api from "./api";
import { Promotion, ApiListResponse } from "@/lib/types";

const PromotionService = {
  getAllPromotion: async () => {
    const res = await api.get("/api/v1/promotion");
    return res;
  },

  createPromotion: async (data: any) => {
    const response = await api.post("/api/v1/promotion", data);
    return response;
  },

  updatePromotion: async (id: any, data: any) => {
    const response = await api.put(`/api/v1/promotion/${id}`, data);
    return response;
  },

  deletePromotion: async (id: any) => {
    const response = await api.delete(`/api/v1/promotion/${id}`);
    return response;
  },
};

export default PromotionService;
