"use client";

import { useEffect, useState, Suspense } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Heading from "@/components/Heading";

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
    const [notes, setNotes] = useState("");
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
        setConfirming(true);
        try {
            const formattedPhone = customerPhone.trim() 
                ? `+91${customerPhone.replace(/\D/g, "")}` 
                : "";

            const payload = {
                payment_method: paymentMethod,
                customer_name: customerName.trim() || undefined,
                customer_email: customerEmail.trim() || undefined,
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
            <div className="container animate-fade-in" style={{ maxWidth: '600px', padding: '80px 20px', textAlign: 'center' }}>
                <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px 32px', boxShadow: 'var(--shadow-md)' }}>
                    <div style={{ width: '72px', height: '72px', background: '#eff6ff', color: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', fontSize: '2rem' }}>
                        ✓
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Store Sale Success!</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Order has been successfully logged and inventory deducted.</p>

                    <div style={{ background: '#fafbfc', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px', fontSize: '0.92rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Order Number:</span>
                            <strong style={{ color: 'var(--text-main)' }}>{successData.orderNumber}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                            <strong style={{ color: 'var(--text-main)' }}>{successData.customerName}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                            <strong style={{ color: 'var(--text-main)', textTransform: 'uppercase' }}>{successData.paymentMethod}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Order Type:</span>
                            <strong style={{ color: '#0d9488' }}>Direct Store Sale</strong>
                        </div>
                        <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem' }}>
                            <span style={{ fontWeight: 600 }}>Amount Collected:</span>
                            <strong style={{ color: 'var(--text-main)' }}>₹{successData.total}</strong>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <Link href={`/admin/orders/${orderId}`} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 600 }}>
                            View Order Details
                        </Link>
                        <Link href="/products" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 600 }}>
                            Back to Store
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Canceled Screen
    if (canceledState) {
        return (
            <div className="container animate-fade-in" style={{ maxWidth: '600px', padding: '80px 20px', textAlign: 'center' }}>
                <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px 32px', boxShadow: 'var(--shadow-md)' }}>
                    <div style={{ width: '72px', height: '72px', background: '#fef2f2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', fontSize: '2rem' }}>
                        ✕
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Store Sale Canceled</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>The checkout session has been cancelled and items returned to stock.</p>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <Link href="/cart" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 600 }}>
                            Go to Cart
                        </Link>
                        <Link href="/products" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 600 }}>
                            Browse Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Dynamic UPI Link QR Code generator (fallback if no base64 image in settings)
    const fallbackQrData = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${order?.total || 0}&cu=INR`;
    const finalQrSource = qrCodeImage || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fallbackQrData)}`;

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '80px', paddingTop: '40px' }}>
            <Heading title="Direct Store Checkout" subtitle={`Order Session: #TEJWL${String(orderId).padStart(2, '0')}`} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '32px' }}>
                
                {/* LEFT COLUMN: ORDER ITEMS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ padding: '24px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '20px' }}>Cart Summary</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {items.map((item) => (
                                <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ width: '64px', height: '64px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={item.image_url?.split(',')[0]} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{item.name}</div>
                                        {item.selected_variation && (
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {item.selected_variation}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            Qty: {item.quantity} &bull; ₹{item.price}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                        ₹{item.price * item.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', fontSize: '0.92rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                                <span style={{ fontWeight: 600 }}>₹{order?.total}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Store Shipping:</span>
                                <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem' }}>
                                <strong style={{ fontWeight: 700 }}>Total Amount:</strong>
                                <strong style={{ color: 'var(--text-main)', fontWeight: 700 }}>₹{order?.total}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: PAYMENT & CUSTOMER DETAILS */}
                <form onSubmit={handleConfirmOrder} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Payment Selector */}
                    <div className="card" style={{ padding: '24px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>Payment Method</h3>
                        
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                            {["UPI", "Cash", "Card"].map((method) => {
                                const active = paymentMethod === method;
                                return (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setPaymentMethod(method)}
                                        style={{
                                            flex: 1,
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            border: active ? '2px solid var(--accent)' : '1px solid var(--border)',
                                            background: active ? 'rgba(15, 157, 148, 0.04)' : '#fff',
                                            color: active ? 'var(--accent)' : 'var(--text-main)',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontSize: '0.9rem'
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
                                padding: '20px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Scan to Pay</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                    Merchant: {upiName} &bull; {upiId}
                                </div>
                                <div style={{ display: 'inline-block', padding: '12px', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '8px' }}>
                                    <img src={finalQrSource} alt="UPI Payment QR Code" style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    Amount to collect: ₹{order?.total}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Customer Details */}
                    <div className="card" style={{ padding: '24px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>Customer Profile (Optional)</h3>
                        
                        {foundMessage && (
                            <div style={{
                                padding: '10px 14px',
                                background: 'rgba(16, 185, 129, 0.08)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                borderRadius: '8px',
                                color: 'var(--success)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                marginBottom: '16px'
                            }}>
                                {foundMessage}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Customer Mobile Number</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select style={{ padding: '0 10px', border: '1px solid var(--border)', borderRadius: '8px', background: '#fafbfc', fontSize: '0.85rem', outline: 'none' }} disabled>
                                        <option>+91</option>
                                    </select>
                                    <input 
                                        type="tel" 
                                        maxLength="10"
                                        placeholder="Enter 10-digit number"
                                        className="input-field"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                                        style={{ flex: 1, height: '40px', padding: '0 12px', fontSize: '0.85rem' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Customer Email Address</label>
                                <input 
                                    type="email" 
                                    placeholder="customer@email.com"
                                    className="input-field"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '0.85rem' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Customer Full Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter customer name"
                                    className="input-field"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '0.85rem' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>Sale / Billing Notes</label>
                                <textarea 
                                    placeholder="e.g. Counter payment reference notes, etc."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    style={{ width: '100%', height: '80px', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button
                            type="button"
                            onClick={handleCancelOrder}
                            disabled={cancelling || confirming}
                            style={{
                                flex: 1,
                                padding: '16px',
                                background: '#fef2f2',
                                color: '#ef4444',
                                border: '1.5px solid #fca5a5',
                                borderRadius: 'var(--radius-btn, 10px)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '0.95rem'
                            }}
                        >
                            {cancelling ? "Cancelling..." : "Cancel Order"}
                        </button>
                        
                        <button
                            type="submit"
                            disabled={confirming || cancelling}
                            style={{
                                flex: 2,
                                padding: '16px',
                                background: 'var(--accent)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 'var(--radius-btn, 10px)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '0.95rem',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        >
                            {confirming ? "Confirming..." : "Confirm Order"}
                        </button>
                    </div>

                </form>

            </div>
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
