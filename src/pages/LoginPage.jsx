import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPass, setShowPass] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 py-16">
            <Link to="/" className="font-extrabold text-3xl text-black tracking-tight mb-10 hover:opacity-70 transition-opacity">
                MAUVE
            </Link>
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-black uppercase tracking-tight text-black text-center mb-1">Welcome Back</h1>
                <p className="text-sm text-gray-400 text-center mb-8">
                    Enter your details to sign in.{" "}
                    <Link to="/register" className="text-black font-semibold hover:text-red-600 transition-colors underline">Create account</Link>
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 mb-5 rounded-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} autoComplete="on" className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            autoComplete="email"
                            className="w-full border border-gray-300 px-4 py-3 text-sm font-medium text-black placeholder-gray-300 outline-none focus:border-black transition-colors rounded-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500">Password</label>
                            <Link to="/forgot-password" className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors">Forgot password?</Link>
                        </div>
                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="w-full border border-gray-300 px-4 py-3 pr-12 text-sm font-medium text-black placeholder-gray-300 outline-none focus:border-black transition-colors rounded-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                tabIndex={-1}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors p-1"
                            >
                                {showPass ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 text-sm font-black uppercase tracking-widest transition-all duration-200 rounded-sm mt-2
                            ${loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-red-600"}`}
                    >
                        {loading ? "SIGNING IN..." : "SIGN IN"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{" "}
                    <Link to="/register" className="font-black text-black hover:text-red-600 transition-colors">Create one →</Link>
                </p>
            </div>
        </div>
    );
}