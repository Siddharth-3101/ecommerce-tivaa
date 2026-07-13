"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { Calendar, Trash2 } from "lucide-react";
import Heading from "@/components/Heading";

export default function MyOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    
    // Filters state
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [dateFilter, setDateFilter] = useState("All Time");
    const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

    const limit = 6;
    const user = getUser();

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }

        const fetchOrders = async () => {
            try {
                const res = await api.get(`/orders/my?t=${Date.now()}`);
                setOrders(res.data || []);
            } catch (err) {
                console.error("Failed to load orders:", err);
                setError("Could not retrieve your orders. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    const handleRetryPayment = async (orderId, totalAmount) => {
        setSubmitting(true);
        try {
            const payOrderRes = await api.post("/payment/order", {
                amount: totalAmount,
                currency: "INR",
                order_id: orderId
            });
            const razorpayOrder = payOrderRes.data;

            const options = {
                key: razorpayOrder.key_id || "rzp_test_51NgC2HSJ34m7p8",
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "Tivaa Elegance",
                description: `Order #TEJWL${String(orderId).padStart(2, '0')}`,
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    try {
                        setSubmitting(true);
                        await api.post("/payment/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_id: orderId,
                        });
                        window.dispatchEvent(new Event('cart-updated'));
                        // Refresh the list
                        const res = await api.get(`/orders/my?t=${Date.now()}`);
                        setOrders(res.data || []);
                        alert("Payment successful!");
                        router.push(`/orders/${orderId}?success=true`);
                    } catch (verifyErr) {
                        alert("Payment verification failed. Please contact support.");
                    } finally {
                        setSubmitting(false);
                    }
                },
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
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

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "delivered":
            case "paid":
                return { background: "#ecfdf5", color: "#10b981" };
            case "out for delivery":
            case "shipped":
                return { background: "#ecfdf5", color: "#10b981" };
            case "processing":
                return { background: "#eff6ff", color: "#3b82f6" };
            case "pending":
                return { background: "#fffbeb", color: "#d97706" };
            case "cancelled":
            case "refunded":
                return { background: "#f1f5f9", color: "#64748b" };
            default:
                return { background: "#f8fafc", color: "#475569" };
        }
    };

    const getStatusSubtext = (order) => {
        const status = order.order_status?.toLowerCase();
        const createdDate = new Date(order.created_at);
        
        if (status === "delivered") {
            const delDate = new Date(createdDate);
            delDate.setDate(createdDate.getDate() + 2);
            return {
                text: `Delivered on ${delDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`,
                icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                )
            };
        }
        if (status === "cancelled" || status === "refunded") {
            const cancelDate = new Date(createdDate);
            return {
                text: `${status === "refunded" ? "Refunded" : "Cancelled"} on ${cancelDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`,
                icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                )
            };
        }
        if (status === "pending") {
            return {
                text: "Payment Pending",
                icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                )
            };
        }
        
        return { text: "", icon: null };
    };

    const formatOrderDateTime = (dateStr) => {
        if (!dateStr) return { date: "", time: "" };
        const date = new Date(dateStr);
        const monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        const day = date.getDate();
        const month = monthsFull[date.getMonth()];
        const year = date.getFullYear();
        
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        
        return {
            date: `${month} ${day}, ${year}`,
            time: `${hours}:${minutes} ${ampm}`
        };
    };

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(15,23,42,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <p style={{ color: 'var(--text-muted)' }}>Retrieving your order history...</p>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        if (statusFilter && statusFilter !== "All Status") {
            if (order.order_status?.toLowerCase() !== statusFilter.toLowerCase()) {
                return false;
            }
        }
        
        if (dateFilter && dateFilter !== "All Time") {
            const orderDate = new Date(order.created_at);
            const now = new Date();
            
            const orderDateDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
            const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            const diffTime = todayDay - orderDateDay;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (dateFilter === "Today") {
                if (diffDays !== 0) return false;
            } else if (dateFilter === "Yesterday") {
                if (diffDays !== 1) return false;
            } else if (dateFilter === "This Week") {
                if (diffDays > 7) return false;
            } else if (dateFilter === "Last Week") {
                if (diffDays < 7 || diffDays > 14) return false;
            } else if (dateFilter === "This Month") {
                if (diffDays > 30) return false;
            }
        }
        return true;
    });

    const handleClearFilters = () => {
        setStatusFilter("All Status");
        setDateFilter("All Time");
        setPage(1);
    };

    // Pagination
    const total = filteredOrders.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedOrders = filteredOrders.slice(offset, offset + limit);

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px 0 60px' }}>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
                
                {/* Header Title section */}
                <div style={{ marginBottom: '12px' }}>
                    <Heading as="h1" variant="HomeHeader2">My Orders</Heading>
                </div>

                {/* Filters card */}
                <div className="filters-card">
                    <div className="filter-group">
                        <div className="filter-item">
                            <label className="filter-label">Order Status</label>
                            <select 
                                value={statusFilter} 
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="filter-select"
                            >
                                <option value="All Status">All Status</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="processing">Confirmed</option>
                                <option value="Pending">Pending</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>

                        <div className="filter-item" style={{ position: 'relative' }}>
                            <label className="filter-label">Date</label>
                            <button 
                                type="button" 
                                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                                className="filter-dropdown-btn"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Calendar size={16} color="#64748b" />
                                    <span>{dateFilter}</span>
                                </div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </button>
                            {isDateDropdownOpen && (
                                <div className="custom-dropdown-options">
                                    {["Today", "Yesterday", "This Week", "Last Week", "This Month", "All Time"].map(option => (
                                        <button
                                            key={option}
                                            onClick={() => {
                                                setDateFilter(option);
                                                setPage(1);
                                                setIsDateDropdownOpen(false);
                                            }}
                                            className={`dropdown-option-item ${dateFilter === option ? 'active' : ''}`}
                                        >
                                            <Calendar size={14} />
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button 
                        type="button" 
                        onClick={handleClearFilters}
                        className="clear-filters-btn"
                    >
                        <span>Clear Filters</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
                    </button>
                </div>

                {error && (
                    <div style={{ padding: '14px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#b91c1c', marginBottom: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                {/* Orders Cards List */}
                {filteredOrders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon-circle">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        </div>
                        <h3>No orders found</h3>
                        <p>No orders match the selected filters. Click "Clear Filters" or search for other products.</p>
                        <Link href="/products" className="empty-action-btn">
                            Explore Products
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {paginatedOrders.map((order) => {
                            const dateDetails = formatOrderDateTime(order.created_at);
                            const statusSub = getStatusSubtext(order);
                            const itemCount = order.items?.length || 0;
                            const isPending = order.order_status?.toLowerCase() === "pending";

                            return (
                                <div key={order.id} className="order-card-row">
                                    
                                    {/* Thumbnail preview */}
                                    <div className="thumbnails-wrapper">
                                        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', height: '44px', width: '60px', justifyContent: 'center' }}>
                                            {(order.items || []).slice(0, 2).map((item, idx) => (
                                                <div key={item.id} style={{
                                                    width: '38px',
                                                    height: '38px',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    border: '2px solid #ffffff',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                                    marginLeft: idx > 0 ? '-18px' : '0',
                                                    zIndex: 5 - idx,
                                                    background: '#f8fafc',
                                                    flexShrink: 0
                                                }}>
                                                    <img 
                                                        src={item.image_url ? item.image_url.split(",")[0].trim() : "/placeholder.png"} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                        alt={item.name} 
                                                    />
                                                </div>
                                            ))}
                                            {itemCount > 2 && (
                                                <div className="more-count-badge">
                                                    +{itemCount - 2}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Column 2: Order Meta Info */}
                                    <div className="order-meta-info">
                                        <h3 className="order-title-text">Order #TEJWL{String(order.id).padStart(2, '0')}</h3>
                                        <div className="order-date-text">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                            <span>{dateDetails.date} &bull; {dateDetails.time}</span>
                                        </div>
                                        <span className="items-count-badge">{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
                                    </div>

                                    {/* Column 3: Amount Info */}
                                    <div className="price-info-box">
                                        <label className="column-info-label">Amount</label>
                                        <strong className="order-price-bold">₹{Number(order.total || 0).toFixed(2)}</strong>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px' }}>
                                            <label className="column-info-label">Payment Method</label>
                                            <span className="payment-method-text">{order.payment_method}</span>
                                        </div>
                                    </div>

                                    {/* Column 4: Status Badge Info */}
                                    <div className="status-info-box">
                                        <label className="column-info-label">Status</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                                            <span 
                                                className="status-pill-badge"
                                                style={getStatusStyle(order.order_status)}
                                            >
                                                {order.order_status?.toLowerCase() === "processing" ? "Confirmed" : order.order_status}
                                            </span>
                                            {statusSub.text && (
                                                <div className="status-delivery-subrow">
                                                    {statusSub.icon}
                                                    <span>{statusSub.text}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Column 5: Action Button Row */}
                                    <div className="action-buttons-box">
                                        {isPending && (
                                            <button
                                                type="button"
                                                onClick={() => handleRetryPayment(order.id, order.total)}
                                                disabled={submitting}
                                                className="pay-now-action-btn"
                                            >
                                                {submitting ? "Processing..." : "Pay Now"}
                                            </button>
                                        )}
                                        <Link 
                                            href={`/orders/${order.id}`}
                                            className="view-details-action-btn"
                                            style={{
                                                padding: '7px 14px',
                                                background: 'var(--accent)',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                transition: 'background 0.2s',
                                                fontFamily: 'var(--font-poppins), sans-serif',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
                                        >
                                            <span>View Details</span>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                        </Link>
                                    </div>

                                </div>
                            );
                        })}

                        {/* Pagination Selector bar */}
                        <div className="pagination-container">
                            <span className="pagination-count-summary">
                                Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} orders
                            </span>
                            
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <button
                                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                        disabled={page === 1}
                                        className="pag-nav-btn"
                                    >
                                        &lt;
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`pag-num-btn ${page === p ? 'active' : ''}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={page === totalPages}
                                        className="pag-nav-btn"
                                    >
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>

            <style jsx>{`
                .filters-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 8px 14px;
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    gap: 16px;
                    margin-bottom: 12px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
                    flex-wrap: wrap;
                }
                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                }
                .filter-item {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .filter-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .filter-select {
                    padding: 10px 32px 10px 14px;
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    font-size: 0.88rem;
                    color: #1e293b;
                    cursor: pointer;
                    min-width: 180px;
                    appearance: none;
                    font-weight: 500;
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    background-size: 16px;
                    transition: border-color 0.2s;
                }
                .filter-select:focus {
                    border-color: var(--accent);
                    outline: none;
                }
                .filter-dropdown-btn {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    font-size: 0.88rem;
                    color: #1e293b;
                    cursor: pointer;
                    min-width: 180px;
                    font-weight: 500;
                    transition: border-color 0.2s;
                }
                .filter-dropdown-btn:focus {
                    border-color: var(--accent);
                    outline: none;
                }
                .custom-dropdown-options {
                    position: absolute;
                    top: calc(100% + 4px);
                    left: 0;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    zIndex: 100;
                    min-width: 180px;
                    padding: 4px 0;
                }
                .dropdown-option-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 10px 14px;
                    background: transparent;
                    border: none;
                    font-size: 0.85rem;
                    color: #475569;
                    text-align: left;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background 0.15s, color 0.15s;
                }
                .dropdown-option-item:hover {
                    background: #f8fafc;
                }
                .dropdown-option-item.active {
                    background: #f0fdf4;
                    color: #10b981;
                }
                .clear-filters-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    background: #ffffff;
                    border: 1px solid var(--accent);
                    border-radius: 8px;
                    font-size: 0.88rem;
                    font-weight: 600;
                    color: var(--accent);
                    cursor: pointer;
                    transition: all 0.2s;
                    align-self: flex-end;
                }
                .clear-filters-btn:hover {
                    background: var(--accent-glow);
                }
                .order-card-row {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 8px 16px;
                    display: grid;
                    grid-template-columns: 80px 2.2fr 1.3fr 1.5fr 1.5fr;
                    align-items: center;
                    gap: 12px;
                    transition: box-shadow 0.2s, transform 0.2s;
                }
                .order-card-row:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                    transform: translateY(-1px);
                }
                .thumbnails-wrapper {
                    display: flex;
                    align-items: center;
                }
                .more-count-badge {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: rgba(15, 23, 42, 0.85);
                    color: #ffffff;
                    font-size: 0.62rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: -9px;
                    zIndex: 6;
                    border: 2px solid #ffffff;
                }
                .order-meta-info {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .order-title-text {
                    font-size: 0.92rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                    font-family: var(--font-poppins);
                }
                .order-date-text {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .items-count-badge {
                    font-size: 0.72rem;
                    color: #64748b;
                    font-weight: 600;
                }
                .column-info-label {
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 2px;
                    display: block;
                }
                .order-price-bold {
                    font-size: 1.0rem;
                    color: #0d9488;
                    font-weight: 800;
                    font-family: var(--font-poppins);
                }
                .payment-method-text {
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #334155;
                }
                .status-pill-badge {
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    display: inline-block;
                }
                .status-delivery-subrow {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.72rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .action-buttons-box {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    justify-content: center;
                    align-items: stretch;
                }
                .pay-now-action-btn {
                    padding: 6px 12px;
                    background: var(--accent);
                    color: #ffffff;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.76rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: opacity 0.2s;
                    text-align: center;
                }
                .pay-now-action-btn:hover {
                    opacity: 0.9;
                }
                .view-details-action-btn {
                    padding: 7px 14px;
                    background: var(--accent);
                    color: #ffffff;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: background 0.2s;
                    font-family: var(--font-poppins), sans-serif;
                }
                .view-details-action-btn:hover {
                    background: var(--accent-hover);
                }
                .empty-state {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 60px 40px;
                    text-align: center;
                    max-width: 540px;
                    margin: 40px auto 0;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }
                .empty-icon-circle {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    margin: 0 auto 20px;
                }
                .empty-state h3 {
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 8px 0;
                }
                .empty-state p {
                    color: #64748b;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    margin: 0 0 24px 0;
                }
                .empty-action-btn {
                    display: inline-block;
                    padding: 10px 24px;
                    background: var(--accent);
                    color: #ffffff;
                    border-radius: 8px;
                    font-size: 0.88rem;
                    font-weight: 700;
                    text-decoration: none;
                    transition: opacity 0.2s;
                }
                .empty-action-btn:hover {
                    opacity: 0.9;
                }
                .pagination-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 20px;
                    padding-top: 12px;
                    border-top: 1px solid #e2e8f0;
                }
                .pagination-count-summary {
                    font-size: 0.82rem;
                    color: #64748b;
                    font-weight: 500;
                }
                .pag-nav-btn {
                    padding: 6px 12px;
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #475569;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .pag-nav-btn:hover:not(:disabled) {
                    background: #f8fafc;
                }
                .pag-nav-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .pag-num-btn {
                    width: 32px;
                    height: 32px;
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    border-radius: 50%;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #475569;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .pag-num-btn:hover {
                    background: #f8fafc;
                }
                .pag-num-btn.active {
                    background: var(--accent);
                    border-color: var(--accent);
                    color: #ffffff;
                }

                @media (max-width: 900px) {
                    .order-card-row {
                        grid-template-columns: 1fr;
                        padding: 14px;
                        gap: 12px;
                    }
                    .price-info-box, .status-info-box {
                        border-top: 1px solid #f1f5f9;
                        padding-top: 12px;
                    }
                    .action-buttons-box {
                        margin-top: 8px;
                    }
                }
                @media (max-width: 600px) {
                    .filters-card {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .filter-group {
                        flex-direction: column;
                        align-items: stretch;
                        width: 100%;
                    }
                    .filter-select, .filter-dropdown-btn {
                        min-width: 100%;
                    }
                    .clear-filters-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
}
