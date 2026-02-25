/**
 * @file src/services/api-service.ts
 */

import axios, { type InternalAxiosRequestConfig } from "axios";
import { logout } from "@/store/auth/auth-slice";
import { TokenService } from "./auth-service";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000/api/v1"
    : "https://op-blog-mo4u.onrender.com/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor: Attach access token
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // We dynamic import the store ONLY when a request is actually made
  // const { store } = await import("@/store");

  const token = TokenService.getToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Force Logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // We only dynamically import the store when we receive the response.
      const { store } = await import("@/store");

      store.dispatch(logout());
      window.location.href = "/auth/login";
      return Promise.reject("Token expired, please login again");
    }

    // CRITICAL: You must reject other errors so thunks can catch them!
    return Promise.reject(error);
  },
);

export default api;
