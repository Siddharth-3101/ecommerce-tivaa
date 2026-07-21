"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import WishlistButton from "./WishlistButton";
import Button from "./Button";
import { getProductSlug } from "@/lib/slug";

export default function ProductCard({ product, variant = "default", onRemoveFromWishlist }) {
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);
    const [cartQty, setCartQty] = useState(0);
    const [cartItemId, setCartItemId] = useState(null);
    const router = useRouter();

    const isSimple = variant === "simple";

    const syncCartQty = () => {
        if (isSimple) return;
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
        if (isSimple) return;
        window.addEventListener("cart-updated", syncCartQty);
        window.addEventListener("cart-items-loaded", syncCartQty);
        return () => {
            window.removeEventListener("cart-updated", syncCartQty);
            window.removeEventListener("cart-items-loaded", syncCartQty);
        };
    }, [product.id, isSimple]);

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
            window.dispatchEvent(new Event("cart-updated")); 
            
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

    if (isSimple) {
        return (
            <div 
                className="card" 
                style={{ 
                    position: 'relative', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    width: '100%',
                    maxWidth: '100%',
                    height: '100%', 
                    textDecoration: 'none',
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    boxShadow: 'var(--shadow-sm)'
                }}
            >
                <div style={{ position: 'relative', width: '100%', padding: '16px 16px 0', aspectRatio: '1/1', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src={product.image_url ? product.image_url.split(",")[0].trim() : "/placeholder.png"}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        alt={product.name}
                        loading="lazy"
                    />
                </div>
                <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span className="product-card-title" style={{ color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3' }}>
                        {product.name}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="product-card-price" style={{ color: 'var(--text-main)' }}>
                            ₹{product.discounted_price || product.price}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFB800" stroke="#FFB800" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            <span className="product-card-rating" style={{ color: 'var(--accent)', marginLeft: '2px' }}>4.5</span>
                        </div>
                    </div>
                </div>
                <Link 
                    href={`/product/${getProductSlug(product)}`} 
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }} 
                    aria-label={product.name}
                />
                <style dangerouslySetInnerHTML={{ __html: `
                    .product-card-title { font-size: 12px; font-weight: 500; font-family: var(--font-poppins); }
                    .product-card-price { font-size: 12.6px; font-weight: 600; font-family: var(--font-poppins); }
                    .product-card-rating { font-size: 10px; font-weight: 500; font-family: var(--font-poppins); }
                `}} />
            </div>
        );
    }

    return (
        <div 
            className="card" 
            style={{ 
                position: 'relative', 
                display: 'flex', 
                flexDirection: 'column', 
                width: '100%',
                maxWidth: '100%',
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
                    {onRemoveFromWishlist ? (
                        <Button 
                            variant="ghost"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRemoveFromWishlist(product.id);
                            }}
                            title="Remove from Wishlist"
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: 'var(--danger)',
                                boxShadow: 'var(--shadow-sm)',
                                transition: 'all 0.2s',
                                padding: 0
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </Button>
                    ) : (
                        <WishlistButton productId={product.id} variant="small" />
                    )}
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

            {/* Restructured details layout to place Title on its own row (full-width), and price/action below it */}
            <div className="product-card-details" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                <span 
                    className="product-card-title"
                    style={{ 
                        color: 'var(--text-main)', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden', 
                        textTransform: 'capitalize',
                        lineHeight: '1.3',
                        width: '100%'
                    }}
                >
                    {product.name}
                </span>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
                    <div className="product-price-wrapper">
                        {product.discounted_price ? (
                            <>
                                <span className="product-price-discount product-card-price" style={{ color: 'var(--accent)' }}>
                                    ₹{product.discounted_price}
                                </span>
                                <span className="product-price-original product-card-original-price" style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                                    ₹{product.price}
                                </span>
                            </>
                        ) : (
                            <span className="product-price-discount product-card-price" style={{ color: 'var(--accent)' }}>
                                ₹{product.price}
                            </span>
                        )}
                    </div>
                    
                    <div style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
                        {product.stock > 0 && (
                            cartQty > 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', borderRadius: '20px', padding: '2px 6px' }}>
                                    <Button
                                        variant="ghost"
                                        onClick={handleDecrement}
                                        disabled={loading}
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 'bold', padding: '0 2px', display: 'flex', alignItems: 'center' }}
                                        aria-label="Decrease quantity"
                                    >-</Button>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '10px', textAlign: 'center', color: 'var(--text-main)' }}>
                                        {cartQty}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        onClick={handleIncrement}
                                        disabled={loading || cartQty >= (product.stock !== undefined && product.stock !== null ? Number(product.stock) : 0)}
                                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 'bold', padding: '0 2px', display: 'flex', alignItems: 'center' }}
                                        aria-label="Increase quantity"
                                    >+</Button>
                                </div>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={handleAddToCart}
                                    disabled={loading || added}
                                    style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', transition: 'all 0.2s ease', border: 'none', cursor: 'pointer', padding: 0, outline: 'none', boxShadow: 'var(--shadow-sm)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
                                    aria-label="Add to Cart"
                                >
                                    {loading ? (
                                        <span className="cart-btn-spinner"></span>
                                    ) : added ? (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    ) : (
                                        <span style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1 }}>+</span>
                                    )}
                                </Button>
                            )
                        )}
                    </div>
                </div>
            </div>
            <Link 
                href={`/product/${getProductSlug(product)}`} 
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 5 }} 
                aria-label={product.name}
            />
            <style dangerouslySetInnerHTML={{ __html: `
                .cart-btn-spinner { width: 10px; height: 10px; border: 2px solid rgba(255,255,255,0.4); border-radius: 50%; border-top-color: #ffffff; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .product-card-details { padding: 12px 16px 16px; }
                .product-price-wrapper { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
                
                .product-card-title { font-size: 12px; font-weight: 500; font-family: var(--font-poppins); }
                .product-card-price { font-size: 12.6px; font-weight: 600; font-family: var(--font-poppins); }
                .product-card-original-price { font-size: 9.9px; font-weight: 400; font-family: var(--font-poppins); }
            `}} />
        </div>
    );
}
