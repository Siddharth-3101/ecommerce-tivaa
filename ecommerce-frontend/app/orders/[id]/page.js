"use client";

import { useEffect, useState, use } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function OrderDetailsPage({ params }) {
    const { id } = use(params);
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
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
                const res = await api.get(`/orders/my/${id}`);
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
        <div className="container" style={{ paddingTop: '120px', display: 'flex', justifyContent: 'center' }}>
            <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!orderData) return (
        <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
            <h1>Order Not Found</h1>
            <Link href="/" className="btn btn-primary" style={{ marginTop: '24px' }}>Back to Home</Link>
        </div>
    );

    const { order, items } = orderData;

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
            {isSuccess && (
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ width: '80px', height: '80px', background: 'var(--accent-glow)', color: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>Order Placed!</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Thank you for your purchase. Your order ID is #{order.id}</p>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '48px' }}>
                <div>
                    <h2 style={{ marginBottom: '24px' }}>Order Items</h2>
                    <div className="card" style={{ overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ textAlign: 'left', padding: '16px 24px' }}>Product</th>
                                    <th style={{ textAlign: 'center', padding: '16px 24px' }}>Qty</th>
                                    <th style={{ textAlign: 'right', padding: '16px 24px' }}>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#1e2130' }}>
                                                <img src={item.image_url || "https://placehold.co/100x100?text=Premium"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{item.name}</span>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '16px 24px' }}>{item.quantity}</td>
                                        <td style={{ textAlign: 'right', padding: '16px 24px', fontWeight: 600 }}>₹{item.price * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Order Information</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
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

                    <Link href="/" className="btn btn-secondary" style={{ padding: '12px' }}>Back to Store</Link>
                </aside>
            </div>
        </div>
    );
}
