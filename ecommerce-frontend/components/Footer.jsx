"use client";

import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{ background: '#FAF5EC', color: 'var(--text-main)', paddingTop: '24px', paddingBottom: '16px', borderTop: '1.5px solid rgba(122, 56, 194, 0.15)' }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '12px', padding: '0 24px' }}>
                
                {/* Logo and Brand */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Link href="/" style={{ display: 'inline-flex' }}>
                        <div style={{ 
                            background: '#ffffff', 
                            borderRadius: '50%', 
                            width: '56px', 
                            height: '56px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            border: '1.5px solid rgba(122, 56, 194, 0.15)', 
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <img 
                                src="/logo.png" 
                                alt="Tivaa Logo" 
                                style={{ 
                                    height: '40px', 
                                    width: '40px',
                                    objectFit: 'contain',
                                    mixBlendMode: 'multiply'
                                }} 
                            />
                        </div>
                    </Link>
                </div>

                {/* Quick Links Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ 
                        color: 'var(--text-main)', 
                        marginBottom: '0px', 
                        fontSize: '0.85rem', 
                        textTransform: 'uppercase', 
                        letterSpacing: '2px',
                        fontWeight: 600
                    }}>
                        Quick Links
                    </h4>
                    <ul style={{ 
                        listStyle: 'none', 
                        padding: 0, 
                        display: 'flex', 
                        flexDirection: 'row', 
                        flexWrap: 'wrap', 
                        justifyContent: 'center', 
                        gap: '16px', 
                        margin: 0 
                    }}>
                        <li><Link href="/faq" className="footer-link-custom" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>FAQs</Link></li>
                        <li><Link href="/contact" className="footer-link-custom" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Contact Us</Link></li>
                        <li><Link href="/privacy" className="footer-link-custom" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Privacy Policy</Link></li>
                        <li><Link href="/refund-policy" className="footer-link-custom" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Refund Policy</Link></li>
                        <li><Link href="/terms" className="footer-link-custom" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Terms of Service</Link></li>
                    </ul>
                </div>
            </div>

            {/* Bottom Part: Socials & Copyright */}
            <div className="container" style={{ borderTop: '1.5px solid rgba(122, 56, 194, 0.15)', paddingTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', paddingLeft: '24px', paddingRight: '24px' }}>
                
                {/* Instagram Social Icon */}
                <div style={{ display: 'flex', gap: '16px' }}>
                    <a 
                        href="https://www.instagram.com/tivaa_elegance_jewellery?igsh=OXYzajJ6MndvcjVi" 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%'
                        }}
                        className="social-btn-custom"
                        aria-label="Instagram Link"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                </div>

                {/* Copyright text */}
                <p style={{ color: 'var(--text-light)', fontSize: '0.75rem', margin: 0, textAlign: 'center', letterSpacing: '0.5px' }}>
                    © 2026 Tivaa Elegance. All rights reserved.
                </p>
            </div>

            <style jsx>{`
                .footer-link-custom {
                    color: var(--text-muted);
                    transition: all 0.25s ease;
                    text-decoration: none;
                }
                .footer-link-custom:hover {
                    color: var(--accent) !important;
                    text-decoration: underline !important;
                }
                .social-btn-custom {
                    color: var(--text-muted);
                    background: rgba(122, 56, 194, 0.05);
                    border: 1px solid rgba(122, 56, 194, 0.15);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .social-btn-custom:hover {
                    color: var(--accent);
                    background: rgba(122, 56, 194, 0.1);
                    border-color: var(--accent);
                    transform: translateY(-2px);
                }
            `}</style>
        </footer>
    );
}
