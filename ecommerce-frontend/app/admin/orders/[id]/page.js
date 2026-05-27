"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import Link from "next/link";
import React from "react";

export default function AdminOrderDetails({ params }) {
    // Next.js 15+ resolution trick if it's a promise, else fast fallback
    const resolvedParams = React.use ? React.use(params) : params;
    const { id } = resolvedParams;
    const router = useRouter();
    const user = getUser();

    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const res = await api.get(`/admin/orders/${id}`);
                setOrder(res.data.order);
                setItems(res.data.items);
                setStatus(res.data.order.order_status);
            } catch (err) {
                // Silenced console.error to prevent next.js dev overlay interruptions
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === "admin") {
            loadOrder();
        } else {
            setLoading(false);
        }
    }, [id, user]);

    if (!user || user.role !== "admin") {
        return (
            <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Access Denied</h2>
                <p style={{ color: 'var(--text-muted)' }}>You must log in as an administrator to view this page.</p>
                <Link href="/login" className="btn btn-primary" style={{ marginTop: '24px' }}>Sign in securely</Link>
            </div>
        );
    }

    const updateStatus = async () => {
        try {
            await api.put(`/admin/orders/${id}/status`, { status });
            // refresh data gracefully
            const res = await api.get(`/admin/orders/${id}`);
            setOrder(res.data.order);
            setStatus(res.data.order.order_status);
        } catch (err) {
            alert("Failed to update status.");
        }
    };

    if (loading || !order) {
        return (
            <div className="container" style={{ paddingTop: '120px', display: 'flex', justifyContent: 'center' }}>
                <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "32px" }}>
                <Link href="/admin/orders" className="btn btn-secondary" style={{ padding: "8px 12px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </Link>
                <div>
                    <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Order #{order.id}</h1>
                    <p style={{ color: "var(--text-muted)", margin: "8px 0 0 0" }}>Placed on {new Date(order.created_at || new Date()).toLocaleDateString()}</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "32px" }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div className="card" style={{ padding: "24px" }}>
                        <h2 style={{ fontSize: '1.4rem', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>Order Items</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {items.map((item) => (
                                <div key={item.product_id} style={{ display: "flex", gap: "16px", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                                    <div style={{ width: "64px", height: "64px", borderRadius: "8px", overflow: "hidden", background: "#1e2130" }}>
                                        <img src={item.image_url ? item.image_url.split(",")[0].trim() : "/placeholder.png"} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={item.name} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '4px' }}>{item.name}</strong>  
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Qty: {item.quantity}</span>
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                        ₹{item.price}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "24px", marginTop: "8px" }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Total Paid</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>₹{order.total}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ padding: "24px" }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Customer Info</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Name</span>
                                <strong style={{ color: 'var(--text-main)' }}>{order.customer_name}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Email</span>
                                <strong style={{ color: 'var(--text-main)' }}>{order.customer_email}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: "24px" }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Order Status</h3>
                        
                        <div style={{ marginBottom: '24px' }}>
                            <span style={{ 
                                padding: "6px 12px", 
                                background: order.order_status === "delivered" ? "rgba(16, 185, 129, 0.1)" : order.order_status === "processing" ? "rgba(99, 102, 241, 0.1)" : "rgba(245, 158, 11, 0.1)", 
                                color: order.order_status === "delivered" ? "var(--success)" : order.order_status === "processing" ? "#818cf8" : "#fbbf24", 
                                borderRadius: "12px", 
                                fontSize: "1rem", 
                                fontWeight: 600,
                                textTransform: "capitalize",
                                display: "inline-block"
                            }}>
                                {order.order_status || "Pending"}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Update Status</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="input-field"
                                    style={{ flex: 1 }}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <button className="btn btn-primary" onClick={updateStatus} style={{ padding: '0 16px' }}>
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
