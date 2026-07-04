"use client";

import { useState, useEffect } from "react";

export default function ProductImageGallery({ images = [], productName = "Product" }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [overrideImage, setOverrideImage] = useState(null);

    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        const handleEvent = (e) => setOverrideImage(e.detail);
        window.addEventListener('variationImageSelected', handleEvent);
        return () => window.removeEventListener('variationImageSelected', handleEvent);
    }, []);

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPos({ x, y });
        setIsZoomed(true);
    };

    const handleMouseLeave = () => {
        setIsZoomed(false);
    };

    const validImages = images.filter(img => img && img.trim() !== "");

    if (validImages.length === 0) {
        return (
            <div style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'center' }}>
                <img
                    src="/placeholder.png"
                    alt={productName}
                    style={{ width: '100%', height: 'auto', borderRadius: '2px', objectFit: 'contain' }}
                />
            </div>
        );
    }

    const primaryImage = overrideImage || validImages[activeIndex];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '420px', width: '100%', margin: '0 auto' }}>
            
            {/* Primary Large Image View */}
            <div 
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ 
                    padding: '12px', 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '4px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    aspectRatio: '4/5',
                    position: 'relative',
                    cursor: 'zoom-in'
                }}
            >
                <img
                    src={primaryImage}
                    alt={`${productName} View`}
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain', 
                        borderRadius: '2px',
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
                        transition: isZoomed ? 'none' : 'transform 0.3s ease, opacity 0.3s ease'
                    }}
                    className="gallery-primary-img"
                />
            </div>

            {/* Clickable Horizontal Thumbnail Row */}
            {validImages.length > 1 && (
                <div 
                    style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        overflowX: 'auto', 
                        paddingBottom: '8px',
                        scrollbarWidth: 'thin'
                    }}
                >
                    {validImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setActiveIndex(idx);
                                setOverrideImage(null);
                            }}
                            style={{
                                width: '70px',
                                height: '70px',
                                padding: '4px',
                                borderRadius: '4px',
                                background: '#ffffff',
                                border: idx === activeIndex ? '2px solid #1a1a1a' : '1px solid var(--border)',
                                cursor: 'pointer',
                                flexShrink: 0,
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}
                            className={`gallery-thumb-btn ${idx === activeIndex ? 'active' : ''}`}
                            aria-label={`View Product Image ${idx + 1}`}
                        >
                            <img 
                                src={img} 
                                alt={`Thumbnail ${idx + 1}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '2px' }} 
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
