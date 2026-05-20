"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            try {
                const res = await api.get("/admin/orders");
                setOrders(res.data?.orders || res.data || []);
            } catch (err) {
                console.error("Failed to load orders", err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", marginBottom: "8px" }}>Orders</h1>
                    <p style={{ color: "var(--text-muted)" }}>View and manage customer purchases</p>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>Loading orders...</div>
            ) : (
                <div className="card" style={{ overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                <th style={{ padding: "16px 24px", fontWeight: 600 }}>Order ID</th>
                                <th style={{ padding: "16px 24px", fontWeight: 600 }}>Customer</th>
                                <th style={{ padding: "16px 24px", fontWeight: 600 }}>Date</th>
                                <th style={{ padding: "16px 24px", fontWeight: 600 }}>Total</th>
                                <th style={{ padding: "16px 24px", fontWeight: 600 }}>Status</th>
                                <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.length > 0 ? orders.map((o) => (
                                <tr key={o.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                                    <td style={{ padding: "16px 24px", color: "var(--text-muted)" }}>#{o.id}</td>
                                    <td style={{ padding: "16px 24px", fontWeight: 500, color: "var(--text-main)" }}>{o.user_name || o.customer || "User"}</td>
                                    <td style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: "0.9rem" }}>{new Date(o.created_at || new Date()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td style={{ padding: "16px 24px", fontWeight: 600, color: "var(--text-main)" }}>₹{o.total_amount || o.total || "0"}</td>
                                    <td style={{ padding: "16px 24px" }}>
                                        <span style={{ 
                                            padding: "4px 8px", 
                                            background: o.order_status === "Delivered" ? "rgba(16, 185, 129, 0.1)" : o.order_status === "Processing" ? "rgba(99, 102, 241, 0.1)" : "rgba(245, 158, 11, 0.1)", 
                                            color: o.order_status === "Delivered" ? "var(--success)" : o.order_status === "Processing" ? "#818cf8" : "#fbbf24", 
                                            borderRadius: "12px", 
                                            fontSize: "0.85rem", 
                                            fontWeight: 600,
                                            textTransform: "capitalize"
                                        }}>
                                            {o.order_status || o.status || "Pending"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                        <Link href={`/admin/orders/${o.id}`} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
                                            Details
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                                        No recent orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
