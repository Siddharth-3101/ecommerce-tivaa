"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shippingCost, setShippingCost] = useState(0);
    const router = useRouter();

    const loadCart = async () => {
        try {
            const res = await api.get("/cart");
            const data = res.data;
            const cartItems = Array.isArray(data) ? data : data.items || [];
            setItems(cartItems);
            localStorage.setItem('tivaa-cart-items', JSON.stringify(cartItems));
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
                setShippingCost(Number(res.data.shipping_cost) || 0);
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
        
        loadCart();
        loadSettings();

        // Listen for internal cart syncs
        const handleCartSync = () => loadCart();
        window.addEventListener('cart-updated', handleCartSync);
        return () => window.removeEventListener('cart-updated', handleCartSync);
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

    const handleClearCart = async () => {
        try {
            await api.delete("/cart");
            setItems([]);
            window.dispatchEvent(new Event('cart-updated'));
        } catch (err) {
            alert("Failed to clear cart");
        }
    };

    const total = items.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
    );

    if (loading)
        return (
            <div className="container" style={{ paddingTop: '30px', display: 'flex', justifyContent: 'center' }}>
                <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '30px', paddingBottom: '80px' }}>
            <div className="cart-header-row">
                <div>
                    <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Your Selection</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Review your items before proceeding to checkout.</p>
                </div>
                {items.length > 0 && (
                    <button onClick={handleClearCart} className="btn" style={{ padding: '8px 16px', background: 'transparent', color: 'var(--danger)', border: '1px solid var(--border)' }}>
                        Clear Cart
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <div className="card" style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-card)' }}>
                    <div style={{ width: '80px', height: '80px', margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Your cart is empty</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Discover our premium collection and add some items.</p>
                    <Link href="/" className="btn btn-primary">Continue Shopping</Link>
                </div>
            ) : (
                <div className="cart-grid-boutique">
                    {/* LEFT — ITEMS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {items.map((item) => (
                            <div key={item.id} className="card cart-item-row">
                                <Link href={`/product/${item.product_id || item.id}`}>
                                    <div className="cart-item-image-wrapper">
                                        <img src={item.image_url ? item.image_url.split(",")[0].trim() : "/placeholder.png"} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={item.name} />
                                    </div>
                                </Link>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Link href={`/product/${item.product_id || item.id}`} style={{ textDecoration: 'none', display: 'block', minWidth: 0, overflow: 'hidden', flex: 1 }}>
                                            <h3 className="cart-item-title">{item.name}</h3>
                                        </Link>
                                        <button className="btn" onClick={() => handleRemove(item.id)} style={{ padding: '6px', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', marginLeft: '8px' }} aria-label="Remove item">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                    
                                    {item.selected_variation && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', background: 'rgba(0,0,0,0.03)', padding: '3px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '8px', fontWeight: 500 }}>
                                            Variant: {item.selected_variation}
                                        </div>
                                    )}
                                    
                                    {/* Interactive Quantity Selector */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                        <span style={{ color: "var(--text-muted)", fontSize: '0.85rem' }}>Qty:</span>
                                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden', height: '26px', background: '#ffffff' }}>
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                style={{ width: '26px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', padding: 0 }}
                                                aria-label="Decrease quantity"
                                            >
                                                -
                                            </button>
                                            <span style={{ width: '28px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-glass)' }}>
                                                {item.quantity}
                                            </span>
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                disabled={item.quantity >= (item.stock === null || item.stock === undefined ? 0 : Number(item.stock))}
                                                style={{ 
                                                    width: '26px', 
                                                    height: '100%', 
                                                    border: 'none', 
                                                    background: 'transparent', 
                                                    cursor: item.quantity >= (item.stock === null || item.stock === undefined ? 0 : Number(item.stock)) ? 'not-allowed' : 'pointer', 
                                                    fontSize: '0.9rem', 
                                                    fontWeight: 'bold', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    color: item.quantity >= (item.stock === null || item.stock === undefined ? 0 : Number(item.stock)) ? 'var(--text-light)' : 'var(--text-main)', 
                                                    padding: 0 
                                                }}
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Rs. {item.price}</span>
                                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent)' }}>Rs. {(Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT — SUMMARY */}
                    <aside className="card" style={{ padding: "32px", position: 'sticky', top: '120px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px' }}>
                        <h3 style={{ marginTop: 0, fontSize: '1.2rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Summary</h3>

                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <span>Subtotal ({items.reduce((acc, curr) => acc + curr.quantity, 0)} items)</span>
                            <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>Rs. {total.toFixed(2)}</span>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <span>Shipping</span>
                            <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{shippingCost > 0 ? `Rs. ${shippingCost.toFixed(2)}` : "Free"}</span>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <span>Taxes</span>
                            <span style={{ color: 'var(--text-main)' }}>Calculated at checkout</span>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: '24px', borderTop: '1px solid var(--border)', marginBottom: '32px' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</span>
                            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>Rs. ${(total + shippingCost).toFixed(2)}</span>
                        </div>

                        <Link href="/checkout" className="btn btn-black-solid" style={{ display: "flex", width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.95rem' }}>
                            Secure Checkout
                            <svg style={{ marginLeft: '8px' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </Link>
                        
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '16px', lineHeight: 1.4 }}>
                            By proceeding to checkout you agree to our terms of service and secure shopping policies.
                        </p>
                    </aside>
                </div>
            )}

            <style jsx>{`
                .cart-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 32px;
                }
                .cart-grid-boutique {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 32px;
                    align-items: flex-start;
                }
                .cart-item-row {
                    display: flex;
                    gap: 24px;
                    padding: 20px;
                    align-items: center;
                    background: #ffffff;
                }
                .cart-item-image-wrapper {
                    width: 100px;
                    height: 100px;
                    border-radius: 4px;
                    overflow: hidden;
                    background: #f9f9f9;
                    border: 1px solid var(--border);
                    flex-shrink: 0;
                }
                .cart-item-title {
                    margin: 0;
                    font-size: 1.1rem;
                    color: var(--text-main);
                    font-family: 'Poppins', sans-serif;
                    font-weight: 500;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.35;
                }

                @media (max-width: 900px) {
                    .cart-grid-boutique {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                }

                @media (max-width: 600px) {
                    .cart-header-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }
                    .cart-header-row h1 {
                        font-size: 1.8rem !important;
                    }
                    .cart-item-row {
                        gap: 12px;
                        padding: 12px;
                    }
                    .cart-item-image-wrapper {
                        width: 70px;
                        height: 70px;
                    }
                    .cart-item-title {
                        font-size: 0.95rem;
                    }
                }
            `}</style>
        </div>
    );
}
