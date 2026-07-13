"use client";

import Link from "next/link";
import ProductCard from "./ProductCard";
import Heading from "./Heading";

export default function RelatedProductsSlider({ relatedProducts, categoryName }) {
    return (
        <div style={{ marginTop: '36px', paddingTop: '20px', borderTop: '1px solid var(--border)', marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
                <Heading as="h2" variant="HomeHeader2" className="related-heading" style={{ color: 'var(--text-main)', margin: 0 }}>
                    You may also like
                </Heading>
                <Link href={`/products?category=${encodeURIComponent(categoryName)}`} className="related-view-all">
                    View All
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </Link>
            </div>
            
            <div className="product-grid-boutique">
                {relatedProducts.slice(0, 4).map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
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
                @media (max-width: 768px) {
                    .related-heading {
                        font-size: 0.85rem !important;
                    }
                    .related-view-all {
                        font-size: 13px !important;
                    }
                }
            `}} />
        </div>
    );
}
