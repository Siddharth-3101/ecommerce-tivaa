"use client";

import { useEffect, useState, Suspense } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Heading from "@/components/Heading";
import { formatOrderNumber } from "@/lib/invoice";

function DirectStoreSaleContent() {
    const [user, setUser] = useState(null);
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [canceledState, setCanceledState] = useState(false);

    // Settings
    const [upiName, setUpiName] = useState("Rohini Nagaraj");
    const [upiId, setUpiId] = useState("rohinitn-1@okicici");
    const [qrCodeImage, setQrCodeImage] = useState(""); // base64 string

    // Inputs
    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [notes, setNotes] = useState("Payment Done");
    const [searchingCustomer, setSearchingCustomer] = useState(false);
    const [foundMessage, setFoundMessage] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    // Load initial data
    useEffect(() => {
        const currUser = getUser();
        if (!currUser || currUser.role !== "admin") {
            router.push("/");
            return;
        }
        setUser(currUser);

        if (!orderId) {
            router.push("/cart");
            return;
        }

        async function fetchData() {
            try {
                // Fetch Settings for UPI configs
                const settingsRes = await api.get("/settings");
                if (settingsRes.data) {
                    if (settingsRes.data.store_upi_name) setUpiName(settingsRes.data.store_upi_name);
                    if (settingsRes.data.store_upi_id) setUpiId(settingsRes.data.store_upi_id);
                    if (settingsRes.data.store_qr_code) setQrCodeImage(settingsRes.data.store_qr_code);
                }

                // Fetch Order details
                const orderRes = await api.get(`/admin/orders/${orderId}`);
                if (orderRes.data && orderRes.data.order) {
                    setOrder(orderRes.data.order);
                    setItems(orderRes.data.items || []);
                } else {
                    alert("Order not found or invalid format.");
                    router.push("/cart");
                }
            } catch (err) {
                console.error("Failed to load store checkout details", err);
                alert(err.response?.data?.message || "Failed to load checkout details");
                router.push("/cart");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [orderId, router]);

    // Handle lookup when phone or email changes
    useEffect(() => {
        // Trigger customer lookup if phone has exactly 10 digits
        const cleanPhone = customerPhone.replace(/\D/g, "");
        if (cleanPhone.length === 10) {
            lookupCustomer(null, cleanPhone);
        }
    }, [customerPhone]);

    useEffect(() => {
        // Trigger customer lookup if email is in valid format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(customerEmail.trim())) {
            lookupCustomer(customerEmail.trim(), null);
        }
    }, [customerEmail]);

    const lookupCustomer = async (email, phone) => {
        setSearchingCustomer(true);
        setFoundMessage("");
        try {
            const queryParams = [];
            if (email) queryParams.push(`email=${encodeURIComponent(email)}`);
            if (phone) queryParams.push(`phone=${encodeURIComponent(phone)}`);
            const res = await api.get(`/admin/customers/search?${queryParams.join("&")}`);
            if (res.data && res.data.found && res.data.customer) {
                const cust = res.data.customer;
                setCustomerName(cust.name || "");
                if (cust.email) setCustomerEmail(cust.email);
                if (cust.phone) setCustomerPhone(cust.phone.replace("+91", ""));
                setFoundMessage(`✓ Connected to Profile: ${cust.name}`);
            }
        } catch (err) {
            console.warn("Failed to search customer:", err);
        } finally {
            setSearchingCustomer(false);
        }
    };

    // Confirm Direct Store Sale
    const handleConfirmOrder = async (e) => {
        e.preventDefault();

        const cleanName = customerName.trim();
        const cleanEmail = customerEmail.trim();
        const cleanPhone = customerPhone.replace(/\D/g, "").trim();

        if (!cleanName && !cleanEmail && !cleanPhone) {
            alert("Please enter at least one customer detail (Full Name, Email Address, or Mobile Number) to confirm the order.");
            return;
        }

        setConfirming(true);
        try {
            const formattedPhone = cleanPhone 
                ? `+91${cleanPhone}` 
                : "";

            const payload = {
                payment_method: paymentMethod,
                customer_name: cleanName || undefined,
                customer_email: cleanEmail || undefined,
                customer_phone: formattedPhone || undefined,
                notes: notes.trim() || undefined
            };

            const res = await api.put(`/orders/direct-sale/${orderId}/confirm`, payload);
            
            // Format order reference for success page
            const now = new Date();
            const yy = String(now.getFullYear()).substring(2);
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const seq = String(orderId).padStart(3, '0');
            const orderNumber = `#TV${yy}${mm}${dd}${seq}`;

            setSuccessData({
                orderNumber,
                total: order?.total || 0,
                paymentMethod: paymentMethod,
                customerName: customerName || "Store Guest"
            });
        } catch (err) {
            console.error("Failed to confirm store sale:", err);
            alert(err.response?.data?.message || "Failed to confirm store sale");
        } finally {
            setConfirming(false);
        }
    };

    // Cancel Direct Store Sale
    const handleCancelOrder = async () => {
        if (!confirm("Are you sure you want to cancel this store sale? This will immediately cancel the order and release reserved stock back into inventory.")) {
            return;
        }

        setCancelling(true);
        try {
            await api.put(`/orders/direct-sale/${orderId}/cancel`);
            setCanceledState(true);
        } catch (err) {
            console.error("Failed to cancel store sale:", err);
            alert(err.response?.data?.message || "Failed to cancel store sale");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
                <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.05)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Success Screen
    if (successData) {
        return (
            <div className="container animate-fade-in success-canceled-wrapper">
                <div className="success-canceled-card">
                    <div style={{ width: '64px', height: '64px', background: '#eff6ff', color: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '1.8rem' }}>
                        ✓
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Store Sale Success!</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>Order has been successfully logged and inventory deducted.</p>

                    <div style={{ background: '#fafbfc', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 16px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px', fontSize: '0.88rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Order Number:</span>
                            <strong style={{ color: 'var(--text-main)' }}>{successData.orderNumber}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                            <strong style={{ color: 'var(--text-main)', textAlign: 'right', wordBreak: 'break-word' }}>{successData.customerName}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                            <strong style={{ color: 'var(--text-main)', textTransform: 'uppercase' }}>{successData.paymentMethod}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Order Type:</span>
                            <strong style={{ color: '#0d9488' }}>Direct Store Sale</strong>
                        </div>
                        <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '1rem' }}>
                            <span style={{ fontWeight: 600 }}>Amount Collected:</span>
                            <strong style={{ color: 'var(--text-main)' }}>₹{successData.total}</strong>
                        </div>
                    </div>

                    <div className="card-actions-row">
                        <Link href={`/admin/orders/${orderId}`} className="btn btn-primary" style={{ padding: '12px 20px', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                            View Order Details
                        </Link>
                        <Link href="/products" className="btn btn-secondary" style={{ padding: '12px 20px', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                            Back to Store
                        </Link>
                    </div>
                </div>

                <style jsx>{`
                    .success-canceled-wrapper {
                        max-width: 600px;
                        padding: 40px 16px;
                        margin: 0 auto;
                        text-align: center;
                    }
                    .success-canceled-card {
                        background: #ffffff;
                        border: 1px solid var(--border);
                        border-radius: 16px;
                        padding: 40px 24px;
                        box-shadow: var(--shadow-md);
                    }
                    .card-actions-row {
                        display: flex;
                        gap: 16px;
                        justify-content: center;
                    }
                    @media (max-width: 480px) {
                        .success-canceled-wrapper {
                            padding: 20px 12px;
                        }
                        .success-canceled-card {
                            padding: 24px 16px;
                        }
                        .card-actions-row {
                            flex-direction: column;
                            gap: 10px;
                        }
                        .card-actions-row :global(a) {
                            width: 100%;
                            display: block;
                            text-align: center;
                        }
                    }
                `}</style>
            </div>
        );
    }

    // Canceled Screen
    if (canceledState) {
        return (
            <div className="container animate-fade-in success-canceled-wrapper">
                <div className="success-canceled-card">
                    <div style={{ width: '64px', height: '64px', background: '#fef2f2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '1.8rem' }}>
                        ✕
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Store Sale Canceled</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>The checkout session has been cancelled and items returned to stock.</p>

                    <div className="card-actions-row">
                        <Link href="/cart" className="btn btn-primary" style={{ padding: '12px 20px', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                            Go to Cart
                        </Link>
                        <Link href="/products" className="btn btn-secondary" style={{ padding: '12px 20px', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                            Browse Products
                        </Link>
                    </div>
                </div>

                <style jsx>{`
                    .success-canceled-wrapper {
                        max-width: 600px;
                        padding: 40px 16px;
                        margin: 0 auto;
                        text-align: center;
                    }
                    .success-canceled-card {
                        background: #ffffff;
                        border: 1px solid var(--border);
                        border-radius: 16px;
                        padding: 40px 24px;
                        box-shadow: var(--shadow-md);
                    }
                    .card-actions-row {
                        display: flex;
                        gap: 16px;
                        justify-content: center;
                    }
                    @media (max-width: 480px) {
                        .success-canceled-wrapper {
                            padding: 20px 12px;
                        }
                        .success-canceled-card {
                            padding: 24px 16px;
                        }
                        .card-actions-row {
                            flex-direction: column;
                            gap: 10px;
                        }
                        .card-actions-row :global(a) {
                            width: 100%;
                            display: block;
                            text-align: center;
                        }
                    }
                `}</style>
            </div>
        );
    }

    // Dynamic UPI Link QR Code generator (fallback if no base64 image in settings)
    const fallbackQrData = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${order?.total || 0}&cu=INR`;
    const finalQrSource = qrCodeImage || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fallbackQrData)}`;

    return (
        <div className="container animate-fade-in direct-sale-wrapper">
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Direct Store Checkout</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Order Session: {formatOrderNumber(orderId, order?.created_at)}</p>
            </div>

            <div className="direct-sale-grid">
                
                {/* LEFT COLUMN: ORDER ITEMS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%' }}>
                    <div className="card direct-sale-card">
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>Cart Summary</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                            {items.map((item) => (
                                <div key={item.product_id} className="direct-sale-item-row">
                                    <div style={{ width: '56px', height: '56px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={item.image_url?.split(',')[0]} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                        {item.selected_variation && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.selected_variation}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            Qty: {item.quantity} &bull; ₹{item.price}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', flexShrink: 0, marginLeft: '8px' }}>
                                        ₹{item.price * item.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', fontSize: '0.88rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                                <span style={{ fontWeight: 600 }}>₹{order?.total}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Store Shipping:</span>
                                <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border)', margin: '6px 0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem' }}>
                                <strong style={{ fontWeight: 700 }}>Total Amount:</strong>
                                <strong style={{ color: 'var(--text-main)', fontWeight: 700 }}>₹{order?.total}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: PAYMENT & CUSTOMER DETAILS */}
                <form onSubmit={handleConfirmOrder} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%' }}>
                    
                    {/* Payment Selector */}
                    <div className="card direct-sale-card">
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '14px' }}>Payment Method</h3>
                        
                        <div className="payment-methods-row">
                            {["UPI", "Cash", "Card"].map((method) => {
                                const active = paymentMethod === method;
                                return (
                                    <button
                                        key={method}
                                        type="button"
                                        className="payment-method-btn"
                                        onClick={() => setPaymentMethod(method)}
                                        style={{
                                            flex: 1,
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: active ? '2px solid var(--accent)' : '1px solid var(--border)',
                                            background: active ? 'rgba(15, 157, 148, 0.04)' : '#fff',
                                            color: active ? 'var(--accent)' : 'var(--text-main)',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {method === "UPI" ? "📱 " : method === "Cash" ? "💵 " : "💳 "}
                                        {method}
                                    </button>
                                );
                            })}
                        </div>

                        {paymentMethod === "UPI" && (
                            <div style={{
                                background: '#fafbfc',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                padding: '16px 12px',
                                textAlign: 'center',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}>
                                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>Scan to Pay</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px', wordBreak: 'break-all' }}>
                                    Merchant: {upiName} &bull; {upiId}
                                </div>
                                <div style={{ display: 'inline-block', padding: '10px', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '8px', maxWidth: '100%', boxSizing: 'border-box' }}>
                                    <img src={finalQrSource} alt="UPI Payment QR Code" style={{ width: '160px', height: '160px', maxWidth: '100%', objectFit: 'contain' }} />
                                </div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    Amount to collect: ₹{order?.total}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Customer Details */}
                    <div className="card direct-sale-card">
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Customer Profile</h3>
                        <p style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 500, marginBottom: '16px' }}>At least 1 detail required: Mobile Number, Email, or Full Name</p>
                        
                        {foundMessage && (
                            <div style={{
                                padding: '10px 14px',
                                background: 'rgba(16, 185, 129, 0.08)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                borderRadius: '8px',
                                color: 'var(--success)',
                                fontSize: '0.82rem',
                                fontWeight: 500,
                                marginBottom: '14px',
                                wordBreak: 'break-word'
                            }}>
                                {foundMessage}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Customer Mobile Number</label>
                                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                    <select style={{ padding: '0 8px', border: '1px solid var(--border)', borderRadius: '8px', background: '#fafbfc', fontSize: '0.85rem', outline: 'none', flexShrink: 0 }} disabled>
                                        <option>+91</option>
                                    </select>
                                    <input 
                                        type="tel" 
                                        maxLength="10"
                                        placeholder="Enter 10-digit number"
                                        className="input-field"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                                        style={{ flex: 1, height: '42px', padding: '0 12px', fontSize: '0.88rem', minWidth: 0, boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Customer Email Address</label>
                                <input 
                                    type="email" 
                                    placeholder="customer@email.com"
                                    className="input-field"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    style={{ width: '100%', height: '42px', padding: '0 12px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Customer Full Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter customer name"
                                    className="input-field"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    style={{ width: '100%', height: '42px', padding: '0 12px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Sale / Billing Notes</label>
                                <textarea 
                                    placeholder="e.g. Counter payment reference notes, etc."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    style={{ width: '100%', height: '76px', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="action-buttons-row">
                        <button
                            type="button"
                            onClick={handleCancelOrder}
                            disabled={cancelling || confirming}
                            style={{
                                flex: 1,
                                padding: '12px 14px',
                                background: '#fef2f2',
                                color: '#ef4444',
                                border: '1.5px solid #fca5a5',
                                borderRadius: 'var(--radius-btn, 10px)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '0.9rem',
                                minHeight: '46px'
                            }}
                        >
                            {cancelling ? "Cancelling..." : "Cancel Order"}
                        </button>
                        
                        <button
                            type="submit"
                            disabled={confirming || cancelling}
                            style={{
                                flex: 2,
                                padding: '12px 14px',
                                background: 'var(--accent)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 'var(--radius-btn, 10px)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '0.9rem',
                                boxShadow: 'var(--shadow-sm)',
                                minHeight: '46px'
                            }}
                        >
                            {confirming ? "Confirming..." : "Confirm Order"}
                        </button>
                    </div>

                </form>

            </div>

            <style jsx>{`
                .direct-sale-wrapper {
                    padding-top: 20px;
                    padding-bottom: 60px;
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                    overflow-x: hidden;
                }
                .direct-sale-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 24px;
                    margin-top: 16px;
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                }
                .direct-sale-card {
                    padding: 24px;
                    background: #ffffff;
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                    overflow: hidden;
                }
                .direct-sale-item-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid var(--border);
                    width: 100%;
                    box-sizing: border-box;
                }
                .payment-methods-row {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 16px;
                    width: 100%;
                    box-sizing: border-box;
                }
                .action-buttons-row {
                    display: flex;
                    gap: 14px;
                    width: 100%;
                    box-sizing: border-box;
                }
                @media (max-width: 868px) {
                    .direct-sale-wrapper {
                        padding-top: 12px;
                        padding-bottom: 40px;
                        padding-left: 12px !important;
                        padding-right: 12px !important;
                    }
                    .direct-sale-grid {
                        grid-template-columns: minmax(0, 1fr);
                        gap: 16px;
                        margin-top: 12px;
                    }
                    .direct-sale-card {
                        padding: 16px !important;
                    }
                }
                @media (max-width: 480px) {
                    .payment-methods-row {
                        gap: 6px;
                    }
                    .payment-method-btn {
                        padding: 10px 4px !important;
                        font-size: 0.8rem !important;
                    }
                    .action-buttons-row {
                        flex-direction: column-reverse;
                        gap: 10px;
                    }
                    .action-buttons-row button {
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default function DirectStoreSalePage() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
                <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.05)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        }>
            <DirectStoreSaleContent />
        </Suspense>
    );
}


