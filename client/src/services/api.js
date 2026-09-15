import axios from "axios";

// In dev: Vite proxies /api → http://localhost:5000/api (avoids CORS)
// In prod: set VITE_API_URL to your backend URL
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Required for HTTP-only cookie auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor — normalize error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default api;
