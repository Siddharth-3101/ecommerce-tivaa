"use client";

import { useRef } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";

export default function RelatedProductsSlider({ relatedProducts, categoryName }) {
    const scrollContainerRef = useRef(null);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -240, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 240, behavior: "smooth" });
        }
    };

    return (
        <div style={{ marginTop: '80px', paddingTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 className="related-heading" style={{ color: 'var(--text-main)', margin: 0 }}>
                    You may also like
                </h2>
                <Link href={`/products?category=${encodeURIComponent(categoryName)}`} className="related-view-all">
                    View All
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </Link>
            </div>
            
            <div style={{ position: 'relative' }}>
                {/* Left Arrow */}
                <button 
                    onClick={scrollLeft}
                    style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                    aria-label="Scroll left"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>

                <div 
                    ref={scrollContainerRef}
                    className="product-scroll-container" 
                    style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}
                >
                    {relatedProducts.map((p) => (
                        <div key={p.id} style={{ flex: '0 0 calc(20% - 12.8px)', minWidth: '180px' }}>
                            <ProductCard product={p} variant="simple" />
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                <button 
                    onClick={scrollRight}
                    style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                    aria-label="Scroll right"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .related-heading {
                    font-size: 24px !important;
                    font-weight: 700 !important;
                    font-family: var(--font-poppins) !important;
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
                @media (max-width: 768px) {
                    .related-heading {
                        font-size: 18px !important;
                    }
                    .related-view-all {
                        font-size: 13px !important;
                    }
                }
            `}} />
        </div>
    );
}
