import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', paddingTop: '60px', paddingBottom: '40px' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '60px' }}>
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff 0%, #a0a5b1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px', marginBottom: '16px' }}>
                        PremiumShop
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.8 }}>
                        Elevating everyday living with thoughtfully curated, high-quality products. Excellence is not a standard, it is an expectation.
                    </p>
                </div>

                <div>
                    <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '1.1rem' }}>Shop</h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)' }}>
                        <li><Link href="/products" style={{ transition: 'color 0.2s' }}>All Products</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '1.1rem' }}>Support</h4>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)' }}>
                        <li><Link href="/faq" style={{ transition: 'color 0.2s' }}>FAQ</Link></li>
                        <li><Link href="/orders" style={{ transition: 'color 0.2s' }}>Shipping & Returns</Link></li>
                        <li><Link href="/faq" style={{ transition: 'color 0.2s' }}>Contact Us</Link></li>
                    </ul>
                </div>
            </div>

            <div className="container" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <p style={{ margin: 0 }}>© 2026 PremiumShop. All rights reserved.</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <Link href="/">Privacy Policy</Link>
                    <Link href="/">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}
