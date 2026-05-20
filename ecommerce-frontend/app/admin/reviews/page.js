"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const user = getUser();

    const loadReviews = async () => {
        try {
            const res = await api.get("/reviews/admin"); // backend admin route needed
            setReviews(res.data || []);
        } catch (err) {
            console.error(err);
            setReviews([]);
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

    return (
        <div className="container" style={{ paddingTop: 20 }}>
            <h1 className="h1">Customer Reviews</h1>

            <div className="card" style={{ padding: 18, marginTop: 20 }}>
                {reviews.length === 0 ? (
                    <p>No reviews found.</p>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#eee" }}>
                                <th>User</th>
                                <th>Product</th>
                                <th>Rating</th>
                                <th>Review</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {reviews.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.user_name}</td>
                                    <td>{r.product_name}</td>
                                    <td>{r.rating} ⭐</td>
                                    <td>{r.review}</td>
                                    <td>
                                        <button
                                            className="btn btn-peach"
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
        </div>
    );
}
