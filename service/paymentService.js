import api from "./api";

const paymentService = {
  createPayment: async (paymentData) => {
    const res = await api.post("/api/v1/payment", paymentData);
    return res;
  },
};

export default paymentService;
