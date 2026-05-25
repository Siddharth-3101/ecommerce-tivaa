"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import Link from "next/link";
import { Star, MessageSquare, Calendar, User } from "lucide-react";

export default function ProductReviews({ productId }) {
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState("0.0");
    const [loading, setLoading] = useState(true);
    
    // Form states
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");

    const user = getUser();

    const fetchReviewsData = async () => {
        try {
            const [reviewsRes, avgRes] = await Promise.all([
                api.get(`/reviews/product/${productId}`),
                api.get(`/reviews/product/${productId}/average`)
            ]);
            setReviews(reviewsRes.data);
            setAvgRating(avgRes.data.average_rating || "0.0");
        } catch (err) {
            console.error("Failed to load reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchReviewsData();
        }
    }, [productId]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError("");
        setFormSuccess("");

        if (!user) {
            setFormError("You must be logged in to submit a review.");
            setSubmitting(false);
            return;
        }

        try {
            await api.post("/reviews", {
                product_id: productId,
                rating,
                review: reviewText
            });

            setFormSuccess("Thank you! Your review has been added successfully.");
            setReviewText("");
            setRating(5);
            // Refresh reviews list
            await fetchReviewsData();
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to submit review. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Check if the current user has already reviewed the product
    const hasUserReviewed = user && reviews.some(r => r.user_name === user.name);

    // Helper to render star rating row
    const renderStars = (score, size = 16, interactive = false) => {
        const stars = [];
        const currentRating = interactive ? (hoverRating || rating) : score;

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={size}
                    fill={i <= currentRating ? "var(--accent-yellow)" : "none"}
                    color={i <= currentRating ? "var(--accent-yellow)" : "var(--border)"}
                    style={{
                        marginRight: '4px',
                        cursor: interactive ? 'pointer' : 'default',
                        transition: 'transform 0.15s ease, color 0.15s ease',
                    }}
                    onMouseEnter={() => interactive && setHoverRating(i)}
                    onMouseLeave={() => interactive && setHoverRating(0)}
                    onClick={() => interactive && setRating(i)}
                    className={interactive ? "star-interactive" : ""}
                />
            );
        }
        return <div style={{ display: 'flex', alignItems: 'center' }}>{stars}</div>;
    };

    if (loading) {
        return (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid rgba(229,147,116,0.2)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>Loading reviews...</p>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '48px', borderTop: '1px solid var(--border)', paddingTop: '48px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '60px', alignItems: 'start' }}>
                
                {/* LEFT COLUMN: RATING AGGREGATION & SUBMISSION */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div className="card" style={{ padding: '32px', background: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Customer Reviews</h3>
                        <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
                            {avgRating}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 8px' }}>
                            {renderStars(Math.round(Number(avgRating)), 20)}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                        </p>
                    </div>

                    {/* WRITE REVIEW FORM */}
                    <div className="card" style={{ padding: '32px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquare size={18} color="var(--accent)" /> Leave a Review
                        </h4>

                        {!user ? (
                            <div style={{ textAlign: 'center', padding: '12px 0', fontSize: '0.95rem' }}>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Please sign in to write a product review.</p>
                                <Link href="/login" className="btn btn-secondary" style={{ width: '100%', padding: '10px' }}>
                                    Sign In
                                </Link>
                            </div>
                        ) : hasUserReviewed ? (
                            <div style={{ background: 'rgba(117,163,99,0.05)', border: '1px solid rgba(117,163,99,0.2)', padding: '16px', borderRadius: '12px', color: 'var(--success)', fontSize: '0.9rem', textAlign: 'center' }}>
                                <p>You have already submitted a review for this product. Thank you for your feedback!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {formError && (
                                    <div style={{ padding: '10px', background: 'rgba(179,86,111,0.08)', border: '1px solid rgba(179,86,111,0.2)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem' }}>
                                        {formError}
                                    </div>
                                )}
                                {formSuccess && (
                                    <div style={{ padding: '10px', background: 'rgba(117,163,99,0.08)', border: '1px solid rgba(117,163,99,0.2)', borderRadius: '8px', color: 'var(--success)', fontSize: '0.85rem' }}>
                                        {formSuccess}
                                    </div>
                                )}

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Your Rating</label>
                                    {renderStars(rating, 24, true)}
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Your Comments</label>
                                    <textarea
                                        className="input-field"
                                        rows={4}
                                        placeholder="What did you love about this item? Share your thoughts with others..."
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        required
                                        style={{ resize: 'none', fontSize: '0.95rem' }}
                                        disabled={submitting}
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', padding: '12px' }}>
                                    {submitting ? (
                                        <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '50%', borderTopColor: '#fff', animation: 'spin 1s ease-in-out infinite' }}></span>
                                    ) : "Submit Review"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: REVIEWS FEED */}
                <div>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Customer Experiences ({reviews.length})
                    </h3>

                    {reviews.length === 0 ? (
                        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', borderStyle: 'dashed' }}>
                            <MessageSquare size={36} color="var(--border)" style={{ margin: '0 auto 16px' }} />
                            <h4 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>No reviews yet</h4>
                            <p style={{ fontSize: '0.95rem' }}>Be the first to review this product and share your elegant experience!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {reviews.map((r) => (
                                <div key={r.id} className="card animate-fade-in" style={{ padding: '24px', background: 'var(--bg-glass)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(229,147,116,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                {r.user_name?.charAt(0).toUpperCase() || <User size={16} />}
                                            </div>
                                            <div>
                                                <h5 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 600 }}>{r.user_name}</h5>
                                                <div style={{ marginTop: '2px' }}>
                                                    {renderStars(r.rating, 14)}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <Calendar size={14} />
                                            {new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-main)', fontSize: '0.98rem', lineHeight: 1.6, margin: 0, paddingLeft: '46px' }}>
                                        {r.review || "No written comments left."}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
            
            <style jsx global>{`
                .star-interactive:hover {
                    transform: scale(1.2);
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
