import axios from "axios";

const baseURL = import.meta.env.VITE_ADMIN_API_BASE_URL ?? "http://localhost:3000/v1/admin";

export const http = axios.create({
  baseURL,
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
