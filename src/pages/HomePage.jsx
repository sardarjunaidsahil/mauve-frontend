import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import productService from "../services/productService";

const slides = [
    "https://furorjeans.com/cdn/shop/files/Slider_a3dd12c4-c9d8-4132-a59e-5c4dc6f72eec_1920x900_crop_center.webp?v=1771925913",
    "https://furorjeans.com/cdn/shop/files/Slider_1_a9814b33-4ca3-43fa-9bd9-06de44a31844_1920x900_crop_center.webp?v=1770719820",
    "https://furorjeans.com/cdn/shop/files/Slider_1_26392481-86b2-456c-beed-9f7668fe2fe5_1920x900_crop_center.webp?v=1768024312",
    "https://furorjeans.com/cdn/shop/files/Slider_e7b2213b-d1ea-4eec-8728-1bdeeca49449_1920x900_crop_center.jpg?v=1763615743",
    "https://furorjeans.com/cdn/shop/files/Slider_2_e136d16c-e0f2-477d-b70a-527a34ad62db_1920x900_crop_center.webp?v=1758208368",
];

const categories = [
    { label: "Men", to: "/collections/men", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80" },
    { label: "Women", to: "/collections/women", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80" },
    { label: "Footwear", to: "/collections/footwear", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80" },
    { label: "Accessories", to: "/collections/accessories", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80" },
];

function ProductSkeleton() {
    return (
        <div>
            <div className="skeleton aspect-3/4 w-full" />
            <div className="pt-3 space-y-2">
                <div className="skeleton h-3.5 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
            </div>
        </div>
    );
}

function CarouselSkeleton() {
    return <div className="skeleton w-full" style={{ aspectRatio: "1920/900" }} />;
}

function HeroCarousel() {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = slides[0];
        img.onload = () => setLoaded(true);
        img.onerror = () => setLoaded(true);
    }, []);

    useEffect(() => {
        if (paused) return;
        const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 3500);
        return () => clearInterval(timer);
    }, [paused]);

    if (!loaded) return <CarouselSkeleton />;

    const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
    const next = () => setCurrent((c) => (c + 1) % slides.length);

    return (
        <section
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: "1920/900", minHeight: "220px" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {slides.map((src, i) => (
                <div key={i} className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                    style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}>
                    <img src={src} alt={`slide-${i}`} className="w-full h-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
                </div>
            ))}
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent z-2 pointer-events-none" />

            {/* Arrows — sirf md+ screens par */}
            <button onClick={prev} className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white/80 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all hover:scale-105">
                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={next} className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white/80 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all hover:scale-105">
                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {slides.map((_, i) => (
                    <button key={i} onClick={() => setCurrent(i)}
                        className={`rounded-full transition-all duration-300 ${i === current ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"}`} />
                ))}
            </div>
        </section>
    );
}

function ProductCard({ product, index = 0 }) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);

    return (
        <Link to={`/product/${product.slug}`} className="group block card-fade" style={{ animationDelay: `${index * 0.07}s` }}>
            <div className="relative overflow-hidden bg-gray-100 aspect-3/4">
                {!imgLoaded && <div className="absolute inset-0 skeleton" />}
                <img src={product.images?.[0]} alt={product.name} onLoad={() => setImgLoaded(true)}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                    loading="lazy" />
                {product.discount > 0 && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-sm">
                        SAVE {product.discount}%
                    </span>
                )}
                <button onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                    <svg className={`w-4 h-4 transition-colors ${wishlisted ? "fill-red-600 text-red-600" : "text-gray-600"}`}
                        fill={wishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black text-white text-xs font-black uppercase tracking-widest py-2.5 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    VIEW PRODUCT
                </div>
            </div>
            <div className="pt-3 pb-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-black text-black">PKR {product.price?.toLocaleString()}</span>
                    {product.original_price > product.price && (
                        <span className="text-xs text-gray-400 line-through">PKR {product.original_price?.toLocaleString()}</span>
                    )}
                </div>
                {product.colors?.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                        {product.colors.slice(0, 3).map((c, i) => (
                            <span key={i} className="text-xs text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-sm">{c}</span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}

function CategoryCard({ cat, index = 0 }) {
    return (
        <Link to={cat.to} className="group relative overflow-hidden aspect-square bg-gray-100 block card-fade" style={{ animationDelay: `${index * 0.1}s` }}>
            <img src={cat.image} alt={cat.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <span className="text-white font-black text-xl md:text-2xl uppercase tracking-widest">{cat.label}</span>
                <span className="text-transparent group-hover:text-white text-xs font-bold uppercase tracking-widest border border-transparent group-hover:border-white/70 px-4 py-1.5 transition-all duration-300">SHOP NOW</span>
            </div>
        </Link>
    );
}

function ProductSection({ title, count, products, loading, viewAllLink }) {
    return (
        <section className="max-w-7xl mx-auto px-5 pb-12">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-black text-black uppercase tracking-tight">{title}</h2>
                    {!loading && <p className="text-xs text-gray-400 mt-0.5">( {count} PRODUCTS )</p>}
                </div>
                <Link to={viewAllLink} className="text-sm font-bold text-black border-b-2 border-black hover:text-red-600 hover:border-red-600 transition-colors pb-0.5">
                    VIEW ALL →
                </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                {loading
                    ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
                    : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
                }
            </div>
        </section>
    );
}

export default function HomePage() {
    const [newArrivals, setNewArrivals] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [loadingNew, setLoadingNew] = useState(true);
    const [loadingFeatured, setLoadingFeatured] = useState(true);

    useEffect(() => {
        productService.getNewArrivals(8)
            .then(setNewArrivals)
            .catch(console.error)
            .finally(() => setLoadingNew(false));

        productService.getFeatured(8)
            .then((data) => setFeatured(data.length >= 4 ? data : []))
            .catch(console.error)
            .finally(() => setLoadingFeatured(false));
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <HeroCarousel />

            {/* Shop by Category */}
            <section className="max-w-7xl mx-auto px-5 py-12">
                <h2 className="text-xl font-black text-black uppercase tracking-tight mb-6">Shop by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {categories.map((cat, i) => <CategoryCard key={cat.label} cat={cat} index={i} />)}
                </div>
            </section>

            {/* New Arrivals */}
            <ProductSection
                title="New Arrivals"
                count={newArrivals.length}
                products={newArrivals}
                loading={loadingNew}
                viewAllLink="/collections/men"
            />

            {/* Featured — sirf show karo agar products hain */}
            {(loadingFeatured || featured.length > 0) && (
                <ProductSection
                    title="Featured"
                    count={featured.length}
                    products={featured}
                    loading={loadingFeatured}
                    viewAllLink="/collections/women"
                />
            )}

            {/* Features Strip */}
            <section className="bg-gray-50 border-t border-gray-200 py-8">
                <div className="max-w-7xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {[
                        { icon: "📦", title: "Free Shipping", desc: "On all prepaid orders" },
                        { icon: "🔄", title: "Easy Returns", desc: "7-day return policy" },
                        { icon: "💳", title: "Pay in 3", desc: "With Baadmay" },
                        { icon: "🔒", title: "Secure Payments", desc: "100% safe checkout" },
                    ].map((f, i) => (
                        <div key={f.title} className="flex flex-col items-center gap-2 card-fade" style={{ animationDelay: `${i * 0.1}s` }}>
                            <span className="text-2xl">{f.icon}</span>
                            <p className="text-sm font-bold text-black">{f.title}</p>
                            <p className="text-xs text-gray-500 hidden sm:block">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <style>{`
                .card-fade { opacity: 0; animation: cardFadeIn 0.45s ease forwards; }
                @keyframes cardFadeIn {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .skeleton {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.4s infinite linear;
                }
                @keyframes shimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}