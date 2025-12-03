"use client";
import axios from "axios";

// Tạo instance axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BACKEND_URL, // Thay bằng URL backend của bạn
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // timeout 10s
});

// Request interceptor: thêm token nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: xử lý lỗi chung
api.interceptors.response.use(
  (response) => response?.data,
  (error) => {
    if (error.response) {
      // Ví dụ xử lý lỗi 401 hoặc thông báo từ server
      if (error.response.status === 401) {
        console.warn("Unauthorized! Redirecting to login...");
        localStorage.removeItem("token");
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
