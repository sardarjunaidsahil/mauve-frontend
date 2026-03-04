// MauveLogo.jsx — drop this anywhere in your project
// Usage in Navbar: <MauveLogo className="h-10 w-auto" light={isTransparent} />

export default function MauveLogo({ className = "h-12 w-auto", light = false }) {
    const ink = light ? "#ffffff" : "#000000";
    const bgBox = light ? "#ffffff" : "#000000";
    const bgTxt = light ? "#000000" : "#ffffff";

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 300 96"
            className={className}
            aria-label="MAUVE"
            role="img"
        >
            {/* ── MONOGRAM BLOCK ── */}
            <rect x="0" y="4" width="88" height="88" rx="2" fill={bgBox} />
            {/* Inner inset border — double rule luxury detail */}
            <rect x="5.5" y="9.5" width="77" height="77" rx="1"
                fill="none" stroke={bgTxt} strokeWidth="0.55" opacity="0.28" />

            {/* Corner bracket ornaments */}
            <g stroke={bgTxt} strokeWidth="0.9" fill="none" opacity="0.4">
                <path d="M8 17 L8 11 L14 11" />
                <path d="M80 17 L80 11 L74 11" />
                <path d="M8 79 L8 85 L14 85" />
                <path d="M80 79 L80 85 L74 85" />
            </g>

            {/* ── M Monogram — geometric serif ── */}
            <g transform="translate(44, 48)">
                {/* Left thick stem */}
                <rect x="-21" y="-23" width="6.5" height="46" fill={bgTxt} />
                {/* Right thick stem */}
                <rect x="14.5" y="-23" width="6.5" height="46" fill={bgTxt} />
                {/* Left diagonal thin stroke */}
                <polygon points="-14.5,-23 -8.5,-23 1,0 -5,0" fill={bgTxt} />
                {/* Right diagonal thin stroke */}
                <polygon points="14.5,-23 8.5,-23 -1,0 5,0" fill={bgTxt} />
                {/* Serif caps */}
                <rect x="-25" y="-25" width="13" height="2.5" fill={bgTxt} />
                <rect x="12" y="-25" width="13" height="2.5" fill={bgTxt} />
                {/* Serif feet */}
                <rect x="-25" y="20.5" width="13" height="2.5" fill={bgTxt} />
                <rect x="12" y="20.5" width="13" height="2.5" fill={bgTxt} />
            </g>

            {/* ── WORDMARK ── */}
            <g transform="translate(102, 48)">
                <text
                    x="0" y="0"
                    fontFamily="'Times New Roman', Times, Georgia, serif"
                    fontSize="26"
                    fontWeight="400"
                    letterSpacing="9"
                    fill={ink}
                    dominantBaseline="middle"
                    textAnchor="start"
                >MAUVE</text>

                {/* Hairline rule */}
                <line x1="0.5" y1="17" x2="179" y2="17"
                    stroke={ink} strokeWidth="0.55" opacity="0.45" />

                {/* Sub-tagline */}
                <text
                    x="1" y="28"
                    fontFamily="'Times New Roman', Times, Georgia, serif"
                    fontSize="6.5"
                    letterSpacing="4.2"
                    fill={ink}
                    opacity="0.42"
                    dominantBaseline="middle"
                    textAnchor="start"
                >LUXURY FASHION</text>
            </g>
        </svg>
    );
}