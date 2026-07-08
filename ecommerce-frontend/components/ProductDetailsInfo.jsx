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
        router.push(`/checkout?buyNow=true&productId=${product.id}&quantity=${quantity}&variation=${encodeURIComponent(selectedVariationString || "")}`);
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
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
            {/* Category, Name, Price */}
            <div>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {product.category_name ? (
                        <Link href={`/products?category=${encodeURIComponent(product.category_name)}`} style={{ textDecoration: 'underline' }}>
                            {product.category_name}
                        </Link>
                    ) : "Premium Collection"}
                </span>
                {product.purchased_from && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '12px', background: 'rgba(122, 56, 194, 0.06)', padding: '4px 10px', borderRadius: '4px', textTransform: 'none', letterSpacing: 'normal', fontWeight: 500, display: 'inline-flex', alignItems: 'center' }}>
                        Purchased from: <strong style={{ color: 'var(--text-main)', marginLeft: '4px' }}>{product.purchased_from}</strong>
                    </span>
                )}
                <h1 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', margin: '8px 0', lineHeight: 1.1, fontWeight: 400, letterSpacing: '-0.5px' }}>
                    {product.name}
                </h1>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {displayIsDiscounted ? (
                        <>
                            <span style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--accent)' }}>
                                ₹{displayPrice}
                            </span>
                            <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                                ₹{displayOriginalPrice}
                            </span>
                        </>
                    ) : (
                        <span style={{ fontSize: '1.45rem', fontWeight: 600, color: 'var(--accent)' }}>
                            ₹{displayPrice}
                        </span>
                    )}
                </div>
            </div>

            <div style={{ height: '1px', background: 'var(--border)' }}></div>

            {/* Description */}
            {product.description && (
                <div>
                    <div 
                        className="quill-content"
                        style={{ color: "var(--text-muted)", fontSize: '1.05rem', lineHeight: 1.8, fontWeight: 400 }}
                        dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                </div>
            )}

            {/* Dynamic Capsule Variation Selectors */}
            {hasVariations && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "8px" }}>
                    {parsedVariations.map((group) => (
                        <div key={group.name} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)" }}>
                                Select {group.name}
                            </span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                                {group.options.map((option) => {
                                    const isActive = selectedOptions[group.name] === option.value;
                                    
                                    if (option.image_url) {
                                        // Visual Swatch
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

                                    // Text Button
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => handleOptionSelect(group.name, option)}
                                            style={{
                                                padding: "10px 24px",
                                                borderRadius: "50px",
                                                fontSize: "0.9rem",
                                                fontWeight: isActive ? 600 : 400,
                                                cursor: "pointer",
                                                border: isActive ? "1.5px solid var(--text-main)" : "1.5px solid #e0e0e0",
                                                background: isActive ? "var(--text-main)" : "transparent",
                                                color: isActive ? "#ffffff" : "var(--text-main)",
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
                    
                    {selectedVariationString && (
                        <div style={{ fontSize: "0.9rem", color: "var(--accent)", background: "rgba(0,0,0,0.02)", padding: "10px 16px", borderRadius: "4px", borderLeft: "3px solid var(--text-main)" }}>
                            Selected: <strong>{selectedVariationString}</strong>
                        </div>
                    )}
                </div>
            )}

            {/* Quantity Selector */}
            {displayStock > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '24px 0 16px 0' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quantity</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border)', borderRadius: '4px', width: 'fit-content', padding: '4px', background: '#fafafa' }}>
                        <button 
                            type="button" 
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}
                        >
                            -
                        </button>
                        <span style={{ fontSize: '1rem', fontWeight: 600, minWidth: '32px', textAlign: 'center', color: 'var(--text-main)' }}>{quantity}</span>
                        <button 
                            type="button" 
                            onClick={() => setQuantity(q => Math.min(displayStock, q + 1))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}
                        >
                            +
                        </button>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                {displayStock > 0 ? (
                    <>
                        <div style={{ flex: '1', minWidth: '180px' }}>
                            <AddToCartButton 
                                productId={product.id} 
                                disabled={displayStock <= 0} 
                                selectedVariation={selectedVariationString}
                                stock={displayStock}
                                quantity={quantity}
                            />
                        </div>
                        <div style={{ flex: '1', minWidth: '180px' }}>
                            <button
                                onClick={handleBuyNow}
                                disabled={displayStock <= 0 || buyLoading}
                                className="btn btn-black-solid"
                                style={{
                                    width: "100%",
                                    padding: "16px",
                                    fontSize: "1.1rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    backgroundColor: "var(--text-main)",
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    transition: "all 0.2s"
                                }}
                            >
                                {buyLoading ? (
                                    <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderRadius: '50%', borderTopColor: '#fff', animation: 'spin 1s ease-in-out infinite' }}></span>
                                ) : (
                                    <>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                        Buy Now
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                ) : null}
                <div>
                    <WishlistButton productId={product.id} />
                </div>
            </div>

            {/* Stock Availability Banner */}
            {displayStock <= 0 ? (
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span style={{ fontSize: '0.95rem' }}><strong>Currently Out of Stock.</strong> Please check back later.</span>
                </div>
            ) : (
                <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', color: 'rgba(16, 185, 129, 0.95)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', border: "1px solid rgba(16, 185, 129, 0.1)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <span style={{ fontSize: '0.95rem' }}><strong>{displayStock} units available.</strong> Order now to secure yours.</span>
                </div>
            )}

            {/* Product Features */}
            {product.features && (
                <div className="card" style={{ marginTop: '12px', padding: '24px', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.5px' }}>Product Features</h3>
                    <ul style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px', fontSize: '0.95rem' }}>
                        {product.features.split('\n').filter(f => f.trim()).map((feature, i) => {
                            const splitIdx = feature.indexOf(':');
                            if (splitIdx > -1) {
                                return (
                                    <li key={i}><strong>{feature.substring(0, splitIdx + 1)}</strong>{feature.substring(splitIdx + 1)}</li>
                                );
                            }
                            return <li key={i}>{feature}</li>;
                        })}
                    </ul>
                </div>
            )}

            <style jsx global>{`
                .hover-variant-chip:hover {
                    background-color: #f5f5f5 !important;
                    border-color: var(--text-main) !important;
                }
                .hover-variant-img:hover {
                    box-shadow: 0 0 0 2px var(--border) inset !important;
                }
            `}</style>
        </div>
    );
}
