"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowRight, ArrowLeft, Calendar } from "lucide-react";

export default function MyOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = getUser();

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }

        const fetchOrders = async () => {
            try {
                const res = await api.get("/orders/my");
                // The API returns orders sorted by date
                setOrders(res.data || []);
            } catch (err) {
                console.error("Failed to load orders:", err);
                setError("Could not retrieve your orders. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, router]);

    const getStatusStyle = (status) => {
        switch (status) {
            case "delivered":
            case "paid":
                return { background: "rgba(16, 185, 129, 0.08)", color: "var(--success)", border: "1px solid rgba(16, 185, 129, 0.2)" };
            case "pending":
                return { background: "rgba(220, 163, 83, 0.08)", color: "var(--accent-yellow)", border: "1px solid rgba(220, 163, 83, 0.2)" };
            case "shipped":
                return { background: "rgba(130, 185, 194, 0.08)", color: "var(--accent-teal)", border: "1px solid rgba(130, 185, 194, 0.2)" };
            case "cancelled":
                return { background: "rgba(179, 86, 111, 0.08)", color: "var(--danger)", border: "1px solid rgba(179, 86, 111, 0.2)" };
            default:
                return { background: "rgba(0,0,0,0.05)", color: "var(--text-muted)" };
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(229,147,116,0.2)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <p style={{ color: 'var(--text-muted)' }}>Retrieving your order history...</p>
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
                <h1 style={{ fontSize: '3rem', marginBottom: '8px', background: 'var(--gradient-logo)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block' }}>My Orders</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Track your premium jewelry orders and view shipping details.</p>
            </div>

            <section className="container">
                {error && (
                    <div style={{ padding: '14px', background: 'rgba(179, 86, 111, 0.08)', border: '1px solid rgba(179, 86, 111, 0.2)', borderRadius: '12px', color: 'var(--danger)', marginBottom: '24px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div style={{ padding: '80px 40px', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: '24px', textAlign: 'center', maxWidth: '600px', margin: '0 auto', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ width: '88px', height: '88px', margin: '0 auto 24px', borderRadius: '50%', background: 'rgba(229,147,116,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                            <ShoppingBag size={36} />
                        </div>
                        <h3 style={{ fontSize: '1.6rem', marginBottom: '12px', color: 'var(--text-main)' }}>No orders placed yet</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                            Timeless jewelry awaits. Start adding items to your cart and place your first order!
                        </p>
                        <Link href="/products" className="btn btn-primary" style={{ padding: '14px 28px' }}>
                            Explore Products
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
                        {orders.map((order) => (
                            <div key={order.id} className="card animate-fade-in" style={{ padding: '24px', background: 'var(--bg-glass)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                    
                                    {/* Order Meta */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>
                                            Order #{order.id}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <Calendar size={14} />
                                            <span>{new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    {/* Order stats */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Price</span>
                                            <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>₹{order.total}</strong>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Method</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{order.payment_method}</span>
                                        </div>

                                        {/* Status Badge */}
                                        <div 
                                            style={{ 
                                                padding: '6px 14px', 
                                                borderRadius: '20px', 
                                                fontSize: '0.8rem', 
                                                fontWeight: 700, 
                                                textTransform: 'uppercase', 
                                                letterSpacing: '0.5px',
                                                ...getStatusStyle(order.order_status)
                                            }}
                                        >
                                            {order.order_status}
                                        </div>

                                        {/* Details button */}
                                        <Link 
                                            href={`/orders/${order.id}`} 
                                            className="btn btn-secondary" 
                                            style={{ 
                                                padding: '8px 16px', 
                                                fontSize: '0.85rem', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '6px',
                                                background: '#ffffff'
                                            }}
                                        >
                                            Details <ArrowRight size={14} />
                                        </Link>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
