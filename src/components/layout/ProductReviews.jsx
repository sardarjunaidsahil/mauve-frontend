import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

// ── Star component ─────────────────────────────────────────────────────
function Stars({ rating, size = "sm", interactive = false, onRate }) {
    const [hovered, setHovered] = useState(0);
    const sz = size === "lg" ? "w-7 h-7" : size === "md" ? "w-5 h-5" : "w-4 h-4";

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = interactive ? (hovered || rating) >= star : rating >= star;
                const half = !interactive && rating >= star - 0.5 && rating < star;
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && onRate?.(star)}
                        onMouseEnter={() => interactive && setHovered(star)}
                        onMouseLeave={() => interactive && setHovered(0)}
                        className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"} p-0`}
                    >
                        <svg
                            className={`${sz} ${filled ? "text-yellow-400" : half ? "text-yellow-200" : "text-gray-200"} transition-colors`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
}

// ── Rating Bar ─────────────────────────────────────────────────────────
function RatingBar({ count, total, label }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 w-3 shrink-0">{label}</span>
            <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs text-gray-400 w-6 text-right shrink-0">{count}</span>
        </div>
    );
}

// ── Write Review Form ──────────────────────────────────────────────────
function WriteReviewForm({ productId, onSubmit, onCancel, existing }) {
    const [rating, setRating] = useState(existing?.rating || 0);
    const [title, setTitle] = useState(existing?.title || "");
    const [body, setBody] = useState(existing?.body || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) { setError("Please select a rating"); return; }
        if (!body.trim()) { setError("Please write a review"); return; }
        setLoading(true);
        setError("");
        try {
            let res;
            if (existing) {
                res = await api.put(`/reviews/${existing.id}`, { rating, title, body });
            } else {
                res = await api.post(`/reviews/${productId}`, { rating, title, body });
            }
            onSubmit(res.data.review);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit review");
        } finally {
            setLoading(false);
        }
    };

    const ratingLabels = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 p-6 rounded-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-black mb-5">
                {existing ? "Edit Your Review" : "Write a Review"}
            </h3>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-3 py-2 mb-4 rounded-sm">
                    {error}
                </div>
            )}

            {/* Star Rating */}
            <div className="mb-5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2 block">
                    Your Rating *
                </label>
                <div className="flex items-center gap-3">
                    <Stars rating={rating} size="lg" interactive onRate={setRating} />
                    {rating > 0 && (
                        <span className="text-sm font-bold text-gray-600">{ratingLabels[rating]}</span>
                    )}
                </div>
            </div>

            {/* Title */}
            <div className="mb-4">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5 block">
                    Review Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Summarize your experience…"
                    maxLength={100}
                    className="w-full border border-gray-300 px-4 py-2.5 text-sm font-medium text-black placeholder-gray-300 outline-none focus:border-black transition-colors rounded-sm"
                />
            </div>

            {/* Body */}
            <div className="mb-5">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5 block">
                    Review *
                </label>
                <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Share your experience with this product…"
                    rows={4}
                    maxLength={1000}
                    className="w-full border border-gray-300 px-4 py-2.5 text-sm font-medium text-black placeholder-gray-300 outline-none focus:border-black transition-colors rounded-sm resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{body.length}/1000</p>
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-sm
                        ${loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-red-600"}`}
                >
                    {loading ? "Submitting..." : existing ? "Update Review" : "Submit Review"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 text-xs font-black uppercase tracking-widest border border-gray-300 hover:border-black transition-colors rounded-sm"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

// ── Helper function ───────────────────────────────────────────────────
const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
};

// ── Review Card ────────────────────────────────────────────────────────
function ReviewCard({ review, currentUserId, onEdit, onDelete }) {
    const isOwner = currentUserId && currentUserId === review.user_id;
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm("Delete your review?")) return;
        setDeleting(true);
        try {
            await api.delete(`/reviews/${review.id}`);
            onDelete(review.id);
        } catch {
            setDeleting(false);
        }
    };

    return (
        <div className="py-5 border-b border-gray-100 last:border-0">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-xs font-black shrink-0">
                        {review.initials || review.first_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-black text-black capitalize">
                                {review.first_name} {review.last_name}
                            </span>
                            <Stars rating={review.rating} size="sm" />
                            <span className="text-xs text-gray-400">{timeAgo(review.created_at)}</span>
                        </div>
                        {review.title && (
                            <p className="text-sm font-bold text-black mt-1">{review.title}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{review.body}</p>
                        {review.updated_at && review.updated_at !== review.created_at && (
                            <p className="text-xs text-gray-400 mt-1 italic">Edited</p>
                        )}
                    </div>
                </div>

                {/* Owner actions */}
                {isOwner && (
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => onEdit(review)}
                            className="text-xs font-bold text-gray-400 hover:text-black transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                            {deleting ? "..." : "Delete"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main ProductReviews Component ──────────────────────────────────────
export default function ProductReviews({ productId }) {
    const { isLoggedIn, user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState(null);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editReview, setEditReview] = useState(null);
    const [userReview, setUserReview] = useState(null);

    // ✅ FIX: useCallback so fetchReviews can be safely used in useEffect
    const fetchReviews = useCallback(async () => {
        if (!productId) return;
        setLoading(true);
        // ✅ FIX: Reset userReview before fetching new page
        setUserReview(null);
        try {
            const res = await api.get(`/reviews/${productId}?page=${page}&limit=5`);
            setReviews(res.data.reviews || []);
            setSummary(res.data.summary || null);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);

            // Find current user's review in this page
            if (user) {
                const mine = (res.data.reviews || []).find(r => r.user_id === user.id);
                if (mine) setUserReview(mine);
            }
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
        } finally {
            setLoading(false);
        }
    }, [productId, page, user]);

    // ✅ FIX: Reset page to 1 when productId changes
    useEffect(() => {
        setPage(1);
        setShowForm(false);
        setEditReview(null);
        setUserReview(null);
    }, [productId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleSubmit = (newReview) => {
        if (editReview) {
            setReviews(prev => prev.map(r => r.id === newReview.id ? newReview : r));
            setUserReview(newReview);
        } else {
            setReviews(prev => [newReview, ...prev]);
            setUserReview(newReview);
            setTotal(t => t + 1);
        }
        setShowForm(false);
        setEditReview(null);
        // Refresh to get updated summary
        fetchReviews();
    };

    const handleDelete = (reviewId) => {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        setUserReview(null);
        setTotal(t => Math.max(0, t - 1));
        fetchReviews();
    };

    const handleEdit = (review) => {
        setEditReview(review);
        setShowForm(true);
        setTimeout(() => {
            document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
    };

    const avgRating = parseFloat(summary?.average) || 0;

    // ✅ Guard: productId nahi hai toh kuch mat dikhao
    if (!productId) return null;

    return (
        <div className="mt-16 border-t border-gray-200 pt-12">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <h2 className="text-lg font-black uppercase tracking-widest text-black">
                    Customer Reviews
                    {total > 0 && (
                        <span className="ml-2 text-gray-400 font-bold">({total})</span>
                    )}
                </h2>
                {/* ✅ "Write Review" button sirf tab dikhao jab user logged in ho aur uska review na ho */}
                {isLoggedIn && !userReview && !showForm && (
                    <button
                        onClick={() => { setShowForm(true); setEditReview(null); }}
                        className="px-5 py-2.5 text-xs font-black uppercase tracking-widest bg-black text-white hover:bg-red-600 transition-all rounded-sm"
                    >
                        Write a Review
                    </button>
                )}
            </div>

            {/* Summary */}
            {summary && parseInt(summary.total) > 0 && (
                <div className="flex flex-col sm:flex-row gap-8 mb-8 p-6 bg-gray-50 border border-gray-100">
                    {/* Average */}
                    <div className="text-center sm:border-r sm:border-gray-200 sm:pr-8">
                        <p className="text-5xl font-black text-black">{avgRating.toFixed(1)}</p>
                        <Stars rating={avgRating} size="md" />
                        <p className="text-xs text-gray-400 mt-1">{summary.total} reviews</p>
                    </div>
                    {/* Bars */}
                    <div className="flex-1 flex flex-col justify-center gap-2">
                        <RatingBar label="5" count={parseInt(summary.five) || 0} total={parseInt(summary.total)} />
                        <RatingBar label="4" count={parseInt(summary.four) || 0} total={parseInt(summary.total)} />
                        <RatingBar label="3" count={parseInt(summary.three) || 0} total={parseInt(summary.total)} />
                        <RatingBar label="2" count={parseInt(summary.two) || 0} total={parseInt(summary.total)} />
                        <RatingBar label="1" count={parseInt(summary.one) || 0} total={parseInt(summary.total)} />
                    </div>
                </div>
            )}

            {/* Write Review Form */}
            {showForm && (
                <div id="review-form" className="mb-8">
                    <WriteReviewForm
                        productId={productId}
                        existing={editReview}
                        onSubmit={handleSubmit}
                        onCancel={() => { setShowForm(false); setEditReview(null); }}
                    />
                </div>
            )}

            {/* Login prompt */}
            {!isLoggedIn && (
                <div className="border border-dashed border-gray-300 p-6 text-center mb-8 rounded-sm">
                    <p className="text-sm text-gray-500 mb-3">
                        <Link to="/login" className="font-black text-black hover:text-red-600 transition-colors">
                            Sign in
                        </Link>
                        {" "}to write a review
                    </p>
                </div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="py-5 border-b border-gray-100 animate-pulse">
                            <div className="flex gap-3">
                                <div className="w-9 h-9 bg-gray-200 rounded-full shrink-0" />
                                <div className="flex-1">
                                    <div className="h-3 bg-gray-200 rounded w-32 mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">No reviews yet</p>
                    <p className="text-xs text-gray-400 mt-1">Be the first to review this product!</p>
                </div>
            ) : (
                <div>
                    {reviews.map(review => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            currentUserId={user?.id}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}

                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                onClick={() => setPage(p => p - 1)}
                                disabled={page === 1}
                                className="px-4 py-2 text-xs font-black uppercase border border-gray-300 hover:border-black transition-colors disabled:opacity-30 rounded-sm"
                            >
                                ← Prev
                            </button>
                            <span className="text-xs font-bold text-gray-500">{page} / {pages}</span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page === pages}
                                className="px-4 py-2 text-xs font-black uppercase border border-gray-300 hover:border-black transition-colors disabled:opacity-30 rounded-sm"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}