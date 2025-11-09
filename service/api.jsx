
"use client";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5052/api", // thay bằng URL backend của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: interceptor cho token
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default api;
