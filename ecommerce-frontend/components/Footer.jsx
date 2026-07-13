"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Heading from './Heading';

export default function Footer() {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return null;
    }


    return (
        <footer style={{ background: '#173B63', color: '#e2e8f0', paddingTop: '24px', paddingBottom: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div className="container" style={{ padding: '0 24px' }}>
                
                {/* 4-Column Grid Layout */}
                <div className="footer-grid">
                    
                    {/* Column 1: Logo & Branding (Logo on left, text/social stacked on right) */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        {/* Logo on the left */}
                        <Link href="/" style={{ display: 'block', flexShrink: 0 }}>
                            <img 
                                src="/logo_footer.png?v=2" 
                                style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    objectFit: 'contain', 
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }} 
                                alt="TIVAA Logo" 
                            />
                        </Link>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, maxWidth: '220px' }}>
                            <Heading 
                                as="h3"
                                variant="h3"
                                style={{ 
                                    color: '#ffffff', 
                                    fontWeight: 700, 
                                    fontSize: '1.05rem', 
                                    fontFamily: 'var(--font-poppins)', 
                                    letterSpacing: '0.5px',
                                    margin: '0 0 2px 0' 
                                }}
                            >
                                TIVAA Elegance
                            </Heading>
                            <p style={{ 
                                fontSize: '0.64rem', 
                                color: '#cbd5e1', 
                                lineHeight: '1.4', 
                                margin: '2px 0 6px 0',
                                fontFamily: 'var(--font-poppins)'
                            }}>
                                Curated products for every moment. Quality you can trust, style you'll love.
                            </p>
                            
                            {/* Social Media Links (Only Instagram!) */}
                            <div style={{ display: 'flex', gap: '8px', marginTop: 0 }}>
                                <a 
                                    href="https://www.instagram.com/tivaa_elegance_jewellery?igsh=OXYzajJ6MndvcjVi" 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="footer-social-link" 
                                    aria-label="Instagram"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                </a>
                            </div>
                        </div>
                    </div>
 
                    {/* Column 2: Shop */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Heading as="h4" variant="h3" style={{ color: '#ffffff', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Shop</Heading>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li><Link href="/products" className="footer-link-navy">All Products</Link></li>
                            <li><Link href="/categories?parent=Jewellery" className="footer-link-navy">Fashion & Jewellery</Link></li>
                            <li><Link href="/categories?parent=School Supplies" className="footer-link-navy">School Supplies</Link></li>
                            <li><Link href="/products" className="footer-link-navy">New Arrivals</Link></li>
                            <li><Link href="/categories" className="footer-link-navy">View Categories</Link></li>
                        </ul>
                    </div>
 
                    {/* Column 3: Customer Service */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Heading as="h4" variant="h3" style={{ color: '#ffffff', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Customer Service</Heading>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li><Link href="/orders" className="footer-link-navy">My Orders</Link></li>
                            <li><Link href="/wishlist" className="footer-link-navy">Wishlist</Link></li>
                            <li><Link href="/faq" className="footer-link-navy">Shipping & Delivery</Link></li>
                            <li><Link href="/refund-policy" className="footer-link-navy">Returns & Exchanges</Link></li>
                            <li><Link href="/faq" className="footer-link-navy">FAQs</Link></li>
                            <li><Link href="/contact" className="footer-link-navy">Contact Us</Link></li>
                        </ul>
                    </div>
 
                    {/* Column 4: About TIVAA */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Heading as="h4" variant="h3" style={{ color: '#ffffff', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>About TIVAA</Heading>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li><Link href="/contact" className="footer-link-navy">About Us</Link></li>
                            <li><Link href="/privacy" className="footer-link-navy">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="footer-link-navy">Terms & Conditions</Link></li>
                        </ul>
                    </div>
 
                </div>
 
                {/* Bottom Part: Copyright (No Payment Partners) */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '20px', paddingTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.6rem', margin: 0, fontFamily: 'var(--font-poppins)', textAlign: 'center' }}>
                        © 2026 TIVAA Elegance. All rights reserved.
                    </p>
                </div>
 
            </div>
 
            <style dangerouslySetInnerHTML={{ __html: `
                .footer-grid {
                    display: grid;
                    grid-template-columns: 1.3fr 1fr 1fr 1fr;
                    gap: 16px;
                }
                @media (max-width: 1024px) {
                    .footer-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 768px) {
                    .footer-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }
                }
 
                .footer-link-navy {
                    color: #cbd5e1;
                    transition: all 0.2s ease;
                    text-decoration: none;
                    font-size: 0.64rem;
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
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.04);
                }
                .footer-social-link:hover {
                    color: #ffffff;
                    background: var(--accent);
                    transform: translateY(-2px);
                }
            `}} />
        </footer>
    );
}
