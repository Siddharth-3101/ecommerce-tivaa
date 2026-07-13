"use client";

import { useEffect, useState, use } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { 
    ArrowLeft, 
    Download, 
    ShoppingCart, 
    FileText, 
    CreditCard, 
    IndianRupee, 
    MapPin, 
    Headphones, 
    X, 
    AlertCircle, 
    CircleHelp,
    Calendar
} from "lucide-react";
import Heading from "@/components/Heading";

// Reusable progress steps bar matching mockup styling
function CheckoutSteps({ currentStep = 5 }) {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        setIsMobile(window.innerWidth <= 768);
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const getStepIcon = (stepId) => {
        const v = "?v=2";
        if (stepId === 1) return `/cart.png${v}`;
        if (stepId === 2) return `/Address.png${v}`;
        
        // For Review (3), Payment (4), and Complete (5)
        const isCurrentOrCompleted = stepId <= currentStep;
        if (stepId === 3) {
            return isCurrentOrCompleted ? `/review_green.png${v}` : `/review_white.png${v}`;
        }
        if (stepId === 4) {
            return isCurrentOrCompleted ? `/payment_green.png${v}` : `/payment_white.png${v}`;
        }
        if (stepId === 5) {
            return isCurrentOrCompleted ? `/complete_green.png${v}` : `/complete_white.png${v}`;
        }
        return "";
    };

    const steps = [
        { id: 1, name: "Cart" },
        { id: 2, name: "Address" },
        { id: 3, name: "Review" },
        { id: 4, name: "Payment" },
        { id: 5, name: "Complete" }
    ];

    const badgeSize = isMobile ? '20px' : '28px';
    const connectorTop = isMobile ? '10px' : '14px';
    const labelFontSize = isMobile ? '10px' : '11px';
    const labelMarginTop = isMobile ? '6px' : '8px';

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '680px',
            margin: '0 auto 36px auto',
            padding: '0 16px',
            position: 'relative',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {steps.map((step, idx) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                return (
                    <div key={step.id} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                        flex: 1
                    }}>
                        {idx > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: connectorTop,
                                left: '-50%',
                                width: '100%',
                                height: '2px',
                                backgroundColor: idx < currentStep ? 'var(--accent)' : '#e2e8f0',
                                zIndex: 1
                            }}></div>
                        )}
                        <div style={{
                            width: badgeSize,
                            height: badgeSize,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                            position: 'relative'
                        }}>
                            <img 
                                src={getStepIcon(step.id)} 
                                alt={step.name} 
                                style={{ width: badgeSize, height: badgeSize, objectFit: 'contain' }}
                            />
                        </div>
                        <span style={{
                            fontSize: labelFontSize,
                            fontWeight: '600',
                            color: isActive || isCompleted ? 'var(--accent)' : '#94a3b8',
                            marginTop: labelMarginTop,
                            transition: 'all 0.3s ease',
                            textAlign: 'center'
                        }}>
                            {step.name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default function OrderDetailsPage({ params }) {
    const { id } = use(params);
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const searchParams = useSearchParams();
    const isSuccess = searchParams.get("success") === "true";
    const router = useRouter();
    const user = typeof window !== 'undefined' ? getUser() : null;

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
                        const updatedRes = await api.get(`/orders/my/${order.id}?t=${Date.now()}`);
                        setOrderData(updatedRes.data);
                        alert("Payment successful!");
                        router.push(`/orders/${order.id}?success=true`);
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

    const handleBuyAgain = async () => {
        try {
            setSubmitting(true);
            let successCount = 0;
            let failedItems = [];

            for (const item of items) {
                try {
                    await api.post("/cart", {
                        product_id: item.product_id,
                        quantity: item.quantity,
                        selected_variation: item.selected_variation || null
                    });
                    successCount++;
                } catch (err) {
                    console.error(`Failed to add item ${item.name} to cart:`, err);
                    failedItems.push(item.name);
                }
            }

            // Dispatch event to update navbar/cart indicators
            window.dispatchEvent(new Event('cart-updated'));

            if (failedItems.length > 0) {
                if (successCount > 0) {
                    alert(`Some items were added to your cart. However, the following item(s) could not be added (possibly out of stock): ${failedItems.join(", ")}`);
                    router.push("/cart");
                } else {
                    alert(`Could not add items to cart. They might be out of stock: ${failedItems.join(", ")}`);
                }
            } else {
                router.push("/cart");
            }
        } catch (err) {
            console.error("❌ Buy Again Error:", err);
            alert("Failed to add items to cart. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const hasSuccessParam = searchParams.has("success");
    const customerName = order.customer_name || user?.name || "Customer";
    const firstName = customerName.split(" ")[0];

    const formatOrderDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    };

    const getStatusBadgeStyle = (status) => {
        const s = status?.toLowerCase();
        if (s === 'delivered' || s === 'paid' || s === 'out for delivery' || s === 'completed') {
            return {
                backgroundColor: 'rgba(15, 157, 148, 0.08)',
                color: 'var(--accent)',
                border: '1px solid rgba(15, 157, 148, 0.15)'
            };
        }
        if (s === 'pending' || s === 'processing') {
            return {
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                border: '1px solid #FDE68A'
            };
        }
        if (s === 'cancelled' || s === 'refunded') {
            return {
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                border: '1px solid #FCA5A5'
            };
        }
        return {
            backgroundColor: '#F3F4F6',
            color: '#4B5563',
            border: '1px solid #E5E7EB'
        };
    };

    return (
        <div className="order-details-container animate-fade-in">
            {hasSuccessParam && (
                <div style={{ marginBottom: '36px' }}>
                    <CheckoutSteps currentStep={isSuccess ? 5 : 4} />
                </div>
            )}

            {hasSuccessParam ? (
                <div className="status-parent-card">
                    {/* Step progress bar or banner */}
                    <div className="status-banner-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h2>{isSuccess ? "Order Placed Successfully!" : "Payment Failed / Pending"}</h2>
                        </div>
                        
                        {isSuccess && (
                            <button 
                                type="button" 
                                className="status-download-btn"
                                title="Download Invoice"
                                onClick={async () => {
                                    const { downloadInvoice } = await import("@/lib/invoice");
                                    downloadInvoice(order, items);
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            </button>
                        )}
                    </div>

                    <div className="status-card-body">
                        {/* Left Side checkmark or error mark */}
                        <div className={`status-icon-circle ${isSuccess ? "success" : "failure"}`}>
                            {isSuccess ? (
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : (
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            )}
                        </div>

                        {/* Right Side details */}
                        <div className="status-details-content">
                            <h3>{isSuccess ? `Thank you, ${firstName}! 🎉` : `Payment Issue, ${firstName}`}</h3>
                            <p className="status-main-desc">
                                {isSuccess ? "Your order has been placed successfully." : "We couldn't process your payment. Your order remains pending."}
                            </p>
                            <div className="status-meta-row">
                                <span className="status-order-id">Order ID: TEJWL{String(order.id).padStart(2, '0')}</span>
                                <span className="status-meta-separator">|</span>
                                <span className="status-date">{formatOrderDate(order.created_at)}</span>
                            </div>
                            <p className="status-notifications-desc">
                                {isSuccess ? (
                                    <>We've sent the order details to <strong>{order.customer_email || "your email"}</strong></>
                                ) : (
                                    <>You can retry the payment below to complete your order or contact customer support.</>
                                )}
                            </p>

                            <div className="status-actions-row">
                                {isSuccess ? (
                                    <button 
                                        type="button" 
                                        className="track-order-btn" 
                                        onClick={() => router.push(`/orders/${order.id}`)}
                                    >
                                        Track Order
                                    </button>
                                ) : (
                                    <button 
                                        type="button" 
                                        disabled={submitting} 
                                        className="track-order-btn" 
                                        onClick={handleRetryPayment}
                                    >
                                        {submitting ? "Processing..." : "Pay Now"}
                                    </button>
                                )}
                                
                                <Link href="/" className="continue-shopping-btn">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* MAIN REDESIGNED ORDER DETAILS SCREEN */
                <>
                    {/* DESKTOP HEADER */}
                    <div className="desktop-header">
                        <div className="desktop-header-left" style={{ alignItems: 'flex-start', gap: '8px' }}>
                            <Link 
                                href="/orders" 
                                className="continue-shopping-btn"
                                style={{
                                    background: '#ffffff',
                                    color: 'var(--accent)',
                                    border: '1.5px solid var(--accent)',
                                    borderRadius: '8px',
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textDecoration: 'none',
                                    height: '32px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    boxSizing: 'border-box',
                                    marginBottom: '4px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                            >
                                <ArrowLeft size={14} /> Back to Orders
                            </Link>
                            <Heading as="h1" variant="HomeHeader2" className="order-title" style={{ margin: 0 }}>Order #TEJWL{String(order.id).padStart(2, '0')}</Heading>
                        </div>
                        <div className="header-actions">
                            <button className="btn-outline" onClick={async () => {
                                const { downloadInvoice } = await import("@/lib/invoice");
                                downloadInvoice(order, items);
                            }}>
                                <Download size={15} style={{ color: 'var(--accent)' }} /> Download Bill
                            </button>
                            {order.order_status?.toLowerCase() === "pending" ? (
                                <button className="btn btn-primary" onClick={handleRetryPayment} disabled={submitting} style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>
                                    Pay Now
                                </button>
                            ) : (
                                <button className="btn-outline" onClick={handleBuyAgain} disabled={submitting}>
                                    <ShoppingCart size={15} style={{ color: 'var(--accent)' }} /> Buy Again
                                </button>
                            )}
                        </div>
                    </div>

                    {/* MOBILE HEADER */}
                    <div className="mobile-header-bar">
                        <Link href="/orders" className="mobile-back-btn">
                            <ArrowLeft size={20} /> Order Details
                        </Link>
                        <Link href="/contact" className="mobile-support-link">
                            <Headphones size={20} />
                        </Link>
                    </div>

                    <div className="mobile-title-block">
                        <div className="mobile-title-row">
                            <Heading as="h2" variant="HomeHeader2">Order #TEJWL{String(order.id).padStart(2, '0')}</Heading>
                            <span className="status-badge" style={getStatusBadgeStyle(order.order_status)}>
                                {order.order_status?.toLowerCase() === "processing" ? "Confirmed" : order.order_status}
                            </span>
                        </div>
                    </div>

                    {/* MOBILE HIGHLIGHT PILLS */}
                    <div className="mobile-pills-row">
                        <div className="mobile-pill">
                            <div className="mobile-pill-icon-wrapper">
                                <FileText size={16} />
                            </div>
                            <span className="mobile-pill-value" style={{ color: 'var(--accent)' }}>
                                {order.order_status === 'paid' || order.order_status === 'delivered' || order.order_status === 'completed' ? 'Paid' : (order.order_status?.toLowerCase() === "processing" ? "Confirmed" : "Pending")}
                            </span>
                            <span className="mobile-pill-label">Payment</span>
                        </div>
                        
                        <div className="mobile-pill">
                            <div className="mobile-pill-icon-wrapper">
                                <IndianRupee size={16} />
                            </div>
                            <span className="mobile-pill-value" style={{ color: 'var(--accent)' }}>
                                ₹{Number(order.total).toFixed(2)}
                            </span>
                            <span className="mobile-pill-label">Total Amount</span>
                        </div>

                        <div className="mobile-pill">
                            <div className="mobile-pill-icon-wrapper">
                                <CreditCard size={16} />
                            </div>
                            <span className="mobile-pill-value" style={{ color: 'var(--text-main)', textTransform: 'capitalize' }}>
                                {order.payment_method}
                            </span>
                            <span className="mobile-pill-label">Payment Method</span>
                        </div>
                    </div>

                    {/* DESKTOP HIGHLIGHTS GRID */}
                    <div className="highlights-grid">
                        <div className="highlight-card">
                            <div className="highlight-icon-wrapper">
                                <FileText size={16} />
                            </div>
                            <div className="highlight-info">
                                <span className="highlight-label">Status</span>
                                <div>
                                    <span className="status-badge" style={getStatusBadgeStyle(order.order_status)}>
                                        {order.order_status?.toLowerCase() === "processing" ? "Confirmed" : order.order_status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="highlight-card">
                            <div className="highlight-icon-wrapper">
                                <CreditCard size={16} />
                            </div>
                            <div className="highlight-info">
                                <span className="highlight-label">Payment</span>
                                <div>
                                    <span className="status-badge" style={getStatusBadgeStyle(order.order_status === 'paid' || order.order_status === 'delivered' || order.order_status === 'completed' ? 'paid' : 'pending')}>
                                        {order.order_status === 'paid' || order.order_status === 'delivered' || order.order_status === 'completed' ? 'Paid' : (order.order_status?.toLowerCase() === "processing" ? "Confirmed" : "Pending")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="highlight-card">
                            <div className="highlight-icon-wrapper">
                                <IndianRupee size={16} />
                            </div>
                            <div className="highlight-info">
                                <span className="highlight-label">Total Amount</span>
                                <span className="highlight-value" style={{ color: 'var(--accent)' }}>₹{Number(order.total).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="highlight-card">
                            <div className="highlight-icon-wrapper">
                                <CreditCard size={16} />
                            </div>
                            <div className="highlight-info">
                                <span className="highlight-label">Payment Method</span>
                                <span className="highlight-value" style={{ textTransform: 'capitalize' }}>{order.payment_method}</span>
                            </div>
                        </div>
                    </div>

                    {/* DESKTOP BAR: ORDER INFORMATION */}
                    <div className="order-info-bar">
                        <div className="info-col">
                            <span className="info-label">Order ID</span>
                            <span className="info-value">TEJWL{String(order.id).padStart(2, '0')}</span>
                        </div>
                        <div className="info-divider"></div>
                        <div className="info-col">
                            <span className="info-label">Date</span>
                            <span className="info-value">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="info-divider"></div>
                        <div className="info-col">
                            <span className="info-label">Payment Method</span>
                            <span className="info-value" style={{ textTransform: 'capitalize' }}>{order.payment_method}</span>
                        </div>
                        <div className="info-divider"></div>
                        <div className="info-col">
                            <span className="info-label">Payment Status</span>
                            <div>
                                <span className="status-badge" style={getStatusBadgeStyle(order.order_status === 'paid' || order.order_status === 'delivered' || order.order_status === 'completed' ? 'paid' : order.order_status)}>
                                    {order.order_status === 'paid' || order.order_status === 'delivered' || order.order_status === 'completed' ? 'Paid' : (order.order_status?.toLowerCase() === "processing" ? "Confirmed" : order.order_status)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* THREE-COLUMN GRID */}
                    <div className="order-grid">
                        {/* Shipping Address */}
                        <div className="grid-card shipping-card-wrapper">
                            <div className="card-header">
                                <div className="card-title-group">
                                    <MapPin size={18} className="card-title-icon" />
                                    <h3>Shipping Address</h3>
                                </div>
                            </div>
                            <div className="shipping-info">
                                <span className="shipping-name">{order.customer_name || user?.name || "Customer"}</span>
                                <span className="shipping-phone">{order.phone || ""}</span>
                                <span className="shipping-address-text">
                                    {order.address ? `${order.address},\n${order.city ? order.city : ""}${order.pincode ? ` - ${order.pincode}` : ""}${order.state ? `, ${order.state}` : ""}` : "No address specified."}
                                </span>
                            </div>
                        </div>

                        {/* Price Details */}
                        <div className="grid-card price-card-wrapper">
                            <div className="card-header">
                                <div className="card-title-group">
                                    <h3>Price Details</h3>
                                </div>
                            </div>
                            <div className="price-details-list">
                                <div className="price-row">
                                    <span>Subtotal ({items.reduce((acc, it) => acc + (it.quantity || 1), 0)} {items.reduce((acc, it) => acc + (it.quantity || 1), 0) === 1 ? 'item' : 'items'})</span>
                                    <span>₹{items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0).toFixed(2)}</span>
                                </div>
                                <div className="price-row">
                                    <span>Shipping</span>
                                    <span style={{ color: 'var(--success)', fontWeight: '600' }}>FREE</span>
                                </div>
                                <div className="price-row">
                                    <span>Coupon Discount</span>
                                    <span style={{ color: 'var(--success)' }}>- ₹0.00</span>
                                </div>
                                <div className="price-row">
                                    <span>Taxes</span>
                                    <span>₹{Number(order.shipping_cost || 0).toFixed(2)}</span>
                                </div>
                                
                                <div className="price-row total-row">
                                    <span className="price-total-label">Total Amount</span>
                                    <span className="price-total-value">₹{Number(order.total).toFixed(2)}</span>
                                </div>

                                <div className="price-subtext-row">
                                    <span>Paid via {order.payment_method === 'cod' ? 'COD' : 'Razorpay'}</span>
                                    <span className="status-badge" style={getStatusBadgeStyle(order.order_status === 'paid' || order.order_status === 'delivered' || order.order_status === 'completed' ? 'paid' : order.order_status)}>
                                        {order.order_status === 'paid' || order.order_status === 'delivered' || order.order_status === 'completed' ? 'Paid' : (order.order_status?.toLowerCase() === "processing" ? "Confirmed" : order.order_status)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="grid-card items-card-wrapper">
                            <div className="card-header">
                                <div className="card-title-group">
                                    <h3>Order Items ({items.length})</h3>
                                </div>
                            </div>
                            <div className="items-list">
                                {items.map(item => (
                                    <div key={item.id} className="item-row">
                                        <div className="item-left">
                                            <div className="item-image-wrapper">
                                                <img 
                                                    src={item.image_url ? item.image_url.split(",")[0].trim() : "https://placehold.co/100x100?text=Premium"} 
                                                    className="item-img" 
                                                    alt={item.name} 
                                                />
                                            </div>
                                            <div className="item-details">
                                                <span className="item-name">{item.name}</span>
                                                {item.selected_variation && (
                                                    <span className="item-variant">
                                                        Variant: {item.selected_variation}
                                                    </span>
                                                )}
                                                <span className="item-qty">Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                        <div className="item-price">
                                            ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>


                    {/* DESKTOP BOTTOM BAR 2: NEED HELP */}
                    <div className="need-help-bar">
                        <div className="help-left">
                            <div className="help-icon-wrapper">
                                <Headphones size={18} />
                            </div>
                            <div>
                                <h4 className="help-title">Need Help?</h4>
                                <p className="help-subtitle">We're here to help you with your order</p>
                            </div>
                        </div>
                        <Link href="/contact" className="btn-outline-green">
                            Contact Support
                        </Link>
                    </div>

                    {/* MOBILE FIXED BOTTOM ACTIONS BAR */}
                    <div className="mobile-bottom-actions">
                        <button className="mobile-btn-download" onClick={async () => {
                            const { downloadInvoice } = await import("@/lib/invoice");
                            downloadInvoice(order, items);
                        }}>
                            <Download size={16} style={{ color: 'var(--accent)' }} /> Download Bill
                        </button>
                        {order.order_status?.toLowerCase() === "pending" ? (
                            <button className="mobile-btn-buy" onClick={handleRetryPayment} disabled={submitting}>
                                Pay Now
                            </button>
                        ) : (
                            <button className="mobile-btn-buy" onClick={handleBuyAgain} disabled={submitting}>
                                <ShoppingCart size={16} /> Buy Again
                            </button>
                        )}
                    </div>
                </>
            )}



            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            <style jsx global>{`
                /* Container padding and max-width */
                .order-details-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 16px 20px 48px 20px;
                    font-family: var(--font-poppins), sans-serif;
                }

                /* Desktop Header */
                .desktop-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 16px;
                }
                .desktop-header-left {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--accent);
                    margin-bottom: 8px;
                    transition: opacity 0.2s;
                    text-decoration: none;
                }
                .back-link:hover {
                    opacity: 0.8;
                }
                .order-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0;
                }
                .order-date {
                    display: inline-flex;
                    align-items: center;
                    font-size: 13px;
                    color: var(--text-muted);
                    margin: 0;
                    font-weight: 500;
                }
                .header-actions {
                    display: flex;
                    gap: 12px;
                }
                .btn-outline {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: #ffffff;
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    color: var(--text-main);
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-outline:hover {
                    background: #f8fafc;
                    border-color: var(--text-light);
                }

                /* Mobile Header & Elements (Hidden by default) */
                .mobile-header-bar {
                    display: none;
                }
                .mobile-title-block {
                    display: none;
                }
                .mobile-pills-row {
                    display: none;
                }
                .mobile-bottom-actions {
                    display: none;
                }

                /* Highlights Cards Grid (Desktop) */
                .highlights-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .highlight-card {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #ffffff;
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 10px 14px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.015);
                }
                .highlight-icon-wrapper {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    background: rgba(15, 157, 148, 0.08);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--accent);
                    flex-shrink: 0;
                }
                .highlight-info {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .highlight-label {
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .highlight-value {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text-main);
                }
                .status-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: capitalize;
                }

                /* Mid Section Grid */
                .order-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 16px;
                }
                .grid-card {
                    background: #ffffff;
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.015);
                    display: flex;
                    flex-direction: column;
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 8px;
                }
                .card-title-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .card-title-group h3 {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0;
                }
                .card-title-icon {
                    color: var(--text-muted);
                }
                .change-link {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--accent);
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                .change-link:hover {
                    text-decoration: underline;
                }

                /* Shipping Address Card Content */
                .shipping-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    font-size: 13px;
                    line-height: 1.6;
                }
                .shipping-name {
                    font-weight: 700;
                    color: var(--text-main);
                }
                .shipping-phone {
                    color: var(--text-muted);
                }
                .shipping-address-text {
                    color: var(--text-muted);
                    white-space: pre-line;
                }

                /* Order Items Card Content */
                .items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .item-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                    border-bottom: 1px solid #f8fafc;
                    padding-bottom: 8px;
                }
                .item-row:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }
                .item-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .item-image-wrapper {
                    width: 44px;
                    height: 44px;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #f9f9f9;
                    border: 1px solid var(--border);
                    flex-shrink: 0;
                }
                .item-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .item-details {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .item-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-main);
                    line-height: 1.4;
                }
                .item-qty {
                    font-size: 11px;
                    color: var(--text-muted);
                }
                .item-variant {
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .item-price {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text-main);
                    flex-shrink: 0;
                }

                /* Price Details Card Content */
                .price-details-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    font-size: 13px;
                }
                .price-row {
                    display: flex;
                    justify-content: space-between;
                    color: var(--text-muted);
                }
                .price-row.total-row {
                    border-top: 1px dashed var(--border);
                    padding-top: 10px;
                    margin-top: 4px;
                    color: var(--text-main);
                    align-items: center;
                }
                .price-total-label {
                    font-size: 13px;
                    font-weight: 700;
                }
                .price-total-value {
                    font-size: 15px;
                    font-weight: 800;
                    color: var(--accent);
                }
                .price-subtext-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 6px;
                    font-size: 11px;
                    color: var(--text-muted);
                }
                .price-subtext-row .status-badge {
                    font-size: 10px;
                }

                /* Bottom Sections (Desktop Only) */
                .order-info-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #ffffff;
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    padding: 12px 20px;
                    margin-bottom: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.015);
                }
                .info-col {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .info-label {
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .info-value {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text-main);
                }
                .info-divider {
                    width: 1px;
                    height: 24px;
                    background-color: var(--border);
                }

                .need-help-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #ffffff;
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    padding: 12px 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.015);
                }
                .help-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .help-icon-wrapper {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(15, 157, 148, 0.08);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--accent);
                }
                .help-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0;
                }
                .help-subtitle {
                    font-size: 13px;
                    color: var(--text-muted);
                    margin: 0;
                }
                .btn-outline-green {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: #ffffff;
                    border: 1px solid var(--accent);
                    border-radius: 10px;
                    color: var(--accent);
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-outline-green:hover {
                    background: rgba(15, 157, 148, 0.04);
                }

                /* Modals styling */
                .address-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(15, 30, 50, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .address-modal-card {
                    background: #ffffff;
                    border-radius: 18px;
                    padding: 28px;
                    max-width: 440px;
                    width: 90%;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-icon-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .modal-icon-title h3 {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0;
                }
                .close-modal-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: var(--text-light);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    border-radius: 50%;
                    transition: background 0.2s;
                }
                .close-modal-btn:hover {
                    background: #f1f5f9;
                }
                .modal-body {
                    font-size: 14px;
                    line-height: 1.5;
                    color: var(--text-muted);
                }
                .modal-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 8px;
                }
                .modal-btn-primary {
                    flex: 1;
                    background: var(--accent);
                    color: #ffffff !important;
                    border: none;
                    border-radius: 10px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                    text-decoration: none;
                }
                .modal-btn-primary:hover {
                    background: var(--accent-hover);
                }
                .modal-btn-secondary {
                    flex: 1;
                    background: #ffffff;
                    color: var(--text-main);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .modal-btn-secondary:hover {
                    background: #f8fafc;
                }

                /* STATUS SCREEN CARD STYLING */
                .status-parent-card {
                    background: #ffffff;
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 32px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    max-width: 800px;
                    margin: 40px auto;
                    box-sizing: border-box;
                }
                .status-banner-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 20px;
                    margin-bottom: 28px;
                }
                .status-step-badge {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: var(--accent);
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 700;
                }
                .status-banner-header h2 {
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--accent);
                    margin: 0;
                }
                .status-download-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: var(--accent);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    border-radius: 50%;
                    transition: background 0.2s;
                }
                .status-download-btn:hover {
                    background: #f1f5f9;
                }
                .status-card-body {
                    display: flex;
                    gap: 32px;
                    align-items: flex-start;
                }
                .status-icon-circle {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .status-icon-circle.success {
                    background: var(--accent);
                }
                .status-icon-circle.failure {
                    background: #ef4444;
                }
                .status-details-content {
                    flex: 1;
                    min-width: 0;
                }
                .status-details-content h3 {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0 0 8px 0;
                }
                .status-main-desc {
                    font-size: 14px;
                    color: var(--text-muted);
                    margin: 0 0 16px 0;
                    line-height: 1.5;
                }
                .status-meta-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 13px;
                    color: var(--text-muted);
                    background: #f8fafc;
                    padding: 10px 16px;
                    border-radius: 8px;
                    width: fit-content;
                    margin-bottom: 16px;
                }
                .status-meta-separator {
                    color: var(--border);
                }
                .status-order-id {
                    font-weight: 600;
                    color: var(--text-main);
                }
                .status-notifications-desc {
                    font-size: 13px;
                    color: var(--text-muted);
                    margin: 0 0 28px 0;
                    line-height: 1.5;
                }
                .status-actions-row {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }
                .track-order-btn {
                    background: var(--accent);
                    color: #ffffff;
                    border: none;
                    border-radius: 8px;
                    padding: 10px 24px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    height: 42px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .track-order-btn:hover {
                    background: var(--accent-hover, #008f7d);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px var(--accent-glow);
                }
                .continue-shopping-btn {
                    background: #ffffff !important;
                    color: var(--accent) !important;
                    border: 1.5px solid var(--accent) !important;
                    border-radius: 8px !important;
                    padding: 10px 24px !important;
                    font-size: 13px !important;
                    font-weight: 600 !important;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-decoration: none !important;
                    height: 42px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    box-sizing: border-box !important;
                }
                .continue-shopping-btn:hover {
                    background: #f0fdf4 !important;
                    color: var(--accent) !important;
                }

                @media (max-width: 900px) {
                    .status-parent-card {
                        padding: 24px 16px;
                        margin: 20px 10px;
                    }
                    .status-card-body {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        gap: 20px;
                    }
                    .status-meta-row {
                        margin: 0 auto 16px auto;
                    }
                    .status-actions-row {
                        flex-direction: column;
                        align-items: stretch;
                        width: 100%;
                    }
                    .track-order-btn, .continue-shopping-btn {
                        width: 100%;
                    }
                }

                /* Responsiveness for Mobile View */
                @media (max-width: 900px) {
                    .order-details-container {
                        padding: 16px 16px 100px 16px;
                    }
                    
                    .desktop-header {
                        display: none;
                    }
                    
                    .highlights-grid {
                        display: none;
                    }
                    
                    .order-info-bar {
                        display: flex;
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                        padding: 16px;
                        background: #ffffff;
                        border: 1px solid var(--border);
                        border-radius: 12px;
                        margin-bottom: 20px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.015);
                    }
                    .info-divider {
                        display: none;
                    }
                    .info-col {
                        display: flex !important;
                        flex-direction: row !important;
                        justify-content: space-between !important;
                        align-items: center !important;
                        width: 100% !important;
                    }
                    
                    .need-help-bar {
                        display: none;
                    }
                    
                    /* Show Mobile Elements */
                    .mobile-header-bar {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding-bottom: 16px;
                        margin-bottom: 20px;
                        border-bottom: 1px solid var(--border);
                    }
                    .mobile-back-btn {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 15px;
                        font-weight: 600;
                        color: var(--text-main);
                    }
                    .mobile-support-link {
                        color: var(--accent);
                        display: flex;
                        align-items: center;
                    }
                    
                    .mobile-title-block {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                        margin-bottom: 20px;
                    }
                    .mobile-title-row {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .mobile-title-row h2 {
                        font-size: 20px;
                        font-weight: 700;
                        color: var(--text-main);
                        margin: 0;
                    }
                    .mobile-date-text {
                        font-size: 13px;
                        color: var(--text-muted);
                        margin: 0;
                    }
                    
                    .mobile-pills-row {
                        display: flex;
                        justify-content: space-between;
                        gap: 10px;
                        margin-bottom: 24px;
                    }
                    .mobile-pill {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: #ffffff;
                        border: 1px solid var(--border);
                        border-radius: 12px;
                        padding: 12px 6px;
                        text-align: center;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.015);
                    }
                    .mobile-pill-icon-wrapper {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        background: rgba(15, 157, 148, 0.08);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: var(--accent);
                        margin-bottom: 6px;
                    }
                    .mobile-pill-value {
                        font-size: 11px;
                        font-weight: 700;
                        margin-bottom: 2px;
                    }
                    .mobile-pill-label {
                        font-size: 9px;
                        color: var(--text-light);
                        font-weight: 500;
                    }
                    
                    .order-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                    
                    /* Reordering sections for Mobile */
                    .shipping-card-wrapper {
                        order: 1;
                    }
                    .price-card-wrapper {
                        order: 2;
                    }
                    .items-card-wrapper {
                        order: 3;
                    }
                    
                    .mobile-bottom-actions {
                        display: flex;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        background: #ffffff;
                        border-top: 1px solid var(--border);
                        padding: 12px 16px;
                        gap: 12px;
                        z-index: 100;
                        box-shadow: 0 -4px 15px rgba(0,0,0,0.05);
                    }
                    .mobile-btn-download {
                        flex: 1;
                        background: #ffffff;
                        color: var(--text-main);
                        border: 1px solid var(--border);
                        border-radius: 10px;
                        height: 46px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        font-weight: 600;
                        font-size: 13px;
                        cursor: pointer;
                    }
                    .mobile-btn-buy {
                        flex: 1;
                        background: var(--accent);
                        color: #ffffff;
                        border: none;
                        border-radius: 10px;
                        height: 46px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        font-weight: 600;
                        font-size: 13px;
                        cursor: pointer;
                    }
                }
            `}</style>
        </div>
    );
}
