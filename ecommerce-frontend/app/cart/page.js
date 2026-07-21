"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Heading from "@/components/Heading";

// Local payment logos and trust icons for a premium look
function PaymentLogos() {
    return (
        <div className="payment-grid">
            <span className="payment-chip">
                <img src="/visa.png" alt="Visa" />
            </span>
            <span className="payment-chip">
                <img src="/mastercard.png" alt="MasterCard" />
            </span>
            <span className="payment-chip">
                <img src="/rupay.png" alt="RuPay" />
            </span>
            <span className="payment-chip">
                <img src="/upi.png" alt="UPI" />
            </span>
            <span className="payment-chip">
                <img src="/gpay.jpg" alt="G Pay" />
            </span>
            <span className="payment-chip">
                <img src="/phonepay.png" alt="PhonePe" />
            </span>
            <span className="payment-chip">
                <img src="/paytm.png" alt="Paytm" />
            </span>
            <span className="payment-chip">
                <img src="/amex.png" alt="AMEX" />
            </span>
            
        </div>
    );
}

export default function CartPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shippingCost, setShippingCost] = useState(65); // default shipping
    const [isMobile, setIsMobile] = useState(false);
    const [isAccordionExpanded, setIsAccordionExpanded] = useState(false);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [initiatingSale, setInitiatingSale] = useState(false);
    const router = useRouter();

    const fetchRecommendations = async (cartItems) => {
        try {
            const res = await api.get("/products?limit=100");
            const data = res.data;
            const list = Array.isArray(data) ? data : (data.products || []);
            if (list.length === 0) return;

            let sameCatId = null;
            if (cartItems && cartItems.length > 0 && cartItems[0].category_id) {
                sameCatId = cartItems[0].category_id;
            } else {
                const uniqueCatIds = Array.from(new Set(list.map(p => p.category_id).filter(Boolean)));
                if (uniqueCatIds.length > 0) {
                    sameCatId = uniqueCatIds[Math.floor(Math.random() * uniqueCatIds.length)];
                }
            }

            const sameList = list.filter(p => p.category_id === sameCatId);

            const otherCatIds = Array.from(new Set(list.map(p => p.category_id).filter(id => id && id !== sameCatId)));
            let otherList = [];
            if (otherCatIds.length > 0) {
                const randomOtherCatId = otherCatIds[Math.floor(Math.random() * otherCatIds.length)];
                otherList = list.filter(p => p.category_id === randomOtherCatId);
            } else {
                otherList = list;
            }

            const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());
            const chosenSame = shuffle(sameList).slice(0, 5);
            const chosenOther = shuffle(otherList).slice(0, 5);

            const mixed = shuffle([...chosenSame, ...chosenOther]).slice(0, 10);
            setRecommendedProducts(mixed);
        } catch (err) {
            console.error("Failed to load cart recommendations:", err);
        }
    };

    useEffect(() => {
        if (!loading) {
            fetchRecommendations(items);
        }
    }, [loading]);

    const loadCart = async () => {
        try {
            const res = await api.get("/cart");
            const data = res.data;
            const cartItems = Array.isArray(data) ? data : data.items || [];
            
            // Filter out of stock items
            const outOfStockItems = cartItems.filter(item => item.stock === null || item.stock === undefined || item.stock <= 0);
            
            if (outOfStockItems.length > 0) {
                for (const item of outOfStockItems) {
                    try {
                        await api.delete(`/cart/${item.id}`);
                    } catch (e) {
                        console.error(e);
                    }
                }
                const names = outOfStockItems.map(item => `"${item.name}"`).join(", ");
                alert(`The following item(s) are out of stock and have been removed from your cart: ${names}`);
                const inStockItems = cartItems.filter(item => item.stock !== null && item.stock !== undefined && item.stock > 0);
                setItems(inStockItems);
                localStorage.setItem('tivaa-cart-items', JSON.stringify(inStockItems));
                window.dispatchEvent(new Event('cart-updated'));
            } else {
                setItems(cartItems);
                localStorage.setItem('tivaa-cart-items', JSON.stringify(cartItems));
            }
        } catch (err) {
            console.log(err);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const loadSettings = async () => {
        try {
            const res = await api.get("/settings");
            if (res.data && res.data.shipping_cost) {
                setShippingCost(Number(res.data.shipping_cost) || 65);
            }
        } catch (err) {
            console.log("Failed to load settings in cart:", err);
        }
    };

    useEffect(() => {
        const user = getUser();
        if(!user) {
            router.push("/login");
            return;
        }
        setUser(user);

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        
        loadCart();
        loadSettings();

        const handleCartSync = () => loadCart();
        window.addEventListener('cart-updated', handleCartSync);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('cart-updated', handleCartSync);
        };
    }, [router]);

    const handleRemove = async (id) => {
        try {
            await api.delete(`/cart/${id}`);
            setItems((prev) => prev.filter((i) => i.id !== id));
            window.dispatchEvent(new Event('cart-updated'));
        } catch (err) {
            alert("Failed to remove item");
        }
    };

    const handleUpdateQuantity = async (id, newQty) => {
        if (newQty <= 0) {
            handleRemove(id);
            return;
        }
        try {
            await api.put(`/cart/${id}`, { quantity: newQty });
            setItems((prev) =>
                prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
            );
            window.dispatchEvent(new Event('cart-updated'));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update quantity");
        }
    };

    const subtotal = items.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
    );

    const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

    const shippingCharged = shippingCost;

    const handleDirectStoreSaleInit = async () => {
        setInitiatingSale(true);
        try {
            const res = await api.post("/orders/direct-sale/initiate");
            if (res.data && res.data.orderId) {
                window.dispatchEvent(new Event('cart-updated'));
                router.push(`/direct-store-sale?orderId=${res.data.orderId}`);
            }
        } catch (err) {
            console.error("Failed to initiate direct store sale:", err);
            alert(err.response?.data?.message || "Failed to initiate direct store sale");
        } finally {
            setInitiatingSale(false);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const itemsToRender = isMobile && !isAccordionExpanded ? items.slice(0, 3) : items;

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '24px', paddingBottom: '60px', fontFamily: 'var(--font-poppins), sans-serif' }}>
            
            {/* Header section */}
            <div className="cart-page-header">
                <div>
                    <Heading as="h1" variant="HomeHeader2" className="cart-title">
                        Your Cart <span className="cart-count">({totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'})</span>
                    </Heading>
                    <p className="cart-subtitle">Review your items and proceed to checkout</p>
                </div>
                {isMobile ? (
                    <Link href="/products" className="continue-shopping-mobile-link">
                        Continue Shopping
                    </Link>
                ) : (
                    <Link href="/products" className="continue-shopping-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px', transform: 'rotate(180deg)' }}><polyline points="9 18 15 12 9 6"></polyline></svg>
                        Continue Shopping
                    </Link>
                )}
            </div>

            {items.length === 0 ? (
                <div className="empty-cart-card">
                    <div className="empty-cart-icon-wrapper">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </div>
                    <h2 className="empty-cart-title">Your cart is empty</h2>
                    <p className="empty-cart-desc">Discover our premium collection and add some items.</p>
                    <Link href="/products" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>Continue Shopping</Link>
                </div>
            ) : (
                <>


                    <div className="cart-layout-grid">
                        
                        {/* LEFT COLUMN: ITEMS */}
                        <div className="cart-items-column">
                            
                            <div className="cart-items-panel">
                                {/* Web layout items headers */}
                                {!isMobile && (
                                    <div className="cart-table-header">
                                        <span style={{ flex: 3.5 }}>PRODUCT</span>
                                        <span style={{ flex: 1.2, textAlign: 'center' }}>PRICE</span>
                                        <span style={{ flex: 1.5, textAlign: 'center' }}>QUANTITY</span>
                                        <span style={{ flex: 1.2, textAlign: 'center' }}>TOTAL</span>
                                        <span style={{ flex: 0.8, textAlign: 'center' }}></span>
                                    </div>
                                )}

                                {/* Cart items list */}
                                <div className="cart-items-list-container">
                                    {itemsToRender.map((item) => {
                                        // Extract variant color name if it is a color group
                                        const variantText = item.selected_variation || "";
                                        const isColorVariant = variantText.toLowerCase().includes("color");
                                        let colorHex = "";
                                        let colorName = "";

                                        if (isColorVariant) {
                                            const match = variantText.match(/color:\s*([^,]+)/i);
                                            if (match) {
                                                colorName = match[1].trim();
                                                // simple hex converter for common mockup colors
                                                const lowerColor = colorName.toLowerCase();
                                                if (lowerColor === "red") colorHex = "#eb2f06";
                                                else if (lowerColor === "blue") colorHex = "#0a3d62";
                                                else if (lowerColor === "brown") colorHex = "#78e08f"; // mockup green/brown
                                                else if (lowerColor === "pink") colorHex = "#ff9ff3";
                                                else if (lowerColor === "purple") colorHex = "#5f27cd";
                                                else colorHex = "#7f8c8d";
                                            }
                                        }

                                        return (
                                            <div key={item.id} className="cart-item-card">
                                                {/* Left: Product Info Column */}
                                                <div className="item-details-section">
                                                    <Link href={`/product/${item.product_id}`} className="item-thumbnail-box" style={{ display: 'flex', textDecoration: 'none' }}>
                                                        <img 
                                                            src={item.image_url ? item.image_url.split(",")[0].trim() : "/placeholder.png"} 
                                                            alt={item.name} 
                                                            className="item-img" 
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </Link>
                                                    <div className="item-meta">
                                                        <Link href={`/product/${item.product_id}`} className="item-title-link">
                                                            <h3 className="item-title">{item.name}</h3>
                                                        </Link>
                                                        {variantText && (
                                                            <div className="item-variant-chip-row">
                                                                <span className="variant-label">
                                                                    {variantText.split(",").map((v, i) => {
                                                                        const parts = v.split(":");
                                                                        const label = parts[0]?.trim() || "";
                                                                        const val = parts[1]?.trim() || "";
                                                                        
                                                                        return (
                                                                            <span key={i} className="variant-part">
                                                                                {label}: {val}
                                                                                {label.toLowerCase() === 'color' && colorHex && (
                                                                                    <span className="color-dot" style={{ backgroundColor: colorHex }}></span>
                                                                                )}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </span>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Mobile Inline Price display */}
                                                        {isMobile && (
                                                            <div className="mobile-price-row">
                                                                <span className="mobile-price">₹{item.price}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Price (Desktop only) */}
                                                {!isMobile && (
                                                    <div className="item-price-cell">
                                                        ₹{item.price}
                                                    </div>
                                                )}

                                                {/* Quantity selector */}
                                                <div className="item-quantity-cell">
                                                    <div className="qty-control-box">
                                                        <button 
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                            className="qty-btn"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="qty-value">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                            disabled={item.quantity >= (item.stock === null || item.stock === undefined ? 999 : Number(item.stock))}
                                                            className="qty-btn"
                                                            style={{ cursor: item.quantity >= (item.stock === null || item.stock === undefined ? 999 : Number(item.stock)) ? 'not-allowed' : 'pointer' }}
                                                            aria-label="Increase quantity"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Total price cell (Desktop only) */}
                                                {!isMobile && (
                                                    <div className="item-total-cell">
                                                        ₹{(Number(item.price) * Number(item.quantity))}
                                                    </div>
                                                )}

                                                {/* Remove cell */}
                                                <div className="item-remove-cell">
                                                    <button onClick={() => handleRemove(item.id)} className="remove-btn" aria-label="Remove item">
                                                        <svg className="bin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                        {!isMobile && <span className="remove-btn-text">Remove</span>}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Mobile Accordion Toggle */}
                            {isMobile && items.length > 3 && (
                                <button onClick={() => setIsAccordionExpanded(!isAccordionExpanded)} className="accordion-toggle-btn">
                                    {isAccordionExpanded ? (
                                        <>
                                            Show Less
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px' }}><polyline points="18 15 12 9 6 15"></polyline></svg>
                                        </>
                                    ) : (
                                        <>
                                            View All ({items.length} Items)
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </>
                                    )}
                                </button>
                            )}

                            {user && user.role === 'admin' && (
                                <div style={{
                                    marginTop: '16px',
                                    padding: '16px',
                                    background: '#eff6ff',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    color: '#1e40af',
                                    fontSize: '0.85rem'
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>You are logged in as Admin.</div>
                                        <div style={{ fontSize: '0.78rem', color: '#1d4ed8', marginTop: '2px' }}>You have access to Direct Store Sale.</div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* RIGHT COLUMN: ORDER SUMMARY */}
                        <div className="cart-summary-column">
                            <aside className="order-summary-card">
                                <h2 className="summary-title">Order Summary</h2>

                                <div className="summary-row">
                                    <span className="summary-row-label">Subtotal ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})</span>
                                    <span className="summary-row-value">₹{subtotal}</span>
                                </div>
                                
                                <div className="summary-row">
                                    <span className="summary-row-label">Shipping</span>
                                    <span className="summary-row-value">
                                        ₹{shippingCost.toFixed(2)}
                                    </span>
                                </div>

                                <div className="summary-row" style={{ marginBottom: '20px' }}>
                                    <span className="summary-row-label">Taxes</span>
                                    <span className="summary-row-value">Included</span>
                                </div>

                                <div className="summary-divider"></div>

                                <div className="total-row">
                                    <span className="total-label">Total</span>
                                    <span className="total-value">₹{(subtotal + shippingCharged)}</span>
                                </div>

                                {/* Checkout Buttons */}
                                <div className="summary-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <Link href="/checkout" className="checkout-btn">
                                        Proceed to Checkout
                                    </Link>
                                    {user && user.role === 'admin' && (
                                        <>
                                            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR</div>
                                            <button 
                                                type="button" 
                                                onClick={handleDirectStoreSaleInit} 
                                                disabled={initiatingSale}
                                                className="direct-sale-btn"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '12px',
                                                    width: '100%',
                                                    border: '1.5px solid #0d9488',
                                                    borderRadius: 'var(--radius-btn, 10px)',
                                                    padding: '12px 20px',
                                                    background: '#fcfdfd',
                                                    color: '#0d9488',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <span style={{ fontSize: '1.5rem' }}>🏪</span>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{initiatingSale ? "Initiating..." : "Direct Store Sale (Admin)"}</span>
                                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Skip address & online payment</span>
                                                </div>
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* We Accept block */}
                                <div className="we-accept-section">
                                    <span className="accept-title">We Accept</span>
                                    <PaymentLogos />
                                </div>
                            </aside>
                        </div>

                    </div>
                </>
            )}

            <style jsx global>{`
                .cart-page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 24px;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 16px;
                }
                .cart-title {
                    margin: 0;
                    letter-spacing: -0.2px;
                }
                .cart-count {
                    font-weight: 500;
                    color: var(--text-muted);
                    font-size: 11px;
                    margin-left: 4px;
                }
                .cart-subtitle {
                    font-size: 10px;
                    color: var(--text-muted);
                    margin: 4px 0 0 0;
                }
                .continue-shopping-btn {
                    display: inline-flex;
                    align-items: center;
                    border: 1px solid var(--border);
                    color: var(--accent);
                    padding: 8px 16px;
                    font-size: 13px;
                    font-weight: 600;
                    border-radius: 6px;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    background: transparent;
                }
                .continue-shopping-btn:hover {
                    background: var(--accent);
                    color: #ffffff;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px var(--accent-glow);
                }
                .continue-shopping-mobile-link {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    padding: 6px 12px;
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--accent);
                    background: #ffffff;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }
                .continue-shopping-mobile-link:hover {
                    background: #fafbfc;
                }
                
                /* Layout grid */
                .cart-layout-grid {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 32px;
                    align-items: flex-start;
                }

                /* Panel container for items and headers */
                .cart-items-panel {
                    background: #ffffff;
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    overflow: hidden;
                }

                /* Table header */
                .cart-table-header {
                    display: flex;
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--border);
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-muted);
                    letter-spacing: 1px;
                    background: #ffffff;
                }

                /* Cart item cards list */
                .cart-items-list-container {
                    display: flex;
                    flex-direction: column;
                }
                .cart-item-card {
                    display: flex;
                    align-items: center;
                    padding: 12px 24px;
                    border-bottom: 1px solid var(--border);
                    background: #ffffff;
                    transition: background-color 0.2s ease;
                }
                .cart-item-card:last-child {
                    border-bottom: none;
                }
                .cart-item-card:hover {
                    background-color: #fafbfc;
                }
                
                /* Details section */
                .item-details-section {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex: 3.5;
                    min-width: 0;
                }
                .item-thumbnail-box {
                    width: 68px;
                    height: 68px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    overflow: hidden;
                    background: #ffffff;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .item-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .item-meta {
                    flex: 1;
                    min-width: 0;
                }
                .item-title-link {
                    text-decoration: none;
                    display: block;
                }
                .item-title {
                    font-size: 13.5px;
                    font-weight: 600;
                    color: var(--text-main);
                    margin: 0 0 6px 0;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .item-variant-chip-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .variant-part {
                    font-size: 11px;
                    color: var(--text-muted);
                    background: #f1f5f9;
                    padding: 2px 8px;
                    border-radius: 4px;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: 500;
                }
                .color-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    display: inline-block;
                }
                
                /* Table cells spacing */
                .item-price-cell {
                    flex: 1.2;
                    text-align: center;
                    font-size: 13.5px;
                    color: var(--text-main);
                    font-weight: 500;
                }
                .item-quantity-cell {
                    flex: 1.5;
                    display: flex;
                    justify-content: center;
                }
                .item-total-cell {
                    flex: 1.2;
                    text-align: center;
                    font-size: 13.5px;
                    color: var(--text-main);
                    font-weight: 600;
                }
                .item-remove-cell {
                    flex: 0.8;
                    display: flex;
                    justify-content: center;
                }

                /* Quantity controller */
                .qty-control-box {
                    display: flex;
                    align-items: center;
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    overflow: hidden;
                    height: 30px;
                    width: 80px;
                    background: #ffffff;
                }
                .qty-btn {
                    width: 26px;
                    height: 100%;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-main);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    transition: background-color 0.2s;
                }
                .qty-btn:hover:not(:disabled) {
                    background-color: #f1f5f9;
                }
                .qty-btn:disabled {
                    color: var(--text-light);
                    cursor: not-allowed;
                }
                .qty-value {
                    flex: 1;
                    text-align: center;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-main);
                    border-left: 1px solid var(--border);
                    border-right: 1px solid var(--border);
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #fafbfc;
                }

                /* Remove button */
                .remove-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 3px;
                    transition: color 0.2s;
                    padding: 4px;
                }
                .remove-btn:hover {
                    color: var(--danger);
                }
                .remove-btn-text {
                    font-size: 9px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Mobile accordion toggle */
                .accordion-toggle-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    padding: 12px;
                    border: 1px dashed var(--border);
                    background: transparent;
                    color: var(--accent);
                    font-size: 13px;
                    font-weight: 600;
                    border-radius: 8px;
                    margin-top: 16px;
                    cursor: pointer;
                }

                /* Free shipping progress card */
                .free-shipping-progress-card {
                    background: #f8fafc;
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 16px;
                }
                .progress-banner-text {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                .progress-text-label {
                    font-size: 13px;
                    color: var(--text-main);
                }
                .progress-bar-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .progress-bar-bg {
                    flex: 1;
                    height: 8px;
                    background: #e2e8f0;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .progress-bar-fill {
                    height: 100%;
                    background: var(--accent);
                    border-radius: 4px;
                    transition: width 0.4s ease;
                }
                .progress-fraction {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-muted);
                    white-space: nowrap;
                }

                /* ORDER SUMMARY COLUMN */
                .order-summary-card {
                    padding: 24px;
                    background: #ffffff;
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    position: sticky;
                    top: 120px;
                }
                .summary-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-main);
                    margin: 0 0 20px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }
                .summary-row-label {
                    font-size: 13px;
                    color: var(--text-muted);
                }
                .summary-row-value {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-main);
                }
                .shipping-success-alert {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px;
                    background: #e8f5f3;
                    color: var(--accent);
                    border-radius: 6px;
                    margin-bottom: 16px;
                    margin-top: 4px;
                }
                .summary-divider {
                    height: 1px;
                    background: var(--border);
                    margin: 16px 0;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 24px;
                }
                .total-label {
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-main);
                }
                .total-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--accent);
                }

                /* Actions */
                .summary-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                .checkout-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 44px;
                    background: var(--accent);
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.2s;
                }
                .checkout-btn:hover {
                    background: var(--accent-hover);
                    box-shadow: 0 4px 14px var(--accent-glow);
                    transform: translateY(-1px);
                }
                .coupon-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 40px;
                    background: transparent;
                    color: var(--text-main);
                    font-size: 13px;
                    font-weight: 600;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .coupon-btn:hover {
                    border-color: var(--text-main);
                    background-color: #f8fafc;
                }

                 /* Payment accept section */
                .we-accept-section {
                    margin-top: 20px;
                }
                .payment-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                    margin-top: 12px;
                }
                .payment-chip {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 28px;
                    border: 1px solid #e2e8f0;
                    border-radius: 4px;
                    background: #ffffff;
                    overflow: hidden;
                    padding: 4px 6px;
                }
                .payment-chip img {
                    max-width: 100% !important;
                    max-height: 100% !important;
                    width: auto !important;
                    height: auto !important;
                    object-fit: contain !important;
                }
                .accept-title {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .trust-divider {
                    height: 1px;
                    background: var(--border);
                    margin: 20px 0;
                }
                
                /* Trust points with background and center alignment */
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
                    margin-bottom: 2px;
                }
                .trust-caption {
                    font-size: 11px;
                    color: var(--text-muted);
                }

                /* Responsive design */
                @media (max-width: 992px) {
                    .cart-layout-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                    .order-summary-card {
                        position: static;
                    }
                }

                @media (max-width: 768px) {
                    .cart-page-header {
                        margin-bottom: 16px;
                        padding-bottom: 12px;
                        align-items: center;
                    }
                    .cart-title {
                        font-size: 1.1rem;
                    }
                    .cart-count {
                        font-size: 11px;
                    }
                    .cart-item-card {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                        padding: 8px 0;
                    }
                    .item-details-section {
                        align-items: flex-start;
                        gap: 12px;
                    }
                    .item-thumbnail-box {
                        width: 60px;
                        height: 60px;
                    }
                    .item-title {
                        font-size: 13px;
                    }
                    .mobile-price-row {
                        margin-top: 4px;
                    }
                    .mobile-price {
                        font-size: 13px;
                        font-weight: 600;
                        color: var(--text-main);
                    }
                    
                    .item-meta {
                        padding-right: 36px;
                    }
                    
                    /* Spacing cells for mobile */
                    .item-quantity-cell {
                        justify-content: flex-start;
                        margin-left: 0;
                        margin-top: 4px;
                    }
                    .item-remove-cell {
                        position: absolute;
                        right: 0;
                        top: 8px;
                    }
                    .cart-item-card {
                        position: relative;
                    }
                    .remove-btn {
                        padding: 4px 8px;
                    }
                }
            `}</style>
        </div>
    );
}
