"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const limit = 12;

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

    // Calculate paginated slice
    const total = orders.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedOrders = orders.slice(offset, offset + limit);

    const handleDownloadCSV = async () => {
        if (orders.length === 0) {
            alert("No orders to export.");
            return;
        }

        try {
            const headers = ["id", "user_id", "customer", "email", "total", "order_status", "payment_method", "created_at", "payment_id"];
            const headerLine = headers.join(",");
            const rowLines = orders.map(o => 
                headers.map(h => {
                    let val = "";
                    if (h === "customer") val = o.user_name || o.customer || "";
                    else if (h === "email") val = o.email || "";
                    else if (h === "payment_id") val = o.payment_id || "";
                    else val = o[h] === null || o[h] === undefined ? "" : String(o[h]);
                    return `"${val.replace(/"/g, '""')}"`;
                }).join(",")
            );
            const csvContent = [headerLine, ...rowLines].join("\n");
            
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "orders_export.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error(err);
            alert("Failed to export orders.");
        }
    };

    const handleImportCSV = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target.result;
                const lines = text.split(/\r?\n/);
                if (lines.length === 0 || !lines[0]) {
                    alert("Empty CSV file.");
                    return;
                }

                const parseCSVLine = (line) => {
                    const result = [];
                    let curVal = "";
                    let inQuotes = false;
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        if (char === '"') {
                            if (inQuotes && line[i + 1] === '"') {
                                curVal += '"';
                                i++;
                            } else {
                                inQuotes = !inQuotes;
                            }
                        } else if (char === ',' && !inQuotes) {
                            result.push(curVal);
                            curVal = "";
                        } else {
                            curVal += char;
                        }
                    }
                    result.push(curVal);
                    return result;
                };

                const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
                const parsedOrders = [];

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    const values = parseCSVLine(line);
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = values[index] !== undefined ? values[index].trim() : "";
                    });
                    if (obj.user_id && obj.total) {
                        parsedOrders.push(obj);
                    }
                }

                if (parsedOrders.length === 0) {
                    alert("No valid orders found in CSV. Make sure user_id and total are specified.");
                    return;
                }

                if (!confirm(`Are you sure you want to import/update ${parsedOrders.length} orders?`)) {
                    return;
                }

                await api.post("/admin/orders/bulk", parsedOrders);
                alert("Orders imported/updated successfully!");
                // Refresh list
                setLoading(true);
                const res = await api.get("/admin/orders");
                setOrders(res.data?.orders || res.data || []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || "Failed to import orders. Please check CSV format.");
                setLoading(false);
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", marginBottom: "8px" }}>Orders</h1>
                    <p style={{ color: "var(--text-muted)" }}>View and manage customer purchases</p>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <button onClick={handleDownloadCSV} className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ffffff", padding: "10px 18px", fontSize: "0.9rem" }}>
                        Download CSV
                    </button>
                    <label className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ffffff", padding: "10px 18px", cursor: "pointer", margin: 0, fontSize: "0.9rem" }}>
                        Import CSV
                        <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: "none" }} />
                    </label>
                </div>
            </div>


            {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>Loading orders...</div>
            ) : (
                <>
                    <div className="card" style={{ overflow: "hidden" }}>
                        <div style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}>
                            <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse", textAlign: "left" }}>
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
                                {paginatedOrders.length > 0 ? paginatedOrders.map((o) => (
                                    <tr key={o.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                                        <td style={{ padding: "16px 24px" }}>
                                            <div style={{ color: "var(--text-main)", fontWeight: 600 }}>#{o.id}</div>
                                            {o.payment_id && (
                                                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px", fontFamily: "monospace" }}>
                                                    {o.payment_id}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: "16px 24px", fontWeight: 500, color: "var(--text-main)" }}>{o.user_name || o.customer || "User"}</td>
                                        <td style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: "0.9rem" }}>{new Date(o.created_at || new Date()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                        <td style={{ padding: "16px 24px", fontWeight: 600, color: "var(--text-main)" }}>₹{o.total_amount || o.total || "0"}</td>
                                        <td style={{ padding: "16px 24px" }}>
                                            <span style={{ 
                                                padding: "4px 8px", 
                                                background: o.order_status?.toLowerCase() === "delivered" ? "rgba(16, 185, 129, 0.1)" : o.order_status?.toLowerCase() === "processing" ? "rgba(99, 102, 241, 0.1)" : "rgba(245, 158, 11, 0.1)", 
                                                color: o.order_status?.toLowerCase() === "delivered" ? "var(--success)" : o.order_status?.toLowerCase() === "processing" ? "#818cf8" : "#fbbf24", 
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
                    </div>

                    {/* Sleek circular boutique pagination selector */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
                            {page > 1 && (
                                <button
                                    onClick={() => setPage(page - 1)}
                                    className="btn btn-secondary"
                                    style={{ padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                                >
                                    Prev
                                </button>
                            )}
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                const isActive = p === page;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            fontSize: '0.9rem',
                                            fontWeight: isActive ? '600' : '400',
                                            border: isActive ? '1px solid var(--text-main)' : '1px solid #e0e0e0',
                                            background: isActive ? 'var(--text-main)' : 'transparent',
                                            color: isActive ? '#ffffff' : 'var(--text-main)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            
                            {page < totalPages && (
                                <button
                                    onClick={() => setPage(page + 1)}
                                    className="btn btn-secondary"
                                    style={{ padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
