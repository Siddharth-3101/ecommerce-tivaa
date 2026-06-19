"use client";

import { useEffect, useState, use } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";

export default function OrderDetailsPage({ params }) {
    const { id } = use(params);
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const searchParams = useSearchParams();
    const isSuccess = searchParams.get("success") === "true";
    const router = useRouter();

    useEffect(() => {
        const user = getUser();
        if(!user) {
            router.push("/login");
            return;
        }

        async function loadOrder() {
            try {
                const res = await api.get(`/orders/my/${id}?t=${Date.now()}`);
                setOrderData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadOrder();
    }, [id, router]);

    if (loading) return (
        <div className="container" style={{ paddingTop: '30px', display: 'flex', justifyContent: 'center' }}>
            <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!orderData) return (
        <div className="container" style={{ paddingTop: '30px', textAlign: 'center' }}>
            <h1>Order Not Found</h1>
            <Link href="/" className="btn btn-primary" style={{ marginTop: '24px' }}>Back to Home</Link>
        </div>
    );

    const { order, items } = orderData;

    const handleRetryPayment = async () => {
        setSubmitting(true);
        try {
            // 1. Generate Razorpay order on the backend for this existing order
            const payOrderRes = await api.post("/payment/order", {
                amount: order.total,
                currency: "INR",
                order_id: order.id
            });
            const razorpayOrder = payOrderRes.data;

            // 2. Open Razorpay checkout modal
            const options = {
                key: razorpayOrder.key_id || "rzp_test_51NgC2HSJ34m7p8",
                amount: razorpayOrder.amount, // in paise
                currency: razorpayOrder.currency,
                name: "Tivaa Elegance",
                description: `Order #TEJWL${String(order.id).padStart(2, '0')}`,
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    try {
                        setSubmitting(true);
                        // 3. Verify payment signature on the backend
                        await api.post("/payment/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_id: order.id,
                        });
                        window.dispatchEvent(new Event('cart-updated'));
                        // Refresh the page or update order status in state
                        const updatedRes = await api.get(`/orders/my/${order.id}`);
                        setOrderData(updatedRes.data);
                        alert("Payment successful!");
                    } catch (verifyErr) {
                        alert("Payment verification failed. Please contact support.");
                    } finally {
                        setSubmitting(false);
                    }
                },
                prefill: {
                    name: order.customer_name || "",
                    email: order.customer_email || "",
                },
                theme: {
                    color: "#0a0b10",
                },
                modal: {
                    ondismiss: function () {
                        alert("Payment closed. You can retry payment anytime from this page.");
                        setSubmitting(false);
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
            console.error("❌ Retry Payment Error:", err);
            alert(err.response?.data?.message || "Failed to initiate payment. Please try again.");
            setSubmitting(false);
        }
    };

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '30px', paddingBottom: '80px' }}>
            {isSuccess && (
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ width: '80px', height: '80px', background: 'var(--accent-glow)', color: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h1 className="placed-title" style={{ marginBottom: '12px' }}>Order Placed!</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Thank you for your purchase. Your order ID is #TEJWL{String(order.id).padStart(2, '0')}</p>
                </div>
            )}

            <div className="order-grid">
                <div>
                    <h2 style={{ marginBottom: '24px' }}>Order Items</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {items.map(item => (
                            <div key={item.id} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#f9f9f9', border: '1px solid var(--border)', flexShrink: 0 }}>
                                        <img src={item.image_url ? item.image_url.split(",")[0].trim() : "https://placehold.co/100x100?text=Premium"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.name} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>{item.name}</span>
                                        {item.selected_variation && (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>
                                                Variant: {item.selected_variation}
                                            </span>
                                        )}
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            Qty: {item.quantity} × ₹{item.price}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)', flexShrink: 0 }}>
                                    ₹{Number(item.price) * Number(item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Order Information</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
                                <span style={{ fontWeight: 600 }}>TEJWL{String(order.id).padStart(2, '0')}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                                <span style={{ textTransform: 'capitalize', color: 'var(--accent)', fontWeight: 600 }}>{order.order_status}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Date</span>
                                <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Payment</span>
                                <span>{order.payment_method}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Total Amount</h3>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>₹{order.total}</div>
                    </div>

                    {order.order_status?.toLowerCase() === "pending" && (
                        <button 
                            disabled={submitting} 
                            onClick={handleRetryPayment} 
                            className="btn btn-primary" 
                            style={{ padding: '12px', fontSize: '1rem', fontWeight: 600, boxShadow: '0 4px 12px var(--accent-glow)' }}
                        >
                            {submitting ? "Processing Payment..." : "Pay Now"}
                        </button>
                    )}

                    {['paid', 'shipped', 'delivered'].includes(order.order_status?.toLowerCase()) && (
                        <button 
                            onClick={async () => {
                                const { downloadInvoice } = await import("@/lib/invoice");
                                downloadInvoice(order, items);
                            }}
                            className="btn btn-black-solid" 
                            style={{ padding: '12px', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Download Bill
                        </button>
                    )}
                    <Link href="/" className="btn btn-secondary" style={{ padding: '12px' }}>Back to Store</Link>
                </aside>
            </div>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            <style jsx>{`
                .order-grid {
                    display: grid;
                    grid-template-columns: 1fr 350px;
                    gap: 48px;
                }
                .order-grid > * {
                    min-width: 0;
                }
                .placed-title {
                    font-size: 3rem;
                }
                @media (max-width: 900px) {
                    .order-grid {
                        grid-template-columns: 1fr;
                        gap: 32px;
                    }
                }
                @media (max-width: 768px) {
                    .placed-title {
                        font-size: 2.2rem;
                    }
                }
            `}</style>
        </div>
    );
}
