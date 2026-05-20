"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        shipping_address: "",
        city: "",
        state: "",
        pincode: "",
        payment_method: "Credit Card"
    });
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
                const items = Array.isArray(data) ? data : data.items || [];
                setCartItems(items);
                if (items.length === 0) {
                    router.push("/cart");
                }
            } catch (err) {
                router.push("/cart");
            } finally {
                setLoading(false);
            }
        }
        loadCart();
    }, [router]);

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post("/orders", formData);
            window.dispatchEvent(new Event('cart-updated'));
            router.push(`/orders/${res.data.orderId}?success=true`);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to place order");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="container" style={{ paddingTop: '120px', display: 'flex', justifyContent: 'center' }}>
            <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '48px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Checkout</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Please provide your shipping and payment details.</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div className="card" style={{ padding: '32px' }}>
                            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ width: '32px', height: '32px', background: 'var(--accent)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>1</span>
                                Shipping Address
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Street Address</label>
                                    <input 
                                        type="text" 
                                        className="input-field" 
                                        required 
                                        value={formData.shipping_address}
                                        onChange={(e) => setFormData({...formData, shipping_address: e.target.value})}
                                        placeholder="123 Luxury Lane"
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>City</label>
                                        <input 
                                            type="text" 
                                            className="input-field" 
                                            required 
                                            value={formData.city}
                                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>State</label>
                                        <input 
                                            type="text" 
                                            className="input-field" 
                                            required 
                                            value={formData.state}
                                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Pincode</label>
                                    <input 
                                        type="text" 
                                        className="input-field" 
                                        required 
                                        value={formData.pincode}
                                        onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: '32px' }}>
                            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ width: '32px', height: '32px', background: 'var(--accent)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>2</span>
                                Payment Method
                            </h3>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                {["Credit Card", "UPI", "Net Banking"].map(method => (
                                    <label key={method} style={{ flex: 1, padding: '16px', border: `1px solid ${formData.payment_method === method ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '12px', cursor: 'pointer', background: formData.payment_method === method ? 'var(--accent-glow)' : 'transparent', transition: 'all 0.2s', textAlign: 'center' }}>
                                        <input 
                                            type="radio" 
                                            name="payment_method" 
                                            style={{ display: 'none' }} 
                                            checked={formData.payment_method === method}
                                            onChange={() => setFormData({...formData, payment_method: method})}
                                        />
                                        <span style={{ fontWeight: 600, color: formData.payment_method === method ? 'var(--accent)' : 'var(--text-main)' }}>{method}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '20px', fontSize: '1.2rem', boxShadow: '0 10px 20px var(--accent-glow)' }}>
                            {submitting ? "Processing Order..." : `Complete Purchase — ₹${total.toFixed(2)}`}
                        </button>
                    </form>
                </div>

                <aside>
                    <div className="card" style={{ padding: '32px', position: 'sticky', top: '120px' }}>
                        <h3 style={{ marginBottom: '24px' }}>In Your Cart</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {cartItems.map(item => (
                                <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#1e2130', flexShrink: 0 }}>
                                        <img src={item.image_url || "https://placehold.co/100x100?text=Premium"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ fontSize: '0.95rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
                                    </div>
                                    <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600 }}>Total To Pay</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
