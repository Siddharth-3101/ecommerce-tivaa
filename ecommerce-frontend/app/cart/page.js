"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const user = getUser();
        if(!user) {
            router.push("/login");
            return;
        }
        
        async function loadCart() {
            try {
                const res = await api.get("/cart");
                const data = res.data;
                const cartItems = Array.isArray(data) ? data : data.items || [];
                setItems(cartItems);
            } catch (err) {
                console.log(err);
                setItems([]);
            } finally {
                setLoading(false);
            }
        }
        loadCart();
    }, [router]);

    const handleRemove = async (id) => {
        try {
            await api.delete(`/cart/${id}`);
            setItems((prev) => prev.filter((i) => i.id !== id));
            window.dispatchEvent(new Event('cart-updated'));
        } catch (err) {
            alert("Failed to remove item");
        }
    };

    const handleClearCart = async () => {
        try {
            await api.delete("/cart");
            setItems([]);
            window.dispatchEvent(new Event('cart-updated'));
        } catch (err) {
            alert("Failed to clear cart");
        }
    };

    const total = items.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
    );

    if (loading)
        return (
            <div className="container" style={{ paddingTop: '120px', display: 'flex', justifyContent: 'center' }}>
                <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Your Selection</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Review your items before proceeding to checkout.</p>
                </div>
                {items.length > 0 && (
                    <button onClick={handleClearCart} className="btn" style={{ padding: '8px 16px', background: 'transparent', color: 'var(--danger)', border: '1px solid var(--border)' }}>
                        Clear Cart
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <div className="card" style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-card)' }}>
                    <div style={{ width: '80px', height: '80px', margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Your cart is empty</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Discover our premium collection and add some items.</p>
                    <Link href="/" className="btn btn-primary">Continue Shopping</Link>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px", alignItems: 'flex-start' }}>
                    {/* LEFT — ITEMS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {items.map((item) => (
                            <div key={item.id} className="card" style={{ display: "flex", gap: "24px", padding: "20px", alignItems: "center" }}>
                                <Link href={`/product/${item.product_id || item.id}`}>
                                    <div style={{ width: "120px", height: "120px", borderRadius: "12px", overflow: "hidden", background: "#1e2130" }}>
                                        <img src={item.image_url || "https://placehold.co/300x300?text=Premium"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </div>
                                </Link>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Link href={`/product/${item.product_id || item.id}`} style={{ textDecoration: 'none' }}>
                                            <h3 style={{ margin: "0 0 8px 0", fontSize: '1.2rem', color: 'var(--text-main)', transition: 'color 0.2s' }}>{item.name}</h3>
                                        </Link>
                                        <button className="btn" onClick={() => handleRemove(item.id)} style={{ padding: '6px', background: 'transparent', color: 'var(--text-muted)', border: 'none' }} aria-label="Remove item">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                    <p style={{ color: "var(--text-muted)", fontSize: '0.9rem', marginBottom: '16px' }}>Quantity: <strong>{item.quantity}</strong></p>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>₹{item.price}</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT — SUMMARY */}
                    <aside className="card" style={{ padding: "32px", position: 'sticky', top: '100px' }}>
                        <h3 style={{ marginTop: 0, fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>Order Summary</h3>

                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '16px', color: 'var(--text-muted)' }}>
                            <span>Subtotal ({items.reduce((acc, curr) => acc + curr.quantity, 0)} items)</span>
                            <span style={{ color: 'var(--text-main)' }}>₹{total.toFixed(2)}</span>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '16px', color: 'var(--text-muted)' }}>
                            <span>Shipping</span>
                            <span style={{ color: 'var(--success)', fontWeight: 600 }}>Free</span>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '24px', color: 'var(--text-muted)' }}>
                            <span>Taxes</span>
                            <span style={{ color: 'var(--text-main)' }}>Calculated at checkout</span>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: '24px', borderTop: '1px solid var(--border)', marginBottom: '32px' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Total</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>₹{total.toFixed(2)}</span>
                        </div>

                        <Link href="/checkout" className="btn btn-primary" style={{ display: "flex", width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1.1rem' }}>
                            Secure Checkout
                            <svg style={{ marginLeft: '8px' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </Link>
                        
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '16px' }}>
                            By proceeding to checkout you agree to our terms of service and secure shopping policies.
                        </p>
                    </aside>
                </div>
            )}
        </div>
    );
}
