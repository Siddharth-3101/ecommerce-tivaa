"use client";

import api from "@/lib/api";
import { useState, useEffect } from "react";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ productId, disabled, selectedVariation, stock, quantity }) {
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);
    const [cartQty, setCartQty] = useState(0);
    const [cartItemId, setCartItemId] = useState(null);
    const [maxStock, setMaxStock] = useState(stock !== undefined && stock !== null ? Number(stock) : 999);
    const user = getUser();
    const router = useRouter();

    const syncCartQty = () => {
        if (stock !== undefined && stock !== null) {
            setMaxStock(Number(stock));
        }
        const cached = localStorage.getItem('tivaa-cart-items');
        if (cached) {
            try {
                const items = JSON.parse(cached);
                const match = items.find(item => {
                    const idMatch = item.product_id === productId;
                    const var1 = item.selected_variation ? item.selected_variation.trim() : null;
                    const var2 = selectedVariation ? selectedVariation.trim() : null;
                    return idMatch && var1 === var2;
                });
                
                if (match) {
                    setCartQty(match.quantity);
                    setCartItemId(match.id);
                    if (stock === undefined || stock === null) {
                        setMaxStock(match.stock !== undefined && match.stock !== null ? Number(match.stock) : 0);
                    }
                } else {
                    setCartQty(0);
                    setCartItemId(null);
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            setCartQty(0);
            setCartItemId(null);
        }
    };

    useEffect(() => {
        syncCartQty();
        window.addEventListener("cart-updated", syncCartQty);
        window.addEventListener("cart-items-loaded", syncCartQty);
        return () => {
            window.removeEventListener("cart-updated", syncCartQty);
            window.removeEventListener("cart-items-loaded", syncCartQty);
        };
    }, [productId, selectedVariation, stock]);

    const handleAdd = async () => {
        if (!user) {
            router.push("/login");
            return;
        }

        try {
            setLoading(true);
            await api.post("/cart", {
                product_id: productId,
                quantity: quantity || 1,
                selected_variation: selectedVariation || null
            });

            setAdded(true);
            setTimeout(() => {
                setAdded(false);
                window.dispatchEvent(new Event('cart-updated'));
            }, 2000);
        } catch (err) {
            console.log(err);
            alert(err.response?.data?.message || "Failed to add item to cart. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleIncrement = async () => {
        if (cartQty >= maxStock) return;
        try {
            setLoading(true);
            await api.put(`/cart/${cartItemId}`, { quantity: cartQty + 1 });
            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            console.error("Cart update failed:", err);
            alert(err.response?.data?.message || "Failed to update quantity.");
        } finally {
            setLoading(false);
        }
    };

    const handleDecrement = async () => {
        try {
            setLoading(true);
            if (cartQty === 1) {
                await api.delete(`/cart/${cartItemId}`);
            } else {
                await api.put(`/cart/${cartItemId}`, { quantity: cartQty - 1 });
            }
            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            console.error("Cart update failed:", err);
            alert(err.response?.data?.message || "Failed to update quantity.");
        } finally {
            setLoading(false);
        }
    };

    if (cartQty > 0) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-btn, 10px)', height: '54px', overflow: 'hidden', width: '100%', background: '#ffffff' }}>
                <button 
                    onClick={handleDecrement}
                    disabled={loading}
                    className="qty-btn"
                    style={{ flex: 1, height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 600, padding: 0 }}
                    aria-label="Decrease quantity"
                >
                    -
                </button>
                <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-glass)', height: '100%', borderLeft: '1.5px solid var(--border)', borderRight: '1.5px solid var(--border)' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>{cartQty}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px', fontWeight: 600 }}>In Cart</span>
                </div>
                <button 
                    onClick={handleIncrement}
                    disabled={loading || cartQty >= maxStock}
                    className="qty-btn"
                    style={{ flex: 1, height: '100%', border: 'none', background: 'transparent', cursor: cartQty >= maxStock ? 'not-allowed' : 'pointer', color: cartQty >= maxStock ? 'var(--text-light)' : 'var(--text-main)', fontSize: '1.2rem', fontWeight: 600, padding: 0 }}
                    aria-label="Increase quantity"
                >
                    +
                </button>
                
                <style jsx>{`
                    .qty-btn {
                        transition: background-color 0.2s ease;
                    }
                    .qty-btn:hover:not(:disabled) {
                        background-color: rgba(15, 157, 148, 0.04) !important;
                    }
                `}</style>
            </div>
        );
    }

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
                background: added ? "var(--success)" : undefined,
                height: '54px'
            }}
        >
            {loading ? (
                <span className="btn-spinner"></span>
            ) : added ? (
                <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Added
                </>
            ) : (
                <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    Add to Cart
                </>
            )}
            
            <style jsx>{`
                .btn-spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: #fff;
                    animation: spin 1s ease-in-out infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </button>
    );
}
