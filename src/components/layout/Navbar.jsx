import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MauveLogo from "./MauveLogo";

const navLinks = [
    { label: "New Arrivals", href: "/collections/new-arrivals", highlight: true },
    {
        label: "Men", href: "/collections/men",
        dropdown: ["Graphic Tees", "Polo Shirts", "Shirts", "Basic Tees", "Chino Pants", "Denim Jeans", "Co-Ord Sets", "Jogger Pants", "Shorts"],
    },
    {
        label: "Women", href: "/collections/women",
        dropdown: ["Tops", "Dresses", "Co-Ord Sets", "Bottoms", "Outerwear"],
    },
    {
        label: "Footwear", href: "/collections/footwear",
        dropdown: ["Sneakers", "Slides", "Sandals", "Boots"],
    },
    {
        label: "Accessories", href: "/collections/accessories",
        dropdown: ["Caps", "Bags", "Belts", "Socks", "Wallets"],
    },
];

const ALL_PRODUCTS = [
    { id: 1, name: "Graphic Tee – Drop Shadow", category: "Men", href: "/collections/men/graphic-tees" },
    { id: 2, name: "Oversized Polo Shirt", category: "Men", href: "/collections/men/polo-shirts" },
    { id: 3, name: "Slim Fit Chino Pants", category: "Men", href: "/collections/men/chino-pants" },
    { id: 4, name: "Washed Denim Jeans", category: "Men", href: "/collections/men/denim-jeans" },
    { id: 5, name: "Floral Printed Dress", category: "Women", href: "/collections/women/dresses" },
    { id: 6, name: "Ribbed Co-Ord Set", category: "Women", href: "/collections/women/co-ord-sets" },
    { id: 7, name: "High-Waist Bottoms", category: "Women", href: "/collections/women/bottoms" },
    { id: 8, name: "White Lace-Up Sneakers", category: "Footwear", href: "/collections/footwear/sneakers" },
    { id: 9, name: "Suede Slide Sandals", category: "Footwear", href: "/collections/footwear/slides" },
    { id: 10, name: "Structured Cap", category: "Accessories", href: "/collections/accessories/caps" },
    { id: 11, name: "Canvas Tote Bag", category: "Accessories", href: "/collections/accessories/bags" },
    { id: 12, name: "Leather Belt", category: "Accessories", href: "/collections/accessories/belts" },
    { id: 13, name: "Basic White Tee", category: "Men", href: "/collections/men/basic-tees" },
    { id: 14, name: "Jogger Pants – Black", category: "Men", href: "/collections/men/jogger-pants" },
    { id: 15, name: "Ankle Boots", category: "Footwear", href: "/collections/footwear/boots" },
];

const POPULAR = ["Graphic Tees", "Sneakers", "Co-Ord Sets", "Denim Jeans", "Caps"];

const SEARCH_PLACEHOLDERS = [
    "Search for Graphic Tees…",
    "Search for Sneakers…",
    "Search for Co-Ord Sets…",
    "Search for Denim Jeans…",
    "Search for Caps…",
    "Search for Dresses…",
];


function useAnimatedPlaceholder(phrases, interval = 2600) {
    const [displayed, setDisplayed] = useState("");
    const [phraseIdx, setPhraseIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        const current = phrases[phraseIdx];
        let timeout;
        if (paused) {
            timeout = setTimeout(() => { setPaused(false); setDeleting(true); }, interval);
            return () => clearTimeout(timeout);
        }
        if (!deleting) {
            if (charIdx < current.length) {
                timeout = setTimeout(() => {
                    setDisplayed(current.slice(0, charIdx + 1));
                    setCharIdx((c) => c + 1);
                }, 55);
            } else {
                timeout = setTimeout(() => { setPaused(true); }, 0);
            }
        } else {
            if (charIdx > 0) {
                timeout = setTimeout(() => {
                    setDisplayed(current.slice(0, charIdx - 1));
                    setCharIdx((c) => c - 1);
                }, 28);
            } else {
                setTimeout(() => {
                    setDeleting(false);
                    setPhraseIdx((i) => (i + 1) % phrases.length);
                }, 0);
            }
        }
        return () => clearTimeout(timeout);
    }, [charIdx, deleting, paused, phraseIdx, phrases, interval]);

    return displayed;
}


function highlightMatch(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <span className="text-red-600 font-bold">{text.slice(idx, idx + query.length)}</span>
            {text.slice(idx + query.length)}
        </>
    );
}

function DesktopSearch({ isTransparent }) {
    const [expanded, setExpanded] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();
    const animPlaceholder = useAnimatedPlaceholder(SEARCH_PLACEHOLDERS);

    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setExpanded(false); setQuery(""); setResults([]);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape") { setExpanded(false); setQuery(""); setResults([]); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

   
    useEffect(() => {
        if (expanded) setTimeout(() => inputRef.current?.focus(), 60);
    }, [expanded]);

  
    useEffect(() => {
        const t = setTimeout(() => {
            if (!query.trim()) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            const q = query.toLowerCase();
            setResults(ALL_PRODUCTS.filter((p) =>
                p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
            ));
            setLoading(false);
        }, 300);

        return () => clearTimeout(t);
    }, [query]);

    const handleResultClick = (href) => {
        setExpanded(false); setQuery(""); setResults([]);
        navigate(href);
    };

    return (
        <div ref={wrapperRef} className="relative hidden lg:flex items-center">

            {!expanded && (
                <button
                    onClick={() => setExpanded(true)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 group
                        ${isTransparent
                            ? "border-white/30 hover:border-white/60 hover:bg-white/10"
                            : "border-gray-200 hover:border-gray-400 bg-white"}`}
                >
                    <svg className={`w-3.5 h-3.5 shrink-0 ${isTransparent ? "text-white/70" : "text-gray-400"}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <span className={`text-xs font-medium w-40 text-left whitespace-nowrap overflow-hidden
                        ${isTransparent ? "text-white/60" : "text-gray-400"}`}>
                        {animPlaceholder || <>&nbsp;</>}
                        <span className="inline-block w-[1.5px] h-3 bg-red-500 ml-1px align-middle animate-pulse rounded-full" />
                    </span>
                </button>
            )}

            {expanded && (
                <div className="search-expand-input flex items-center gap-2 bg-white border border-gray-300 focus-within:border-black rounded-full px-4 py-1.5 shadow-lg w-72">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products…"
                        className="flex-1 text-xs font-medium text-gray-800 placeholder-gray-300 bg-transparent outline-none"
                    />
                    {loading && <div className="spinner-sm shrink-0" />}
                    {query && !loading && (
                        <button onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}>
                            <svg className="w-3.5 h-3.5 text-gray-400 hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            )}

     
            {expanded && (
                <div className="search-drop absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 shadow-2xl rounded-sm z-50 overflow-hidden">

                
                    {!query && (
                        <div className="p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Popular</p>
                            <div className="flex flex-wrap gap-1.5">
                                {POPULAR.map((term) => (
                                    <button key={term} onClick={() => setQuery(term)}
                                        className="px-3 py-1 border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-red-500 hover:text-red-600 transition-all">
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="p-4 flex flex-col gap-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-7 h-7 bg-gray-100 rounded animate-pulse shrink-0" />
                                    <div className="flex-1">
                                        <div className="h-3 bg-gray-100 rounded animate-pulse w-32 mb-1" />
                                        <div className="h-2 bg-gray-100 rounded animate-pulse w-16" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && query && results.length > 0 && (
                        <div className="py-2 max-h-72 overflow-y-auto">
                            <p className="px-4 pb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                {results.length} result{results.length !== 1 ? "s" : ""}
                            </p>
                            {results.map((product, i) => (
                                <button key={product.id} onClick={() => handleResultClick(product.href)}
                                    className="result-item w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left group transition-colors"
                                    style={{ animationDelay: `${i * 0.035}s` }}>
                                    <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-red-50 transition-colors">
                                        <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m16 10l-8-4m-8 4l8-4" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 group-hover:text-red-600 transition-colors truncate">
                                            {highlightMatch(product.name, query)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{product.category}</p>
                                    </div>
                                    <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-red-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    )}

                    {!loading && query && results.length === 0 && (
                        <div className="py-8 text-center">
                            <p className="text-xs font-semibold text-gray-500">No results for "{query}"</p>
                            <p className="text-[11px] text-gray-400 mt-1">Try different keywords</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function MobileSearchOverlay({ onClose }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const animPlaceholder = useAnimatedPlaceholder(SEARCH_PLACEHOLDERS);

    useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);

    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    useEffect(() => {
        const t = setTimeout(() => {
            if (!query.trim()) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            const q = query.toLowerCase();
            setResults(ALL_PRODUCTS.filter((p) =>
                p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
            ));
            setLoading(false);
        }, 300);

        return () => clearTimeout(t);
    }, [query]);

    const handleResultClick = (href) => { onClose(); navigate(href); };

    return (
        <>
            <div className="mobile-overlay-bg fixed inset-0 bg-black/50 z-100 backdrop-blur-sm" onClick={onClose} />
            <div className="mobile-search-panel fixed top-0 left-0 right-0 z-101 bg-white shadow-2xl">
                <div className="max-w-screen-7xl mx-auto px-5 flex items-center gap-4 h-16 border-b border-gray-100">
                    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={animPlaceholder || "Search products…"}
                        className="flex-1 text-base font-medium text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                    />
                    {loading && <div className="spinner shrink-0" />}
                    {query && !loading && (
                        <button onClick={() => setQuery("")} className="p-1 rounded-full hover:bg-gray-100">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    <button onClick={onClose} className="ml-1 text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors shrink-0">Cancel</button>
                </div>
                <div className="max-w-screen-7xl mx-auto px-5 py-4 max-h-[70vh] overflow-y-auto">
                    {!query && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Popular Searches</p>
                            <div className="flex flex-wrap gap-2">
                                {POPULAR.map((term) => (
                                    <button key={term} onClick={() => setQuery(term)}
                                        className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-red-500 hover:text-red-600 transition-all">
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {loading && (
                        <div className="flex flex-col gap-3 pt-1">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3 py-2">
                                    <div className="w-8 h-8 bg-gray-100 rounded animate-pulse shrink-0" />
                                    <div className="flex-1">
                                        <div className="h-3.5 bg-gray-100 rounded animate-pulse w-40 mb-1.5" />
                                        <div className="h-2.5 bg-gray-100 rounded animate-pulse w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!loading && query && results.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                                {results.length} Result{results.length !== 1 ? "s" : ""} for "{query}"
                            </p>
                            <div className="flex flex-col divide-y divide-gray-50">
                                {results.map((product, i) => (
                                    <button key={product.id} onClick={() => handleResultClick(product.href)}
                                        className="result-item flex items-center gap-4 py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                                        style={{ animationDelay: `${i * 0.04}s` }}>
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-red-50 transition-colors">
                                            <svg className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0v10l-8 4m-8-4V7m16 10l-8-4m-8 4l8-4" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 group-hover:text-red-600 transition-colors truncate">
                                                {highlightMatch(product.name, query)}
                                            </p>
                                            <p className="text-xs text-gray-400 font-medium mt-0.5">{product.category}</p>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-300 group-hover:text-red-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {!loading && query && results.length === 0 && (
                        <div className="py-10 text-center">
                            <p className="text-sm font-semibold text-gray-700">No results for "{query}"</p>
                            <p className="text-xs text-gray-400 mt-1">Try different keywords or browse categories</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default function Navbar({ cartCount = 0, scrolled = false, isHome = false, onCartClick }) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileDropdown, setMobileDropdown] = useState(null);
    const [navHovered, setNavHovered] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const { isLoggedIn, user, logout } = useAuth();
    const navigate = useNavigate();

    const profileRef = useRef(null);
    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggleMobileDropdown = (label) => setMobileDropdown((prev) => (prev === label ? null : label));
    const isTransparent = isHome && !scrolled && !navHovered;

    const userInitial = (user?.firstName || user?.name || "U").charAt(0).toUpperCase();
    const userDisplayName = user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : user?.name || "";

    return (
        <>
            <style>{`
                .nav-link { position: relative; }
                .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0%; height: 2px; background-color: #dc2626; transition: width 0.22s ease; }
                .nav-link:hover::after { width: 100%; }
                .nav-link:hover { opacity: 0.75; }

                @keyframes dropDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
                .dropdown-menu { animation: dropDown 0.18s ease forwards; }

                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .mobile-menu { animation: slideDown 0.22s ease forwards; }

                @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: translateX(0); } }
                .mobile-item { opacity: 0; animation: fadeInLeft 0.2s ease forwards; }

                @keyframes searchExpandIn {
                    from { opacity: 0; transform: scaleX(0.7); transform-origin: right center; }
                    to   { opacity: 1; transform: scaleX(1);   transform-origin: right center; }
                }
                .search-expand-input { animation: searchExpandIn 0.22s cubic-bezier(0.4,0,0.2,1) forwards; }

                @keyframes dropResults { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
                .search-drop { animation: dropResults 0.18s ease forwards; }

                @keyframes resultItem { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
                .result-item { opacity: 0; animation: resultItem 0.14s ease forwards; }

                @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
                .mobile-overlay-bg { animation: overlayIn 0.2s ease forwards; }
                @keyframes panelIn { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
                .mobile-search-panel { animation: panelIn 0.22s ease forwards; }

                .spinner    { width:18px;height:18px;border:2px solid #e5e7eb;border-top-color:#dc2626;border-radius:50%;animation:spin .6s linear infinite; }
                .spinner-sm { width:13px;height:13px;border:2px solid #e5e7eb;border-top-color:#dc2626;border-radius:50%;animation:spin .6s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            {mobileSearchOpen && <MobileSearchOverlay onClose={() => setMobileSearchOpen(false)} />}

            <nav
                className={`w-full transition-all duration-300 ${!isTransparent ? "bg-white border-b border-gray-200 shadow-sm" : "bg-transparent border-b border-white/10"}`}
                onMouseEnter={() => setNavHovered(true)}
                onMouseLeave={() => setNavHovered(false)}
            >
                <div className="max-w-screen-7xl mx-auto px-5 flex items-center h-16 gap-4">

                    <Link to="/" className="shrink-0 mr-3 hover:opacity-80 transition-opacity duration-300">
                        <MauveLogo className="h-10 w-auto" light={isTransparent} />
                    </Link>

                    <div className="hidden lg:flex items-center flex-1">
                        {navLinks.map((link) => (
                            <div key={link.label} className="relative"
                                onMouseEnter={() => link.dropdown && setOpenDropdown(link.label)}
                                onMouseLeave={() => setOpenDropdown(null)}>
                                <Link to={link.href}
                                    className={`nav-link flex items-center gap-1 text-sm px-3 py-2 font-semibold whitespace-nowrap transition-all duration-300
                                        ${link.highlight ? "text-red-500" : !isTransparent ? "text-gray-800" : "text-white"}`}>
                                    {link.label}
                                    {link.dropdown && (
                                        <svg className={`w-3 h-3 transition-transform duration-200 text-gray-400 ${openDropdown === link.label ? "rotate-180" : ""}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </Link>
                                {link.dropdown && openDropdown === link.label && (
                                    <div className="dropdown-menu absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-2xl min-w-48 z-50 py-2">
                                        {link.dropdown.map((item) => (
                                            <Link key={item}
                                                to={`${link.href}?sub=${item.toLowerCase().replace(/\s+/g, "-")}`}
                                                className="block px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 hover:pl-7 transition-all duration-150">
                                                {item}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="ml-auto flex items-center gap-2">

                        <DesktopSearch isTransparent={isTransparent} />

                        {isLoggedIn ? (
                            <div className="hidden lg:block relative" ref={profileRef}>
                                <button onClick={() => setProfileOpen((prev) => !prev)}
                                    className={`flex items-center gap-2 px-3 py-2 hover:text-red-600 transition-colors duration-300 ${!isTransparent ? "text-gray-800" : "text-white"}`}>
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black bg-red-600 text-white">
                                        {userInitial}
                                    </div>
                                    <svg className={`w-3 h-3 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {profileOpen && (
                                    <div className="dropdown-menu absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-2xl min-w-44 z-50 py-2">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-xs font-black text-black capitalize">{userDisplayName}</p>
                                            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                                        </div>
                                        {user?.role === "admin" && (
                                            <Link to="/admin"
                                                className="block px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all border-b border-gray-100">
                                                ⚙️ Admin Panel
                                            </Link>
                                        )}
                                        <Link to="/orders" onClick={() => setProfileOpen(false)}
                                            className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-all">
                                            My Orders
                                        </Link>
                                        <button onClick={() => { logout(); setProfileOpen(false); navigate("/"); }}
                                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-all border-t border-gray-100 mt-1">
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className={`hidden lg:block text-sm font-semibold hover:text-red-600 transition-colors duration-300 px-3 py-2 ${!isTransparent ? "text-gray-800" : "text-white"}`}>
                                Login
                            </Link>
                        )}

                        <button onClick={() => setMobileSearchOpen(true)} className="lg:hidden p-2 hover:bg-white/20 rounded-full transition-colors">
                            <svg className={`w-5 h-5 transition-colors duration-300 ${!isTransparent ? "text-gray-700" : "text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                        </button>

                        <button onClick={onCartClick} className="relative p-2 hover:bg-white/20 rounded-full transition-colors">
                            <svg className={`w-5 h-5 transition-colors duration-300 ${!isTransparent ? "text-gray-700" : "text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        <button className="lg:hidden p-2 hover:bg-white/20 rounded-full transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
                            <svg className={`w-5 h-5 transition-colors duration-300 ${!isTransparent ? "text-gray-800" : "text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {mobileOpen
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                }
                            </svg>
                        </button>
                    </div>
                </div>

                {mobileOpen && (
                    <div className="mobile-menu lg:hidden border-t border-gray-100 bg-white shadow-2xl">
                        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                            {isLoggedIn ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black">{userInitial}</div>
                                        <span className="text-sm font-semibold text-gray-800 capitalize">{userDisplayName}</span>
                                    </div>
                                    <button onClick={() => { logout(); setMobileOpen(false); navigate("/"); }} className="text-xs font-bold text-red-500 hover:underline">Logout</button>
                                </div>
                            ) : (
                                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors">Login</Link>
                            )}
                        </div>
                        {isLoggedIn && (
                            <div className="px-5 pt-3 pb-1 border-b border-gray-100">
                                <Link to="/orders" onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2 py-2.5 text-sm font-semibold text-gray-800 hover:text-red-600 transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    My Orders
                                </Link>
                            </div>
                        )}
                        <div className="px-5 py-4 flex flex-col divide-y divide-gray-100">
                            {navLinks.map((link, i) => (
                                <div key={link.label} className="mobile-item" style={{ animationDelay: `${0.05 + i * 0.045}s` }}>
                                    <div className={`flex items-center justify-between py-3.5 cursor-pointer transition-colors ${link.highlight ? "text-red-600" : "text-gray-800 hover:text-red-600"}`}
                                        onClick={() => link.dropdown ? toggleMobileDropdown(link.label) : null}>
                                        {link.dropdown ? (
                                            <span className="text-sm font-semibold">{link.label}</span>
                                        ) : (
                                            <Link to={link.href} className="text-sm font-semibold w-full" onClick={() => setMobileOpen(false)}>{link.label}</Link>
                                        )}
                                        {link.dropdown && (
                                            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${mobileDropdown === link.label ? "rotate-90" : ""}`}
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        )}
                                    </div>
                                    {link.dropdown && mobileDropdown === link.label && (
                                        <div className="bg-gray-50 border-l-2 border-red-600 ml-2 mb-2 flex flex-col" style={{ animation: "slideDown 0.18s ease forwards" }}>
                                            {link.dropdown.map((item) => (
                                                <Link key={item}
                                                    to={`${link.href}?sub=${item.toLowerCase().replace(/\s+/g, "-")}`}
                                                    className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-gray-100 transition-colors"
                                                    onClick={() => setMobileOpen(false)}>
                                                    {item}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="px-5 pb-5 mobile-item" style={{ animationDelay: "0.35s" }}>
                            <p className="text-xs text-gray-400 text-center font-medium tracking-wide uppercase">Free Shipping on Prepaid Orders 📦</p>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}