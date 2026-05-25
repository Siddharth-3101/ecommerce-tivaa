"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

export default function WishlistButton({ productId }) {
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const user = getUser();
    const router = useRouter();

    // Check if the product is already in the user's wishlist on mount
    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!user) return;
            try {
                const res = await api.get("/wishlist");
                const isWishlisted = res.data.some(item => item.id === productId);
                setLiked(isWishlisted);
            } catch (err) {
                console.error("Failed to fetch wishlist status:", err);
            }
        };

        checkWishlistStatus();
    }, [productId, user]);

    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push("/login");
            return;
        }

        setLoading(true);
        try {
            if (liked) {
                // Remove from wishlist
                await api.delete(`/wishlist/${productId}`);
                setLiked(false);
            } else {
                // Add to wishlist
                await api.post("/wishlist", { productId });
                setLiked(true);
            }
        } catch (err) {
            console.error("Wishlist operation failed:", err);
            alert("Failed to update wishlist. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`btn-wishlist-toggle ${liked ? "active" : ""}`}
            title={liked ? "Remove from Wishlist" : "Add to Wishlist"}
            style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: liked ? "rgba(229, 147, 116, 0.08)" : "#ffffff",
                border: liked ? "1px solid var(--accent)" : "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                color: liked ? "var(--accent)" : "var(--text-muted)",
                boxShadow: liked ? "0 4px 14px var(--accent-glow)" : "var(--shadow-sm)",
            }}
        >
            <Heart
                size={22}
                fill={liked ? "var(--accent)" : "none"}
                style={{
                    transition: "transform 0.3s ease",
                    transform: loading ? "scale(0.8)" : "scale(1)",
                }}
            />
            
            <style jsx global>{`
                .btn-wishlist-toggle:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px var(--accent-glow);
                    border-color: var(--accent);
                    color: var(--accent);
                }
                .btn-wishlist-toggle:active {
                    transform: scale(0.95);
                }
            `}</style>
        </button>
    );
}
