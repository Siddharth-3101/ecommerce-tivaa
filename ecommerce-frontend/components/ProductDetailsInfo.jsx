"use client";

import { useState, useEffect } from "react";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProductDetailsInfo({ product }) {
    // Parse variations JSON safely
    let parsedVariations = [];
    if (product.variations) {
        try {
            const parsedObj = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
            if (Array.isArray(parsedObj)) {
                parsedVariations = parsedObj;
            } else {
                // Convert old format to new format
                parsedVariations = Object.entries(parsedObj).map(([name, options]) => ({
                    name,
                    options: options.map(opt => ({ value: opt, image_url: "" }))
                }));
            }
        } catch (e) {
            console.error("Failed to parse variations JSON", e);
        }
    }

    const hasVariations = parsedVariations.length > 0;

    // Track selected variations
    const [selectedOptions, setSelectedOptions] = useState({});
    const [quantity, setQuantity] = useState(1);

    // Initialize with first option of each variation group
    useEffect(() => {
        const initial = {};
        parsedVariations.forEach((group) => {
            if (group.options && group.options.length > 0) {
                initial[group.name] = group.options[0].value;
            }
        });
        setSelectedOptions(initial);
        setQuantity(1); // reset to 1 when product changes
    }, [product.variations]);

    const [buyLoading, setBuyLoading] = useState(false);
    const user = getUser();
    const router = useRouter();

    const handleBuyNow = () => {
        if (!user) {
            router.push("/login");
            return;
        }
        const checkoutQty = cartQty > 0 ? cartQty : 1;
        router.push(`/checkout?buyNow=true&productId=${product.id}&quantity=${checkoutQty}&variation=${encodeURIComponent(selectedVariationString || "")}`);
    };

    const handleOptionSelect = (groupName, option) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [groupName]: option.value,
        }));
        
        if (option.image_url) {
            window.dispatchEvent(new CustomEvent('variationImageSelected', { detail: option.image_url }));
        }
    };

    // Format selection choice distinctively: e.g. "Size: S, Color: Pink"
    const getSelectedVariationString = () => {
        if (Object.keys(selectedOptions).length === 0) return null;
        return Object.entries(selectedOptions)
            .map(([key, val]) => `${key}: ${val}`)
            .join(", ");
    };

    const selectedVariationString = getSelectedVariationString();

    // Sync cart quantity for this specific product/variation
    const [cartQty, setCartQty] = useState(0);

    useEffect(() => {
        const syncQty = () => {
            const cached = localStorage.getItem('tivaa-cart-items');
            if (cached) {
                try {
                    const items = JSON.parse(cached);
                    const match = items.find(item => {
                        const idMatch = item.product_id === product.id;
                        const var1 = item.selected_variation ? item.selected_variation.trim() : null;
                        const var2 = selectedVariationString ? selectedVariationString.trim() : null;
                        return idMatch && var1 === var2;
                    });
                    if (match) {
                        setCartQty(match.quantity);
                    } else {
                        setCartQty(0);
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
                setCartQty(0);
            }
        };

        syncQty();
        window.addEventListener("cart-updated", syncQty);
        window.addEventListener("cart-items-loaded", syncQty);
        return () => {
            window.removeEventListener("cart-updated", syncQty);
            window.removeEventListener("cart-items-loaded", syncQty);
        };
    }, [product.id, selectedVariationString]);

    // Calculate dynamic effective price and stock based on selection
    const getEffectivePriceAndStock = () => {
        let price = product.discounted_price ? Number(product.discounted_price) : Number(product.price);
        let originalPrice = Number(product.price);
        let stock = product.stock !== null && product.stock !== undefined ? Number(product.stock) : 999;
        let isDiscounted = !!product.discounted_price;

        parsedVariations.forEach((group) => {
            const selectedVal = selectedOptions[group.name];
            if (selectedVal && group.options) {
                const matchedOption = group.options.find(opt => opt.value === selectedVal);
                if (matchedOption) {
                    if (matchedOption.price !== undefined && matchedOption.price !== null && matchedOption.price !== "" && Number(matchedOption.price) > 0) {
                        price = Number(matchedOption.price);
                        originalPrice = Number(matchedOption.price);
                        isDiscounted = false; // Override price resets main product discount
                    }
                    if (matchedOption.stock !== undefined && matchedOption.stock !== null && matchedOption.stock !== "") {
                        stock = Number(matchedOption.stock);
                    }
                }
            }
        });

        return { price, originalPrice, stock, isDiscounted };
    };

    const { price: displayPrice, originalPrice: displayOriginalPrice, stock: displayStock, isDiscounted: displayIsDiscounted } = getEffectivePriceAndStock();

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: 0, paddingRight: '16px', fontFamily: 'var(--font-poppins), sans-serif', height: '100%' }}>
            
            {/* Title */}
            <h1 style={{ fontSize: '20px', margin: '0', lineHeight: 1.2, fontWeight: 500, color: 'var(--text-main)', letterSpacing: '-0.5px' }} className="product-title-text">
                {product.name}
            </h1>

            {/* Price section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {displayIsDiscounted ? (
                        <>
                            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent)' }} className="product-price-text">
                                ₹{displayPrice}
                            </span>
                            <span style={{ fontSize: '18px', fontWeight: 400, textDecoration: 'line-through', color: 'var(--text-muted)' }} className="product-original-price">
                                ₹{displayOriginalPrice}
                            </span>
                        </>
                    ) : (
                        <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent)' }} className="product-price-text">
                            ₹{displayPrice}
                        </span>
                    )}
                </div>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>Inclusive of all taxes</span>
            </div>

            {/* Note: product.description removed from here as per user request to move to description tab only */}

            {/* Dynamic Capsule Variation Selectors */}
            {hasVariations && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {parsedVariations.map((group) => (
                        <div key={group.name} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-main)" }}>
                                {group.name}: <span style={{fontWeight: 400}}>{selectedOptions[group.name]}</span>
                            </span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                                {group.options.map((option) => {
                                    const isActive = selectedOptions[group.name] === option.value;
                                    
                                    if (option.image_url) {
                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => handleOptionSelect(group.name, option)}
                                                style={{
                                                    padding: 0,
                                                    width: "56px",
                                                    height: "56px",
                                                    borderRadius: "50%",
                                                    cursor: "pointer",
                                                    border: isActive ? "2px solid var(--text-main)" : "2px solid transparent",
                                                    boxShadow: isActive ? "0 0 0 2px #ffffff inset" : "0 0 0 1px #e0e0e0 inset",
                                                    background: "transparent",
                                                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                                    overflow: "hidden",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                                title={option.value}
                                                className="hover-variant-img"
                                            >
                                                <img src={option.image_url} alt={option.value} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            </button>
                                        );
                                    }

                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => handleOptionSelect(group.name, option)}
                                            style={{
                                                padding: "8px 24px",
                                                borderRadius: "4px",
                                                fontSize: "16px",
                                                fontWeight: isActive ? 600 : 400,
                                                cursor: "pointer",
                                                border: isActive ? "1px solid var(--text-main)" : "1px solid #e0e0e0",
                                                background: isActive ? "rgba(0,0,0,0.02)" : "transparent",
                                                color: "var(--text-main)",
                                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                minWidth: "60px",
                                            }}
                                            className={isActive ? "" : "hover-variant-chip"}
                                        >
                                            {option.value}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Stock Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', marginTop: '0px' }}>
                {displayStock > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                        <span style={{ fontSize: '16px', fontWeight: 500 }}>In Stock</span>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }}></div>
                        <span style={{ fontSize: '16px', fontWeight: 500 }}>Out of Stock</span>
                    </div>
                )}
            </div>

            {/* Action Buttons (Stacked, Full Width) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '0px' }}>
                {displayStock > 0 ? (
                    <>
                        <AddToCartButton 
                            productId={product.id} 
                            disabled={displayStock <= 0} 
                            selectedVariation={selectedVariationString}
                            stock={displayStock}
                            quantity={quantity}
                            className="product-details-btn"
                            style={{ width: '100%', height: '46px', borderRadius: '4px' }}
                            showIcon={true}
                        />
                        <button
                            onClick={handleBuyNow}
                            disabled={displayStock <= 0 || buyLoading}
                            className="btn btn-outline product-details-btn"
                            style={{
                                width: "100%",
                                height: "46px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                cursor: "pointer",
                                borderRadius: "4px",
                                border: "1.5px solid var(--accent)",
                                color: "var(--accent)",
                                background: "transparent",
                                transition: "all 0.2s"
                            }}
                        >
                            {buyLoading ? (
                                <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(15, 157, 148, 0.3)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                            ) : (
                                <>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                    Buy Now
                                </>
                            )}
                        </button>
                    </>
                ) : null}
                
                <WishlistButton 
                    productId={product.id} 
                    variant="textOutline"
                    className="product-details-btn"
                />
            </div>

            {/* Stock Availability Banner */}
            {displayStock > 0 && (
                <div style={{ padding: '12px', background: '#e8f5f3', color: 'var(--accent)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <span style={{ fontSize: '16px' }}><strong>{displayStock} units available.</strong> Order now to secure yours.</span>
                </div>
            )}

            {/* Trust Badges */}
            <div style={{ 
                display: 'flex', 
                gap: '16px', 
                padding: '0 16px', 
                height: '85px', // Set fixed height to align with image tiles
                background: '#f5f9f8', 
                borderRadius: '8px', 
                marginTop: 'auto',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                border: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)', fontFamily: 'var(--font-poppins)' }}>Secure Payment</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-poppins)' }}>100% safe &amp; secure</div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)', fontFamily: 'var(--font-poppins)' }}>Customer Support</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-poppins)' }}>We're here to help</div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .hover-variant-chip:hover {
                    background-color: #f9f9f9 !important;
                    border-color: var(--text-main) !important;
                }
                .hover-variant-img:hover {
                    box-shadow: 0 0 0 2px var(--border) inset !important;
                }
                .btn-outline:hover {
                    background-color: var(--accent) !important;
                    color: white !important;
                }
                
                /* Actions buttons fonts */
                .product-details-btn {
                    font-size: 20px !important;
                    font-weight: 600 !important;
                    font-family: var(--font-poppins), sans-serif !important;
                }
                
                /* Mobile typography overrides */
                @media (max-width: 768px) {
                    .product-title-text {
                        font-size: 16px !important;
                    }
                    .product-price-text {
                        font-size: 20px !important;
                    }
                    .product-original-price {
                        font-size: 14px !important;
                    }
                    .product-details-btn {
                        font-size: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
}
