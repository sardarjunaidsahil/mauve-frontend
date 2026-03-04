import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function CartDrawer() {
    const { items, isOpen, setIsOpen, removeItem, updateQty, subtotal, totalItems } = useCart();

    const installment = Math.round(subtotal / 3);

    // ESC key se band karo
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setIsOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [setIsOpen]);

    // Scroll lock
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    return (
        <>
            {/* ── Backdrop ── */}
            <div
                className={`fixed inset-0 bg-black/50 z-60 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={() => setIsOpen(false)}
            />

            {/* ── Drawer ── */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-105 bg-white z-70 flex flex-col shadow-2xl transition-transform duration-350 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <h2 className="text-base font-black uppercase tracking-widest text-black">CART</h2>
                        {totalItems > 0 && (
                            <span className="bg-black text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                {totalItems}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── Items ── */}
                {items.length === 0 ? (
                    /* Empty state */
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
                        <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <p className="text-sm font-black uppercase tracking-widest text-gray-400">Your cart is empty</p>
                        <p className="text-xs text-gray-400 text-center">Add items to your cart to checkout</p>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="mt-2 bg-black text-white text-xs font-black px-8 py-3 uppercase tracking-widest hover:bg-red-600 transition-colors"
                        >
                            CONTINUE SHOPPING
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Cart Items List */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">
                            {items.map((item) => (
                                <div key={item.cartKey} className="flex gap-4 pb-5 border-b border-gray-100 last:border-0">
                                    {/* Image */}
                                    <Link
                                        to={`/product/${item.id}`}
                                        onClick={() => setIsOpen(false)}
                                        className="shrink-0 w-24 h-28 bg-gray-100 overflow-hidden"
                                    >
                                        <img
                                            src={item.images?.[0] || item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <Link
                                                to={`/product/${item.id}`}
                                                onClick={() => setIsOpen(false)}
                                                className="text-sm font-bold text-black hover:text-red-600 transition-colors leading-tight line-clamp-2"
                                            >
                                                {item.name}
                                            </Link>
                                            <button
                                                onClick={() => removeItem(item.cartKey)}
                                                className="shrink-0 p-1 hover:text-red-600 transition-colors text-gray-400"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Size & Color */}
                                        <div className="flex gap-2 flex-wrap">
                                            <span className="text-xs text-gray-500 font-medium">{item.size}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-xs text-gray-500 font-medium">{item.color}</span>
                                        </div>

                                        {/* Price + Qty */}
                                        <div className="flex items-center justify-between mt-auto pt-1">
                                            <span className="text-sm font-black text-red-600">
                                                PKR {(item.price * item.quantity).toLocaleString()}
                                            </span>

                                            {/* Qty controls */}
                                            <div className="flex items-center border border-gray-300 rounded-sm">
                                                <button
                                                    onClick={() => updateQty(item.cartKey, item.quantity - 1)}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold transition-colors text-sm"
                                                >−</button>
                                                <span className="w-7 text-center text-xs font-bold text-black">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQty(item.cartKey, item.quantity + 1)}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold transition-colors text-sm"
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Footer ── */}
                        <div className="border-t border-gray-200 px-6 py-5 flex flex-col gap-4 bg-white">

                            {/* Giftkarte */}
                            <div className="border border-gray-200 rounded-sm">
                                <button className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span>🎁</span>
                                        <span className="text-xs font-bold tracking-wide">giftkarte</span>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Order Note */}
                            <button className="w-full flex items-center justify-between text-sm font-semibold text-gray-600 hover:text-black transition-colors">
                                <span className="text-xs font-bold uppercase tracking-widest">Add order note</span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>

                            {/* Taxes line */}
                            <p className="text-xs text-gray-400 text-center">Taxes and shipping calculated at checkout</p>

                            {/* Baadmay */}
                            {subtotal > 0 && (
                                <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 px-3 py-2 rounded-sm">
                                    <div className="bg-purple-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shrink-0">baadmay</div>
                                    <p className="text-xs text-gray-600">
                                        Pay in 3 Installments of{" "}
                                        <span className="text-green-600 font-bold">Rs. {installment.toLocaleString()}</span>
                                    </p>
                                </div>
                            )}

                            {/* Checkout Button */}
                            <Link
                                to="/checkout"
                                onClick={() => setIsOpen(false)}
                                className="w-full bg-black text-white text-sm font-black py-4 flex items-center justify-between px-6 hover:bg-red-600 transition-colors duration-200 uppercase tracking-widest"
                            >
                                <span>CHECKOUT</span>
                                <span className="font-black">PKR {subtotal.toLocaleString()}</span>
                            </Link>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </>
    );
}