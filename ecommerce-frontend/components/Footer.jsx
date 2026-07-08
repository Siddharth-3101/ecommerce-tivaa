"use client";

import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{ background: '#173B63', color: '#e2e8f0', paddingTop: '48px', paddingBottom: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div className="container" style={{ padding: '0 24px' }}>
                
                {/* 5-Column Grid Layout */}
                <div className="footer-grid">
                    
                    {/* Column 1: Logo & Branding */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.4rem', fontFamily: 'var(--font-poppins)', letterSpacing: '1px' }}>TIVAA</span>
                        </Link>
                        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                            Curated products for every moment. Quality you can trust, style you'll love.
                        </p>
                        
                        {/* Social Media Links */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            {/* Facebook */}
                            <a href="#" className="footer-social-link" aria-label="Facebook">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                            </a>
                            {/* Instagram */}
                            <a href="https://www.instagram.com/tivaa_elegance_jewellery?igsh=OXYzajJ6MndvcjVi" target="_blank" rel="noreferrer" className="footer-social-link" aria-label="Instagram">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </a>
                            {/* Pinterest */}
                            <a href="#" className="footer-social-link" aria-label="Pinterest">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
                            </a>
                            {/* YouTube */}
                            <a href="#" className="footer-social-link" aria-label="YouTube">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.54a29 29 0 0 0 .46 5.12 2.78 2.78 0 0 0 1.95 1.96c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.12 29 29 0 0 0-.46-5.12z"></path><polygon points="9.75 15.02 15.5 11.54 9.75 8.07 9.75 15.02"></polygon></svg>
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

                    {/* Column 5: Newsletter */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h4 style={{ color: '#ffffff', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Newsletter</h4>
                        <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0 }}>
                            Subscribe to get updates on new arrivals and offers.
                        </p>
                        <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                required
                                className="input-field" 
                                style={{ 
                                    height: '42px', 
                                    background: '#ffffff', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    padding: '0 12px', 
                                    fontSize: '0.85rem',
                                    color: '#1a1a1a'
                                }} 
                            />
                            <button type="submit" className="btn btn-primary" style={{ height: '42px', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px', background: 'var(--accent)' }}>
                                Subscribe
                            </button>
                        </form>
                    </div>

                </div>

                {/* Bottom Part: Copyright & Payment Partners */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '40px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0, fontFamily: 'var(--font-poppins)' }}>
                        © 2026 TIVAA. All rights reserved.
                    </p>
                    
                    {/* Payment Logos */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <img src="https://img.icons8.com/color/36/000000/visa.png" alt="Visa" style={{ height: '24px', objectFit: 'contain' }} />
                        <img src="https://img.icons8.com/color/36/000000/mastercard.png" alt="Mastercard" style={{ height: '24px', objectFit: 'contain' }} />
                        <img src="https://img.icons8.com/color/48/000000/upi.png" alt="UPI" style={{ height: '24px', objectFit: 'contain' }} />
                        <span style={{ color: '#cbd5e1', fontSize: '0.7rem', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>RuPay</span>
                    </div>
                </div>

            </div>

            <style jsx global>{`
                .footer-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr 1fr 0.8fr 1.2fr;
                    gap: 32px;
                }
                @media (max-width: 1024px) {
                    .footer-grid {
                        grid-template-columns: repeat(3, 1fr);
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
