import api from "./api";

const authService = {

    async register(data) {
        // Sirf verification code bhejta hai — token nahi milta
        const res = await api.post("/auth/register", data);
        return res.data;
    },

    async login(email, password) {
        const res = await api.post("/auth/login", { email, password });
        if (res.data.token) {
            localStorage.setItem("mauve_token", res.data.token);
            localStorage.setItem("mauve_user", JSON.stringify(res.data.user));
        }
        return res.data;
    },

    // Email verification ke baad call hota hai
    async verifyEmail(email, code) {
        const res = await api.post("/auth/verify-email", { email, code });
        if (res.data.token) {
            localStorage.setItem("mauve_token", res.data.token);
            localStorage.setItem("mauve_user", JSON.stringify(res.data.user));
        }
        return res.data;
    },

    // Naya code bhejo
    async resendCode(email) {
        const res = await api.post("/auth/resend-code", { email });
        return res.data;
    },

    async getMe() {
        const res = await api.get("/auth/me");
        return res.data.user;
    },

    async changePassword(currentPassword, newPassword) {
        const res = await api.post("/auth/change-password", { currentPassword, newPassword });
        return res.data;
    },

    logout() {
        localStorage.removeItem("mauve_token");
        localStorage.removeItem("mauve_user");
    },

    getStoredUser() {
        try {
            return JSON.parse(localStorage.getItem("mauve_user")) || null;
        } catch { return null; }
    },

    getToken() {
        return localStorage.getItem("mauve_token");
    },

    // loginWithToken ke liye — AuthContext use karta hai
    storeUser(userData) {
        localStorage.setItem("mauve_user", JSON.stringify(userData));
    },

    isLoggedIn() {
        return !!localStorage.getItem("mauve_token");
    },
};

export default authService;