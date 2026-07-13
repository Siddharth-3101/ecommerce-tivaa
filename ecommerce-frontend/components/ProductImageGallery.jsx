"use client";

import { useState, useEffect } from "react";

export default function ProductImageGallery({ images = [], productName = "Product", discount = null }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [overrideImage, setOverrideImage] = useState(null);

    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        const handleEvent = (e) => {
            const imageUrl = e.detail;
            setOverrideImage(imageUrl);
            if (imageUrl) {
                const idx = images.findIndex(img => img && img.trim() === imageUrl.trim());
                if (idx !== -1) {
                    setActiveIndex(idx);
                }
            }
        };
        window.addEventListener('variationImageSelected', handleEvent);
        return () => window.removeEventListener('variationImageSelected', handleEvent);
    }, [images]);

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPos({ x, y });
    };

    const handleMouseLeave = () => {
        setIsZoomed(false);
    };

    const handleContainerClick = () => {
        setIsZoomed(!isZoomed);
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setActiveIndex((prev) => (prev + 1) % validImages.length);
        setOverrideImage(null);
    }

    const prevImage = (e) => {
        e.stopPropagation();
        setActiveIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
        setOverrideImage(null);
    }

    const validImages = images.filter(img => img && img.trim() !== "");

    if (validImages.length === 0) {
        return (
            <div style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', textAlign: 'center' }}>
                <img
                    src="/placeholder.png"
                    alt={productName}
                    style={{ width: '100%', height: 'auto', borderRadius: '16px', objectFit: 'contain' }}
                />
            </div>
        );
    }

    const primaryImage = overrideImage || validImages[activeIndex];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', width: '100%', margin: '0 auto', height: '100%' }}>
            
            {/* Primary Large Image View */}
            <div 
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleContainerClick}
                style={{ 
                    width: '100%',
                    padding: '0', 
                    background: '#ffffff', // changed to white
                    border: '1px solid var(--border)', 
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    aspectRatio: '1.3/1',
                    position: 'relative',
                    cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'white',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    cursor: 'pointer'
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                </div>

                {validImages.length > 1 && (
                    <>
                        <button onClick={prevImage} style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'white',
                            border: 'none',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            zIndex: 10
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button onClick={nextImage} style={{
                            position: 'absolute',
                            right: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'white',
                            border: 'none',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            zIndex: 10
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </>
                )}

                <img
                    src={primaryImage}
                    alt={`${productName} View`}
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain', 
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        transform: isZoomed ? 'scale(2)' : 'scale(1)',
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
                        gap: '16px', 
                        overflowX: 'auto', 
                        paddingBottom: '8px',
                        scrollbarWidth: 'none', // hide scrollbar for cleaner look
                        msOverflowStyle: 'none',
                        marginTop: 'auto'
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
                                width: '85px',
                                height: '85px',
                                padding: '4px',
                                borderRadius: '12px', // rounded squares
                                background: '#ffffff', // changed to white
                                border: idx === activeIndex ? '2px solid var(--accent)' : '2px solid var(--border)',
                                cursor: 'pointer',
                                flexShrink: 0,
                                transition: 'all 0.2s ease',
                                outline: 'none',
                                overflow: 'hidden'
                            }}
                            className={`gallery-thumb-btn ${idx === activeIndex ? 'active' : ''}`}
                            aria-label={`View Product Image ${idx + 1}`}
                        >
                            <img 
                                src={img} 
                                alt={`Thumbnail ${idx + 1}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} 
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

