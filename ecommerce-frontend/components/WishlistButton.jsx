"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import Button from "./Button";

export default function WishlistButton({ productId, variant = "large", className = "" }) {
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
            window.dispatchEvent(new Event("wishlist-updated"));
        } catch (err) {
            console.error("Wishlist operation failed:", err);
            alert("Failed to update wishlist. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (variant === "textOutline") {
        return (
            <Button
                onClick={handleToggle}
                disabled={loading}
                variant="outline"
                className={`btn-wishlist-text ${liked ? "active" : ""} ${className}`}
                style={{
                    width: "100%",
                    height: "46px",
                    borderRadius: "4px",
                    border: liked ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: liked ? "var(--accent)" : "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    color: liked ? "#ffffff" : "var(--text-main)",
                    fontSize: "14px",
                    fontWeight: 600,
                    fontFamily: "var(--font-poppins), sans-serif",
                    textTransform: "none"
                }}
            >
                <Heart
                    size={18}
                    fill={liked ? "#ffffff" : "none"}
                    color={liked ? "#ffffff" : "var(--text-main)"}
                    style={{
                        transition: "transform 0.3s ease",
                        transform: loading ? "scale(0.8)" : "scale(1)",
                    }}
                />
                {liked ? "Added to wishlist" : "Add to wishlist"}
                
                <style dangerouslySetInnerHTML={{ __html: `
                    .btn-wishlist-text:hover {
                        border-color: var(--text-main);
                    }
                    .btn-wishlist-text.active:hover {
                        border-color: var(--accent);
                    }
                    .btn-wishlist-text:active {
                        transform: scale(0.98);
                    }
                `}} />
            </Button>
        );
    }

    return (
        <Button
            onClick={handleToggle}
            disabled={loading}
            variant="ghost"
            className={`btn-wishlist-toggle ${liked ? "active" : ""}`}
            title={liked ? "Remove from Wishlist" : "Add to Wishlist"}
            style={{
                width: variant === "small" ? "40px" : "60px",
                height: variant === "small" ? "40px" : "60px",
                borderRadius: "50%",
                background: liked ? "rgba(15, 157, 148, 0.08)" : "#ffffff",
                border: liked ? "1px solid var(--accent)" : "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                color: liked ? "var(--accent)" : "var(--text-muted)",
                boxShadow: liked ? (variant === "small" ? "0 2px 8px var(--accent-glow)" : "0 4px 14px var(--accent-glow)") : "var(--shadow-sm)",
                padding: 0
            }}
        >
            <Heart
                size={variant === "small" ? 18 : 24}
                fill={liked ? "var(--accent)" : "none"}
                style={{
                    transition: "transform 0.3s ease",
                    transform: loading ? "scale(0.8)" : "scale(1)",
                }}
            />
            
            <style dangerouslySetInnerHTML={{ __html: `
                .btn-wishlist-toggle:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px var(--accent-glow);
                    border-color: var(--accent);
                    color: var(--accent);
                }
                .btn-wishlist-toggle:active {
                    transform: scale(0.95);
                }
            `}} />
        </Button>
    );
}
