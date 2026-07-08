"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import WishlistButton from "./WishlistButton";

export default function ProductCard({ product }) {
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);
    const [cartQty, setCartQty] = useState(0);
    const [cartItemId, setCartItemId] = useState(null);
    const router = useRouter();

    const syncCartQty = () => {
        const cached = localStorage.getItem('tivaa-cart-items');
        if (cached) {
            try {
                const items = JSON.parse(cached);
                const matches = items.filter(item => item.product_id === product.id);
                const qty = matches.reduce((sum, item) => sum + item.quantity, 0);
                setCartQty(qty);
                if (matches.length > 0) {
                    setCartItemId(matches[0].id);
                } else {
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
    }, [product.id]);

    const handleIncrement = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const stockLimit = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 0;
        if (cartQty >= stockLimit) return;
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

    const handleDecrement = async (e) => {
        e.preventDefault();
        e.stopPropagation();
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


    const handleAddToCart = async (e) => {
        // Prevent navigating to the product details page
        e.preventDefault();
        e.stopPropagation();

        const user = getUser();
        if (!user) {
            router.push("/login");
            return;
        }

        try {
            setLoading(true);
            await api.post("/cart", {
                product_id: product.id,
                quantity: 1,
            });

            setAdded(true);
            window.dispatchEvent(new Event("cart-updated")); // Notify Navbar to increment count
            
            setTimeout(() => {
                setAdded(false);
            }, 2000);
        } catch (err) {
            console.error("Cart addition failed:", err);
            alert(err.response?.data?.message || "Failed to add item to cart. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="card" 
            style={{ 
                position: 'relative', 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%', 
                textDecoration: 'none',
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-card, 18px)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                boxShadow: 'var(--shadow-sm)'
            }}
        >
            <Link 
                href={`/product/${product.id}`} 
                style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    zIndex: 1 
                }} 
                aria-label={product.name}
            />
            
            {/* 1:1 Aspect Ratio Image Container */}
            <div 
                className="product-image-container" 
                style={{ 
                    position: 'relative', 
                    width: '100%', 
                    aspectRatio: '1/1', 
                    overflow: 'hidden', 
                    background: '#f8fafc' 
                }}
            >
                <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                    <WishlistButton productId={product.id} variant="small" />
                </div>
                <img
                    src={product.image_url ? product.image_url.split(",")[0].trim() : "/placeholder.png"}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                    }}
                    alt={product.name}
                    loading="lazy"
                />
                {product.stock === 0 && (
                    <div 
                        style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '12px',
                            background: 'rgba(23, 59, 99, 0.95)',
                            color: '#ffffff',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            letterSpacing: '0.5px',
                            zIndex: 2
                        }}
                    >
                        Sold out
                    </div>
                )}
            </div>

            {/* Content Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', padding: '16px', flexGrow: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1 }}>
                    <span 
                        style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: 600, 
                            fontFamily: "var(--font-poppins)",
                            color: 'var(--text-main)', 
                            display: '-webkit-box', 
                            WebkitLineClamp: 1, 
                            WebkitBoxOrient: 'vertical', 
                            overflow: 'hidden', 
                            marginBottom: '4px',
                            textTransform: 'capitalize'
                        }}
                    >
                        {product.name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {product.discounted_price ? (
                            <>
                                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent)', fontFamily: "var(--font-poppins)" }}>
                                    ₹{product.discounted_price}
                                </span>
                                <span style={{ fontSize: '0.78rem', textDecoration: 'line-through', color: 'var(--text-muted)', fontFamily: "var(--font-poppins)" }}>
                                    ₹{product.price}
                                </span>
                            </>
                        ) : (
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent)', fontFamily: "var(--font-poppins)" }}>
                                ₹{product.price}
                            </span>
                        )}
                    </div>
                </div>
                
                {/* Add to Cart Actions */}
                <div style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
                    {product.stock > 0 && (
                        cartQty > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', borderRadius: '20px', padding: '2px 8px' }}>
                                <button
                                    onClick={handleDecrement}
                                    disabled={loading}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        color: 'var(--text-main)',
                                        fontSize: '0.95rem',
                                        fontWeight: 'bold',
                                        padding: '0 4px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    aria-label="Decrease quantity"
                                >
                                    -
                                </button>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '12px', textAlign: 'center', color: 'var(--text-main)' }}>
                                    {cartQty}
                                </span>
                                <button
                                    onClick={handleIncrement}
                                    disabled={loading || cartQty >= (product.stock !== undefined && product.stock !== null ? Number(product.stock) : 0)}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        color: 'var(--text-main)',
                                        fontSize: '0.95rem',
                                        fontWeight: 'bold',
                                        padding: '0 4px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleAddToCart}
                                disabled={loading || added}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--accent)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ffffff',
                                    transition: 'all 0.2s ease',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    outline: 'none',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
                                aria-label="Add to Cart"
                            >
                                {loading ? (
                                    <span className="cart-btn-spinner"></span>
                                ) : added ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                ) : (
                                    <span style={{ fontSize: '1.2rem', fontWeight: 600, lineHeight: 1 }}>+</span>
                                )}
                            </button>
                        )
                    )}
                </div>
            </div>

            <style jsx>{`
                .cart-btn-spinner {
                    width: 12px;
                    height: 12px;
                    border: 2px solid rgba(255,255,255,0.4);
                    border-radius: 50%;
                    border-top-color: #ffffff;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>

    );
}
