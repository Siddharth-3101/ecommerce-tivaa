"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
    "Uttar Pradesh", "Uttarakhand", "West Bengal", 
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function CheckoutPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);
    const [shippingCost, setShippingCost] = useState(0);
    const [formData, setFormData] = useState({
        shipping_address: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        payment_method: "Razorpay"
    });
    const router = useRouter();

    useEffect(() => {
        const loggedInUser = getUser();
        if(!loggedInUser) {
            router.push("/login");
            return;
        }
        setUser(loggedInUser);

        async function loadCartAndProfile() {
            try {
                const searchParams = new URLSearchParams(window.location.search);
                const isBuyNow = searchParams.get("buyNow") === "true";
                const productId = searchParams.get("productId");
                const qty = Number(searchParams.get("quantity")) || 1;
                const variation = searchParams.get("variation") || "";

                let items = [];
                if (isBuyNow && productId) {
                    // Fetch product details from backend
                    const prodRes = await api.get(`/products/${productId}`);
                    const prod = prodRes.data;
                    items = [{
                        id: `buynow-${prod.id}`,
                        product_id: prod.id,
                        quantity: qty,
                        price: prod.price,
                        name: prod.name,
                        image_url: prod.image_url,
                        selected_variation: variation || null
                    }];
                } else {
                    const res = await api.get("/cart");
                    const data = res.data;
                    items = Array.isArray(data) ? data : data.items || [];
                    if (items.length === 0) {
                        router.push("/cart");
                        return;
                    }
                }
                setCartItems(items);

                // Fetch settings to get shipping cost
                try {
                    const settingsRes = await api.get("/settings");
                    if (settingsRes.data && settingsRes.data.shipping_cost) {
                        setShippingCost(Number(settingsRes.data.shipping_cost) || 0);
                    }
                } catch (settingsErr) {
                    console.log("Failed to load settings in checkout:", settingsErr);
                }

                // Fetch fresh profile containing saved address details
                const profileRes = await api.get("/auth/me");
                const profile = profileRes.data;
                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        shipping_address: profile.address || "",
                        city: profile.city || "",
                        state: profile.state || "",
                        pincode: profile.pincode || "",
                        phone: profile.phone || ""
                    }));
                }
            } catch (err) {
                console.error(err);
                router.push("/cart");
            } finally {
                setLoading(false);
            }
        }
        loadCartAndProfile();
    }, [router]);

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + shippingCost;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // 1. Create order in the local database
            const searchParams = new URLSearchParams(window.location.search);
            const isBuyNow = searchParams.get("buyNow") === "true";
            const productId = searchParams.get("productId");
            const qty = Number(searchParams.get("quantity")) || 1;
            const variation = searchParams.get("variation") || "";

            const payload = { ...formData };
            if (isBuyNow && productId) {
                payload.buy_now = {
                    product_id: Number(productId),
                    quantity: qty,
                    selected_variation: variation || null
                };
            }

            const res = await api.post("/orders", payload);
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
                key: razorpayOrder.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_51NgC2HSJ34m7p8",
                amount: razorpayOrder.amount, // in paise
                currency: razorpayOrder.currency,
                name: "Tivaa Elegance",
                description: `Order #TEJWL${String(orderId).padStart(2, '0')}`,
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
                    contact: formData.phone || ""
                },
                theme: {
                    color: "#0a0b10",
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
        <div className="container" style={{ paddingTop: '30px', display: 'flex', justifyContent: 'center' }}>
            <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '30px', paddingBottom: '80px' }}>
            <div className="checkout-grid">
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Checkout</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Please provide your shipping and payment details.</p>

                    <form id="checkout-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div className="card checkout-card">
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
                                     />
                                </div>
                                <div className="checkout-form-grid">
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
                                         <select 
                                             className="input-field" 
                                             required 
                                             value={formData.state}
                                             onChange={(e) => setFormData({...formData, state: e.target.value})}
                                             style={{ background: '#ffffff', color: 'var(--text-main)' }}
                                         >
                                             <option value="" disabled>Select State</option>
                                             {INDIAN_STATES.map(s => (
                                                 <option key={s} value={s}>{s}</option>
                                             ))}
                                         </select>
                                     </div>
                                </div>
                                <div className="checkout-form-grid">
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
                                     <div>
                                         <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Mobile Number</label>
                                         <input 
                                             type="tel" 
                                             className="input-field" 
                                             required 
                                             value={formData.phone}
                                             onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                             placeholder="e.g. +91 98765 43210"
                                         />
                                     </div>
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={submitting} className="btn btn-primary checkout-submit-btn desktop-only-btn">
                            {submitting ? "Processing Order..." : `Complete Purchase — ₹${total.toFixed(2)}`}
                        </button>
                    </form>
                </div>

                <aside>
                    <div className="card checkout-card" style={{ position: 'sticky', top: '120px' }}>
                        <h3 style={{ marginBottom: '24px' }}>In Your Cart</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {cartItems.map(item => (
                                <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#1e2130', flexShrink: 0 }}>
                                        <img src={item.image_url ? item.image_url.split(",")[0].trim() : "/placeholder.png"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.name} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ 
                                             fontSize: '0.95rem', 
                                             margin: 0, 
                                             display: '-webkit-box',
                                             WebkitLineClamp: 2,
                                             WebkitBoxOrient: 'vertical',
                                             overflow: 'hidden',
                                             lineHeight: 1.35
                                         }}>{item.name}</h4>
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
                        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                                <span>Shipping</span>
                                <span style={{ color: '#10B981', fontWeight: 600 }}>{shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : "Free"}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                <span style={{ fontWeight: 600 }}>Total To Pay</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>₹{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </aside>
                
                <button type="submit" form="checkout-form" disabled={submitting} className="btn btn-primary checkout-submit-btn mobile-only-btn">
                    {submitting ? "Processing Order..." : `Complete Purchase — ₹${total.toFixed(2)}`}
                </button>
            </div>
            
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            <style jsx>{`
                .checkout-grid {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 48px;
                }
                .checkout-card {
                    padding: 32px;
                }
                .checkout-form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .checkout-submit-btn {
                    padding: 20px;
                    font-size: 1.2rem;
                    box-shadow: 0 10px 20px var(--accent-glow);
                }
                .mobile-only-btn {
                    display: none;
                }

                @media (max-width: 900px) {
                    .checkout-grid {
                        grid-template-columns: 1fr;
                        gap: 32px;
                    }
                    .desktop-only-btn {
                        display: none;
                    }
                    .mobile-only-btn {
                        display: block;
                        width: 100%;
                        margin-top: 16px;
                    }
                }

                @media (max-width: 600px) {
                    .checkout-card {
                        padding: 20px 16px;
                    }
                    .checkout-form-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }
                    .checkout-submit-btn {
                        padding: 16px;
                        font-size: 1.1rem;
                    }
                }
            `}</style>
        </div>
    );
}
