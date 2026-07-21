"use client";

import { useEffect, useState, use } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import Link from "next/link";
import React from "react";
import { formatOrderNumber } from "@/lib/invoice";

export default function AdminOrderDetails({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [user, setUser] = useState(null);

    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [status, setStatus] = useState("");
    const [businessState, setBusinessState] = useState("Tamil Nadu");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getUser();
        setUser(currentUser);

        const loadOrder = async () => {
            try {
                const res = await api.get(`/admin/orders/${id}?t=${Date.now()}`);
                setOrder(res.data.order);
                setItems(res.data.items);
                setStatus(res.data.order.order_status?.toLowerCase());

                try {
                    const settingsRes = await api.get("/settings");
                    if (settingsRes.data && settingsRes.data.business_state) {
                        setBusinessState(settingsRes.data.business_state);
                    }
                } catch (sErr) {
                    console.error("Failed to load business state:", sErr);
                }
            } catch (err) {
                // Silenced console.error to prevent next.js dev overlay interruptions
            } finally {
                setLoading(false);
            }
        };

        if (currentUser && currentUser.role === "admin") {
            loadOrder();
        } else {
            setLoading(false);
        }
    }, [id]);

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '120px', display: 'flex', justifyContent: 'center' }}>
                <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

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
            const res = await api.get(`/admin/orders/${id}?t=${Date.now()}`);
            setOrder(res.data.order);
            setStatus(res.data.order.order_status?.toLowerCase());
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update status.");
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <Link href="/admin/orders" className="btn btn-secondary" style={{ padding: "8px 12px" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </Link>
                    <div>
                        <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Order {formatOrderNumber(order.id, order.created_at)}</h1>
                        <p style={{ color: "var(--text-muted)", margin: "8px 0 0 0" }}>Placed on {new Date(order.created_at || new Date()).toLocaleDateString()}</p>
                    </div>
                </div>
                <button
                    className="btn btn-secondary"
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", fontSize: "0.9rem", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", background: "rgba(16, 185, 129, 0.08)" }}
                    onClick={async () => {
                        const { downloadInvoice } = await import("@/lib/invoice");
                        downloadInvoice(order, items);
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download Bill
                </button>
            </div>

            <div className="order-details-grid" style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "32px" }}>
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

                    {/* Amount & Tax Breakup Card (Admin Only) */}
                    <div className="card" style={{ padding: "24px" }}>
                        {(() => {
                            const cleanState = (s) => (s || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                            const saleState = order?.state || "";
                            const isStoreSale = (order?.order_type || "").toLowerCase() === "store";
                            
                            // Direct store sales or sales within business state apply Intra-State Tax (CGST + SGST)
                            const isSameState = isStoreSale || saleState === "" || cleanState(saleState) === cleanState(businessState);

                            let totalTaxable = 0;
                            let totalGst = 0;
                            let totalCgst = 0;
                            let totalSgst = 0;
                            let totalGross = 0;

                            const itemRows = items.map((item) => {
                                const qty = Number(item.quantity || 1);
                                const unitPrice = Number(item.price || 0);
                                const grossTotal = unitPrice * qty;
                                const gstRate = Number(item.gst_percentage || 0);
                                
                                const taxableAmount = gstRate > 0 ? (grossTotal * 100) / (100 + gstRate) : grossTotal;
                                const gstAmount = grossTotal - taxableAmount;
                                const cgstAmount = gstAmount / 2;
                                const sgstAmount = gstAmount / 2;

                                totalTaxable += taxableAmount;
                                totalGst += gstAmount;
                                totalCgst += cgstAmount;
                                totalSgst += sgstAmount;
                                totalGross += grossTotal;

                                return {
                                    id: item.product_id || item.id,
                                    name: item.name,
                                    qty,
                                    taxableAmount,
                                    gstAmount,
                                    cgstAmount,
                                    sgstAmount,
                                    grossTotal,
                                    gstRate
                                };
                            });

                            return (
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                                        <div>
                                            <h2 style={{ fontSize: "1.3rem", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                                                📊 Amount & Tax Breakup <span style={{ fontSize: "0.8rem", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "3px 10px", borderRadius: "12px", fontWeight: 600 }}>Admin Only</span>
                                            </h2>
                                            <div style={{ fontSize: "0.83rem", color: "var(--text-muted)", marginTop: "4px" }}>
                                                Shipping State: <strong style={{ color: "var(--text-main)" }}>{isStoreSale ? "Direct Store Sale (Over-the-Counter)" : (saleState || "Not Specified (Local Sale)")}</strong> | Business State: <strong style={{ color: "var(--text-main)" }}>{businessState}</strong>
                                            </div>
                                        </div>
                                        <div>
                                            {isSameState ? (
                                                <span style={{ fontSize: "0.8rem", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "4px 12px", borderRadius: "14px", fontWeight: 600 }}>
                                                    Intra-State: Central Tax (CGST) + State Tax (SGST)
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: "0.8rem", background: "rgba(99, 102, 241, 0.1)", color: "#818cf8", border: "1px solid rgba(99, 102, 241, 0.3)", padding: "4px 12px", borderRadius: "14px", fontWeight: 600 }}>
                                                    Inter-State: Integrated Tax (IGST)
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                                            <thead>
                                                <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "2px solid var(--border)" }}>
                                                    <th style={{ padding: "12px", textAlign: "left" }}>Product Code</th>
                                                    <th style={{ padding: "12px", textAlign: "left" }}>Product Name</th>
                                                    <th style={{ padding: "12px", textAlign: "center" }}>Quantity</th>
                                                    <th style={{ padding: "12px", textAlign: "right" }}>Taxable Amount</th>
                                                    {isSameState ? (
                                                        <>
                                                            <th style={{ padding: "12px", textAlign: "right" }}>Central Tax (CGST)</th>
                                                            <th style={{ padding: "12px", textAlign: "right" }}>State Tax (SGST)</th>
                                                        </>
                                                    ) : (
                                                        <th style={{ padding: "12px", textAlign: "right" }}>Integrated Tax (IGST)</th>
                                                    )}
                                                    <th style={{ padding: "12px", textAlign: "right" }}>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {itemRows.map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                                                        <td style={{ padding: "12px", color: "var(--text-muted)" }}>#{row.id}</td>
                                                        <td style={{ padding: "12px", fontWeight: 500, color: "var(--text-main)" }}>
                                                            {row.name}
                                                            {row.gstRate > 0 && (
                                                                <span style={{ fontSize: "0.78rem", color: "#10b981", marginLeft: "8px" }}>
                                                                    ({row.gstRate}% GST)
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: "12px", textAlign: "center" }}>{row.qty}</td>
                                                        <td style={{ padding: "12px", textAlign: "right", fontFamily: "monospace", fontSize: "0.95rem" }}>₹{row.taxableAmount.toFixed(2)}</td>
                                                        {isSameState ? (
                                                            <>
                                                                <td style={{ padding: "12px", textAlign: "right", fontFamily: "monospace", fontSize: "0.95rem", color: "#10b981" }}>
                                                                    ₹{row.cgstAmount.toFixed(2)}
                                                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>({(row.gstRate / 2).toFixed(1)}%)</div>
                                                                </td>
                                                                <td style={{ padding: "12px", textAlign: "right", fontFamily: "monospace", fontSize: "0.95rem", color: "#10b981" }}>
                                                                    ₹{row.sgstAmount.toFixed(2)}
                                                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>({(row.gstRate / 2).toFixed(1)}%)</div>
                                                                </td>
                                                            </>
                                                        ) : (
                                                            <td style={{ padding: "12px", textAlign: "right", fontFamily: "monospace", fontSize: "0.95rem", color: "#818cf8" }}>
                                                                ₹{row.gstAmount.toFixed(2)}
                                                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>({row.gstRate}%)</div>
                                                            </td>
                                                        )}
                                                        <td style={{ padding: "12px", textAlign: "right", fontWeight: 600, fontFamily: "monospace", fontSize: "0.95rem" }}>₹{row.grossTotal.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr style={{ borderTop: "2px solid var(--border)", background: "rgba(16, 185, 129, 0.04)", fontWeight: 700 }}>
                                                    <td colSpan="3" style={{ padding: "12px", textAlign: "right", color: "var(--text-muted)" }}>Subtotal Breakup Total:</td>
                                                    <td style={{ padding: "12px", textAlign: "right", fontFamily: "monospace", fontSize: "1rem" }}>₹{totalTaxable.toFixed(2)}</td>
                                                    {isSameState ? (
                                                        <>
                                                            <td style={{ padding: "12px", textAlign: "right", fontFamily: "monospace", fontSize: "1rem", color: "#10b981" }}>₹{totalCgst.toFixed(2)}</td>
                                                            <td style={{ padding: "12px", textAlign: "right", fontFamily: "monospace", fontSize: "1rem", color: "#10b981" }}>₹{totalSgst.toFixed(2)}</td>
                                                        </>
                                                    ) : (
                                                        <td style={{ padding: "12px", textAlign: "right", fontFamily: "monospace", fontSize: "1rem", color: "#818cf8" }}>₹{totalGst.toFixed(2)}</td>
                                                    )}
                                                    <td style={{ padding: "12px", textAlign: "right", fontFamily: "monospace", fontSize: "1.05rem", color: "var(--accent)" }}>₹{totalGross.toFixed(2)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", paddingTop: "14px", borderTop: "1px dashed var(--border)", gap: "20px", alignItems: "center" }}>
                                        <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-muted)" }}>Total:</span>
                                        <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--accent)", fontFamily: "monospace" }}>₹{totalGross.toFixed(2)}</span>
                                    </div>
                                </div>
                            );
                        })()}
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
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Payment Info</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Method</span>
                                <strong style={{ color: 'var(--text-main)', textTransform: "capitalize" }}>{order.payment_method}</strong>
                            </div>
                            {order.razorpay_order_id && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Razorpay Order ID</span>
                                    <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace', fontSize: '0.85rem' }}>{order.razorpay_order_id}</strong>
                                </div>
                            )}
                            {order.payment_id && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Payment ID</span>
                                    <strong style={{ color: 'var(--accent)', fontFamily: 'monospace', fontSize: '0.85rem' }}>{order.payment_id}</strong>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card" style={{ padding: "24px" }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Shipping Address</h3>
                        {order.address ? (
                            <div style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                <p style={{ margin: 0, fontWeight: 500 }}>{order.address}</p>
                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>{order.city}, {order.state} - {order.pincode}</p>
                                {order.phone && (
                                    <p style={{ margin: '8px 0 0 0', fontWeight: 600, color: 'var(--text-main)' }}>Phone: {order.phone}</p>
                                )}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>No shipping address provided</p>
                        )}
                    </div>

                    <div className="card" style={{ padding: "24px" }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Order Status</h3>
                        
                        <div style={{ marginBottom: '24px' }}>
                            <span style={{ 
                                padding: "6px 12px", 
                                background: order.order_status?.toLowerCase() === "delivered" ? "rgba(16, 185, 129, 0.1)" : order.order_status?.toLowerCase() === "processing" ? "rgba(99, 102, 241, 0.1)" : "rgba(245, 158, 11, 0.1)", 
                                color: order.order_status?.toLowerCase() === "delivered" ? "var(--success)" : order.order_status?.toLowerCase() === "processing" ? "#818cf8" : "#fbbf24",  
                                borderRadius: "12px", 
                                fontSize: "1rem", 
                                fontWeight: 600,
                                textTransform: "capitalize",
                                display: "inline-block"
                            }}>
                                {order.order_status?.toLowerCase() === "processing" ? "Confirmed" : (order.order_status || "Pending")}
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
                                    <option value="processing">Confirmed</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                                <button className="btn btn-primary" onClick={updateStatus} style={{ padding: '0 16px' }}>
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @media (max-width: 900px) {
                    .order-details-grid {
                        grid-template-columns: 1fr !important;
                        gap: 24px !important;
                    }
                }
            `}</style>
        </div>
    );
}
