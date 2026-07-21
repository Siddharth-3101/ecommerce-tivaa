"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { formatOrderNumber } from "@/lib/invoice";

export default function ManageOrdersDeletePage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterState, setFilterState] = useState("all"); // "all", "active", "deleted"
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [processingId, setProcessingId] = useState(null);
    const [page, setPage] = useState(1);
    const limit = 15;

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/orders-manage");
            setOrders(res.data?.orders || res.data || []);
        } catch (err) {
            console.error("Failed to load orders for soft delete management", err);
            alert("Failed to load orders list");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Soft Delete Handler
    const handleSoftDelete = async (orderId, orderNum) => {
        if (!confirm(`Are you sure you want to SOFT DELETE order ${orderNum}?\n\nThis will hide the order from Customer Order History and main Admin Orders list, but the order will remain safely in database.`)) {
            return;
        }

        setProcessingId(orderId);
        try {
            await api.put(`/admin/orders/${orderId}/soft-delete`);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, is_deleted: 1 } : o));
            alert(`Order ${orderNum} soft deleted successfully!`);
        } catch (err) {
            console.error("Failed to soft delete order:", err);
            alert(err.response?.data?.message || "Failed to soft delete order");
        } finally {
            setProcessingId(null);
        }
    };

    // Restore Handler
    const handleRestore = async (orderId, orderNum) => {
        if (!confirm(`Are you sure you want to RESTORE order ${orderNum} back to active orders?`)) {
            return;
        }

        setProcessingId(orderId);
        try {
            await api.put(`/admin/orders/${orderId}/restore`);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, is_deleted: 0 } : o));
            alert(`Order ${orderNum} restored successfully!`);
        } catch (err) {
            console.error("Failed to restore order:", err);
            alert(err.response?.data?.message || "Failed to restore order");
        } finally {
            setProcessingId(null);
        }
    };

    // Filter Logic
    const filteredOrders = orders.filter(o => {
        // Filter by Deletion State
        if (filterState === "active" && Number(o.is_deleted) === 1) return false;
        if (filterState === "deleted" && Number(o.is_deleted) !== 1) return false;

        // Filter by Order Status
        if (statusFilter !== "all" && o.order_status !== statusFilter) return false;

        // Filter by Search Query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const orderNum = formatOrderNumber(o.id, o.created_at).toLowerCase();
            const matchesId = String(o.id).includes(q) || orderNum.includes(q);
            const matchesCust = (o.customer || o.user_name || "").toLowerCase().includes(q);
            const matchesEmail = (o.email || "").toLowerCase().includes(q);
            return matchesId || matchesCust || matchesEmail;
        }

        return true;
    });

    // Pagination
    const total = filteredOrders.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedOrders = filteredOrders.slice(offset, offset + limit);

    return (
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 16px' }}>
            
            {/* Page Title & Subheader */}
            <div style={{ marginBottom: '24px', background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                            🗑️ Soft Delete Order Management
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
                            Standalone admin tool to soft delete or restore orders without removing database history.
                        </p>
                    </div>
                    <div style={{ background: '#eff6ff', color: 'var(--accent)', border: '1px solid #bfdbfe', padding: '8px 16px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                        Direct URL: /admin/manage-orders-delete
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    
                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Search by Order ID, Name, Email..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        style={{ padding: '8px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.88rem', width: '260px', outline: 'none' }}
                    />

                    {/* Deletion Filter */}
                    <select
                        value={filterState}
                        onChange={(e) => { setFilterState(e.target.value); setPage(1); }}
                        style={{ padding: '8px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.88rem', outline: 'none', background: '#fafbfc' }}
                    >
                        <option value="all">All Orders ({orders.length})</option>
                        <option value="active">Active Only ({orders.filter(o => Number(o.is_deleted) !== 1).length})</option>
                        <option value="deleted">Soft Deleted Only ({orders.filter(o => Number(o.is_deleted) === 1).length})</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        style={{ padding: '8px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.88rem', outline: 'none', background: '#fafbfc' }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Showing <strong>{filteredOrders.length}</strong> matching orders
                </div>
            </div>

            {/* Orders Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <span style={{ display: 'inline-block', width: '36px', height: '36px', border: '4px solid rgba(0,0,0,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                    <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : paginatedOrders.length === 0 ? (
                <div style={{ background: '#fff', padding: '48px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    No orders match your filter criteria.
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                            <thead>
                                <tr style={{ background: '#fafbfc', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    <th style={{ padding: '14px 16px' }}>Order ID</th>
                                    <th style={{ padding: '14px 16px' }}>Customer</th>
                                    <th style={{ padding: '14px 16px' }}>Date</th>
                                    <th style={{ padding: '14px 16px' }}>Type</th>
                                    <th style={{ padding: '14px 16px' }}>Status</th>
                                    <th style={{ padding: '14px 16px' }}>Soft Delete State</th>
                                    <th style={{ padding: '14px 16px' }}>Total</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedOrders.map((o) => {
                                    const isDel = Number(o.is_deleted) === 1;
                                    const dateStr = new Date(o.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                    const orderNum = formatOrderNumber(o.id, o.created_at);

                                    return (
                                        <tr key={o.id} style={{ borderBottom: '1px solid var(--border)', background: isDel ? '#fef2f2' : '#ffffff' }}>
                                            <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                                                <Link href={`/admin/orders/${o.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                                                    {orderNum}
                                                </Link>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{o.customer || "Guest"}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.email}</div>
                                            </td>
                                            <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                                {dateStr}
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{
                                                    padding: '3px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    background: o.order_type === 'Store' ? '#ccfbf1' : '#e0f2fe',
                                                    color: o.order_type === 'Store' ? '#0f766e' : '#0369a1'
                                                }}>
                                                    {o.order_type || 'Online'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 600,
                                                    textTransform: 'capitalize',
                                                    background: o.order_status === 'delivered' ? '#dcfce7' : o.order_status === 'paid' ? '#e0e7ff' : '#fef3c7',
                                                    color: o.order_status === 'delivered' ? '#15803d' : o.order_status === 'paid' ? '#4338ca' : '#b45309'
                                                }}>
                                                    {o.order_status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                {isDel ? (
                                                    <span style={{ background: '#ef4444', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                        SOFT DELETED
                                                    </span>
                                                ) : (
                                                    <span style={{ background: '#22c55e', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                        ACTIVE
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                                                ₹{o.total}
                                            </td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <Link
                                                        href={`/admin/orders/${o.id}`}
                                                        style={{
                                                            padding: '6px 12px',
                                                            border: '1px solid var(--border)',
                                                            borderRadius: '6px',
                                                            background: '#fff',
                                                            color: 'var(--text-main)',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                            textDecoration: 'none'
                                                        }}
                                                    >
                                                        View
                                                    </Link>

                                                    {isDel ? (
                                                        <button
                                                            onClick={() => handleRestore(o.id, orderNum)}
                                                            disabled={processingId === o.id}
                                                            style={{
                                                                padding: '6px 12px',
                                                                border: '1px solid #16a34a',
                                                                borderRadius: '6px',
                                                                background: '#dcfce7',
                                                                color: '#15803d',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 600,
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {processingId === o.id ? "Restoring..." : "🔄 Restore"}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleSoftDelete(o.id, orderNum)}
                                                            disabled={processingId === o.id}
                                                            style={{
                                                                padding: '6px 12px',
                                                                border: '1px solid #ef4444',
                                                                borderRadius: '6px',
                                                                background: '#fef2f2',
                                                                color: '#ef4444',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 600,
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {processingId === o.id ? "Deleting..." : "🗑️ Soft Delete"}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', background: '#fafbfc' }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}
                            >
                                Previous
                            </button>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
