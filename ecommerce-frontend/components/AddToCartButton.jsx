"use client";

import api from "@/lib/api";
import { useState } from "react";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ productId, disabled, selectedVariation }) {
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);
    const user = getUser();
    const router = useRouter();

    const handleAdd = async () => {
        if (!user) {
            router.push("/login");
            return;
        }

        try {
            setLoading(true);
            await api.post("/cart", {
                product_id: productId,
                quantity: 1,
                selected_variation: selectedVariation || null
            });

            setAdded(true);
            setTimeout(() => {
                setAdded(false);
                // Optionally trigger a re-render of Navbar or reload if context isn't set up
                window.dispatchEvent(new Event('cart-updated'));
            }, 2000);
        } catch (err) {
            console.log(err);
            alert(err.response?.data?.message || "Failed to add item to cart. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleAdd}
            className={`btn btn-primary ${added ? 'btn-success' : ''}`}
            disabled={loading || disabled || added}
            style={{ 
                width: "100%", 
                padding: "16px", 
                fontSize: "1.1rem", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: "8px",
                background: added ? "var(--success)" : undefined
            }}
        >
            {loading ? (
                <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderRadius: '50%', borderTopColor: '#fff', animation: 'spin 1s ease-in-out infinite' }}></span>
            ) : added ? (
                <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Added
                </>
            ) : (
                <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    Add to Cart
                </>
            )}
            
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </button>
    );
}
