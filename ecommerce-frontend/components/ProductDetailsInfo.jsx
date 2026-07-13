"use client";

import { useState, useEffect } from "react";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Heading from "./Heading";
import Button from "./Button";

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
        let firstImageUrl = null;
        
        parsedVariations.forEach((group, idx) => {
            if (group.options && group.options.length > 0) {
                initial[group.name] = group.options[0].value;
                if (idx === 0 && group.options[0].image_url) {
                    firstImageUrl = group.options[0].image_url;
                }
            }
        });
        
        setSelectedOptions(initial);
        setQuantity(1); // reset to 1 when product changes

        if (firstImageUrl) {
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('variationImageSelected', { detail: firstImageUrl }));
            }, 50);
        }
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
                        const optPrice = Number(matchedOption.price);
                        if (product.discounted_price && Number(product.discounted_price) > 0 && Number(product.price) > Number(product.discounted_price)) {
                            price = optPrice;
                            originalPrice = Math.round(optPrice * (Number(product.price) / Number(product.discounted_price)));
                            isDiscounted = true;
                        } else {
                            price = optPrice;
                            originalPrice = optPrice;
                            isDiscounted = false;
                        }
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
            <Heading as="h3" variant="HomeHeader2" style={{ margin: '0', lineHeight: 1.2, fontWeight: 500, color: 'var(--text-main)', letterSpacing: '-0.5px' }} className="product-title-text">
                {product.name}
            </Heading>

            {/* Price section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {displayIsDiscounted ? (
                        <>
                            <span style={{ fontSize: '19.2px', fontWeight: 700, color: 'var(--accent)' }} className="product-price-text">
                                ₹{displayPrice}
                            </span>
                            <span style={{ fontSize: '14.4px', fontWeight: 400, textDecoration: 'line-through', color: 'var(--text-muted)' }} className="product-original-price">
                                ₹{displayOriginalPrice}
                            </span>
                        </>
                    ) : (
                        <span style={{ fontSize: '19.2px', fontWeight: 700, color: 'var(--accent)' }} className="product-price-text">
                            ₹{displayPrice}
                        </span>
                    )}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>Inclusive of all taxes</span>
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
            {displayStock <= 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', marginTop: '0px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }}></div>
                        <span style={{ fontSize: '16px', fontWeight: 500 }}>Out of Stock</span>
                    </div>
                </div>
            )}

            {/* Action Buttons (Side by Side) */}
            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '0px' }}>
                {displayStock > 0 ? (
                    <>
                        <div style={{ flex: 1 }}>
                            <AddToCartButton
                                productId={product.id}
                                disabled={displayStock <= 0}
                                selectedVariation={selectedVariationString}
                                stock={displayStock}
                                quantity={quantity}
                                variant="primary"
                                style={{ height: '48px', fontSize: '15px' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Button 
                                variant="brand-solid"
                                onClick={handleBuyNow}
                                style={{ 
                                    width: "100%", 
                                    padding: "0 16px", 
                                    fontSize: "15px", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center", 
                                    gap: "8px", 
                                    height: '48px',
                                    fontFamily: "var(--font-poppins), sans-serif",
                                    textTransform: 'none',
                                    letterSpacing: '0'
                                }}
                                className="product-details-btn"
                                disabled={displayStock <= 0 || buyLoading}
                            >
                                {buyLoading ? (
                                    <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(255, 255, 255, 0.3)', borderRadius: '50%', borderTopColor: '#ffffff', animation: 'spin 1s ease-in-out infinite' }}></span>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                        Buy Now
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                ) : null}
            </div>          
                <WishlistButton 
                    productId={product.id} 
                    variant="textOutline"
                    className="product-details-btn"
                />

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
                marginTop: '20px',
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
                
                /* Product Typography Overrides */
                .product-title-text {
                    font-size: 0.85rem !important;
                    font-weight: 600 !important;
                    font-family: var(--font-poppins), sans-serif !important;
                    color: var(--text-main) !important;
                }
                .product-price-text {
                    font-size: 19.2px !important;
                    font-weight: 700 !important;
                    font-family: var(--font-poppins), sans-serif !important;
                    color: var(--accent) !important;
                }
                .product-original-price {
                    font-size: 14.4px !important;
                    font-weight: 400 !important;
                    font-family: var(--font-poppins), sans-serif !important;
                    color: var(--text-muted) !important;
                    text-decoration: line-through !important;
                }
                
                /* Actions buttons fonts */
                .product-details-btn {
                    font-size: 15px !important;
                    font-weight: 600 !important;
                    font-family: var(--font-poppins), sans-serif !important;
                }
                
                /* Mobile typography overrides */
                @media (max-width: 768px) {
                    .product-title-text {
                        font-size: 0.85rem !important;
                    }
                    .product-price-text {
                        font-size: 16px !important;
                    }
                    .product-original-price {
                        font-size: 12px !important;
                    }
                    .product-details-btn {
                        font-size: 14px !important;
                    }
                }
            `}</style>
        </div>
    );
}
