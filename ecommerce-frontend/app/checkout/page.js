"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";

export default function CheckoutPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        shipping_address: "",
        city: "",
        state: "",
        pincode: "",
        payment_method: "Credit Card"
    });
    const router = useRouter();

    useEffect(() => {
        const loggedInUser = getUser();
        if(!loggedInUser) {
            router.push("/login");
            return;
        }
        setUser(loggedInUser);

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
            // 1. Create order in the local database
            const res = await api.post("/orders", formData);
            const { orderId, total } = res.data;

            // 2. Generate Razorpay order on the backend
            const payOrderRes = await api.post("/payment/order", {
                amount: total,
                currency: "INR",
                order_id: orderId
            });
            const razorpayOrder = payOrderRes.data;

            // 3. Open Razorpay checkout modal
            const options = {
                key: razorpayOrder.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_51NgC2HSJ34m7p8", // Loaded dynamically from backend to avoid key mismatch
                amount: razorpayOrder.amount, // in paise
                currency: razorpayOrder.currency,
                name: "PremiumShop",
                description: `Order #${orderId}`,
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    try {
                        setSubmitting(true);
                        // 4. Verify payment signature on the backend
                        await api.post("/payment/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_id: orderId,
                        });
                        window.dispatchEvent(new Event('cart-updated'));
                        router.push(`/orders/${orderId}?success=true`);
                    } catch (verifyErr) {
                        alert("Payment verification failed. Please contact support.");
                        router.push(`/orders/${orderId}?success=false`);
                    } finally {
                        setSubmitting(false);
                    }
                },
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                },
                theme: {
                    color: "#0a0b10", // Sleek premium dark mode theme
                },
                modal: {
                    ondismiss: function () {
                        alert("Payment closed. You can retry payment from your Orders dashboard.");
                        router.push(`/orders/${orderId}`);
                    }
                }
            };

            if (window.Razorpay) {
                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                alert("Razorpay SDK failed to load. Please refresh the page and try again.");
                setSubmitting(false);
            }
        } catch (err) {
            console.error("❌ Checkout Error:", err);
            alert(err.response?.data?.message || "Failed to place order. Please try again.");
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
                                        <img src={item.image_url ? item.image_url.split(",")[0].trim() : "https://placehold.co/100x100?text=Premium"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ fontSize: '0.95rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h4>
                                        {item.selected_variation && (
                                            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 500 }}>
                                                {item.selected_variation}
                                            </p>
                                        )}
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
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        </div>
    );
}
