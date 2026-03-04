import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import ProductReviews from "../components/layout/ProductReviews";

export default function ProductPage() {
    const { id } = useParams();
    const { addItem } = useCart();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [wishlisted, setWishlisted] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const [sizeError, setSizeError] = useState(false);
    const [activeTab, setActiveTab] = useState("description");

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError("");
            setSelectedImage(0);
            setSelectedSize(null);
            setSelectedColor("");

            try {
                const { data } = await api.get(`/products/${id}`);
                const prod = data.product || data;
                setProduct(prod);
                setSelectedColor(prod.colors?.[0] || "");

                if (prod.category) {
                    try {
                        const rel = await api.get(`/products?category=${prod.category}&limit=5`);
                        const list = rel.data?.products || rel.data || [];
                        setRelatedProducts(
                            list
                                .filter((p) => String(p._id || p.id) !== String(id))
                                .slice(0, 4)
                        );
                    } catch {
                        // related nahi mile — koi baat nahi
                    }
                }
            } catch {
                setError("Product load nahi hua. Please refresh karein.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!selectedSize) {
            setSizeError(true);
            setTimeout(() => setSizeError(false), 2000);
            return;
        }
        addItem(product, selectedSize, selectedColor, quantity);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <p className="text-sm font-black uppercase tracking-widest text-red-500">
                    {error || "Product nahi mila."}
                </p>
                <Link
                    to="/"
                    className="bg-black text-white text-xs font-black px-8 py-3 uppercase tracking-widest hover:bg-red-600 transition-colors"
                >
                    WAPAS JAAEN
                </Link>
            </div>
        );
    }

    const installment = Math.round(product.price / 3);
    const images = product.images?.length
        ? product.images
        : [product.image].filter(Boolean);

    // ✅ FIX: _id || id dono handle karo
    const productId = product._id || product.id;

    return (
        <div className="min-h-screen bg-white">

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-5 pt-6 pb-4">
                <p className="text-xs text-gray-400">
                    <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
                    <span className="mx-2">/</span>
                    <Link
                        to={`/collections/${product.category}`}
                        className="hover:text-red-600 transition-colors capitalize"
                    >
                        {product.category}
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-black font-semibold">{product.name}</span>
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-5 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

                    {/* ── Left: Images ── */}
                    <div className="flex flex-col-reverse lg:flex-row gap-3">
                        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`shrink-0 w-16 h-20 lg:w-20 lg:h-24 overflow-hidden border-2 transition-all duration-150 ${selectedImage === i
                                        ? "border-black"
                                        : "border-transparent hover:border-gray-300"
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        <div className="relative flex-1 overflow-hidden bg-gray-50 aspect-3/4">
                            <img
                                key={selectedImage}
                                src={images[selectedImage]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                style={{ animation: "fadeIn 0.3s ease" }}
                            />
                            {product.discount > 0 && (
                                <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-sm">
                                    SAVE {product.discount}%
                                </span>
                            )}
                            <button
                                onClick={() => setWishlisted(!wishlisted)}
                                className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                            >
                                <svg
                                    className={`w-4 h-4 ${wishlisted ? "fill-red-600 text-red-600" : "text-gray-500"}`}
                                    fill={wishlisted ? "currentColor" : "none"}
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-sm">
                                {selectedImage + 1} / {images.length}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Product Info ── */}
                    <div className="flex flex-col gap-5">

                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">
                                {product.subCategory}
                            </p>
                            <h1 className="text-2xl lg:text-3xl font-black text-black leading-tight tracking-tight">
                                {product.name}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-2xl font-black text-red-600">
                                PKR {product.price?.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                                <span className="text-base text-gray-400 line-through">
                                    PKR {product.originalPrice?.toLocaleString()}
                                </span>
                            )}
                            {product.discount > 0 && (
                                <span className="bg-red-600 text-white text-xs font-black px-2 py-1 rounded-sm">
                                    SAVE {product.discount}% OFF
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 border border-gray-200 px-4 py-3 rounded-sm bg-gray-50">
                            <div className="bg-purple-600 text-white text-xs font-black px-2 py-1 rounded">baadmay</div>
                            <p className="text-sm text-gray-700">
                                Pay in 3 Installments of{" "}
                                <span className="text-green-600 font-bold">Rs. {installment.toLocaleString()}</span>
                            </p>
                        </div>

                        {product.articleNo && (
                            <p className="text-xs text-gray-400">
                                Article No: <span className="text-gray-600 font-semibold">{product.articleNo}</span>
                            </p>
                        )}

                        {product.details?.length > 0 && (
                            <ul className="flex flex-col gap-1">
                                {product.details.map((d, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                                        {d}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {product.modelInfo && (
                            <p className="text-xs text-gray-500 italic">{product.modelInfo}</p>
                        )}

                        <div className="border-t border-gray-100" />

                        {product.colors?.length > 0 && (
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
                                    COLOR: <span className="text-black">{selectedColor}</span>
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-3 py-2 text-xs font-semibold border-2 transition-all duration-150 rounded-sm ${selectedColor === color
                                                ? "border-black bg-black text-white"
                                                : "border-gray-300 text-gray-700 hover:border-black"
                                                }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.sizes?.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className={`text-xs font-black uppercase tracking-widest transition-colors ${sizeError ? "text-red-600" : "text-gray-500"
                                        }`}>
                                        SIZE:{" "}
                                        {selectedSize ? (
                                            <span className="text-black">{selectedSize}</span>
                                        ) : (
                                            <span className={sizeError ? "text-red-500" : "text-gray-400"}>
                                                Select a size
                                            </span>
                                        )}
                                    </p>
                                    <button className="text-xs font-semibold text-gray-500 underline hover:text-black flex items-center gap-1 transition-colors">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Size Guide
                                    </button>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => { setSelectedSize(size); setSizeError(false); }}
                                            className={`min-w-11 h-11 px-3 text-sm font-bold border-2 transition-all duration-150 rounded-sm ${selectedSize === size
                                                ? "border-black bg-black text-white"
                                                : sizeError
                                                    ? "border-red-400 text-gray-700 hover:border-black"
                                                    : "border-gray-300 text-gray-700 hover:border-black"
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                                {sizeError && (
                                    <p className="text-red-500 text-xs mt-2 font-semibold">⚠ Please select a size</p>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 items-center">
                            <div className="flex items-center border-2 border-gray-300 rounded-sm">
                                <button
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    className="w-10 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold transition-colors"
                                >−</button>
                                <span className="w-10 text-center text-sm font-bold text-black">{quantity}</span>
                                <button
                                    onClick={() => setQuantity((q) => q + 1)}
                                    className="w-10 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold transition-colors"
                                >+</button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className={`flex-1 h-12 text-sm font-black tracking-widest uppercase transition-all duration-300 rounded-sm ${addedToCart
                                    ? "bg-green-600 text-white"
                                    : "bg-black text-white hover:bg-red-600"
                                    }`}
                            >
                                {addedToCart ? "✓ ADDED TO CART" : "ADD TO CART"}
                            </button>

                            <button
                                onClick={() => setWishlisted(!wishlisted)}
                                className={`w-12 h-12 border-2 flex items-center justify-center rounded-sm transition-all duration-200 ${wishlisted ? "border-red-600 bg-red-50" : "border-gray-300 hover:border-black"
                                    }`}
                            >
                                <svg
                                    className={`w-5 h-5 ${wishlisted ? "fill-red-600 text-red-600" : "text-gray-500"}`}
                                    fill={wishlisted ? "currentColor" : "none"}
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-2">
                            {[
                                { icon: "📦", text: "Free Shipping on Prepaid" },
                                { icon: "🔄", text: "Easy 7-Day Returns" },
                                { icon: "🔒", text: "Secure Checkout" },
                            ].map((b) => (
                                <div key={b.text} className="flex flex-col items-center gap-1 text-center p-3 bg-gray-50 rounded-sm">
                                    <span className="text-lg">{b.icon}</span>
                                    <p className="text-[10px] font-semibold text-gray-500 leading-tight">{b.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="mt-16 border-t border-gray-200">
                    <div className="flex gap-0 border-b border-gray-200">
                        {["description", "details", "shipping"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-4 text-sm font-black uppercase tracking-widest transition-colors border-b-2 -mb-px ${activeTab === tab
                                    ? "border-black text-black"
                                    : "border-transparent text-gray-400 hover:text-black"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="py-6 max-w-2xl">
                        {activeTab === "description" && (
                            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                        )}
                        {activeTab === "details" && (
                            <ul className="flex flex-col gap-2">
                                {product.details?.map((d, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />{d}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {activeTab === "shipping" && (
                            <div className="flex flex-col gap-3 text-sm text-gray-600">
                                <p>📦 <strong>Free Shipping</strong> on all prepaid orders across Pakistan.</p>
                                <p>🚚 <strong>Cash on Delivery</strong> available with a small handling fee.</p>
                                <p>⏱ Orders dispatched within <strong>1-2 business days</strong>.</p>
                                <p>🔄 <strong>7-day easy returns</strong> on all unused items in original packaging.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ✅ FIX: _id || id pass karo */}
                <ProductReviews productId={productId} />

                {/* ── Related Products ── */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-xl font-black uppercase tracking-tight text-black mb-6">
                            You May Also Like
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
                            {relatedProducts.map((p) => (
                                <Link
                                    key={p._id || p.id}
                                    to={`/product/${p._id || p.id}`}
                                    className="group"
                                >
                                    <div className="relative overflow-hidden bg-gray-100 aspect-3/4">
                                        <img
                                            src={p.images?.[0] || p.image}
                                            alt={p.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {p.discount > 0 && (
                                            <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-sm">
                                                SAVE {p.discount}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm font-bold text-red-600">
                                                PKR {p.price?.toLocaleString()}
                                            </span>
                                            {p.originalPrice && (
                                                <span className="text-xs text-gray-400 line-through">
                                                    PKR {p.originalPrice?.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0.6; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}