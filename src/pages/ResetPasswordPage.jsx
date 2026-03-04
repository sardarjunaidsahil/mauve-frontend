import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState(location.state?.email || "");
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [resending, setResending] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (countdown <= 0) { setCanResend(true); return; }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleCodeChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError("");
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0)
            inputRefs.current[index - 1]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            setCode(pasted.split(""));
            inputRefs.current[5]?.focus();
        }
    };

    const handleResend = async () => {
        if (!canResend || !email) return;
        setResending(true);
        try {
            await api.post("/auth/forgot-password", { email });
            setCanResend(false);
            setCountdown(60);
            setCode(["", "", "", "", "", ""]);
            setError("");
        } catch {
            setError("Failed to resend. Try again.");
        } finally { setResending(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const codeStr = code.join("");
        if (codeStr.length !== 6) { setError("Please enter the complete 6-digit code"); return; }
        if (!newPassword) { setError("Please enter a new password"); return; }
        if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
        if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
        if (!email) { setError("Email is required"); return; }

        setLoading(true);
        setError("");
        try {
            await api.post("/auth/reset-password", { email, code: codeStr, newPassword });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Try again.");
            setCode(["", "", "", "", "", ""]);
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
        } finally { setLoading(false); }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 py-16">
                <Link to="/" className="font-extrabold text-3xl text-black tracking-tight mb-10 hover:opacity-70 transition-opacity">
                    MAUVE
                </Link>
                <div className="w-full max-w-md text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-black flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-black mb-2">Password Reset! 🎉</h1>
                    <p className="text-sm text-gray-400 mb-6">
                        Your password has been updated successfully.<br />
                        Redirecting to login...
                    </p>
                    <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-black animate-[shrink_3s_linear_forwards]" style={{ animation: "width 3s linear forwards", width: "100%" }} />
                    </div>
                    <Link to="/login" className="inline-block mt-6 text-sm font-black text-black hover:text-red-600 transition-colors">
                        Sign in now →
                    </Link>
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
                    <div className="w-16 h-16 bg-red-600 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-black uppercase tracking-tight text-black text-center mb-2">Reset Password</h1>
                <p className="text-sm text-gray-400 text-center mb-8">
                    Enter the code sent to{" "}
                    <span className="font-bold text-black">{email || "your email"}</span>
                </p>

                {/* Email input if not pre-filled */}
                {!location.state?.email && (
                    <div className="mb-5">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5 block">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full border border-gray-300 px-4 py-3 text-sm font-medium outline-none focus:border-black transition-colors rounded-sm" />
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 mb-5 text-center rounded-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* OTP */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 block">Reset Code</label>
                        <div className="flex justify-center gap-3" onPaste={handlePaste}>
                            {code.map((digit, index) => (
                                <input key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text" inputMode="numeric" maxLength={1}
                                    value={digit}
                                    onChange={e => handleCodeChange(index, e.target.value)}
                                    onKeyDown={e => handleKeyDown(index, e)}
                                    disabled={loading}
                                    className={`w-12 h-14 text-center text-xl font-black border-2 outline-none transition-all rounded-sm
                                        ${digit ? "border-red-600 bg-red-600 text-white" : "border-gray-200 text-black"}
                                        focus:border-red-600 focus:scale-105 disabled:opacity-50`}
                                />
                            ))}
                        </div>
                        <div className="text-center mt-3">
                            <p className="text-xs text-gray-400">
                                {canResend ? (
                                    <button type="button" onClick={handleResend} disabled={resending}
                                        className="font-black text-black hover:text-red-600 transition-colors disabled:opacity-50">
                                        {resending ? "Sending..." : "Resend Code"}
                                    </button>
                                ) : (
                                    <span>Resend in <span className="font-black text-black">{countdown}s</span></span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500">New Password</label>
                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(""); }}
                                placeholder="Min. 6 characters" autoComplete="new-password"
                                className="w-full border border-gray-300 px-4 py-3 pr-12 text-sm font-medium text-black placeholder-gray-300 outline-none focus:border-black transition-colors rounded-sm"
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors p-1">
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

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-500">Confirm Password</label>
                        <input
                            type={showPass ? "text" : "password"}
                            value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(""); }}
                            placeholder="Re-enter new password" autoComplete="new-password"
                            className={`w-full border px-4 py-3 text-sm font-medium text-black placeholder-gray-300 outline-none transition-colors rounded-sm
                                ${confirmPassword && newPassword !== confirmPassword ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"}`}
                        />
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-xs text-red-500 font-semibold">Passwords do not match</p>
                        )}
                    </div>

                    <button type="submit" disabled={loading}
                        className={`w-full py-4 text-sm font-black uppercase tracking-widest transition-all duration-200 rounded-sm
                            ${loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-red-600"}`}>
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Resetting...
                            </span>
                        ) : "Reset Password"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    <Link to="/login" className="font-black text-black hover:text-red-600 transition-colors">← Back to Login</Link>
                </p>
            </div>
        </div>
    );
}