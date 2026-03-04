import { useEffect, useRef, useState } from "react";

const announcements = [
    "🔥 Season's Biggest Sale — UPTO 50% Off",
    "📦 Enjoy Free Shipping on Prepaid orders",
    "🩴 NEW IN SLIDES",
    "🌊 Blue Horizon — Summer Drop '26",
];

export default function AnnouncementBar() {
    const [offset, setOffset] = useState(0);
    const trackRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setOffset((prev) => {
                const trackWidth = trackRef.current?.scrollWidth / 2 || 0;
                const next = prev - 1;
                return Math.abs(next) >= trackWidth ? 0 : next;
            });
        }, 20);
        return () => clearInterval(interval);
    }, []);

    const items = [...announcements, ...announcements];

    return (
        <div
            className="bg-black text-white overflow-hidden whitespace-nowrap py-1 select-none"
            style={{ fontSize: "11px", lineHeight: "1.4" }}
        >
            <div
                ref={trackRef}
                className="inline-flex gap-10 items-center"
                style={{ transform: `translateX(${offset}px)`, willChange: "transform" }}
            >
                {items.map((text, i) => (
                    <span
                        key={i}
                        className="tracking-widest uppercase font-medium"
                        style={{ fontSize: "11px", fontFamily: "inherit" }}
                    >
                        {text}
                    </span>
                ))}
            </div>
        </div>
    );
}