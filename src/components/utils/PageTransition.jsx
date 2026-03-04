import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
    const { pathname } = useLocation();

    return (
        <div
            key={pathname}
            style={{ animation: "pageFadeIn 0.25s ease forwards" }}
        >
            {children}
            <style>{`
                @keyframes pageFadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}