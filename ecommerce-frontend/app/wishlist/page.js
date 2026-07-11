"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(229,147,116,0.2)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <p style={{ color: 'var(--text-muted)' }}>Retrieving your exquisite wishlist...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: '30px 0 80px' }}>
            <div className="container" style={{ marginBottom: '40px' }}>
                <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', transition: 'color 0.2s', marginBottom: '16px' }}>
                    <ArrowLeft size={16} /> Continue Shopping
                </Link>
                <h1 style={{ fontSize: '3rem', marginBottom: '8px', background: 'var(--gradient-logo)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block' }}>My Wishlist</h1>
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
                            <ProductCard 
                                key={p.id} 
                                product={p} 
                                onRemoveFromWishlist={handleRemove} 
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
