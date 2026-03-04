import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import orderService from "../services/orderService";

const STATUS_CONFIG = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", step: 0 },
    confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700", step: 1 },
    processing: { label: "Processing", color: "bg-purple-100 text-purple-700", step: 2 },
    shipped: { label: "Shipped", color: "bg-indigo-100 text-indigo-700", step: 3 },
    delivered: { label: "Delivered", color: "bg-green-100 text-green-700", step: 4 },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", step: -1 },
    refunded: { label: "Refunded", color: "bg-gray-100 text-gray-600", step: -1 },
};

const TRACK_STEPS = ["Order Placed", "Confirmed", "Processing", "Shipped", "Delivered"];

function TrackingBar({ status }) {
    const currentStep = STATUS_CONFIG[status]?.step ?? 0;
    if (currentStep === -1) return null;
    return (
        <div className="flex items-center gap-0 mt-4">
            {TRACK_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all shrink-0
                            ${i <= currentStep ? "bg-black text-white" : "bg-gray-200 text-gray-400"}`}>
                            {i < currentStep ? "✓" : i + 1}
                        </div>
                        <p className={`text-[9px] font-bold uppercase tracking-wide mt-1 text-center leading-tight
                            ${i <= currentStep ? "text-black" : "text-gray-300"}`}>
                            {step}
                        </p>
                    </div>
                    {i < TRACK_STEPS.length - 1 && (
                        <div className={`h-px flex-1 mb-4 mx-1 transition-all ${i < currentStep ? "bg-black" : "bg-gray-200"}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

function OrderCard({ order }) {
    const [expanded, setExpanded] = useState(false);
    const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const date = new Date(order.created_at).toLocaleDateString("en-PK", {
        day: "numeric", month: "short", year: "numeric"
    });
    const time = new Date(order.created_at).toLocaleTimeString("en-PK", {
        hour: "2-digit", minute: "2-digit", hour12: true
    });
    const items = order.items || [];
    const firstItem = items[0];

    return (
        <div className="bg-white border border-gray-200 overflow-hidden">
            {/* Order Header */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                {/* First item image */}
                <div className="w-14 h-16 bg-gray-100 shrink-0 overflow-hidden">
                    {firstItem?.image && (
                        <img src={firstItem.image} alt={firstItem.name} className="w-full h-full object-cover" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Order #{order.id?.slice(0, 8).toUpperCase()}
                            </p>
                            {/* Date + Time */}
                            <p className="text-xs font-bold text-black mt-0.5">
                                {date}
                                <span className="text-gray-400 font-medium ml-1.5">· {time}</span>
                            </p>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-sm shrink-0 ${status.color}`}>
                            {status.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                        <p className="text-xs text-gray-500">{items.length} item{items.length > 1 ? "s" : ""}</p>
                        <span className="text-gray-200">|</span>
                        <p className="text-sm font-black text-black">PKR {order.total?.toLocaleString()}</p>
                        <span className="text-gray-200">|</span>
                        <p className="text-xs text-gray-500 capitalize">{order.payment_method?.toUpperCase()}</p>
                    </div>
                </div>

                <button
                    onClick={() => setExpanded(!expanded)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center border border-gray-200 hover:border-black transition-colors"
                >
                    <svg className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 order-expand">

                    {/* Tracking Bar */}
                    <TrackingBar status={order.status} />

                    {/* Items List */}
                    <div className="mt-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Items</p>
                        <div className="flex flex-col gap-3">
                            {items.map((item, i) => (
                                <div key={i} className="flex gap-3 items-center bg-white p-3 border border-gray-100">
                                    <div className="w-12 h-14 bg-gray-100 overflow-hidden shrink-0">
                                        {item.image && (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-black truncate">{item.name}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                            {item.size} · {item.color} · Qty: {item.quantity}
                                        </p>
                                    </div>
                                    <p className="text-xs font-black text-black shrink-0">
                                        PKR {(item.price * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="mt-4 bg-white border border-gray-100 p-3">
                        <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-semibold text-black">PKR {order.subtotal?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span className="font-semibold text-black">PKR {order.shipping_fee?.toLocaleString()}</span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span className="font-semibold">- PKR {order.discount_amount?.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-1.5 border-t border-gray-100 font-black text-black text-sm">
                                <span>Total</span>
                                <span className="text-red-600">PKR {order.total?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mt-3 bg-white border border-gray-100 p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Delivered To</p>
                        <p className="text-xs font-bold text-black">{order.full_name} · {order.phone}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{order.address}, {order.city}, {order.province}</p>
                    </div>

                    {/* Tracking Number */}
                    {order.tracking_no && (
                        <div className="mt-3 bg-white border border-gray-100 p-3 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tracking No.</p>
                                <p className="text-xs font-bold text-black mt-0.5">{order.tracking_no}</p>
                            </div>
                            <span className="text-xs font-black text-black border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors cursor-pointer">
                                TRACK
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function OrdersPage() {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (!isLoggedIn) { navigate("/login"); return; }
        orderService.getMyOrders()
            .then(setOrders)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [isLoggedIn, navigate]);

    const filtered = filter === "all"
        ? orders
        : orders.filter((o) => o.status === filter);

    const filters = [
        { value: "all", label: "All" },
        { value: "pending", label: "Pending" },
        { value: "shipped", label: "Shipped" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-2.5">
            <div className="max-w-3xl mx-auto px-5 py-8">

                {/* Header */}
                <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                        <Link to="/" className="hover:text-black transition-colors">Home</Link> / My Orders
                    </p>
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black">My Orders</h1>
                        {!loading && (
                            <p className="text-xs text-gray-400">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-0 border-b border-gray-200 mb-6 overflow-x-auto">
                    {filters.map((f) => (
                        <button key={f.value} onClick={() => setFilter(f.value)}
                            className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all
                                ${filter === f.value ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"}`}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white border border-gray-200 p-4 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="w-14 h-16 bg-gray-200 rounded" />
                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <svg className="w-14 h-14 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-sm font-black uppercase tracking-widest text-gray-300">No orders found</p>
                        <Link to="/" className="bg-black text-white text-xs font-black px-8 py-3 uppercase tracking-widest hover:bg-red-600 transition-colors">
                            START SHOPPING
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .order-expand { animation: expandDown 0.25s ease forwards; }
                @keyframes expandDown {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}