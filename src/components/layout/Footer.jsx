import { useState } from "react";
import { Link } from "react-router-dom";

const footerLinks = [
    {
        title: "Shop",
        links: [
            { label: "New Arrivals", to: "/collections/new-arrivals" },
            { label: "Men", to: "/collections/men" },
            { label: "Women", to: "/collections/women" },
            { label: "Footwear", to: "/collections/footwear" },
            { label: "Accessories", to: "/collections/accessories" },
            { label: "Special Prices", to: "/collections/sale" },
        ],
    },
    {
        title: "Help",
        links: [
            { label: "Track My Order", to: "/track-order" },
            { label: "Returns & Exchanges", to: "/returns" },
            { label: "Shipping Info", to: "/shipping" },
            { label: "Size Guide", to: "/size-guide" },
            { label: "FAQs", to: "/faqs" },
            { label: "Contact Us", to: "/contact" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About Us", to: "/about" },
            { label: "Careers", to: "/careers" },
            { label: "Store Locator", to: "/stores" },
            { label: "Privacy Policy", to: "/privacy" },
            { label: "Terms & Conditions", to: "/terms" },
        ],
    },
];

const socialLinks = [
    {
        label: "Instagram",
        href: "https://instagram.com",
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
        ),
    },
    {
        label: "Facebook",
        href: "https://facebook.com",
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
    },
    {
        label: "TikTok",
        href: "https://tiktok.com",
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
            </svg>
        ),
    },
];

export default function Footer() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email) return;
        setSubscribed(true);
        setEmail("");
        setTimeout(() => setSubscribed(false), 3000);
    };

    return (
        <footer className="bg-black text-white">

            {/* ── Newsletter Strip ── */}
            <div className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tight">Stay in the Loop</h3>
                        <p className="text-sm text-gray-400 mt-1">Get exclusive deals, new arrivals & style inspo.</p>
                    </div>
                    <div className="flex gap-0 w-full md:w-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="flex-1 md:w-72 bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-white transition-colors"
                        />
                        <button
                            onClick={handleSubscribe}
                            className={`px-6 py-3 text-sm font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap
                                ${subscribed ? "bg-green-600 text-white" : "bg-white text-black hover:bg-red-600 hover:text-white"}`}
                        >
                            {subscribed ? "✓ SUBSCRIBED" : "SUBSCRIBE"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Main Footer ── */}
            <div className="max-w-7xl mx-auto px-5 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

                    {/* Brand col */}
                    <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
                        <Link to="/" className="font-extrabold text-2xl text-white tracking-tight hover:opacity-70 transition-opacity">
                            MAUVE
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Pakistan's premium fashion destination. Style that speaks.
                        </p>
                        {/* Social */}
                        <div className="flex gap-3">
                            {socialLinks.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all duration-200"
                                    aria-label={s.label}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {footerLinks.map((col) => (
                        <div key={col.title} className="flex flex-col gap-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-white">{col.title}</h4>
                            <ul className="flex flex-col gap-2.5">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.to}
                                            className="text-sm text-gray-400 hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Bottom Bar ── */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} MAUVE. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        {/* Payment icons */}
                        {["VISA", "MC", "JCB", "COD"].map((p) => (
                            <span key={p} className="text-[10px] font-black text-gray-500 border border-gray-700 px-2 py-0.5 rounded-sm">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}