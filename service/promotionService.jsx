import api from "./api";

const PromotionService = {
    getAllPromotion: async () => {
       const response = await api.get("/promotion")
        return response.data.data;
    },

    createPromotion: async (data) => {
        const response = await api.post("/promotion", data)
        return  response.data;
    },

    updatePromotion: async (id,data) => {
        const response = await api.put(`/promotion/${id}`, data)
        return response.data
    },

    deletePromotion: async (id) => {
        const response = await api.delete(`/promotion/${id}`)
        return response.data
    },
}

export default PromotionService