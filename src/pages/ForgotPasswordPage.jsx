import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) { setError("Please enter your email"); return; }
        setLoading(true);
        setError("");
        try {
            await api.post("/auth/forgot-password", { email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Try again.");
        } finally { setLoading(false); }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 py-16">
                <Link to="/" className="font-extrabold text-3xl text-black tracking-tight mb-10 hover:opacity-70 transition-opacity">
                    MAUVE
                </Link>
                <div className="w-full max-w-md text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-black flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-black mb-2">Check Your Email</h1>
                    <p className="text-sm text-gray-400 mb-8">
                        We sent a 6-digit reset code to<br />
                        <span className="font-bold text-black">{email}</span>
                    </p>
                    <button
                        onClick={() => navigate("/reset-password", { state: { email } })}
                        className="w-full py-4 text-sm font-black uppercase tracking-widest bg-black text-white hover:bg-red-600 transition-all rounded-sm">
                        Enter Reset Code →
                    </button>
                    <p className="text-xs text-gray-400 mt-4">
                        Didn't receive it?{" "}
                        <button onClick={() => setSent(false)} className="font-black text-black hover:text-red-600 transition-colors">
                            Try again
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 py-16">
            <Link to="/" className="font-extrabold text-3xl text-black tracking-tight mb-10 hover:opacity-70 transition-opacity">
                MAUVE
            </Link>
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-black flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-black uppercase tracking-tight text-black text-center mb-2">Forgot Password</h1>
                <p className="text-sm text-gray-400 text-center mb-8">
                    Enter your email and we'll send you a reset code.
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 mb-5 rounded-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500">Email Address</label>
                        <input
                            type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                            placeholder="you@example.com" autoComplete="email"
                            className="w-full border border-gray-300 px-4 py-3 text-sm font-medium text-black placeholder-gray-300 outline-none focus:border-black transition-colors rounded-sm"
                        />
                    </div>

                    <button type="submit" disabled={loading}
                        className={`w-full py-4 text-sm font-black uppercase tracking-widest transition-all duration-200 rounded-sm mt-2
                            ${loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-red-600"}`}>
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Sending...
                            </span>
                        ) : "Send Reset Code"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Remember your password?{" "}
                    <Link to="/login" className="font-black text-black hover:text-red-600 transition-colors">Sign in →</Link>
                </p>
            </div>
        </div>
    );
}