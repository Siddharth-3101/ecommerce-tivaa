"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import Heading from "./Heading";

import { slugify } from "@/lib/slug";

export default function RelatedProductsSlider({ relatedProducts, categoryName }) {
    const carouselRef = useRef(null);

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const container = carouselRef.current;
            const scrollAmount = container.clientWidth * 0.75;
            container.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };

    if (!relatedProducts || relatedProducts.length === 0) return null;

    return (
        <div style={{ position: 'relative', marginTop: '36px', paddingTop: '20px', borderTop: '1px solid var(--border)', marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
                <Heading as="h2" variant="HomeHeader2" className="related-heading" style={{ color: 'var(--text-main)', margin: 0 }}>
                    You May Also Like
                </Heading>
                {categoryName && (
                    <Link href={`/category/${slugify(categoryName)}`} className="related-view-all">
                        View All
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </Link>
                )}
            </div>
            
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} className="carousel-wrapper">
                {relatedProducts.length > 4 && (
                    <button
                        onClick={() => scrollCarousel("left")}
                        style={{
                            position: 'absolute',
                            left: '-18px',
                            zIndex: 10,
                            background: '#ffffff',
                            border: '1px solid var(--border)',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-sm)',
                            padding: 0,
                            transition: 'all 0.2s',
                            outline: 'none'
                        }}
                        className="slider-nav-btn"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={20} color="var(--text-main)" />
                    </button>
                )}

                <div 
                    ref={carouselRef}
                    className="slider-container"
                >
                    {relatedProducts.map((p) => (
                        <div key={p.id} className="slider-item">
                            <ProductCard product={p} />
                        </div>
                    ))}
                </div>

                {relatedProducts.length > 4 && (
                    <button
                        onClick={() => scrollCarousel("right")}
                        style={{
                            position: 'absolute',
                            right: '-18px',
                            zIndex: 10,
                            background: '#ffffff',
                            border: '1px solid var(--border)',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-sm)',
                            padding: 0,
                            transition: 'all 0.2s',
                            outline: 'none'
                        }}
                        className="slider-nav-btn"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={20} color="var(--text-main)" />
                    </button>
                )}
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .related-heading {
                    font-size: 0.85rem !important;
                    font-weight: 600 !important;
                    font-family: var(--font-poppins), sans-serif !important;
                }
                .related-view-all {
                    font-size: 14px !important;
                    font-weight: 500 !important;
                    color: var(--accent) !important;
                    text-decoration: none !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 4px !important;
                }
                .slider-container {
                    display: flex;
                    gap: 20px;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    scroll-behavior: smooth;
                    padding: 8px 4px;
                    width: 100%;
                }
                .slider-container::-webkit-scrollbar {
                    display: none;
                }
                .slider-item {
                    flex: 0 0 calc(15% - 12px);
                    scroll-snap-align: start;
                    box-sizing: border-box;
                }
                .slider-nav-btn:hover {
                    background-color: #f8fafc !important;
                    border-color: var(--text-main) !important;
                    transform: scale(1.05);
                }
                @media (max-width: 1024px) {
                    .slider-item {
                        flex: 0 0 calc(20% - 10px);
                    }
                }
                @media (max-width: 768px) {
                    .slider-item {
                        flex: 0 0 calc(30% - 8px);
                    }
                    .slider-nav-btn {
                        display: none !important;
                    }
                }
                @media (max-width: 480px) {
                    .slider-item {
                        flex: 0 0 calc(50% - 6px);
                    }
                }
            `}} />
        </div>
    );
}
