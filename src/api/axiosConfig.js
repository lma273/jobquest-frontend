import axios from "axios";
// test 11:55 16.12
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
});
console.log("API BASE URL 12/1 =", import.meta.env.VITE_API_BASE_URL);


// Gắn token Bearer từ localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

