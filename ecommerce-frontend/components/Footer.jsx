import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{ background: '#1F1128', color: '#EADCF8', paddingTop: '80px', paddingBottom: '40px', borderTop: '1px solid rgba(234, 220, 248, 0.15)' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', marginBottom: '60px', padding: '0 24px' }}>
                
                {/* Column 1: Quick Links */}
                <div>
                    <h4 style={{ 
                        color: '#ffffff', 
                        marginBottom: '24px', 
                        fontSize: '1rem', 
                        textTransform: 'uppercase', 
                        letterSpacing: '2px',
                        fontWeight: 600
                    }}>
                        Quick Links
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '14px', margin: 0 }}>
                        <li><Link href="/products" className="footer-link" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>Search</Link></li>
                        <li><Link href="/faq" className="footer-link" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>Contact Information</Link></li>
                        <li><Link href="/faq" className="footer-link" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>Privacy Policy</Link></li>
                        <li><Link href="/faq" className="footer-link" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>Refund Policy</Link></li>
                        <li><Link href="/faq" className="footer-link" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>Terms of Service</Link></li>
                    </ul>
                </div>

                {/* Column 2: Logo and Brand (Centered or Right Column) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <Link href="/" style={{ display: 'inline-flex', marginBottom: '16px' }}>
                        <div style={{ 
                            background: '#ffffff', 
                            borderRadius: '50%', 
                            width: '72px', 
                            height: '72px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            border: '1.5px solid rgba(234, 220, 248, 0.3)', 
                            overflow: 'hidden',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
                        }}>
                            <img 
                                src="/logo.png" 
                                alt="Tivaa Logo" 
                                style={{ 
                                    height: '52px', 
                                    width: '52px',
                                    objectFit: 'contain',
                                    mixBlendMode: 'multiply'
                                }} 
                            />
                        </div>
                    </Link>
                    <p style={{ color: '#A292B0', fontSize: '0.85rem', maxWidth: '300px', lineHeight: 1.6, margin: 0 }}>
                        Exquisite boutique styles designed to elevate your aesthetic with quality and luxury.
                    </p>
                </div>
            </div>

            {/* Bottom Part: Socials & Copyright */}
            <div className="container" style={{ borderTop: '1px solid rgba(234, 220, 248, 0.15)', paddingTop: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', paddingLeft: '24px', paddingRight: '24px' }}>
                
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
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%'
                        }}
                        className="social-btn"
                        aria-label="Instagram Link"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                </div>

                {/* Copyright text */}
                <p style={{ color: '#8D7C98', fontSize: '0.85rem', margin: 0, textAlign: 'center', letterSpacing: '0.5px' }}>
                    © 2026 Tivaa Elegance. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
