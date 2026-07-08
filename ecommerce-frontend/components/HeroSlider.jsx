"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroSlider({ slides = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const touchStart = useRef(0);
    const touchEnd = useRef(0);

    // Auto slide effect
    useEffect(() => {
        if (slides.length <= 1 || isHovered) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length, isHovered]);

    if (!slides || slides.length === 0) return null;

    const handlePrev = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const handleNext = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const handleTouchStart = (e) => {
        touchStart.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEnd.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStart.current - touchEnd.current > 50) {
            // Swipe Left -> Next
            handleNext({ preventDefault: () => {}, stopPropagation: () => {} });
        }
        if (touchStart.current - touchEnd.current < -50) {
            // Swipe Right -> Prev
            handlePrev({ preventDefault: () => {}, stopPropagation: () => {} });
        }
    };

    return (
        <section 
            className="hero-slider-section"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ 
                position: 'relative', 
                width: '100%', 
                overflow: 'hidden',
                borderRadius: 'var(--radius-hero, 24px)',
                background: '#f8fafc',
                boxShadow: 'var(--shadow-sm)'
            }}
        >
            {/* Slides container */}
            <div 
                style={{ 
                    display: 'flex', 
                    width: '100%',
                    transform: `translateX(-${currentIndex * 100}%)`, 
                    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
                }}
            >
                {slides.map((slide, idx) => (
                    <div 
                        key={slide.id || idx} 
                        style={{ 
                            position: 'relative', 
                            minWidth: '100%', 
                            width: '100%', 
                            aspectRatio: '1920/800' 
                        }}
                        className="hero-slide-item"
                    >
                        <Link href={slide.link || "/products"} style={{ display: 'block', width: '100%', height: '100%' }}>
                            <picture>
                                {/* Mobile Banner */}
                                <source srcSet={slide.mobile_url || slide.desktop_url} media="(max-width: 768px)" />
                                {/* Desktop Banner */}
                                <img 
                                    src={slide.desktop_url} 
                                    alt={slide.title || "Tivaa Elegance Banner"} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    draggable={false}
                                />
                            </picture>

                            {/* Text and Button Overlay (Aligned left, premium styling) */}
                            <div className="hero-slide-overlay">
                                <div className="hero-slide-content">
                                    <h1 className="hero-slide-title">
                                        {slide.title ? (
                                            <>
                                                {slide.title.replace(/Essentials/gi, "").trim()}{" "}
                                                <span className="hero-slide-highlight">Essentials</span>
                                            </>
                                        ) : (
                                            <>
                                                Discover Everyday <span className="hero-slide-highlight">Essentials</span>
                                            </>
                                        )}
                                    </h1>
                                    <p className="hero-slide-subtitle">
                                        {slide.subtitle || "Fashion, Jewellery & More that you'll love"}
                                    </p>
                                    <div className="hero-slide-btn">
                                        {slide.button_text || "Shop Now"}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button 
                        onClick={handlePrev}
                        className="hero-arrow hero-arrow-left"
                        aria-label="Previous Slide"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={handleNext}
                        className="hero-arrow hero-arrow-right"
                        aria-label="Next Slide"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Slide Dots Indicators */}
            {slides.length > 1 && (
                <div className="hero-dots">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`hero-dot ${idx === currentIndex ? 'active' : ''}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}

            <style jsx global>{`
                .hero-slider-section {
                    aspect-ratio: 1920/800;
                }
                @media (max-width: 768px) {
                    .hero-slider-section {
                        aspect-ratio: 16/9; /* Widescreen aspect ratio for mobile to prevent severe cropping of desktop banners! */
                    }
                    .hero-slide-item {
                        aspect-ratio: 16/9 !important;
                    }
                }

                .hero-slide-overlay {
                    position: absolute;
                    left: 8%;
                    top: 50%;
                    transform: translateY(-50%);
                    max-width: 45%;
                    z-index: 5;
                    pointer-events: none;
                    text-align: left;
                }

                .hero-slide-content {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .hero-slide-title {
                    font-family: var(--font-poppins);
                    font-size: 2.8vw;
                    font-weight: 700;
                    color: var(--text-main);
                    line-height: 1.15;
                    margin: 0;
                }

                .hero-slide-highlight {
                    color: var(--accent);
                    font-family: var(--font-poppins);
                    font-style: italic;
                    font-weight: 400;
                }

                .hero-slide-subtitle {
                    font-family: var(--font-poppins);
                    font-size: 1.1vw;
                    color: var(--text-muted);
                    margin: 0;
                    line-height: 1.5;
                }

                .hero-slide-btn {
                    align-self: flex-start;
                    background: var(--text-main);
                    color: #ffffff;
                    font-family: var(--font-poppins);
                    font-size: 0.9vw;
                    font-weight: 600;
                    padding: 1vw 2.5vw;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(23, 59, 99, 0.2);
                    transition: all 0.2s ease;
                    pointer-events: auto;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .hero-slide-btn:hover {
                    background: var(--accent);
                    color: #ffffff;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(15, 157, 148, 0.3);
                }

                .hero-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid var(--border);
                    color: var(--text-main);
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 10;
                    opacity: 0;
                    transition: all 0.2s ease;
                    box-shadow: var(--shadow-sm);
                }

                .hero-slider-section:hover .hero-arrow {
                    opacity: 1;
                }

                .hero-arrow:hover {
                    background: var(--accent);
                    color: #ffffff;
                    border-color: var(--accent);
                    box-shadow: var(--shadow-md);
                }

                .hero-arrow-left {
                    left: 20px;
                }

                .hero-arrow-right {
                    right: 20px;
                }

                .hero-dots {
                    position: absolute;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 8px;
                    z-index: 10;
                }

                .hero-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: rgba(23, 59, 99, 0.2);
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    transition: all 0.2s ease;
                }

                .hero-dot.active {
                    background: var(--text-main);
                    transform: scale(1.25);
                }

                @media (max-width: 768px) {
                    .hero-slide-overlay {
                        left: 10%;
                        max-width: 80%;
                        bottom: 8%;
                        top: auto;
                        transform: none;
                    }
                    .hero-slide-content {
                        gap: 8px;
                    }
                    .hero-slide-title {
                        font-size: 6vw;
                    }
                    .hero-slide-subtitle {
                        font-size: 3.5vw;
                    }
                    .hero-slide-btn {
                        font-size: 3vw;
                        padding: 2.5vw 6vw;
                    }
                    .hero-arrow {
                        width: 36px;
                        height: 36px;
                        opacity: 0.8;
                    }
                    .hero-arrow-left { left: 10px; }
                    .hero-arrow-right { right: 10px; }
                    .hero-dots {
                        bottom: 12px;
                    }
                }
            `}</style>
        </section>
    );
}
