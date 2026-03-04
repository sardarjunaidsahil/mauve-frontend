import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";

export default function VerifyEmailPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithToken } = useAuth();

    const [email, setEmail] = useState(location.state?.email || "");
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) { setCanResend(true); return; }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError("");
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
        if (value && newCode.every(d => d !== "")) handleVerify(newCode.join(""));
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
            handleVerify(pasted);
        }
    };

    const handleVerify = async (codeStr) => {
        const verifyCode = codeStr || code.join("");
        if (verifyCode.length !== 6) { setError("Please enter the complete 6-digit code"); return; }
        if (!email) { setError("Email is required"); return; }
        setLoading(true);
        setError("");
        try {
            const res = await authService.verifyEmail(email, verifyCode);
            if (res.token) {
                loginWithToken(res.token, res.user);
                navigate("/", { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid code. Please try again.");
            setCode(["", "", "", "", "", ""]);
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
        } finally { setLoading(false); }
    };

    const handleResend = async () => {
        if (!canResend || !email) return;
        setResending(true);
        setError("");
        try {
            await authService.resendCode(email);
            setSuccess("New code sent to your email!");
            setCanResend(false);
            setCountdown(60);
            setCode(["", "", "", "", "", ""]);
            setTimeout(() => { setSuccess(""); inputRefs.current[0]?.focus(); }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to resend code");
        } finally { setResending(false); }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 py-16">
            <Link to="/" className="font-extrabold text-3xl text-black tracking-tight mb-10 hover:opacity-70 transition-opacity">
                MAUVE
            </Link>
            <div className="w-full max-w-md">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-black flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-black uppercase tracking-tight text-black text-center mb-2">Verify Your Email</h1>
                <p className="text-sm text-gray-400 text-center mb-8">
                    We sent a 6-digit code to<br />
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
                {success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-3 mb-5 text-center rounded-sm">
                        {success}
                    </div>
                )}

                {/* OTP Input */}
                <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                        <input key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text" inputMode="numeric" maxLength={1}
                            value={digit}
                            onChange={e => handleChange(index, e.target.value)}
                            onKeyDown={e => handleKeyDown(index, e)}
                            disabled={loading}
                            className={`w-12 h-14 text-center text-xl font-black border-2 outline-none transition-all rounded-sm
                                ${digit ? "border-black bg-black text-white" : "border-gray-200 text-black"}
                                focus:border-black focus:scale-105 disabled:opacity-50`}
                        />
                    ))}
                </div>

                {/* Verify Button */}
                <button onClick={() => handleVerify()} disabled={loading || code.some(d => !d)}
                    className={`w-full py-4 text-sm font-black uppercase tracking-widest transition-all duration-200 rounded-sm mb-4
                        ${loading || code.some(d => !d)
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-black text-white hover:bg-red-600"}`}>
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Verifying...
                        </span>
                    ) : "Verify Email"}
                </button>

                {/* Resend */}
                <div className="text-center">
                    <p className="text-sm text-gray-400">
                        Didn't receive the code?{" "}
                        {canResend ? (
                            <button onClick={handleResend} disabled={resending}
                                className="font-black text-black hover:text-red-600 transition-colors disabled:opacity-50">
                                {resending ? "Sending..." : "Resend Code"}
                            </button>
                        ) : (
                            <span className="font-semibold text-gray-400">
                                Resend in <span className="text-black font-black">{countdown}s</span>
                            </span>
                        )}
                    </p>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Wrong email?{" "}
                    <Link to="/register" className="font-black text-black hover:text-red-600 transition-colors">Go back</Link>
                </p>
            </div>
        </div>
    );
}