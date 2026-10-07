import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[API]", err.config?.url, err.message);
    return Promise.reject(err);
  },
);
