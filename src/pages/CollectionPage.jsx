import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import productService from "../services/productService";

const SUBCATEGORIES = {
    "new-arrivals": ["All"],
    men: ["All", "graphic-tees", "polo-shirts", "shirts", "basic-tees", "chino-pants", "denim-jeans", "co-ord-sets", "jogger-pants", "shorts"],
    women: ["All", "tops", "dresses", "co-ord-sets", "bottoms", "outerwear"],
    footwear: ["All", "sneakers", "slides", "sandals", "boots"],
    accessories: ["All", "caps", "bags", "belts", "socks", "wallets"],
};

const SUBCATEGORY_LABELS = {
    "graphic-tees": "Graphic Tees", "polo-shirts": "Polo Shirts", "shirts": "Shirts", "basic-tees": "Basic Tees",
    "chino-pants": "Chino Pants", "denim-jeans": "Denim Jeans", "co-ord-sets": "Co-Ord Sets",
    "jogger-pants": "Jogger Pants", "shorts": "Shorts", "tops": "Tops", "dresses": "Dresses",
    "bottoms": "Bottoms", "outerwear": "Outerwear", "sneakers": "Sneakers", "slides": "Slides",
    "sandals": "Sandals", "boots": "Boots", "caps": "Caps", "bags": "Bags", "belts": "Belts",
    "socks": "Socks", "wallets": "Wallets",
};

const SORT_OPTIONS = [
    { value: "default", label: "Featured" },
    { value: "newest", label: "New Arrivals" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "discount", label: "Biggest Discount" },
];

function ProductSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="bg-gray-200 aspect-3/4 w-full mb-3" />
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
    );
}

function ProductCard({ product }) {
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
        <Link to={`/product/${product.slug}`} className="group block">
            <div className="relative overflow-hidden bg-gray-100 aspect-3/4 mb-3">
                {!imgLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
                <img
                    src={product.images?.[0]}
                    alt={product.name}
                    onLoad={() => setImgLoaded(true)}
                    className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                />
                {product.discount > 0 && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                        -{product.discount}%
                    </span>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-black text-white text-xs font-black uppercase tracking-widest py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    VIEW PRODUCT
                </div>
            </div>
            <div>
                <p className="text-xs font-bold text-black uppercase tracking-wide truncate leading-tight">{product.name}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-black text-black">PKR {product.price?.toLocaleString()}</span>
                    {product.original_price > product.price && (
                        <span className="text-xs text-gray-400 line-through">PKR {product.original_price?.toLocaleString()}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default function CollectionPage() {
    const { category } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const subParam = searchParams.get("sub") || "All";
    const sortParam = searchParams.get("sort") || "default";
    const pageParam = parseInt(searchParams.get("page") || "1");

    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const subCategories = SUBCATEGORIES[category] || ["All"];
    const LIMIT = 20;

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        try {
            const isNewArrivals = category === "new-arrivals";
            const data = await productService.getProducts({
                category: isNewArrivals ? undefined : category,
                subCategory: subParam !== "All" ? subParam : undefined,
                sortBy: isNewArrivals ? "newest" : sortParam,
                page: pageParam,
                limit: LIMIT,
            });
            setProducts(data.products);
            setTotal(data.total);
            setPages(data.pages);
        } catch (err) {
            console.error("Failed to fetch products:", err);
        } finally {
            setLoading(false);
        }
    }, [category, subParam, sortParam, pageParam]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const updateParam = (key, value) => {
        const params = Object.fromEntries(searchParams.entries());
        params[key] = value;
        if (key !== "page") params.page = "1";
        setSearchParams(params);
    };

    const categoryLabel = category === "new-arrivals"
        ? "New Arrivals"
        : category ? category.charAt(0).toUpperCase() + category.slice(1) : "All";

    return (
        <div className="min-h-screen bg-white">

            {/* Header */}
            <div className="border-b border-gray-200 px-5 py-1.5 flex items-center justify-between">
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                    <Link to="/" className="hover:text-black transition-colors">Home</Link>
                    {" / "}
                    <span className="text-black font-black">
                        {subParam !== "All" ? (SUBCATEGORY_LABELS[subParam] || subParam) : categoryLabel}
                    </span>
                </p>
                {!loading && <p className="text-xs text-gray-400">{total} Products</p>}
            </div>

            {/* Subcategory Tabs — new-arrivals pe hide */}
            {category !== "new-arrivals" && (
                <div className="border-b border-gray-200 overflow-x-auto">
                    <div className="flex items-center gap-0 px-5 min-w-max mx-auto">
                        {subCategories.map((sub) => (
                            <button
                                key={sub}
                                onClick={() => updateParam("sub", sub)}
                                className={`px-4 py-3 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all
                                    ${subParam === sub ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"}`}
                            >
                                {sub === "All" ? "All" : (SUBCATEGORY_LABELS[sub] || sub)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-600 hover:text-black transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M10 18h4" />
                    </svg>
                    Filter
                </button>
                <select
                    value={sortParam}
                    onChange={(e) => updateParam("sort", e.target.value)}
                    className="text-xs font-bold uppercase tracking-wide text-black border border-gray-200 px-3 py-2 outline-none focus:border-black bg-white cursor-pointer"
                >
                    {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <div className={`shrink-0 border-r border-gray-200 overflow-hidden transition-all duration-300 ${sidebarOpen ? "w-56" : "w-0"}`}>
                    <div className="p-5 w-56">
                        <p className="text-xs font-black uppercase tracking-widest text-black mb-4">Sort By</p>
                        <div className="flex flex-col gap-2">
                            {SORT_OPTIONS.map((opt) => (
                                <button key={opt.value} onClick={() => updateParam("sort", opt.value)}
                                    className={`text-left text-xs font-semibold py-1.5 transition-colors ${sortParam === opt.value ? "text-black font-black" : "text-gray-400 hover:text-black"}`}>
                                    {sortParam === opt.value && <span className="mr-1">→</span>}
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {category !== "new-arrivals" && (
                            <div className="border-t border-gray-200 mt-5 pt-5">
                                <p className="text-xs font-black uppercase tracking-widest text-black mb-4">Category</p>
                                <div className="flex flex-col gap-2">
                                    {subCategories.map((sub) => (
                                        <button key={sub} onClick={() => updateParam("sub", sub)}
                                            className={`text-left text-xs font-semibold py-1 transition-colors ${subParam === sub ? "text-black font-black" : "text-gray-400 hover:text-black"}`}>
                                            {subParam === sub && <span className="mr-1">→</span>}
                                            {sub === "All" ? "All" : (SUBCATEGORY_LABELS[sub] || sub)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1 px-5 py-6">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-8">
                            {Array.from({ length: 20 }).map((_, i) => <ProductSkeleton key={i} />)}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <svg className="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-black uppercase tracking-widest text-gray-300">No products found</p>
                            <button onClick={() => updateParam("sub", "All")}
                                className="text-xs font-black text-black underline hover:text-red-600 transition-colors">
                                CLEAR FILTERS
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-8">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-12">
                            <button onClick={() => updateParam("page", String(pageParam - 1))} disabled={pageParam === 1}
                                className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-gray-300 hover:border-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                ← PREV
                            </button>
                            {Array.from({ length: pages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === pages || Math.abs(p - pageParam) <= 1)
                                .reduce((acc, p, i, arr) => {
                                    if (i > 0 && arr[i - 1] !== p - 1) acc.push("...");
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, i) =>
                                    p === "..." ? (
                                        <span key={`dot-${i}`} className="px-2 text-gray-400">...</span>
                                    ) : (
                                        <button key={p} onClick={() => updateParam("page", String(p))}
                                            className={`w-9 h-9 text-xs font-black border transition-colors ${pageParam === p ? "bg-black text-white border-black" : "border-gray-300 text-black hover:border-black"}`}>
                                            {p}
                                        </button>
                                    )
                                )
                            }
                            <button onClick={() => updateParam("page", String(pageParam + 1))} disabled={pageParam === pages}
                                className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-gray-300 hover:border-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                NEXT →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}