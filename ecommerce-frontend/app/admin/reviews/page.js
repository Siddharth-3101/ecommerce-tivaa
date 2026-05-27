"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const limit = 12;
    const user = getUser();

    const loadReviews = async () => {
        setLoading(true);
        try {
            const res = await api.get("/reviews/admin");
            setReviews(res.data || []);
        } catch (err) {
            console.error(err);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Promise.resolve().then(() => loadReviews());
    }, []);

    if (!user || user.role !== "admin") {
        return (
            <div className="container" style={{ paddingTop: 30 }}>
                <h2>Access Denied</h2>
                <p>You must be an admin to access this page.</p>
            </div>
        );
    }

    const deleteReview = async (id) => {
        if (!confirm("Delete this review?")) return;
        try {
            await api.delete(`/reviews/${id}`);
            loadReviews();
        } catch (err) {
            alert("Failed to delete review");
        }
    };

    // Calculate paginated slice
    const total = reviews.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedReviews = reviews.slice(offset, offset + limit);

    return (
        <div className="container" style={{ paddingTop: 20 }}>
            <h1 className="h1" style={{ fontSize: "2.5rem", marginBottom: "8px", fontWeight: 700 }}>Customer Reviews</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>Monitor and manage product reviews submitted by visitors.</p>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>Loading reviews...</div>
            ) : (
                <>
                    <div className="card" style={{ overflow: "hidden", marginTop: 20 }}>
                        {reviews.length === 0 ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                                No reviews found.
                            </div>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                <thead>
                                    <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                        <th style={{ padding: "16px 24px", fontWeight: 600 }}>User</th>
                                        <th style={{ padding: "16px 24px", fontWeight: 600 }}>Product</th>
                                        <th style={{ padding: "16px 24px", fontWeight: 600 }}>Rating</th>
                                        <th style={{ padding: "16px 24px", fontWeight: 600 }}>Review</th>
                                        <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedReviews.map((r) => (
                                        <tr key={r.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                                            <td style={{ padding: "16px 24px", fontWeight: 500, color: "var(--text-main)" }}>{r.user_name}</td>
                                            <td style={{ padding: "16px 24px" }}>{r.product_name}</td>
                                            <td style={{ padding: "16px 24px", fontWeight: 600, color: "var(--accent-yellow)" }}>{r.rating} ⭐</td>
                                            <td style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: "0.9rem" }}>{r.review}</td>
                                            <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                                <button
                                                    className="btn btn-danger"
                                                    style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                                                    onClick={() => deleteReview(r.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Sleek circular boutique pagination selector */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
                            {page > 1 && (
                                <button
                                    onClick={() => setPage(page - 1)}
                                    className="btn btn-secondary"
                                    style={{ padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                                >
                                    Prev
                                </button>
                            )}
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                const isActive = p === page;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            fontSize: '0.9rem',
                                            fontWeight: isActive ? '600' : '400',
                                            border: isActive ? '1px solid var(--text-main)' : '1px solid #e0e0e0',
                                            background: isActive ? 'var(--text-main)' : 'transparent',
                                            color: isActive ? '#ffffff' : 'var(--text-main)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            
                            {page < totalPages && (
                                <button
                                    onClick={() => setPage(page + 1)}
                                    className="btn btn-secondary"
                                    style={{ padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
