// requests.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // dùng Bearer token thì tắt cái này
});

// Lấy token từ localStorage
const getToken = () => localStorage.getItem("token");

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // <— quan trọng
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Tự xử lý 401: xoá token + đá về /login
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      // KHÔNG redirect ở đây
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
