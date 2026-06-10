"use client";

import Link from "next/link";
import { useState } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function ProductCard({ product }) {
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);
    const router = useRouter();

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
        <div className="card-borderless" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' }}>
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
            <div className="product-image-container">
                <img
                    src={product.image_url ? product.image_url.split(",")[0].trim() : "/placeholder.png"}
                    className="product-image"
                    alt={product.name}
                    loading="lazy"
                />
                {product.stock === 0 && (
                    <div className="badge-soldout">
                        Sold out
                    </div>
                )}
            </div>

            {/* Content info below image */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', padding: '0 14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, paddingRight: '8px' }}>
                    <span 
                        style={{ 
                            fontSize: '0.88rem', 
                            fontWeight: 500, 
                            fontFamily: "'Poppins', sans-serif",
                            color: '#2B1B35', 
                            display: '-webkit-box', 
                            WebkitLineClamp: 1, 
                            WebkitBoxOrient: 'vertical', 
                            overflow: 'hidden', 
                            marginBottom: '4px',
                            textTransform: 'capitalize',
                            letterSpacing: '0.1px'
                        }}
                    >
                        {product.name}
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#7A38C2', fontFamily: "'Poppins', sans-serif" }}>
                        Rs. {product.price}
                    </span>
                </div>
                
                {product.stock > 0 && (
                    <button
                        onClick={handleAddToCart}
                        disabled={loading || added}
                        className={`product-cart-btn ${added ? 'added' : ''}`}
                        aria-label="Add to Cart"
                        style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: added ? '#7A38C2' : '#8B3DFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            transition: 'all 0.25s ease',
                            border: 'none',
                            cursor: loading || added ? 'default' : 'pointer',
                            flexShrink: 0,
                            padding: 0,
                            boxShadow: '0 4px 12px rgba(139, 61, 255, 0.3)',
                            position: 'relative',
                            zIndex: 2
                        }}
                    >
                        {loading ? (
                            <span className="cart-btn-spinner"></span>
                        ) : added ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        )}
                    </button>
                )}
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
                .product-cart-btn {
                    position: relative;
                    z-index: 2;
                }
                .product-cart-btn:hover {
                    background: #A05CFF !important;
                    transform: scale(1.08);
                    box-shadow: 0 6px 18px rgba(139, 61, 255, 0.45) !important;
                }
                .product-cart-btn.added:hover {
                    background: #7A38C2 !important;
                    transform: none;
                }
            `}</style>
        </div>

    );
}
