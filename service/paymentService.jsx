import api from "./api"; 

const paymentService = {
  createPayment: async (paymentData) => {
    const res = await api.post("/payment", paymentData);
    return res.data;
  },
};

export default paymentService;
