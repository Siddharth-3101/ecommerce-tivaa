import axios from "axios";
import { getToken } from "./auth";

const getBaseURL = () => {
    // If running on server side (Next.js build or SSR)
    if (typeof window === "undefined") {
        return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    }
    
    // If running in browser:
    // If the site is accessed via HTTPS (deployed), always use relative '/api' 
    // to force Next.js API proxy rewrites and completely avoid Mixed Content browser blocks.
    if (window.location.protocol === "https:") {
        return "/api";
    }
    
    // Default fallback for local dev
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
};

const api = axios.create({
    baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const hasToken = getToken();
            const isLoginPage = typeof window !== "undefined" && window.location.pathname === "/login";
            
            if (hasToken && !isLoginPage) {
                // Clear expired/invalid token credentials to prevent getting stuck
                import("./auth").then(({ logout }) => {
                    logout();
                    if (typeof window !== "undefined") {
                        window.location.href = "/login?expired=true";
                    }
                });
            }
        }
        return Promise.reject(error);
    }
);

export default api;
