"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";

export default function WishlistPage() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cartLoadingId, setCartLoadingId] = useState(null);
    const [cartSuccessId, setCartSuccessId] = useState(null);

    const user = getUser();

    // Fetch user wishlist on mount
    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }

        const fetchWishlist = async () => {
            try {
                const res = await api.get("/wishlist");
                setProducts(res.data);
            } catch (err) {
                console.error("Failed to load wishlist:", err);
                setError("Could not load your wishlist. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [user, router]);

    const handleRemove = async (productId) => {
        try {
            await api.delete(`/wishlist/${productId}`);
            setProducts(products.filter(p => p.id !== productId));
        } catch (err) {
            console.error("Failed to remove item from wishlist:", err);
            alert("Failed to remove item. Please try again.");
        }
    };

    const handleAddToCart = async (productId) => {
        setCartLoadingId(productId);
        try {
            await api.post("/cart", {
                product_id: productId,
                quantity: 1
            });
            setCartSuccessId(productId);
            window.dispatchEvent(new Event('cart-updated')); // Sync cart counter in navbar
            
            setTimeout(() => {
                setCartSuccessId(null);
            }, 2000);
        } catch (err) {
            console.error("Failed to add to cart:", err);
            alert("Failed to add item to cart. Please try again.");
        } finally {
            setCartLoadingId(null);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(229,147,116,0.2)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <p style={{ color: 'var(--text-muted)' }}>Retrieving your exquisite wishlist...</p>
                <style jsx>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: '120px 0 80px' }}>
            <div className="container" style={{ marginBottom: '40px' }}>
                <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', transition: 'color 0.2s', marginBottom: '24px' }}>
                    <ArrowLeft size={16} /> Continue Shopping
                </Link>
                <h1 style={{ fontSize: '3rem', marginBottom: '8px', background: 'var(--gradient-logo)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>My Wishlist</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Your hand-picked collection of timeless, premium jewels.</p>
            </div>

            <section className="container">
                {error && (
                    <div style={{ padding: '14px', background: 'rgba(179, 86, 111, 0.08)', border: '1px solid rgba(179, 86, 111, 0.2)', borderRadius: '12px', color: 'var(--danger)', marginBottom: '24px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {products.length === 0 ? (
                    <div style={{ padding: '80px 40px', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: '24px', textAlign: 'center', maxWidth: '600px', margin: '0 auto', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ width: '88px', height: '88px', margin: '0 auto 24px', borderRadius: '50%', background: 'rgba(229,147,116,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                            <Heart size={36} fill="rgba(229,147,116,0.1)" />
                        </div>
                        <h3 style={{ fontSize: '1.6rem', marginBottom: '12px', color: 'var(--text-main)' }}>Your wishlist is empty</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                            Explore our Featured Collections and save your favorite masterpieces here to secure yours.
                        </p>
                        <Link href="/products" className="btn btn-primary" style={{ padding: '14px 28px' }}>
                            Explore Collections
                        </Link>
                    </div>
                ) : (
                    <div className="grid">
                        {products.map((p) => (
                            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                                {/* REMOVE BUTTON ON TOP RIGHT */}
                                <button 
                                    onClick={() => handleRemove(p.id)}
                                    title="Remove from Wishlist"
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        border: '1px solid var(--border)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: 'var(--danger)',
                                        zIndex: 10,
                                        boxShadow: 'var(--shadow-sm)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                        e.currentTarget.style.background = 'rgba(179, 86, 111, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>

                                <Link href={`/product/${p.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div className="product-image-container">
                                        <img
                                            src={p.image_url || "/placeholder.png"}
                                            className="product-image"
                                            alt={p.name}
                                            loading="lazy"
                                        />
                                        {p.stock === 0 && (
                                            <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
                                                Out of Stock
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                            {p.category_name || "Premium Collection"}
                                        </span>
                                        <h3 style={{ fontSize: '1.2rem', margin: '0 0 8px 0', fontWeight: 600, color: 'var(--text-main)' }}>
                                            {p.name}
                                        </h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {p.description || "Crafted for timeless beauty and ultimate grace."}
                                        </p>
                                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 'auto', marginBottom: '16px' }}>
                                            ₹{p.price}
                                        </div>
                                    </div>
                                </Link>

                                <div style={{ padding: '0 20px 20px' }}>
                                    <button 
                                        onClick={() => handleAddToCart(p.id)}
                                        disabled={p.stock <= 0 || cartLoadingId === p.id || cartSuccessId === p.id}
                                        className="btn btn-secondary" 
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            gap: '8px',
                                            fontSize: '0.95rem',
                                            background: cartSuccessId === p.id ? 'var(--success)' : '#ffffff',
                                            color: cartSuccessId === p.id ? '#ffffff' : 'var(--text-main)',
                                            borderColor: cartSuccessId === p.id ? 'var(--success)' : 'var(--border)'
                                        }}
                                    >
                                        {cartLoadingId === p.id ? (
                                            <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.2)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                                        ) : cartSuccessId === p.id ? (
                                            "Added to Cart"
                                        ) : p.stock <= 0 ? (
                                            "Out of Stock"
                                        ) : (
                                            <>
                                                <ShoppingBag size={16} /> Add to Cart
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
