import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import orderService from "../services/orderService";

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Other"];
const PROVINCES = ["Punjab", "Sindh", "KPK", "Balochistan", "AJK", "Gilgit-Baltistan", "Islamabad Capital Territory"];
const SHIPPING_FEE = 199;
const steps = ["Shipping", "Payment", "Review"];
const inputCls = "w-full border border-gray-300 px-4 py-3 text-sm font-medium text-black placeholder-gray-300 outline-none focus:border-black transition-colors bg-white";

function Field({ label, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500">{label}</label>
            {children}
        </div>
    );
}

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { items, subtotal, clearCart } = useCart();
    const { user, isLoggedIn } = useAuth();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [payment, setPayment] = useState("cod");
    const [notes, setNotes] = useState("");
    const [address, setAddress] = useState({
        fullName: user ? `${user.firstName} ${user.lastName}` : "",
        phone: "", address: "", city: "", province: "",
    });

    const total = subtotal + SHIPPING_FEE;
    const installment = Math.round(total / 3);

    const handleAddressChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
        setError("");
    };

    const validateAddress = () => {
        if (!address.fullName.trim()) return "Full name is required";
        if (!address.phone.trim()) return "Phone number is required";
        if (!address.address.trim()) return "Address is required";
        if (!address.city) return "City is required";
        if (!address.province) return "Province is required";
        return null;
    };

    const handleNext = () => {
        if (step === 0) {
            const err = validateAddress();
            if (err) { setError(err); return; }
        }
        setError("");
        setStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePlaceOrder = async () => {
        if (!items.length) return;
        setLoading(true);
        setError("");
        try {
            const orderItems = items.map((item) => ({
                productId: item.id, name: item.name,
                image: item.images?.[0] || item.image || "",
                price: item.price, size: item.size,
                color: item.color, quantity: item.quantity,
            }));
            const order = await orderService.createOrder({
                items: orderItems,
                pricing: { subtotal, shippingFee: SHIPPING_FEE, discountAmount: 0, total },
                address, paymentMethod: payment, notes,
            });
            clearCart();
            navigate(`/order-success/${order.id}`);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to place order.");
            setLoading(false);
        }
    };

    if (!items.length && !loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-5">
                <p className="text-sm font-black uppercase tracking-widest text-gray-400">Your cart is empty</p>
                <Link to="/" className="bg-black text-white text-xs font-black px-8 py-3 uppercase tracking-widest hover:bg-red-600 transition-colors">
                    CONTINUE SHOPPING
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
                    <Link to="/" className="font-extrabold text-xl text-black tracking-tight">MAUVE</Link>
                    <div className="flex items-center gap-2">
                        {steps.map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${i < step ? "bg-green-500 text-white" : i === step ? "bg-black text-white" : "bg-gray-200 text-gray-400"}`}>
                                        {i < step ? "✓" : i + 1}
                                    </div>
                                    <span className={`text-xs font-bold hidden sm:block uppercase tracking-wide ${i === step ? "text-black" : i < step ? "text-green-500" : "text-gray-300"}`}>{s}</span>
                                </div>
                                {i < steps.length - 1 && <div className={`w-8 h-px mx-1 ${i < step ? "bg-green-400" : "bg-gray-200"}`} />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-5 py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
                <div className="flex flex-col gap-6">

                    {/* STEP 0 */}
                    {step === 0 && (
                        <div className="bg-white p-6 border border-gray-200 checkout-fade">
                            <h2 className="text-base font-black uppercase tracking-widest text-black mb-6">Shipping Address</h2>
                            {!isLoggedIn && (
                                <div className="bg-gray-50 border border-gray-200 px-4 py-3 mb-5 flex items-center gap-3">
                                    <span className="text-xs text-gray-500">Already have an account?</span>
                                    <Link to="/login" className="text-xs font-black text-black hover:text-red-600 underline">LOGIN</Link>
                                </div>
                            )}
                            <div className="flex flex-col gap-4">
                                <Field label="Full Name *"><input name="fullName" value={address.fullName} onChange={handleAddressChange} placeholder="Ali Khan" className={inputCls} /></Field>
                                <Field label="Phone Number *"><input name="phone" value={address.phone} onChange={handleAddressChange} placeholder="03XX-XXXXXXX" type="tel" className={inputCls} /></Field>
                                <Field label="Full Address *"><textarea name="address" value={address.address} onChange={handleAddressChange} placeholder="House #, Street, Area" rows={3} className={`${inputCls} resize-none`} /></Field>
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="City *">
                                        <select name="city" value={address.city} onChange={handleAddressChange} className={inputCls}>
                                            <option value="">Select city</option>
                                            {CITIES.map((c) => <option key={c}>{c}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Province *">
                                        <select name="province" value={address.province} onChange={handleAddressChange} className={inputCls}>
                                            <option value="">Select province</option>
                                            {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                                        </select>
                                    </Field>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="bg-white p-6 border border-gray-200 checkout-fade">
                            <h2 className="text-base font-black uppercase tracking-widest text-black mb-6">Payment Method</h2>
                            <div className="flex flex-col gap-3">
                                {[
                                    { value: "cod", label: "Cash on Delivery", desc: "Pay when you receive", icon: "💵" },
                                    { value: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, JCB", icon: "💳" },
                                    { value: "baadmay", label: "Baadmay", desc: `3 installments of PKR ${installment.toLocaleString()}`, icon: "🟣" },
                                ].map((opt) => (
                                    <label key={opt.value} className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-all ${payment === opt.value ? "border-black" : "border-gray-200 hover:border-gray-400"}`}>
                                        <input type="radio" name="payment" value={opt.value} checked={payment === opt.value} onChange={() => setPayment(opt.value)} className="hidden" />
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payment === opt.value ? "border-black" : "border-gray-300"}`}>
                                            {payment === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                                        </div>
                                        <span className="text-xl">{opt.icon}</span>
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-black">{opt.label}</p>
                                            <p className="text-xs text-gray-400">{opt.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-5">
                                <Field label="Order Notes (Optional)">
                                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions..." rows={3} className={`${inputCls} resize-none`} />
                                </Field>
                            </div>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="bg-white p-6 border border-gray-200 checkout-fade">
                            <h2 className="text-base font-black uppercase tracking-widest text-black mb-6">Review Order</h2>
                            <div className="mb-5 pb-5 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Shipping To</p>
                                    <button onClick={() => setStep(0)} className="text-xs font-bold text-black hover:text-red-600 underline">Edit</button>
                                </div>
                                <p className="text-sm font-bold text-black">{address.fullName} · {address.phone}</p>
                                <p className="text-sm text-gray-500">{address.address}, {address.city}, {address.province}</p>
                            </div>
                            <div className="mb-5 pb-5 border-b border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Payment</p>
                                    <button onClick={() => setStep(1)} className="text-xs font-bold text-black hover:text-red-600 underline">Edit</button>
                                </div>
                                <p className="text-sm font-bold">{payment === "cod" ? "💵 Cash on Delivery" : payment === "card" ? "💳 Card" : "🟣 Baadmay"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Items ({items.length})</p>
                                <div className="flex flex-col gap-3">
                                    {items.map((item) => (
                                        <div key={item.cartKey} className="flex gap-3 items-center">
                                            <div className="w-14 h-16 bg-gray-100 overflow-hidden shrink-0">
                                                <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-black truncate">{item.name}</p>
                                                <p className="text-xs text-gray-400">{item.size} · {item.color} · Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-black text-red-600 shrink-0">PKR {(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3">{error}</div>}

                    {/* ⚠️ Warning Card — only on Review step */}
                    {step === 2 && (
                        <div className="border border-amber-300 bg-amber-50 px-4 py-4 flex gap-3 items-start warning-pulse">
                            <div className="shrink-0 mt-0.5">
                                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-1">Important Notice</p>
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    Once your order is placed, it <span className="font-black">cannot be cancelled</span>. Please review your items, shipping address, and payment method carefully before confirming.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        {step > 0 && (
                            <button onClick={() => { setStep((s) => s - 1); setError(""); }} className="flex-1 py-4 border-2 border-black text-black text-sm font-black uppercase tracking-widest hover:bg-gray-50 transition-colors">BACK</button>
                        )}
                        {step < 2 ? (
                            <button onClick={handleNext} className="flex-1 py-4 bg-black text-white text-sm font-black uppercase tracking-widest hover:bg-red-600 transition-colors">CONTINUE</button>
                        ) : (
                            <button onClick={handlePlaceOrder} disabled={loading} className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-all ${loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-red-600"}`}>
                                {loading ? "PLACING ORDER..." : "PLACE ORDER"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="bg-white border border-gray-200 p-5 sticky top-24.5">
                        <h3 className="text-sm font-black uppercase tracking-widest text-black mb-4">Order Summary</h3>
                        <div className="flex flex-col gap-3 pb-4 border-b border-gray-100 max-h-64 overflow-y-auto">
                            {items.map((item) => (
                                <div key={item.cartKey} className="flex gap-3 items-center">
                                    <div className="relative w-12 h-14 bg-gray-100 shrink-0">
                                        <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover" />
                                        <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">{item.quantity}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-black truncate">{item.name}</p>
                                        <p className="text-[11px] text-gray-400">{item.size} · {item.color}</p>
                                    </div>
                                    <p className="text-xs font-black text-black shrink-0">PKR {(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2 py-4 border-b border-gray-100 text-sm">
                            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-semibold">PKR {subtotal.toLocaleString()}</span></div>
                            <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="font-semibold">PKR {SHIPPING_FEE.toLocaleString()}</span></div>
                        </div>
                        <div className="flex justify-between pt-4">
                            <span className="text-sm font-black uppercase text-black">Total</span>
                            <span className="text-base font-black text-red-600">PKR {total.toLocaleString()}</span>
                        </div>
                        <div className="mt-4 bg-purple-50 border border-purple-100 px-3 py-2 flex items-center gap-2">
                            <div className="bg-purple-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shrink-0">Cah on Delivery</div>
                            <p className="text-xs text-gray-600">3 installments of <span className="font-bold text-green-600">PKR {installment.toLocaleString()}</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .checkout-fade { animation: checkoutFade 0.3s ease forwards; }
                @keyframes checkoutFade { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                .warning-pulse { animation: warningIn 0.4s ease forwards; }
                @keyframes warningIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
            `}</style>
        </div>
    );
}