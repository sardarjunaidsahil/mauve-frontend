import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = authService.getStoredUser();
        if (stored && authService.getToken()) {
            authService.getMe()
                .then(setUser)
                .catch(() => { authService.logout(); setUser(null); })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const data = await authService.login(email, password);
        setUser(data.user);
        return data;
    };

    const register = async (formData) => {
        // register sirf email bhejta hai — user set nahi karta (verification pending)
        const data = await authService.register(formData);
        return data;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    // Verification ke baad call hota hai
    const loginWithToken = (token, userData) => {
        localStorage.setItem("token", token);
        authService.storeUser(userData);
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isLoggedIn: !!user,
            login,
            register,
            logout,
            loginWithToken,
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

export default AuthContext;