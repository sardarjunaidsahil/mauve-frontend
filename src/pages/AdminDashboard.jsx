import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import CountUp from "react-countup";

// ── API ────────────────────────────────────────────────────────────────
const adminApi = {
    getStats: () => api.get("/admin/stats").then((r) => r.data),
    getOrders: (page = 1) =>
        api.get(`/orders/admin/all?page=${page}&limit=15`).then((r) => r.data),
    updateOrder: (id, data) =>
        api.put(`/orders/${id}/status`, data).then((r) => r.data),
    getProducts: (page = 1, cat = "", subCat = "") =>
        api
            .get(
                `/products?page=${page}&limit=12${cat ? `&category=${cat}` : ""}${subCat ? `&subCategory=${subCat}` : ""}&sortBy=newest`
            )
            .then((r) => r.data),
    createProduct: (data) => api.post("/products", data).then((r) => r.data),
    updateProduct: (id, data) =>
        api.put(`/products/${id}`, data).then((r) => r.data),
    deleteProduct: (id) => api.delete(`/products/${id}`).then((r) => r.data),
    getCustomers: (page = 1) =>
        api.get(`/users/admin/all?page=${page}&limit=15`).then((r) => r.data),
    getAllOrders: () =>
        api.get(`/orders/admin/all?page=1&limit=500`).then((r) => r.data),
};

const SUBCATS = {
    men: ["graphic-tees", "polo-shirts", "shirts", "basic-tees", "chino-pants", "denim-jeans", "co-ord-sets", "jogger-pants", "shorts"],
    women: ["tops", "dresses", "co-ord-sets", "bottoms", "outerwear"],
    footwear: ["sneakers", "slides", "sandals", "boots"],
    accessories: ["caps", "bags", "belts", "socks", "wallets"],
};

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS = {
    pending: "bg-amber-100 text-amber-700 border border-amber-200",
    confirmed: "bg-blue-100 text-blue-700 border border-blue-200",
    processing: "bg-violet-100 text-violet-700 border border-violet-200",
    shipped: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    delivered: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    cancelled: "bg-red-100 text-red-600 border border-red-200",
};

// ── Date helpers ───────────────────────────────────────────────────────
function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function groupOrdersByPeriod(orders) {
    const now = new Date();
    const todayStart = startOfDay(now);
    const yesterdayStart = startOfDay(new Date(now - 86400000));
    const weekStart = startOfDay(new Date(now - 6 * 86400000));
    const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    const groups = { today: [], yesterday: [], thisWeek: [], thisMonth: [], older: [] };
    orders.forEach((o) => {
        const d = new Date(o.created_at);
        if (d >= todayStart) groups.today.push(o);
        else if (d >= yesterdayStart) groups.yesterday.push(o);
        else if (d >= weekStart) groups.thisWeek.push(o);
        else if (d >= monthStart) groups.thisMonth.push(o);
        else groups.older.push(o);
    });
    return groups;
}

// ── Charts ─────────────────────────────────────────────────────────────
function Sparkline({ data, color = "#111827", height = 40 }) {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data, 1);
    const pts = data
        .map((v, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = height - (v / max) * (height - 4) - 2;
            return `${x},${y}`;
        })
        .join(" ");
    return (
        <svg viewBox={`0 0 100 ${height}`} className="w-full h-9" preserveAspectRatio="none">
            <polyline
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function DonutChart({ segments, size = 110 }) {
    const r = 36, cx = 50, cy = 50, circumference = 2 * Math.PI * r;
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} className="w-24 h-24 mx-auto">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="14" />
            {segments.map((seg, i) => {
                const dash = (seg.value / total) * circumference;
                const gap = circumference - dash;
                const offset = segments
                    .slice(0, i)
                    .reduce((sum, s) => sum + (s.value / total) * circumference, 0);
                return (
                    <circle
                        key={i}
                        cx={cx} cy={cy} r={r} fill="none"
                        stroke={seg.color} strokeWidth="14"
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                    />
                );
            })}
            <text x="50" y="54" textAnchor="middle" fontSize="14" fontWeight="800" fill="#111827">
                {total}
            </text>
        </svg>
    );
}

// ── Toast ──────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div
            className={`fixed bottom-4 right-4 z-50 px-4 py-3 text-xs font-bold shadow-2xl flex items-center gap-2 rounded-xl max-w-[calc(100vw-2rem)] ${type === "success" ? "bg-gray-900 text-white" : "bg-red-600 text-white"
                }`}
            style={{ animation: "toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
        >
            <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${type === "success" ? "bg-emerald-500" : "bg-red-400"
                    }`}
            >
                {type === "success" ? "✓" : "✕"}
            </span>
            <span className="truncate flex-1">{msg}</span>
            <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100 text-lg leading-none">×</button>
        </div>
    );
}

// ── StatCard ───────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, accent, chartData, chartType = "bar" }) {
    const numericValue =
        typeof value === "number"
            ? value
            : typeof value === "string" && value.includes("k")
                ? parseFloat(value)
                : 0;

    const displayValue =
        typeof value === "string" && value.includes("k") ? (
            <>
                <CountUp end={numericValue} duration={1.6} separator="," delay={0.2} />k
            </>
        ) : (
            <CountUp end={numericValue} duration={1.8} separator="," delay={0.2} />
        );

    return (
        <div
            className={`bg-white rounded-xl border border-gray-100 border-l-4 ${accent} p-4 hover:shadow-md transition-shadow duration-200 min-h-[120px] flex flex-col`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xl font-black text-gray-900 leading-tight">
                        {value == null ? "—" : displayValue}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5 truncate">
                        {label}
                    </p>
                    {sub && <p className="text-[10px] text-gray-400 mt-1 truncate">{sub}</p>}
                </div>
                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-lg shrink-0">
                    {icon}
                </div>
            </div>
            {chartData && chartData.length > 0 && (
                <div className="mt-auto pt-2 opacity-70">
                    <Sparkline data={chartData} color="#6366f1" height={32} />
                </div>
            )}
        </div>
    );
}

// ── OverviewTab ────────────────────────────────────────────────────────
function OverviewTab() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allOrders, setAllOrders] = useState([]);

    useEffect(() => {
        Promise.all([
            adminApi.getStats().catch(() => null),
            adminApi.getAllOrders().catch(() => ({ orders: [] })),
            adminApi.getProducts(1).catch(() => ({ products: [] })),
        ]).then(([s, o, p]) => {
            const orders = o?.orders || [];
            setAllOrders(orders);
            setStats({
                totalOrders: s?.stats?.totalOrders || orders.length,
                totalProducts: s?.stats?.totalProducts || p?.total || 0,
                totalCustomers: s?.stats?.totalCustomers || 0,
                totalRevenue:
                    s?.stats?.totalRevenue ||
                    orders
                        .filter((x) => x.status === "delivered")
                        .reduce((a, x) => a + (x.total || 0), 0),
                pendingOrders: orders.filter((x) => x.status === "pending").length,
                recentOrders: orders.slice(0, 5),
                lowStock: (p?.products || []).filter((x) => x.stock < 10),
            });
        }).finally(() => setLoading(false));
    }, []);

    const last7Revenue = useMemo(() => {
        const now = new Date().getTime();
        return Array.from({ length: 7 }, (_, i) => {
            const d = startOfDay(new Date(now - (6 - i) * 86400000));
            const next = new Date(d.getTime() + 86400000);
            const rev = allOrders
                .filter(
                    (o) =>
                        o.status === "delivered" &&
                        new Date(o.created_at) >= d &&
                        new Date(o.created_at) < next
                )
                .reduce((s, o) => s + (o.total || 0), 0);
            return { label: d.toLocaleDateString("en-PK", { weekday: "short" }), value: rev };
        });
    }, [allOrders]);

    const last7Orders = useMemo(() => {
        const now = new Date().getTime();
        return Array.from({ length: 7 }, (_, i) => {
            const d = startOfDay(new Date(now - (6 - i) * 86400000));
            const next = new Date(d.getTime() + 86400000);
            return allOrders.filter(
                (o) => new Date(o.created_at) >= d && new Date(o.created_at) < next
            ).length;
        });
    }, [allOrders]);

    const statusDist = useMemo(() => {
        const colors = {
            pending: "#f59e0b", confirmed: "#3b82f6", processing: "#8b5cf6",
            shipped: "#6366f1", delivered: "#10b981", cancelled: "#ef4444",
        };
        return ORDER_STATUSES.map((s) => ({
            label: s,
            color: colors[s],
            value: allOrders.filter((o) => o.status === s).length,
        })).filter((s) => s.value > 0);
    }, [allOrders]);

    if (loading)
        return (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                        <div className="h-6 bg-gray-100 rounded-lg w-1/2 mb-2" />
                        <div className="h-3 bg-gray-100 rounded-lg w-3/4" />
                    </div>
                ))}
            </div>
        );

    return (
        <div className="space-y-5">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                <StatCard label="Orders" value={stats?.totalOrders} icon="📋" accent="border-gray-900" sub="All time" chartData={last7Orders} chartType="sparkline" />
                <StatCard label="Products" value={stats?.totalProducts} icon="👕" accent="border-blue-400" sub="In catalog" />
                <StatCard label="Customers" value={stats?.totalCustomers} icon="👤" accent="border-violet-400" sub="Registered" />
                <StatCard label="Revenue" value={stats?.totalRevenue ? `${(stats.totalRevenue / 1000).toFixed(0)}k` : "0"} icon="💰" accent="border-emerald-500" sub="PKR delivered" chartData={last7Revenue.map((d) => d.value)} chartType="sparkline" />
                <StatCard label="Pending" value={stats?.pendingOrders} icon="⏳" accent="border-amber-400" sub="Need action" />
                <StatCard label="Low Stock" value={stats?.lowStock?.length || 0} icon="⚠️" accent="border-red-500" sub="Under 10 units" />
            </div>

            {/* Revenue Chart + Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-700 mb-1">📈 Last 7 Days Revenue</p>
                    <p className="text-xs text-gray-400 mb-4">Delivered orders only</p>
                    <div className="flex items-end gap-1.5 h-28">
                        {last7Revenue.map((d, i) => {
                            const max = Math.max(...last7Revenue.map((x) => x.value), 1);
                            const pct = (d.value / max) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                                    <span className="text-[9px] font-black text-gray-500 truncate w-full text-center">
                                        {d.value > 0 ? `${(d.value / 1000).toFixed(0)}k` : ""}
                                    </span>
                                    <div className="w-full bg-gray-100 rounded-t-md overflow-hidden h-20">
                                        <div
                                            className="w-full bg-gray-900 rounded-t-md transition-all duration-700"
                                            style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                                        />
                                    </div>
                                    <span className="text-[9px] text-gray-400 font-bold truncate w-full text-center">{d.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-700 mb-3">🍩 Order Status</p>
                    <div className="flex items-center justify-center flex-1 py-2">
                        <DonutChart segments={statusDist} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                        {statusDist.map((s) => (
                            <div key={s.label} className="flex items-center gap-1.5 min-w-0">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                                <span className="text-gray-600 capitalize truncate">{s.label}</span>
                                <span className="font-black text-gray-900 ml-auto shrink-0">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders + Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-700">📦 Recent Orders</p>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                        {(stats?.recentOrders || []).length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-10 font-bold uppercase tracking-widest">No orders yet</p>
                        ) : (
                            (stats?.recentOrders || []).map((o) => (
                                <div key={o.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-gray-900 font-mono">#{o.id?.slice(0, 8).toUpperCase()}</p>
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{o.full_name}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-black text-gray-900">PKR {o.total?.toLocaleString()}</p>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-0.5 inline-block ${STATUS_COLORS[o.status] || "bg-gray-100 text-gray-500"}`}>
                                            {o.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-700">⚠️ Low Stock Alert</p>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                        {(stats?.lowStock || []).length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-10 font-bold uppercase tracking-widest">All products well stocked ✓</p>
                        ) : (
                            (stats?.lowStock || []).slice(0, 6).map((p) => (
                                <div key={p.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-8 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                            {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                                        </div>
                                        <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                                    </div>
                                    <span className="text-xs font-black text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-full shrink-0">
                                        {p.stock} left
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── OrderRow ───────────────────────────────────────────────────────────
function OrderRow({ order, onToast }) {
    const [status, setStatus] = useState(order.status);
    const [tracking, setTracking] = useState(order.tracking_no || "");
    const [saving, setSaving] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [editTracking, setEditTracking] = useState(false);
    const items = order.items || [];
    const date = new Date(order.created_at).toLocaleDateString("en-PK", {
        day: "numeric", month: "short", year: "numeric",
    });

    const handleStatusChange = async (newStatus) => {
        setSaving(true);
        try {
            await adminApi.updateOrder(order.id, { status: newStatus });
            setStatus(newStatus);
            onToast("Status updated ✓", "success");
        } catch {
            onToast("Update failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleTrackingSave = async () => {
        setSaving(true);
        try {
            await adminApi.updateOrder(order.id, { status, tracking_no: tracking });
            setEditTracking(false);
            onToast("Tracking saved ✓", "success");
        } catch {
            onToast("Save failed", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <tr className={`border-b border-gray-100 hover:bg-gray-50/70 transition-colors text-xs ${expanded ? "bg-gray-50/70" : ""}`}>
                <td className="px-3 py-3">
                    <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 group">
                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-all shrink-0 ${expanded ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"}`}>
                            <svg className={`w-2.5 h-2.5 transition-transform ${expanded ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <span className="font-black font-mono text-gray-700 text-[11px]">#{order.id?.slice(0, 8).toUpperCase()}</span>
                    </button>
                </td>
                <td className="px-3 py-3">
                    <p className="font-bold text-gray-900 truncate max-w-[120px]">{order.full_name}</p>
                    <p className="text-gray-400 mt-0.5 text-[10px] truncate max-w-[120px]">{order.phone}</p>
                </td>
                <td className="px-3 py-3 text-gray-500 whitespace-nowrap text-[10px]">{date}</td>
                <td className="px-3 py-3">
                    <span className={`font-bold uppercase px-2 py-0.5 rounded-full text-[10px] ${STATUS_COLORS[status] || "bg-gray-100 text-gray-500"}`}>
                        {status}
                    </span>
                </td>
                <td className="px-3 py-3 font-black text-gray-900 whitespace-nowrap text-[11px]">PKR {order.total?.toLocaleString()}</td>
                <td className="px-3 py-3 text-gray-500 uppercase font-semibold text-[10px]">{order.payment_method}</td>
                <td className="px-3 py-3">
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={saving}
                        className="text-[11px] border border-gray-200 px-2 py-1 outline-none focus:border-gray-900 bg-white cursor-pointer disabled:opacity-50 font-semibold rounded-lg"
                    >
                        {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                </td>
            </tr>

            {expanded && (
                <tr className="bg-gray-50/70 border-b border-gray-200">
                    <td colSpan={7} className="px-4 py-5">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
                            {/* Items */}
                            <div>
                                <p className="font-black uppercase tracking-widest text-gray-400 mb-3">Order Items</p>
                                <div className="flex flex-col gap-2">
                                    {items.map((item, i) => (
                                        <div key={i} className="flex gap-3 items-center bg-white rounded-xl border border-gray-100 p-3">
                                            <div className="w-10 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{item.name}</p>
                                                <p className="text-gray-400 mt-0.5 text-[10px]">{item.size} · {item.color} · Qty {item.quantity}</p>
                                            </div>
                                            <p className="font-black text-gray-900 shrink-0">PKR {(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-3">
                                <div className="bg-white rounded-xl border border-gray-100 p-3">
                                    <p className="font-black uppercase tracking-widest text-gray-400 mb-2 text-[10px]">Ship To</p>
                                    <p className="font-bold text-gray-900">{order.full_name}</p>
                                    <p className="text-gray-500 mt-0.5">{order.address}</p>
                                    <p className="text-gray-500">{order.city}, {order.province}</p>
                                    <p className="text-gray-500">{order.phone}</p>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-100 p-3">
                                    <p className="font-black uppercase tracking-widest text-gray-400 mb-2 text-[10px]">Tracking Number</p>
                                    {editTracking ? (
                                        <div className="flex gap-2 flex-wrap">
                                            <input
                                                value={tracking}
                                                onChange={(e) => setTracking(e.target.value)}
                                                placeholder="e.g. TCS-123456789"
                                                className="flex-1 min-w-[120px] text-xs border border-gray-900 px-3 py-2 outline-none font-bold rounded-lg"
                                            />
                                            <button onClick={handleTrackingSave} disabled={saving} className="text-xs font-black bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">
                                                {saving ? "..." : "SAVE"}
                                            </button>
                                            <button onClick={() => setEditTracking(false)} className="text-xs font-black border border-gray-200 px-3 py-2 rounded-lg hover:border-gray-900 transition-colors">✕</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <p className="font-bold text-gray-900">
                                                {tracking || <span className="text-gray-400 font-normal">Not assigned yet</span>}
                                            </p>
                                            <button onClick={() => setEditTracking(true)} className="text-xs font-black border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-900 text-gray-500 hover:text-gray-900 transition-colors">
                                                {tracking ? "EDIT" : "+ ADD"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-1.5">
                                    <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-bold text-gray-900">PKR {order.subtotal?.toLocaleString()}</span></div>
                                    <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="font-bold text-gray-900">PKR {order.shipping_fee?.toLocaleString()}</span></div>
                                    {order.discount_amount > 0 && (
                                        <div className="flex justify-between text-emerald-600"><span>Discount</span><span className="font-bold">-PKR {order.discount_amount?.toLocaleString()}</span></div>
                                    )}
                                    <div className="flex justify-between font-black text-gray-900 text-sm pt-2 border-t border-gray-100 mt-1">
                                        <span>Total</span>
                                        <span className="text-red-600">PKR {order.total?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ── OrderGroupSection ──────────────────────────────────────────────────
function OrderGroupSection({ title, emoji, orders, onToast, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    if (orders.length === 0) return null;
    const rev = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + (o.total || 0), 0);

    return (
        <div className="mb-4">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
            >
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base">{emoji}</span>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-800">{title}</span>
                    <span className="bg-gray-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{orders.length}</span>
                    {rev > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                            PKR {rev.toLocaleString()}
                        </span>
                    )}
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="overflow-x-auto rounded-b-xl border border-t-0 border-gray-200 shadow-sm mt-1">
                    <table className="w-full" style={{ minWidth: "700px" }}>
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                {["Order ID", "Customer", "Date", "Status", "Total", "Payment", "Update Status"].map((h) => (
                                    <th key={h} className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => <OrderRow key={o.id} order={o} onToast={onToast} />)}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ── OrdersTab ──────────────────────────────────────────────────────────
function OrdersTab({ onToast }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [viewMode, setViewMode] = useState("grouped");
    const [statusFilter, setStatusFilter] = useState("all");
    const [periodFilter, setPeriodFilter] = useState("all");

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.getOrders(page);
            setOrders(data.orders || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
        } catch {
            onToast("Failed to load orders", "error");
        } finally {
            setLoading(false);
        }
    }, [page, onToast]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const grouped = useMemo(() => groupOrdersByPeriod(orders), [orders]);

    const todayRev = grouped.today.reduce((s, o) => s + (o.total || 0), 0);
    const weekRev = [...grouped.today, ...grouped.yesterday, ...grouped.thisWeek].reduce((s, o) => s + (o.total || 0), 0);
    const monthRev = [...grouped.today, ...grouped.yesterday, ...grouped.thisWeek, ...grouped.thisMonth].reduce((s, o) => s + (o.total || 0), 0);
    const pending = orders.filter((o) => o.status === "pending").length;

    const filteredForTable = useMemo(() => {
        let list = orders;
        if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
        const now = new Date();
        if (periodFilter === "today") list = list.filter((o) => new Date(o.created_at) >= startOfDay(now));
        if (periodFilter === "yesterday") {
            const y = startOfDay(new Date(now - 86400000));
            list = list.filter((o) => {
                const d = new Date(o.created_at);
                return d >= y && d < startOfDay(now);
            });
        }
        if (periodFilter === "week") list = list.filter((o) => new Date(o.created_at) >= startOfDay(new Date(now - 6 * 86400000)));
        if (periodFilter === "month") list = list.filter((o) => new Date(o.created_at) >= startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)));
        return list;
    }, [orders, statusFilter, periodFilter]);

    return (
        <div className="space-y-5">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-gray-900 p-4">
                    <p className="text-xl font-black text-gray-900">{grouped.today.length}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Today's Orders</p>
                    <p className="text-xs text-emerald-600 font-bold mt-1">PKR {todayRev.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-blue-400 p-4">
                    <p className="text-xl font-black text-gray-900">{grouped.today.length + grouped.yesterday.length + grouped.thisWeek.length}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">This Week</p>
                    <p className="text-xs text-blue-600 font-bold mt-1">PKR {weekRev.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-violet-400 p-4">
                    <p className="text-xl font-black text-gray-900">{total}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">This Month</p>
                    <p className="text-xs text-violet-600 font-bold mt-1">PKR {monthRev.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 border-l-4 border-l-amber-400 p-4">
                    <p className="text-xl font-black text-gray-900">{pending}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pending Action</p>
                    <p className="text-xs text-amber-600 font-bold mt-1">Need attention</p>
                </div>
            </div>

            {/* View Controls */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setViewMode("grouped")}
                        className={`px-3 py-2 text-xs font-black uppercase tracking-widest transition-colors ${viewMode === "grouped" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                        📅 Grouped
                    </button>
                    <button
                        onClick={() => setViewMode("table")}
                        className={`px-3 py-2 text-xs font-black uppercase tracking-widest transition-colors ${viewMode === "table" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                        📋 Table
                    </button>
                </div>

                {viewMode === "table" && (
                    <>
                        <select
                            value={periodFilter}
                            onChange={(e) => setPeriodFilter(e.target.value)}
                            className="text-xs border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-gray-900 font-bold bg-white cursor-pointer"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="text-xs border border-gray-200 px-3 py-2 rounded-lg outline-none focus:border-gray-900 font-bold bg-white cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                    </>
                )}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                            <div className="h-4 bg-gray-100 rounded-lg w-1/4 mb-2" />
                            <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
                        </div>
                    ))}
                </div>
            ) : viewMode === "grouped" ? (
                <div>
                    <OrderGroupSection title="Today" emoji="🌅" orders={grouped.today} onToast={onToast} defaultOpen={true} />
                    <OrderGroupSection title="Yesterday" emoji="🌙" orders={grouped.yesterday} onToast={onToast} defaultOpen={grouped.today.length === 0} />
                    <OrderGroupSection title="This Week" emoji="📅" orders={grouped.thisWeek} onToast={onToast} />
                    <OrderGroupSection title="This Month" emoji="🗓️" orders={grouped.thisMonth} onToast={onToast} />
                    <OrderGroupSection title="Older" emoji="📦" orders={grouped.older} onToast={onToast} />
                    {Object.values(grouped).every((g) => g.length === 0) && (
                        <p className="text-center py-16 text-xs text-gray-400 font-bold uppercase tracking-widest">No orders found</p>
                    )}
                </div>
            ) : (
                <div>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                        <table className="w-full" style={{ minWidth: "700px" }}>
                            <thead className="bg-gray-900 text-white">
                                <tr>
                                    {["Order ID", "Customer", "Date", "Status", "Total", "Payment", "Update Status"].map((h) => (
                                        <th key={h} className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredForTable.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-16 text-xs text-gray-400 font-bold uppercase tracking-widest">No orders found</td>
                                    </tr>
                                ) : (
                                    filteredForTable.map((o) => <OrderRow key={o.id} order={o} onToast={onToast} />)
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-5">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-xs font-black border border-gray-200 rounded-lg hover:border-gray-900 disabled:opacity-40 transition-colors">← PREV</button>
                            <span className="text-xs font-black text-gray-500 px-2">{page} / {pages}</span>
                            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-4 py-2 text-xs font-black border border-gray-200 rounded-lg hover:border-gray-900 disabled:opacity-40 transition-colors">NEXT →</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── AddProductForm ─────────────────────────────────────────────────────
function AddProductForm({ onSuccess, onToast }) {
    const [form, setForm] = useState({
        name: "", description: "", price: "", originalPrice: "", discount: "",
        category: "men", subCategory: "graphic-tees", articleNo: "", modelInfo: "",
        sizes: "XS,S,M,L,XL,XXL", colors: "Black,White,Grey", stock: "50",
    });
    const [imageUrls, setImageUrls] = useState("");
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!form.name || !form.price || !form.category) {
            onToast("Name, price & category required", "error");
            return;
        }
        setSaving(true);
        try {
            const images = imageUrls.split("\n").map((u) => u.trim()).filter(Boolean);
            const slug = form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
            await adminApi.createProduct({
                name: form.name, slug, description: form.description,
                price: parseInt(form.price),
                originalPrice: parseInt(form.originalPrice || form.price),
                discount: parseInt(form.discount || 0),
                category: form.category, subCategory: form.subCategory,
                articleNo: form.articleNo, modelInfo: form.modelInfo,
                images: JSON.stringify(images),
                sizes: form.sizes, colors: form.colors,
                stock: parseInt(form.stock || 0),
            });
            onToast("Product added successfully! ✓", "success");
            onSuccess?.();
        } catch (e) {
            onToast(e.response?.data?.message || "Failed to add product", "error");
        } finally {
            setSaving(false);
        }
    };

    const inp = "w-full text-xs border border-gray-200 px-3 py-2 outline-none focus:border-gray-900 transition-colors font-medium rounded-lg bg-gray-50 focus:bg-white";
    const lbl = "text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block";

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 max-w-3xl shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-5 pb-3 border-b border-gray-100">✦ Add New Product</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <label className={lbl}>Product Name *</label>
                    <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Oversized Graphic Tee" className={inp} />
                </div>
                <div>
                    <label className={lbl}>Category *</label>
                    <select value={form.category} onChange={(e) => { set("category", e.target.value); set("subCategory", SUBCATS[e.target.value][0]); }} className={inp}>
                        {["men", "women", "footwear", "accessories"].map((c) => (
                            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={lbl}>Sub Category *</label>
                    <select value={form.subCategory} onChange={(e) => set("subCategory", e.target.value)} className={inp}>
                        {(SUBCATS[form.category] || []).map((s) => (
                            <option key={s} value={s}>{s.replace(/-/g, " ")}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={lbl}>Price (PKR) *</label>
                    <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="3500" className={inp} />
                </div>
                <div>
                    <label className={lbl}>Original Price (PKR)</label>
                    <input type="number" value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} placeholder="4500" className={inp} />
                </div>
                <div>
                    <label className={lbl}>Discount %</label>
                    <input type="number" value={form.discount} onChange={(e) => set("discount", e.target.value)} placeholder="20" className={inp} />
                </div>
                <div>
                    <label className={lbl}>Stock</label>
                    <input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="50" className={inp} />
                </div>
                <div>
                    <label className={lbl}>Sizes (comma separated)</label>
                    <input value={form.sizes} onChange={(e) => set("sizes", e.target.value)} placeholder="XS,S,M,L,XL,XXL" className={inp} />
                </div>
                <div>
                    <label className={lbl}>Colors (comma separated)</label>
                    <input value={form.colors} onChange={(e) => set("colors", e.target.value)} placeholder="Black,White,Navy" className={inp} />
                </div>
                <div>
                    <label className={lbl}>Article No</label>
                    <input value={form.articleNo} onChange={(e) => set("articleNo", e.target.value)} placeholder="MV-M-0001" className={inp} />
                </div>
                <div>
                    <label className={lbl}>Model Info</label>
                    <input value={form.modelInfo} onChange={(e) => set("modelInfo", e.target.value)} placeholder="Model is 6'1 wearing size M" className={inp} />
                </div>
                <div className="sm:col-span-2">
                    <label className={lbl}>Description</label>
                    <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Product description..." className={inp + " resize-none"} />
                </div>
                <div className="sm:col-span-2">
                    <label className={lbl}>Image URLs (one per line)</label>
                    <textarea value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} rows={3} placeholder={"https://... \nhttps://..."} className={inp + " resize-none font-mono"} />
                    <p className="text-[10px] text-gray-400 mt-1">Paste image URLs — one per line.</p>
                </div>
            </div>

            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="bg-gray-900 text-white text-xs font-black px-6 py-2.5 uppercase tracking-widest rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ADDING...
                        </>
                    ) : "ADD PRODUCT"}
                </button>
            </div>
        </div>
    );
}

// ── ProductRow ─────────────────────────────────────────────────────────
function ProductRow({ product, onUpdate, onToast, selected, onSelect }) {
    const [editing, setEditing] = useState(false);
    const [price, setPrice] = useState(product.price);
    const [stock, setStock] = useState(product.stock);
    const [active, setActive] = useState(product.is_active);
    const [featured, setFeatured] = useState(product.is_featured);
    const [category, setCategory] = useState(product.category);
    const [subCategory, setSubCategory] = useState(product.sub_category || product.subCategory || "");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await adminApi.updateProduct(product.id, {
                price: parseInt(price), stock: parseInt(stock),
                is_active: active, is_featured: featured,
                category, sub_category: subCategory,
            });
            onToast("Product updated ✓", "success");
            onUpdate?.();
            setEditing(false);
        } catch {
            onToast("Update failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            await adminApi.deleteProduct(product.id);
            onToast("Product deleted", "success");
            onUpdate?.();
        } catch {
            onToast("Delete failed", "error");
        } finally {
            setDeleting(false);
        }
    };

    const Toggle = ({ value, onChange, activeColor = "bg-gray-900" }) => (
        <button onClick={() => onChange(!value)} className={`w-9 h-5 rounded-full relative transition-colors ${value ? activeColor : "bg-gray-300"}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-all ${value ? "right-0.5" : "left-0.5"}`} />
        </button>
    );

    return (
        <tr className={`border-b border-gray-100 hover:bg-gray-50/70 transition-colors text-xs ${selected ? "bg-red-50/40" : ""}`}>
            <td className="px-3 py-3">
                <button
                    onClick={() => onSelect(product.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selected ? "bg-red-600 border-red-600" : "border-gray-300 hover:border-gray-500"}`}
                >
                    {selected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </button>
            </td>
            <td className="px-3 py-3">
                <div className="w-8 h-10 bg-gray-100 rounded-lg overflow-hidden">
                    {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
                </div>
            </td>
            <td className="px-3 py-3">
                <p className="font-bold text-gray-900 truncate max-w-[140px]">{product.name}</p>
                <p className="text-gray-400 mt-0.5 text-[10px]">{product.article_no || "—"}</p>
            </td>
            <td className="px-3 py-3">
                {editing ? (
                    <div className="flex flex-col gap-1.5">
                        <select value={category} onChange={(e) => { setCategory(e.target.value); setSubCategory(SUBCATS[e.target.value][0]); }} className="text-xs border border-gray-900 px-2 py-1 outline-none font-bold w-28 bg-white rounded-lg">
                            {["men", "women", "footwear", "accessories"].map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </select>
                        <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="text-xs border border-gray-200 px-2 py-1 outline-none font-semibold w-28 bg-white rounded-lg focus:border-gray-900">
                            {(SUBCATS[category] || []).map((s) => <option key={s} value={s}>{s.replace(/-/g, " ")}</option>)}
                        </select>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full w-fit">{product.category}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">{product.sub_category || product.subCategory || "—"}</span>
                    </div>
                )}
            </td>
            <td className="px-3 py-3">
                {editing ? (
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-20 text-xs border border-gray-900 px-2 py-1 outline-none font-bold rounded-lg" />
                ) : (
                    <span className="font-black text-gray-900 text-[11px]">PKR {product.price?.toLocaleString()}</span>
                )}
            </td>
            <td className="px-3 py-3">
                {editing ? (
                    <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-16 text-xs border border-gray-900 px-2 py-1 outline-none font-bold rounded-lg" />
                ) : (
                    <span className={`font-black text-[11px] ${product.stock < 10 ? "text-red-600" : "text-gray-900"}`}>{product.stock}</span>
                )}
            </td>
            <td className="px-3 py-3">
                {editing ? (
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-[10px] font-bold cursor-pointer">
                            <Toggle value={active} onChange={setActive} />Active
                        </label>
                        <label className="flex items-center gap-2 text-[10px] font-bold cursor-pointer">
                            <Toggle value={featured} onChange={setFeatured} activeColor="bg-amber-400" />Featured
                        </label>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full w-fit ${product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                            {product.is_active ? "Active" : "Hidden"}
                        </span>
                        {product.is_featured && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full w-fit bg-amber-100 text-amber-700 mt-0.5">Featured</span>
                        )}
                    </div>
                )}
            </td>
            <td className="px-3 py-3">
                {editing ? (
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={handleSave} disabled={saving} className="text-xs font-black bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-1">
                            {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {saving ? "..." : "SAVE"}
                        </button>
                        <button onClick={() => setEditing(false)} className="text-xs font-black border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-900 transition-colors">CANCEL</button>
                    </div>
                ) : (
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setEditing(true)} className="text-xs font-black border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-900 text-gray-600 hover:text-gray-900 transition-colors">EDIT</button>
                        <button onClick={handleDelete} disabled={deleting} className="text-xs font-black border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 text-red-400 transition-colors disabled:opacity-50">
                            {deleting ? "..." : "DEL"}
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
}

// ── ProductsTab ────────────────────────────────────────────────────────
function ProductsTab({ onToast }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [catFilter, setCatFilter] = useState("");
    const [subCatFilter, setSubCatFilter] = useState("");
    const [search, setSearch] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setSelectedIds([]);
        try {
            const data = await adminApi.getProducts(page, catFilter, subCatFilter);
            setProducts(data.products || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
        } catch {
            onToast("Failed to load products", "error");
        } finally {
            setLoading(false);
        }
    }, [page, catFilter, subCatFilter, onToast]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const filtered = search
        ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        : products;

    const toggleSelect = (id) =>
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const toggleSelectAll = () =>
        setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map((p) => p.id));

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.length} selected products? This cannot be undone.`)) return;
        setBulkDeleting(true);
        try {
            await Promise.all(selectedIds.map((id) => adminApi.deleteProduct(id)));
            onToast(`${selectedIds.length} products deleted ✓`, "success");
            setSelectedIds([]);
            fetchProducts();
        } catch {
            onToast("Bulk delete failed", "error");
        } finally {
            setBulkDeleting(false);
        }
    };

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Total" value={total} icon="👕" accent="border-gray-900" />
                <StatCard label="Low Stock" value={products.filter((p) => p.stock < 10).length} icon="⚠️" accent="border-red-500" sub="Under 10" />
                <StatCard label="Hidden" value={products.filter((p) => !p.is_active).length} icon="👁️" accent="border-gray-400" />
                <StatCard label="Featured" value={products.filter((p) => p.is_featured).length} icon="⭐" accent="border-amber-400" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all ${showAdd ? "bg-gray-100 text-gray-900 border border-gray-200" : "bg-gray-900 text-white hover:bg-red-600 shadow-sm"}`}
                >
                    {showAdd ? "✕ CLOSE FORM" : "+ ADD NEW PRODUCT"}
                </button>
            </div>

            {showAdd && (
                <div style={{ animation: "fadeUp 0.2s ease forwards" }}>
                    <AddProductForm onSuccess={() => { fetchProducts(); setShowAdd(false); }} onToast={onToast} />
                </div>
            )}

            {/* Search + Bulk Actions */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center border border-gray-200 focus-within:border-gray-900 transition-colors rounded-lg bg-gray-50 focus-within:bg-white">
                    <svg className="w-4 h-4 text-gray-400 ml-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="px-3 py-2 text-xs outline-none w-40 font-semibold bg-transparent"
                    />
                </div>

                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">{selectedIds.length} selected</span>
                        <button
                            onClick={handleBulkDelete}
                            disabled={bulkDeleting}
                            className="flex items-center gap-1.5 text-xs font-black bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {bulkDeleting ? (
                                <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />DELETING...</>
                            ) : <>🗑 DELETE {selectedIds.length}</>}
                        </button>
                        <button onClick={() => setSelectedIds([])} className="text-xs font-black border border-gray-200 px-3 py-2 rounded-lg hover:border-gray-900 text-gray-500 transition-colors">CLEAR</button>
                    </div>
                )}
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-0 border-b border-gray-200 overflow-x-auto">
                {["", "men", "women", "footwear", "accessories"].map((c) => (
                    <button
                        key={c}
                        onClick={() => { setCatFilter(c); setSubCatFilter(""); setPage(1); }}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all shrink-0 ${catFilter === c && subCatFilter === "" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"}`}
                    >
                        {c === "" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                ))}
            </div>

            {catFilter && SUBCATS[catFilter] && (
                <div className="flex flex-wrap gap-0 border-b border-gray-100 overflow-x-auto bg-gray-50">
                    <button
                        onClick={() => { setSubCatFilter(""); setPage(1); }}
                        className={`px-3 py-2 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all shrink-0 ${subCatFilter === "" ? "border-gray-900 text-gray-900 bg-white" : "border-transparent text-gray-400 hover:text-gray-700"}`}
                    >
                        All {catFilter}
                    </button>
                    {SUBCATS[catFilter].map((s) => (
                        <button
                            key={s}
                            onClick={() => { setSubCatFilter(s); setPage(1); }}
                            className={`px-3 py-2 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all shrink-0 ${subCatFilter === s ? "border-gray-900 text-gray-900 bg-white" : "border-transparent text-gray-400 hover:text-gray-700"}`}
                        >
                            {s.replace(/-/g, " ")}
                        </button>
                    ))}
                </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full" style={{ minWidth: "800px" }}>
                    <thead className="bg-gray-900 text-white">
                        <tr>
                            <th className="px-3 py-3 w-10">
                                <button
                                    onClick={toggleSelectAll}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedIds.length === filtered.length && filtered.length > 0 ? "bg-red-500 border-red-500" : "border-white/40 hover:border-white"}`}
                                >
                                    {selectedIds.length === filtered.length && filtered.length > 0 && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    )}
                                </button>
                            </th>
                            {["Image", "Name", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                                <th key={h} className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i} className="border-b border-gray-100">
                                    {Array.from({ length: 8 }).map((_, j) => (
                                        <td key={j} className="px-3 py-4"><div className="h-3 bg-gray-100 rounded-lg animate-pulse" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-16 text-xs text-gray-400 font-bold uppercase tracking-widest">No products found</td></tr>
                        ) : (
                            filtered.map((p) => (
                                <ProductRow key={p.id} product={p} onUpdate={fetchProducts} onToast={onToast} selected={selectedIds.includes(p.id)} onSelect={toggleSelect} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-5">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-xs font-black border border-gray-200 rounded-lg hover:border-gray-900 disabled:opacity-40 transition-colors">← PREV</button>
                    <span className="text-xs font-black text-gray-500 px-2">{page} / {pages}</span>
                    <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-4 py-2 text-xs font-black border border-gray-200 rounded-lg hover:border-gray-900 disabled:opacity-40 transition-colors">NEXT →</button>
                </div>
            )}
        </div>
    );
}

// ── CustomersTab ───────────────────────────────────────────────────────
function CustomersTab({ onToast }) {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.getCustomers(page);
            setCustomers(data.users || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
        } catch {
            onToast("Failed to load customers", "error");
        } finally {
            setLoading(false);
        }
    }, [page, onToast]);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const filtered = search
        ? customers.filter((c) =>
            `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
        )
        : customers;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatCard label="Total Customers" value={total} icon="👤" accent="border-gray-900" />
                <StatCard label="This Page" value={customers.length} icon="📄" accent="border-blue-400" />
                <StatCard label="Admins" value={customers.filter((c) => c.role === "admin").length} icon="🔑" accent="border-red-500" />
            </div>

            <div className="flex items-center border border-gray-200 focus-within:border-gray-900 transition-colors rounded-lg bg-gray-50 focus-within:bg-white w-full sm:w-auto sm:self-start">
                <svg className="w-4 h-4 text-gray-400 ml-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search customers..."
                    className="px-3 py-2 text-xs outline-none flex-1 font-semibold bg-transparent"
                />
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full" style={{ minWidth: "600px" }}>
                    <thead className="bg-gray-900 text-white">
                        <tr>
                            {["Avatar", "Name", "Email", "Phone", "Role", "Joined"].map((h) => (
                                <th key={h} className="px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i} className="border-b border-gray-100">
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <td key={j} className="px-3 py-4"><div className="h-3 bg-gray-100 rounded-lg animate-pulse" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-16 text-xs text-gray-400 font-bold uppercase tracking-widest">No customers found</td></tr>
                        ) : (
                            filtered.map((c) => (
                                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors text-xs">
                                    <td className="px-3 py-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white ${c.role === "admin" ? "bg-red-600" : "bg-gray-900"}`}>
                                            {c.first_name?.charAt(0).toUpperCase()}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3"><p className="font-bold text-gray-900 whitespace-nowrap">{c.first_name} {c.last_name}</p></td>
                                    <td className="px-3 py-3"><p className="text-gray-600 truncate max-w-[160px]">{c.email}</p></td>
                                    <td className="px-3 py-3"><p className="text-gray-500 whitespace-nowrap">{c.phone || "—"}</p></td>
                                    <td className="px-3 py-3">
                                        <span className={`font-black uppercase px-2 py-0.5 rounded-full text-[10px] ${c.role === "admin" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                                            {c.role}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-gray-400 text-[10px] whitespace-nowrap">
                                        {new Date(c.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-5">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-xs font-black border border-gray-200 rounded-lg hover:border-gray-900 disabled:opacity-40 transition-colors">← PREV</button>
                    <span className="text-xs font-black text-gray-500 px-2">{page} / {pages}</span>
                    <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-4 py-2 text-xs font-black border border-gray-200 rounded-lg hover:border-gray-900 disabled:opacity-40 transition-colors">NEXT →</button>
                </div>
            )}
        </div>
    );
}

// ── Main Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard() {
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState("overview");
    const [toast, setToast] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) { navigate("/login"); return; }
        if (user?.role !== "admin") { navigate("/"); }
    }, [isLoggedIn, user, navigate]);

    const showToast = (msg, type = "success") => setToast({ msg, type });

    const tabs = [
        { id: "overview", label: "Overview", icon: "📊" },
        { id: "orders", label: "Orders", icon: "📋" },
        { id: "products", label: "Products", icon: "👕" },
        { id: "customers", label: "Customers", icon: "👤" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Nav */}
            <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Row */}
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-sm font-black text-white ring-2 ring-red-500/30 shrink-0">
                                {user?.firstName?.charAt(0).toUpperCase() || "A"}
                            </div>
                            <div>
                                <h1 className="text-sm font-black uppercase tracking-tight text-gray-900 leading-tight">Admin Dashboard</h1>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">MAUVE Management</p>
                            </div>
                        </div>
                    </div>

                    {/* Tab Row — horizontal scroll on mobile */}
                    <div className="flex overflow-x-auto gap-0 pb-0 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: "none" }}>
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase tracking-wide whitespace-nowrap border-b-2 transition-all shrink-0 ${tab === t.id ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                                    }`}
                            >
                                <span className="text-base">{t.icon}</span>
                                <span className="hidden xs:inline sm:inline">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5">
                {tab === "overview" && <OverviewTab />}
                {tab === "orders" && <OrdersTab onToast={showToast} />}
                {tab === "products" && <ProductsTab onToast={showToast} />}
                {tab === "customers" && <CustomersTab onToast={showToast} />}
            </main>

            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <style>{`
        @keyframes toastIn {
          from { opacity:0; transform:translateY(20px) scale(0.95); }
          to { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(15px); }
          to { opacity:1; transform:translateY(0); }
        }
        [style*="scrollbar-width: none"]::-webkit-scrollbar { display: none; }
      `}</style>
        </div>
    );
}