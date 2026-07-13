"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import Heading from "@/components/Heading";

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
    "Uttar Pradesh", "Uttarakhand", "West Bengal", 
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

// Reusable progress steps bar matching mockup styling
function CheckoutSteps({ currentStep = 2 }) {
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsMobile(window.innerWidth <= 768);
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Render an empty placeholder of same height during SSR/hydration to avoid mismatch errors
    if (!mounted) {
        return (
            <div style={{ 
                height: '75px', 
                maxWidth: '680px', 
                margin: '0 auto 36px auto', 
                width: '100%' 
            }}></div>
        );
    }

    const steps = [
        { id: 1, name: "Cart" },
        { id: 2, name: "Address" },
        { id: 3, name: "Review" },
        { id: 4, name: "Payment" },
        { id: 5, name: "Complete" }
    ];

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
            padding: isMobile ? '0 8px' : '0 16px',
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
                        flex: 1,
                        minWidth: 0
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
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'contain', 
                                    display: 'block' 
                                }}
                            />
                        </div>
                        <span style={{
                            fontSize: labelFontSize,
                            fontWeight: '600',
                            color: isActive || isCompleted ? 'var(--accent)' : '#94a3b8',
                            marginTop: labelMarginTop,
                            transition: 'all 0.3s ease',
                            textAlign: 'center',
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-word'
                        }}>
                            {step.name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}


export default function CheckoutPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);
    const [shippingCost, setShippingCost] = useState(65);
    const [detecting, setDetecting] = useState(false);
    const [showAllItems, setShowAllItems] = useState(false);
    const [currentCheckoutStep, setCurrentCheckoutStep] = useState(2);
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        shipping_address: "",
        address_line2: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        payment_method: "Razorpay"
    });
    const router = useRouter();

    useEffect(() => {
        const loggedInUser = getUser();
        if(!loggedInUser) {
            router.push("/login");
            return;
        }
        setUser(loggedInUser);

        async function loadCartAndProfile() {
            try {
                const searchParams = new URLSearchParams(window.location.search);
                const isBuyNow = searchParams.get("buyNow") === "true";
                const productId = searchParams.get("productId");
                const qty = Number(searchParams.get("quantity")) || 1;
                const variation = searchParams.get("variation") || "";

                let items = [];
                if (isBuyNow && productId) {
                    const prodRes = await api.get(`/products/${productId}`);
                    const prod = prodRes.data;
                    
                    let effectivePrice = prod.discounted_price ? Number(prod.discounted_price) : Number(prod.price);
                    let imageUrl = prod.image_url ? prod.image_url.split(",")[0].trim() : "/placeholder.png";

                    if (prod.variations && variation) {
                        try {
                            const parsedGroups = typeof prod.variations === 'string' ? JSON.parse(prod.variations) : prod.variations;
                            if (Array.isArray(parsedGroups)) {
                                const selections = variation.split(",").reduce((acc, part) => {
                                    const splitIdx = part.indexOf(":");
                                    if (splitIdx > -1) {
                                        acc[part.substring(0, splitIdx).trim().toLowerCase()] = part.substring(splitIdx + 1).trim().toLowerCase();
                                    }
                                    return acc;
                                }, {});

                                for (const group of parsedGroups) {
                                    const groupKey = group.name.trim().toLowerCase();
                                    const selectedVal = selections[groupKey];
                                    if (selectedVal && group.options) {
                                        const matched = group.options.find(opt => opt.value.trim().toLowerCase() === selectedVal);
                                        if (matched) {
                                            if (matched.price !== undefined && matched.price !== null && matched.price !== "" && Number(matched.price) > 0) {
                                                effectivePrice = Number(matched.price);
                                            }
                                            if (matched.image_url && matched.image_url.trim()) {
                                                imageUrl = matched.image_url.trim();
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            console.error("Failed to parse variations for buyNow checkout", e);
                        }
                    }

                    items = [{
                        id: `buynow-${prod.id}`,
                        product_id: prod.id,
                        quantity: qty,
                        price: effectivePrice,
                        name: prod.name,
                        image_url: imageUrl,
                        selected_variation: variation || null
                    }];
                } else {
                    const res = await api.get("/cart");
                    const data = res.data;
                    items = Array.isArray(data) ? data : data.items || [];
                    if (items.length === 0) {
                        router.push("/cart");
                        return;
                    }
                }
                setCartItems(items);

                try {
                    const settingsRes = await api.get("/settings");
                    if (settingsRes.data && settingsRes.data.shipping_cost) {
                        setShippingCost(Number(settingsRes.data.shipping_cost) || 0);
                    }
                } catch (settingsErr) {
                    console.log("Failed to load settings in checkout:", settingsErr);
                }

                const profileRes = await api.get("/auth/me");
                const profile = profileRes.data;
                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        name: profile.name || "",
                        email: profile.email || "",
                        shipping_address: profile.address || "",
                        city: profile.city || "",
                        state: profile.state || "",
                        pincode: profile.pincode || "",
                        phone: profile.phone || ""
                    }));
                }
            } catch (err) {
                console.error(err);
                router.push("/cart");
            } finally {
                setLoading(false);
            }
        }
        loadCartAndProfile();
    }, [router]);

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const isFreeShipping = false;
    const activeShippingCost = shippingCost;
    const couponDiscount = 0;
    const total = Math.max(0, subtotal + activeShippingCost);

    const handleDetectLocation = () => {
        setDetecting(true);
        setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                city: "Chennai",
                state: "Tamil Nadu",
                pincode: "600122"
            }));
            setDetecting(false);
        }, 800);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
    };

    const handleAddressSubmit = (e) => {
        if (e) e.preventDefault();
        setCurrentCheckoutStep(3);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleFinalPayment = async () => {
        setSubmitting(true);
        try {
            const searchParams = new URLSearchParams(window.location.search);
            const isBuyNow = searchParams.get("buyNow") === "true";
            const productId = searchParams.get("productId");
            const qty = Number(searchParams.get("quantity")) || 1;
            const variation = searchParams.get("variation") || "";

            // Join full address nicely
            const fullAddress = [
                formData.shipping_address,
                formData.address_line2 ? `Apt/Suite: ${formData.address_line2}` : "",
                formData.landmark ? `Landmark: ${formData.landmark}` : ""
            ].filter(Boolean).join(", ");

            const payload = {
                shipping_address: fullAddress,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                phone: formData.phone,
                payment_method: formData.payment_method
            };

            if (isBuyNow && productId) {
                payload.buy_now = {
                    product_id: Number(productId),
                    quantity: qty,
                    selected_variation: variation || null
                };
            }

            const res = await api.post("/orders", payload);
            const { orderId, total: orderTotal } = res.data;

            const payOrderRes = await api.post("/payment/order", {
                amount: orderTotal,
                currency: "INR",
                order_id: orderId
            });
            const razorpayOrder = payOrderRes.data;

            const options = {
                key: razorpayOrder.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_51NgC2HSJ34m7p8",
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
                        router.push(`/orders/${orderId}?success=true`);
                    } catch (verifyErr) {
                        alert("Payment verification failed. Please contact support.");
                        router.push(`/orders/${orderId}?success=false`);
                    } finally {
                        setSubmitting(false);
                    }
                },
                prefill: {
                    name: formData.name || user?.name || "",
                    email: formData.email || user?.email || "",
                    contact: formData.phone || ""
                },
                theme: {
                    color: "#0a0b10",
                },
                modal: {
                    ondismiss: function () {
                        alert("Payment closed. You can retry payment anytime.");
                        router.push(`/orders/${orderId}?success=false`);
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
            console.error("❌ Checkout Error:", err);
            alert(err.response?.data?.message || "Failed to place order. Please try again.");
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="container" style={{ paddingTop: '80px', display: 'flex', justifyContent: 'center' }}>
            <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const itemsToRender = showAllItems ? cartItems : cartItems.slice(0, 4);

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '32px', paddingBottom: '80px' }}>
            <CheckoutSteps currentStep={currentCheckoutStep} />
            
            {currentCheckoutStep === 2 ? (
                <div className="checkout-grid">
                    {/* Left Side: Address Details Panel */}
                    <div className="address-form-column">
                        <form id="checkout-form" onSubmit={handleAddressSubmit}>
                            <div className="checkout-panel-card">
                                <div className="panel-header">
                                    <Heading variant="HomeHeader2" className="panel-title-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="step-number-badge">2</span>
                                        Shipping Address
                                    </Heading>
                                </div>

                                <div className="form-fields-container">
                                    {/* Name, Phone, Email row */}
                                    <div className="form-row-3">
                                        <div>
                                            <label className="input-label">Full Name *</label>
                                            <input 
                                                type="text" 
                                                className="input-field" 
                                                required 
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label">Phone Number *</label>
                                            <input 
                                                type="tel" 
                                                className="input-field" 
                                                required 
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                placeholder="e.g. 9876543210"
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label">Email Address</label>
                                            <input 
                                                type="email" 
                                                className="input-field" 
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                placeholder="e.g. name@domain.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Address Line 1 & Line 2 row */}
                                    <div className="form-row-2">
                                        <div>
                                            <label className="input-label">Street Address *</label>
                                            <input 
                                                type="text" 
                                                className="input-field" 
                                                required 
                                                value={formData.shipping_address}
                                                onChange={(e) => setFormData({...formData, shipping_address: e.target.value})}
                                                placeholder="House No, Building, Street name"
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label">Apartment, suite, unit etc. (optional)</label>
                                            <input 
                                                type="text" 
                                                className="input-field" 
                                                value={formData.address_line2}
                                                onChange={(e) => setFormData({...formData, address_line2: e.target.value})}
                                                placeholder="Apt, Suite, Unit, Floor etc."
                                            />
                                        </div>
                                    </div>

                                    {/* Landmark, Town/City, State, Pincode row */}
                                    <div className="form-row-location">
                                        <div className="loc-city">
                                            <label className="input-label">Town / City *</label>
                                            <input 
                                                type="text" 
                                                className="input-field" 
                                                required 
                                                value={formData.city}
                                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                                            />
                                        </div>
                                        <div className="loc-state">
                                            <label className="input-label">State *</label>
                                            <select 
                                                className="input-field" 
                                                required 
                                                value={formData.state}
                                                onChange={(e) => setFormData({...formData, state: e.target.value})}
                                            >
                                                <option value="">Select State</option>
                                                {INDIAN_STATES.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="loc-pin">
                                            <label className="input-label">Pincode *</label>
                                            <input 
                                                type="text" 
                                                className="input-field" 
                                                required 
                                                value={formData.pincode}
                                                onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    {/* Save Address Checkbox & Review Order Button */}
                                    <div className="checkbox-action-row">
                                        <div className="checkbox-container">
                                            <input type="checkbox" id="save-address" className="checkbox-input" />
                                            <label htmlFor="save-address" className="checkbox-label">Save this address for faster checkout</label>
                                        </div>
                                        <button type="submit" disabled={submitting} className="review-order-btn">
                                            {submitting ? "Processing..." : "Continue"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right Side: Sticky Summary Card */}
                    <aside className="checkout-summary-column">
                        <div className="summary-card">
                            <div className="summary-header">
                                <Heading variant="HomeHeader2" className="summary-title" style={{ fontSize: '13px', fontWeight: '700' }}>Order Summary</Heading>
                                <span className="summary-items-count">{cartItems.reduce((acc, item) => acc + item.quantity, 0)} Items</span>
                            </div>

                            {/* Collapsible list of products */}
                            <div className="summary-items-list">
                                {itemsToRender.map(item => (
                                    <div key={item.id} className="summary-item-row">
                                        <div className="summary-item-thumbnail">
                                            <img 
                                                src={item.image_url ? item.image_url.split(",")[0].trim() : "/placeholder.png"} 
                                                alt={item.name} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="summary-item-info">
                                            <h4 className="summary-item-name">{item.name}</h4>
                                            {item.selected_variation && (
                                                <p className="summary-item-variation">{item.selected_variation}</p>
                                            )}
                                            <p className="summary-item-qty">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="summary-item-price">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Expand items toggle pill */}
                            {cartItems.length > 4 && (
                                <div className="toggle-items-wrapper">
                                    <button 
                                        type="button" 
                                        className="accordion-toggle-btn"
                                        onClick={() => setShowAllItems(!showAllItems)}
                                    >
                                        {showAllItems ? (
                                            <>
                                                Show Less
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px' }}><polyline points="18 15 12 9 6 15"></polyline></svg>
                                            </>
                                        ) : (
                                            <>
                                                View All ({cartItems.length} Items)
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Breakdown lines */}
                            <div className="breakdown-lines-container">
                                <div className="breakdown-line">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="breakdown-line">
                                    <span>Shipping</span>
                                    <span>
                                        {shippingCost === 0 ? "FREE" : `₹${shippingCost.toFixed(2)}`}
                                    </span>
                                </div>

                                <div className="breakdown-line">
                                    <span>Taxes</span>
                                    <span className="included-text">Included</span>
                                </div>

                                <div className="grand-total-row">
                                    <span className="total-label">Total</span>
                                    <span className="total-amount">₹{total.toFixed(2)}</span>
                                </div>

                                {/* Inline Secure Checkout container */}
                                <div className="secure-checkout-seal">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" style={{ flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    <div>
                                        <div className="seal-headline">Secure Checkout</div>
                                        <div className="seal-caption">Your data is 100% protected</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            ) : (
                <div className="review-parent-container">
                    <div className="review-layout-grid">
                        {/* COLUMN 1: SHIPPING ADDRESS */}
                        <div className="review-column-card">
                            <div className="review-card-header">
                                <div className="review-card-title">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    <h3>Shipping Address</h3>
                                </div>
                                <button type="button" className="change-step-link" onClick={() => setCurrentCheckoutStep(2)}>Change</button>
                            </div>
                            <div className="review-address-details">
                                <p className="address-name">{formData.name}</p>
                                <p className="address-phone">{formData.phone}</p>
                                <div className="address-text-block">
                                    <p>{formData.shipping_address}</p>
                                    {formData.address_line2 && <p>{formData.address_line2}</p>}
                                    {formData.landmark && <p>Landmark: {formData.landmark}</p>}
                                    <p>{formData.city} - {formData.pincode}</p>
                                    <p>{formData.state}, India</p>
                                </div>
                            </div>
                            <div className="safe-info-banner">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                <div>
                                    <p className="safe-title">Your information is safe with us.</p>
                                    <p className="safe-desc">We never share your details.</p>
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 2: ORDER ITEMS */}
                        <div className="review-column-card">
                            <div className="review-card-header">
                                <div className="review-card-title">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                    <h3>Order Items</h3>
                                </div>
                                <span className="items-count-badge">{cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} Items</span>
                            </div>
                            
                            <div className="review-items-list">
                                {itemsToRender.map(item => (
                                    <div key={item.id} className="review-item-row">
                                        <div className="review-item-thumbnail">
                                            <img 
                                                src={item.image_url ? item.image_url.split(",")[0].trim() : "/placeholder.png"} 
                                                alt={item.name} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="review-item-info">
                                            <h4 className="review-item-name">{item.name}</h4>
                                            {item.selected_variation && (
                                                <p className="review-item-variation">{item.selected_variation}</p>
                                            )}
                                            <p className="review-item-qty">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="review-item-price">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            {cartItems.length > 4 && (
                                <div className="toggle-items-wrapper" style={{ marginTop: '16px' }}>
                                    <button 
                                        type="button" 
                                        className="accordion-toggle-btn"
                                        onClick={() => setShowAllItems(!showAllItems)}
                                    >
                                        {showAllItems ? (
                                            <>
                                                Show Less
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px' }}><polyline points="18 15 12 9 6 15"></polyline></svg>
                                            </>
                                        ) : (
                                            <>
                                                View All ({cartItems.length} Items)
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* COLUMN 3: ORDER SUMMARY */}
                        <div className="review-column-card">
                            <div className="review-card-header">
                                <div className="review-card-title">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    <h3>Order Summary</h3>
                                </div>
                            </div>

                            <div className="review-summary-breakdown">
                                <div className="breakdown-row">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="breakdown-row">
                                    <span>Shipping</span>
                                    <span>{shippingCost === 0 ? "FREE" : `₹${shippingCost.toFixed(2)}`}</span>
                                </div>
                                <div className="breakdown-row">
                                    <span>Taxes</span>
                                    <span className="taxes-inc">Included</span>
                                </div>
                                <div className="total-divider"></div>
                                <div className="grand-total-row">
                                    <span className="total-label">Total</span>
                                    <span className="total-value">₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button 
                                type="button" 
                                disabled={submitting} 
                                className="pay-securely-btn"
                                onClick={handleFinalPayment}
                            >
                                {submitting ? "Processing..." : (
                                    <>
                                        Pay Securely
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    </>
                                )}
                            </button>

                            <div className="payment-redirect-notice">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                <span>You will be redirected to our secure payment partner to complete the payment.</span>
                            </div>

                            <div className="terms-agree-links">
                                By placing this order, you agree to our <br/>
                                <Link href="/terms" className="legal-link">Terms of Service</Link> & <Link href="/privacy" className="legal-link">Privacy Policy</Link>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            <style jsx global>{`
                /* REVIEW SCREEN LAYOUT & COMPONENT CSS */
                .review-parent-container {
                    width: 100%;
                    max-width: 100%;
                    box-sizing: border-box;
                }

                .review-layout-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 1.2fr 1fr;
                    gap: 24px;
                    align-items: flex-start;
                    margin-top: 32px;
                    width: 100%;
                }

                .review-column-card {
                    background: #ffffff;
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.01);
                    box-sizing: border-box;
                }

                .review-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 16px;
                    margin-bottom: 20px;
                }

                .review-card-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: var(--accent);
                }

                .review-card-title h3 {
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0;
                }

                .change-step-link {
                    background: transparent;
                    border: none;
                    color: var(--accent);
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: none;
                    padding: 0;
                }

                .change-step-link:hover {
                    text-decoration: underline;
                }

                .items-count-badge {
                    font-size: 12px;
                    color: var(--text-muted);
                    font-weight: 600;
                }

                .review-address-details {
                    margin-bottom: 20px;
                }

                .address-name {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0 0 4px 0;
                }

                .address-phone {
                    font-size: 13px;
                    color: var(--text-muted);
                    margin: 0 0 12px 0;
                }

                .address-text-block p {
                    font-size: 13px;
                    color: var(--text-main);
                    margin: 0 0 4px 0;
                    line-height: 1.5;
                }

                .safe-info-banner {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                    padding: 12px;
                    background: #f0fdf4;
                    border-radius: 8px;
                }

                .safe-title {
                    font-size: 11px;
                    font-weight: 700;
                    color: #166534;
                    margin: 0 0 2px 0;
                }

                .safe-desc {
                    font-size: 11px;
                    color: #166534;
                    margin: 0;
                    opacity: 0.85;
                }

                .review-items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .review-item-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .review-item-thumbnail {
                    width: 50px;
                    height: 50px;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid var(--border);
                    background: #f8fafc;
                    flex-shrink: 0;
                }

                .review-item-thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .review-item-info {
                    flex: 1;
                    min-width: 0;
                }

                .review-item-name {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-main);
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .review-item-variation {
                    font-size: 10px;
                    color: var(--text-muted);
                    margin: 2px 0 0 0;
                }

                .review-item-qty {
                    font-size: 11px;
                    color: var(--text-muted);
                    margin: 2px 0 0 0;
                }

                .review-item-price {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-main);
                    flex-shrink: 0;
                }

                .review-summary-breakdown {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .breakdown-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 13px;
                    color: var(--text-muted);
                }

                .coupon-discount {
                    color: #10b981;
                    font-weight: 600;
                }

                .coupon-tag-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 4px;
                }

                .coupon-badge-tag {
                    background: #e8f5e9;
                    color: #2e7d32;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 6px;
                }

                .remove-coupon-btn {
                    background: transparent;
                    border: none;
                    color: #ef4444;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 0;
                }

                .remove-coupon-btn:hover {
                    text-decoration: underline;
                }

                .taxes-inc {
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .total-divider {
                    height: 1px;
                    background: var(--border);
                    margin: 16px 0;
                }

                .grand-total-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }

                .pay-securely-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 46px;
                    background: var(--accent);
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-top: 24px;
                    transition: all 0.2s;
                }

                .pay-securely-btn:hover {
                    background: var(--accent-hover, #008f7d);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px var(--accent-glow);
                }

                .payment-redirect-notice {
                    display: flex;
                    gap: 8px;
                    align-items: flex-start;
                    color: var(--text-muted);
                    font-size: 11px;
                    margin-top: 16px;
                    line-height: 1.4;
                }

                .terms-agree-links {
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 10px;
                    margin-top: 20px;
                    line-height: 1.5;
                }

                .legal-link {
                    color: var(--accent);
                    text-decoration: none;
                    font-weight: 600;
                }

                .legal-link:hover {
                    text-decoration: underline;
                }

                .review-trust-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                    border-top: 1px solid var(--border);
                    padding-top: 24px;
                    margin-top: 40px;
                }

                .review-trust-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .review-trust-icon-box {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #f8fafc;
                    border: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--accent);
                    flex-shrink: 0;
                }

                .review-trust-info h4 {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0 0 2px 0;
                }

                .review-trust-info p {
                    font-size: 11px;
                    color: var(--text-muted);
                    margin: 0;
                }

                /* Standard Grid CSS */
                .checkout-grid {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 32px;
                    align-items: flex-start;
                }

                .checkout-panel-card {
                    background: #ffffff;
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 32px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.01);
                }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 18px;
                    margin-bottom: 24px;
                }

                .step-number-badge {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    background: var(--accent);
                    color: #ffffff;
                    font-size: 11px;
                    font-weight: 700;
                    border-radius: 50%;
                }

                .saved-address-link {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--accent);
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }

                .saved-address-link:hover {
                    text-decoration: underline;
                }

                .form-fields-container {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-row-3,
                .form-row-2,
                .form-row-location {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .input-label {
                    display: block;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-muted);
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .input-field {
                    width: 100%;
                    height: 40px;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 0 12px;
                    font-size: 13px;
                    color: var(--text-main);
                    background: #ffffff;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }

                .input-field:focus {
                    outline: none;
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px var(--accent-glow);
                }

                .detect-btn {
                    height: 40px;
                    padding: 0 16px;
                    background: #ffffff;
                    color: var(--accent);
                    border: 1px solid var(--accent);
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 80px;
                }

                .detect-btn:hover {
                    background: #fafbfc;
                    border-color: var(--accent);
                }

                 .checkbox-container {
                     display: flex;
                     align-items: flex-start;
                     gap: 8px;
                     margin-top: 4px;
                 }
 
                 .checkbox-input {
                     width: 16px;
                     height: 16px;
                     border: 1px solid var(--border);
                     border-radius: 4px;
                     cursor: pointer;
                     accent-color: var(--accent);
                     margin-top: 2px;
                 }
 
                 .checkbox-label {
                     font-size: 12px;
                     color: var(--text-main);
                     cursor: pointer;
                     user-select: none;
                     flex: 1;
                     min-width: 0;
                     word-wrap: break-word;
                     line-height: 1.4;
                 }

                .checkbox-action-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 24px;
                    gap: 16px;
                }

                .review-order-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 40px;
                    padding: 0 24px;
                    background: var(--accent);
                    color: #ffffff;
                    border: none;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .review-order-btn:hover {
                    background: var(--accent-hover, #008f7d);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 14px var(--accent-glow);
                }

                /* Sidebar / Summary CSS */
                .summary-card {
                    background: #ffffff;
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 20px;
                }

                .summary-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 12px;
                }

                .summary-title {
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--text-main);
                }

                .summary-items-count {
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--text-muted);
                }

                .summary-items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .summary-item-row {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }

                .summary-item-thumbnail {
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    overflow: hidden;
                    background: #ffffff;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .summary-item-thumbnail img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: cover;
                }

                .summary-item-info {
                    flex: 1;
                    min-width: 0;
                }

                .summary-item-name {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-main);
                    margin: 0;
                    line-height: 1.35;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .summary-item-variation {
                    font-size: 10px;
                    color: var(--text-main);
                    font-weight: 500;
                    margin: 2px 0 0 0;
                }

                .summary-item-qty {
                    font-size: 10px;
                    color: var(--text-muted);
                    margin: 2px 0 0 0;
                }

                .summary-item-price {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-main);
                    flex-shrink: 0;
                }

                .toggle-items-wrapper {
                    display: flex;
                    justify-content: center;
                    margin-top: 16px;
                }

                .accordion-toggle-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px dashed var(--border);
                    background: transparent;
                    color: var(--accent);
                    font-size: 11px;
                    font-weight: 600;
                    border-radius: 8px;
                    margin-top: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .accordion-toggle-btn:hover {
                    background: #f8fafc;
                    border-color: var(--accent);
                }

                .breakdown-lines-container {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .breakdown-line {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .included-text {
                    font-size: 11px;
                    color: var(--text-muted);
                }

                .free-shipping-text {
                    color: #10b981;
                    font-weight: 700;
                }



                .breakdown-line-coupon {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                }

                .coupon-title {
                    color: var(--text-muted);
                }

                .apply-coupon-link {
                    display: inline-flex;
                    align-items: center;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--accent);
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }

                .apply-coupon-link:hover {
                    text-decoration: underline;
                }

                .grand-total-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 8px;
                    padding-top: 16px;
                    border-top: 1px solid var(--border);
                }

                .total-label {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text-main);
                }

                .total-amount {
                    font-size: 18px;
                    font-weight: 800;
                    color: var(--accent);
                }

                .secure-checkout-seal {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 12px;
                    margin-top: 16px;
                }

                .seal-headline {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-main);
                }

                .seal-caption {
                    font-size: 10px;
                    color: var(--text-muted);
                    margin-top: 1px;
                }

                .trust-points-list {
                    background: #f8fafc;
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    align-items: center;
                    text-align: center;
                    margin-top: 20px;
                }
                .trust-point-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }
                .trust-icon {
                    flex-shrink: 0;
                }
                .trust-headline {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-main);
                }
                .trust-caption {
                    font-size: 11px;
                    color: var(--text-muted);
                }

                @media (max-width: 992px) {
                    .container {
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 0 16px !important;
                        box-sizing: border-box !important;
                    }
                    .checkout-grid,
                    .review-layout-grid {
                        grid-template-columns: 1fr !important;
                        gap: 24px !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        box-sizing: border-box !important;
                        min-width: 0 !important;
                    }
                    .address-form-column,
                    #checkout-form,
                    .checkout-summary-column {
                        width: 100% !important;
                        max-width: 100% !important;
                        box-sizing: border-box !important;
                        min-width: 0 !important;
                    }
                    .checkout-panel-card,
                    .review-column-card,
                    .summary-card {
                        padding: 24px 16px !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        box-sizing: border-box !important;
                        min-width: 0 !important;
                    }
                    .form-fields-container {
                        width: 100% !important;
                        max-width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    .detect-btn {
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    .input-field {
                        width: 100% !important;
                        max-width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    .checkbox-action-row {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        gap: 16px !important;
                    }
                    .review-order-btn {
                        width: 100% !important;
                        height: 44px !important;
                    }
                    .review-trust-bar {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 16px !important;
                        margin-top: 32px !important;
                    }
                    .review-trust-item {
                        width: 100% !important;
                    }
                }

                @media (max-width: 768px) {
                    .container {
                        padding: 0 12px !important;
                    }
                    .checkout-panel-card,
                    .review-column-card,
                    .summary-card {
                        padding: 20px 12px !important;
                    }
                    .pay-securely-btn {
                        height: 48px !important;
                        font-size: 15px !important;
                    }
                }

                @media (max-width: 480px) {
                    .checkout-panel-card,
                    .review-column-card,
                    .summary-card {
                        padding: 16px 12px !important;
                    }
                }
            `}</style>
        </div>
    );
}
