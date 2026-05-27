"use client";

import { useState, useEffect } from "react";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";

export default function ProductDetailsInfo({ product }) {
    // Parse variations JSON safely
    let parsedVariations = {};
    if (product.variations) {
        if (typeof product.variations === 'object') {
            parsedVariations = product.variations;
        } else if (typeof product.variations === 'string') {
            try {
                parsedVariations = JSON.parse(product.variations);
            } catch (e) {
                console.error("Failed to parse variations JSON", e);
            }
        }
    }

    const hasVariations = Object.keys(parsedVariations).length > 0;

    // Track selected variations
    const [selectedOptions, setSelectedOptions] = useState({});

    // Initialize with first option of each variation group
    useEffect(() => {
        const initial = {};
        Object.keys(parsedVariations).forEach((key) => {
            if (parsedVariations[key] && parsedVariations[key].length > 0) {
                initial[key] = parsedVariations[key][0];
            }
        });
        setSelectedOptions(initial);
    }, [product.variations]);

    const handleOptionSelect = (groupName, value) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [groupName]: value,
        }));
    };

    // Format selection choice distinctively: e.g. "Size: S, Color: Pink"
    const getSelectedVariationString = () => {
        if (Object.keys(selectedOptions).length === 0) return null;
        return Object.entries(selectedOptions)
            .map(([key, val]) => `${key}: ${val}`)
            .join(", ");
    };

    const selectedVariationString = getSelectedVariationString();

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Category, Name, Price */}
            <div>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {product.category_name || "Premium Collection"}
                </span>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '12px 0', lineHeight: 1.1, fontWeight: 300, letterSpacing: '-0.5px' }}>
                    {product.name}
                </h1>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Rs. {product.price}
                    </span>
                </div>
            </div>

            <div style={{ height: '1px', background: 'var(--border)' }}></div>

            {/* Description */}
            <div>
                <p style={{ color: "var(--text-muted)", fontSize: '1.05rem', lineHeight: 1.8, fontWeight: 400 }}>
                    {product.description || "An absolute masterpiece. Elegantly designed and crafted for perfection. Add this to your collection."}
                </p>
            </div>

            {/* Dynamic Capsule Variation Selectors */}
            {hasVariations && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "8px" }}>
                    {Object.entries(parsedVariations).map(([groupName, options]) => (
                        <div key={groupName} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)" }}>
                                Select {groupName}
                            </span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                {options.map((option) => {
                                    const isActive = selectedOptions[groupName] === option;
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => handleOptionSelect(groupName, option)}
                                            style={{
                                                padding: "8px 20px",
                                                borderRadius: "50px",
                                                fontSize: "0.85rem",
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
                                            {option}
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

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '16px' }}>
                <div style={{ flex: '1' }}>
                    <AddToCartButton 
                        productId={product.id} 
                        disabled={product.stock <= 0} 
                        selectedVariation={selectedVariationString}
                    />
                </div>
                <div>
                    <WishlistButton productId={product.id} />
                </div>
            </div>

            {/* Stock Availability Banner */}
            {product.stock <= 0 ? (
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span style={{ fontSize: '0.95rem' }}><strong>Currently Out of Stock.</strong> Please check back later.</span>
                </div>
            ) : (
                <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', color: 'rgba(16, 185, 129, 0.95)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', border: "1px solid rgba(16, 185, 129, 0.1)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <span style={{ fontSize: '0.95rem' }}><strong>{product.stock} units available.</strong> Order now to secure yours.</span>
                </div>
            )}

            {/* Product Features */}
            <div className="card" style={{ marginTop: '12px', padding: '24px', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.5px' }}>Product Features</h3>
                <ul style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '20px', fontSize: '0.95rem' }}>
                    <li><strong>Premium Quality:</strong> Built with high quality materials.</li>
                    <li><strong>Express Delivery:</strong> Delivered directly to your door.</li>
                    <li><strong>Secure Warranty:</strong> 30-day return window.</li>
                </ul>
            </div>

            <style jsx global>{`
                .hover-variant-chip:hover {
                    background-color: #f5f5f5 !important;
                    border-color: var(--text-main) !important;
                }
            `}</style>
        </div>
    );
}
