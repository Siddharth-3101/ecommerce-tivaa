"use client";

import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{ background: '#173B63', color: '#e2e8f0', paddingTop: '48px', paddingBottom: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div className="container" style={{ padding: '0 24px' }}>
                
                {/* 4-Column Grid Layout */}
                <div className="footer-grid">
                    
                    {/* Column 1: Logo & Branding */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.4rem', fontFamily: 'var(--font-poppins)', letterSpacing: '1px' }}>TIVAA</span>
                        </Link>
                        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                            Curated products for every moment. Quality you can trust, style you'll love.
                        </p>
                        
                        {/* Social Media Links (Only Instagram!) */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            {/* Instagram */}
                            <a href="https://www.instagram.com/tivaa_elegance_jewellery?igsh=OXYzajJ6MndvcjVi" target="_blank" rel="noreferrer" className="footer-social-link" aria-label="Instagram">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Shop */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h4 style={{ color: '#ffffff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Shop</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <li><Link href="/products" className="footer-link-navy">All Products</Link></li>
                            <li><Link href="/products?category=Jewellery" className="footer-link-navy">Fashion & Jewellery</Link></li>
                            <li><Link href="/products?category=School Supplies %26 Gifts" className="footer-link-navy">School Supplies</Link></li>
                            <li><Link href="/products" className="footer-link-navy">New Arrivals</Link></li>
                            <li><Link href="/products" className="footer-link-navy">Best Sellers</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Customer Service */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h4 style={{ color: '#ffffff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Customer Service</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <li><Link href="/orders" className="footer-link-navy">My Orders</Link></li>
                            <li><Link href="/wishlist" className="footer-link-navy">Wishlist</Link></li>
                            <li><Link href="/faq" className="footer-link-navy">Shipping & Delivery</Link></li>
                            <li><Link href="/refund-policy" className="footer-link-navy">Returns & Exchanges</Link></li>
                            <li><Link href="/faq" className="footer-link-navy">FAQs</Link></li>
                            <li><Link href="/contact" className="footer-link-navy">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: About TIVAA */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h4 style={{ color: '#ffffff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>About TIVAA</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <li><Link href="/contact" className="footer-link-navy">About Us</Link></li>
                            <li><Link href="/privacy" className="footer-link-navy">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="footer-link-navy">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Part: Copyright (No Payment Partners) */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '40px', paddingTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0, fontFamily: 'var(--font-poppins)', textAlign: 'center' }}>
                        © 2026 TIVAA. All rights reserved.
                    </p>
                </div>

            </div>

            <style jsx global>{`
                .footer-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1.2fr 1fr;
                    gap: 32px;
                }
                @media (max-width: 1024px) {
                    .footer-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 768px) {
                    .footer-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                }

                .footer-link-navy {
                    color: #cbd5e1;
                    transition: all 0.2s ease;
                    text-decoration: none;
                    font-size: 0.85rem;
                    font-family: var(--font-poppins);
                }
                .footer-link-navy:hover {
                    color: var(--accent);
                    padding-left: 2px;
                }

                .footer-social-link {
                    color: #cbd5e1;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.04);
                }
                .footer-social-link:hover {
                    color: #ffffff;
                    background: var(--accent);
                    transform: translateY(-2px);
                }
            `}</style>
        </footer>
    );
}
