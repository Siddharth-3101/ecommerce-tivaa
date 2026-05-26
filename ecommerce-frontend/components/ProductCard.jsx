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
            alert("Failed to add item to cart. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Link href={`/product/${product.id}`} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' }}>
            <div className="product-image-container">
                <img
                    src={product.image_url || "/placeholder.png"}
                    className="product-image"
                    alt={product.name}
                    loading="lazy"
                />
                {product.stock === 0 && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                        Out of Stock
                    </div>
                )}
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>
                        {product.name}
                    </h3>
                </div>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.description || "A premium choice for exquisite taste."}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        ₹{product.price}
                    </span>
                    
                    {product.stock > 0 && (
                        <button
                            onClick={handleAddToCart}
                            disabled={loading || added}
                            className={`product-cart-btn ${added ? 'added' : ''}`}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: added ? 'var(--success)' : 'var(--bg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: added ? '#fff' : 'var(--accent)',
                                transition: 'all 0.2s ease',
                                border: '1px solid var(--border)',
                                cursor: loading || added ? 'default' : 'pointer',
                                padding: 0
                            }}
                        >
                            {loading ? (
                                <span className="cart-btn-spinner"></span>
                            ) : added ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
                .cart-btn-spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: var(--accent);
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .product-cart-btn:hover {
                    background: var(--accent) !important;
                    color: #fff !important;
                    transform: scale(1.05);
                }
                .product-cart-btn.added:hover {
                    background: var(--success) !important;
                    transform: none;
                }
            `}</style>
        </Link>
    );
}
