import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{ background: '#562e74', color: '#EADCF8', paddingTop: '40px', paddingBottom: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', marginBottom: '24px', padding: '0 24px' }}>
                
                {/* Logo and Brand */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Link href="/" style={{ display: 'inline-flex', marginBottom: '12px' }}>
                        <div style={{ 
                            background: '#ffffff', 
                            borderRadius: '50%', 
                            width: '64px', 
                            height: '64px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            border: '1.5px solid rgba(255, 255, 255, 0.3)', 
                            overflow: 'hidden',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                        }}>
                            <img 
                                src="/logo.png" 
                                alt="Tivaa Logo" 
                                style={{ 
                                    height: '46px', 
                                    width: '46px',
                                    objectFit: 'contain',
                                    mixBlendMode: 'multiply'
                                }} 
                            />
                        </div>
                    </Link>
                    <p style={{ color: '#EADCF8', fontSize: '0.85rem', maxWidth: '450px', lineHeight: 1.5, margin: 0 }}>
                        Exquisite boutique styles designed to elevate your aesthetic with quality and luxury.
                    </p>
                </div>

                {/* Quick Links Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ 
                        color: '#ffffff', 
                        marginBottom: '4px', 
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
                        gap: '20px', 
                        margin: 0 
                    }}>
                        <li><Link href="/products" className="footer-link" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>Search</Link></li>
                        <li><Link href="/faq" className="footer-link" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>FAQs</Link></li>
                        <li><Link href="/contact" className="footer-link" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>Contact Us</Link></li>
                        <li><Link href="/privacy" className="footer-link" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>Privacy Policy</Link></li>
                        <li><Link href="/refund-policy" className="footer-link" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>Refund Policy</Link></li>
                        <li><Link href="/terms" className="footer-link" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>Terms of Service</Link></li>
                    </ul>
                </div>
            </div>

            {/* Bottom Part: Socials & Copyright */}
            <div className="container" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', paddingLeft: '24px', paddingRight: '24px' }}>
                
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
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%'
                        }}
                        className="social-btn"
                        aria-label="Instagram Link"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                </div>
 
                {/* Copyright text */}
                <p style={{ color: '#CFA7F5', fontSize: '0.8rem', margin: 0, textAlign: 'center', letterSpacing: '0.5px' }}>
                    © 2026 Tivaa Elegance. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
