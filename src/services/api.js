import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

// Request interceptor — har request mein token attach karo
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("mauve_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response interceptor — 401 pe logout
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("mauve_token");
            localStorage.removeItem("mauve_user");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export default api;