"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function AdminHome() {
    const [activeTab, setActiveTab] = useState("quick-links");
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedCartUserId, setExpandedCartUserId] = useState(null);

    // Timeframe filters
    const [loginTimeframe, setLoginTimeframe] = useState("today");
    const [orderTimeframe, setOrderTimeframe] = useState("today");

    useEffect(() => {
        if (activeTab === "analytics") {
            fetchAnalytics();
        }
    }, [activeTab]);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/admin/dashboard/analytics");
            setAnalytics(res.data);
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
            setError(err.response?.data?.message || "Failed to load dashboard analytics");
        } finally {
            setLoading(false);
        }
    };

    const toggleCartExpand = (userId) => {
        if (expandedCartUserId === userId) {
            setExpandedCartUserId(null);
        } else {
            setExpandedCartUserId(userId);
        }
    };

    const formatPrice = (val) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(val);
    };

    // Helper to check if a date falls in today, this week, this month rolling window
    const filterByTimeframe = (dateStr, timeframe) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const now = new Date();
        
        if (timeframe === "today") {
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return date >= startOfToday;
        } else if (timeframe === "week") {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);
            return date >= sevenDaysAgo;
        } else if (timeframe === "month") {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            return date >= thirtyDaysAgo;
        }
        return true;
    };

    // Process & group logins
    const getFilteredLogins = () => {
        if (!analytics || !analytics.logins) return [];
        
        const filtered = analytics.logins.filter(l => filterByTimeframe(l.loginTime, loginTimeframe));
        const grouped = {};
        
        filtered.forEach(l => {
            if (!grouped[l.email]) {
                grouped[l.email] = {
                    email: l.email,
                    name: l.name || "Customer",
                    count: 0,
                    latestTime: l.loginTime
                };
            }
            grouped[l.email].count += 1;
            if (new Date(l.loginTime) > new Date(grouped[l.email].latestTime)) {
                grouped[l.email].latestTime = l.loginTime;
            }
        });
        
        return Object.values(grouped).sort((a, b) => new Date(b.latestTime) - new Date(a.latestTime));
    };

    // Process & group orders
    const getFilteredOrdersSummary = () => {
        if (!analytics || !analytics.orders) return [];
        
        const filtered = analytics.orders.filter(o => filterByTimeframe(o.createdAt, orderTimeframe));
        const summary = {};
        
        filtered.forEach(o => {
            const status = o.status || 'pending';
            if (!summary[status]) {
                summary[status] = {
                    status,
                    count: 0,
                    revenue: 0
                };
            }
            summary[status].count += 1;
            summary[status].revenue += Number(o.total || 0);
        });
        
        return Object.values(summary).sort((a, b) => b.revenue - a.revenue);
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const filteredLogins = getFilteredLogins();
    const filteredOrders = getFilteredOrdersSummary();
    const totalOrdersCount = filteredOrders.reduce((sum, o) => sum + o.count, 0);
    const totalOrdersRevenue = filteredOrders.reduce((sum, o) => sum + o.revenue, 0);

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '80px', fontFamily: 'var(--font-poppins), sans-serif' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Admin Portal</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Manage your store and oversee operations.</p>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '32px', paddingBottom: '2px' }}>
                <button 
                    onClick={() => setActiveTab("quick-links")}
                    style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === "quick-links" ? '3px solid var(--accent)' : '3px solid transparent',
                        color: activeTab === "quick-links" ? 'var(--text-main)' : 'var(--text-muted)',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none'
                    }}
                >
                    Quick Actions
                </button>
                <button 
                    onClick={() => setActiveTab("analytics")}
                    style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === "analytics" ? '3px solid var(--accent)' : '3px solid transparent',
                        color: activeTab === "analytics" ? 'var(--text-main)' : 'var(--text-muted)',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none'
                    }}
                >
                    Analytics & Insights
                </button>
            </div>

            {/* Tab 1: Quick Actions */}
            {activeTab === "quick-links" && (
                <div className="grid">
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Inventory</h3>
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>View all products in your catalog, edit details, adjust stock, and manage prices.</p>
                        <Link href="/admin/products" className="btn btn-primary" style={{ width: '100%' }}>
                            Manage Products
                        </Link>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Create</h3>
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add new items to your catalog, upload high-quality images, and set availability.</p>
                        <Link href="/admin/products/add" className="btn btn-secondary" style={{ width: '100%' }}>
                            Add New Product
                        </Link>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Categories</h3>
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Organize your products into categories for better navigation and filtering.</p>
                        <Link href="/admin/categories" className="btn btn-secondary" style={{ width: '100%' }}>
                            Manage Categories
                        </Link>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Orders</h3>
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Track customer orders, update delivery status, and review POS direct store sales.</p>
                        <Link href="/admin/orders" className="btn btn-secondary" style={{ width: '100%' }}>
                            Manage Orders
                        </Link>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Reports</h3>
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Download ready GST reports (B2CS & HSN) and detailed order sales reports.</p>
                        <Link href="/admin/reports" className="btn btn-secondary" style={{ width: '100%' }}>
                            Download Reports
                        </Link>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M21 19c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14"></path><path d="M21 5v14"></path></svg>
                            </div>
                            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Masters</h3>
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Configure master databases including HSN codes, GST state mapping, and settings.</p>
                        <Link href="/admin/hsn" className="btn btn-secondary" style={{ width: '100%' }}>
                            Manage Masters
                        </Link>
                    </div>
                </div>
            )}

            {/* Tab 2: Analytics & Insights */}
            {activeTab === "analytics" && (
                <div>
                    {loading && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                            <span style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(0,0,0,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}
                    
                    {error && (
                        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '10px', marginBottom: '24px', fontSize: '0.9rem', border: '1px solid #fee2e2' }}>
                            ⚠️ {error}
                            <button onClick={fetchAnalytics} style={{ marginLeft: '12px', background: 'none', border: 'underline', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Try Again</button>
                        </div>
                    )}

                    {!loading && !error && analytics && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            
                            {/* 1. Logins Card with Dropdown and Emails List */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px' }}>
                                    <h2 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 600 }}>User Logins ({filteredLogins.length})</h2>
                                    <select 
                                        value={loginTimeframe} 
                                        onChange={(e) => setLoginTimeframe(e.target.value)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border)',
                                            background: '#fff',
                                            fontWeight: 500,
                                            outline: 'none',
                                            fontSize: '0.88rem',
                                            cursor: 'pointer',
                                            color: 'var(--text-main)'
                                        }}
                                    >
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                    </select>
                                </div>

                                <div className="card" style={{ padding: '24px', background: '#fafbfc' }}>
                                    {filteredLogins.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '20px 0' }}>
                                            No users logged in during this period.
                                        </div>
                                    ) : (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                                        <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Email Address</th>
                                                        <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Customer Name</th>
                                                        <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>Login Count</th>
                                                        <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Most Recent Login</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredLogins.map((login) => (
                                                        <tr key={login.email} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                            <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--accent)' }}>{login.email}</td>
                                                            <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{login.name}</td>
                                                            <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 500 }}>{login.count}</td>
                                                            <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>{formatDateTime(login.latestTime)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 2. Orders placed by Status with Dropdown */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 600 }}>Orders by Status</h2>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            Total: <strong>{totalOrdersCount}</strong> orders | Revenue: <strong>{formatPrice(totalOrdersRevenue)}</strong>
                                        </div>
                                    </div>
                                    <select 
                                        value={orderTimeframe} 
                                        onChange={(e) => setOrderTimeframe(e.target.value)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border)',
                                            background: '#fff',
                                            fontWeight: 500,
                                            outline: 'none',
                                            fontSize: '0.88rem',
                                            cursor: 'pointer',
                                            color: 'var(--text-main)'
                                        }}
                                    >
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                    {filteredOrders.length === 0 ? (
                                        <div className="card" style={{ gridColumn: '1/-1', padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            No orders placed during this period.
                                        </div>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <div key={order.status} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ 
                                                        fontSize: '0.75rem', 
                                                        fontWeight: 700, 
                                                        textTransform: 'uppercase', 
                                                        padding: '4px 8px', 
                                                        borderRadius: '6px',
                                                        background: order.status === 'delivered' ? 'rgba(16, 185, 129, 0.1)' : 
                                                                    order.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 
                                                                    order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                                        color: order.status === 'delivered' ? '#10b981' : 
                                                               order.status === 'pending' ? '#f59e0b' : 
                                                               order.status === 'cancelled' ? '#ef4444' : '#6b7280'
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                    <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{order.count}</span>
                                                </div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>Total Revenue:</div>
                                                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{formatPrice(order.revenue)}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* 3. Abandoned / Active Carts Table */}
                            <div>
                                <h2 style={{ fontSize: '1.3rem', marginBottom: '8px', fontWeight: 600 }}>Active Customer Carts ({analytics.activeCarts.length})</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>List of customers with items in their cart. Click on any customer's email to view their cart details.</p>
                                
                                {analytics.activeCarts.length === 0 ? (
                                    <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        No active customer carts at this moment.
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px', background: '#fff' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                            <thead>
                                                <tr style={{ background: '#fafbfc', borderBottom: '1px solid var(--border)' }}>
                                                    <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-muted)' }}>Customer Email</th>
                                                    <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-muted)' }}>Customer Name</th>
                                                    <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Total Items</th>
                                                    <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Total Value</th>
                                                    <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analytics.activeCarts.map((cart) => {
                                                    const isExpanded = expandedCartUserId === cart.userId;
                                                    return (
                                                        <>
                                                            <tr 
                                                                key={cart.userId} 
                                                                style={{ 
                                                                    borderBottom: '1px solid var(--border)', 
                                                                    background: isExpanded ? 'rgba(122, 56, 194, 0.03)' : 'transparent',
                                                                    transition: 'background 0.2s',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() => toggleCartExpand(cart.userId)}
                                                            >
                                                                <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--accent)' }}>
                                                                    {cart.email}
                                                                </td>
                                                                <td style={{ padding: '14px 18px', color: 'var(--text-main)' }}>
                                                                    {cart.name}
                                                                </td>
                                                                <td style={{ padding: '14px 18px', textAlign: 'center', fontWeight: 500 }}>
                                                                    {cart.itemCount}
                                                                </td>
                                                                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                                                                    {formatPrice(cart.totalPrice)}
                                                                </td>
                                                                <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                                                                    <button style={{ 
                                                                        background: 'none', 
                                                                        border: 'none', 
                                                                        color: 'var(--accent)', 
                                                                        fontWeight: 600, 
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.85rem',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        margin: '0 auto'
                                                                    }}>
                                                                        {isExpanded ? 'Hide' : 'View'} 
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                                                                            <polyline points="6 9 12 15 18 9"></polyline>
                                                                        </svg>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                            {isExpanded && (
                                                                <tr style={{ background: '#fafbfc' }}>
                                                                    <td colSpan="5" style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
                                                                        <div style={{ border: '1px solid var(--border)', borderRadius: '8px', background: '#fff', overflow: 'hidden' }}>
                                                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                                                                <thead>
                                                                                    <tr style={{ background: '#f5f6f8', borderBottom: '1px solid var(--border)' }}>
                                                                                        <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-muted)' }}>Product Name</th>
                                                                                        <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-muted)' }}>Variation</th>
                                                                                        <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Qty</th>
                                                                                        <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Price</th>
                                                                                        <th style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Subtotal</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {cart.items.map((item, idx) => (
                                                                                        <tr key={idx} style={{ borderBottom: idx === cart.items.length - 1 ? 'none' : '1px solid #f0f0f0' }}>
                                                                                            <td style={{ padding: '10px 14px', color: 'var(--text-main)', fontWeight: 500 }}>{item.productName}</td>
                                                                                            <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{item.selectedVariation || '-'}</td>
                                                                                            <td style={{ padding: '10px 14px', textAlign: 'center' }}>{item.quantity}</td>
                                                                                            <td style={{ padding: '10px 14px', textAlign: 'right' }}>{formatPrice(item.price)}</td>
                                                                                            <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>{formatPrice(item.subtotal)}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
