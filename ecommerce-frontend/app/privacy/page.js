import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
    title: "Privacy Policy | Tivaa Elegance",
    description: "Privacy Policy and data protection details for Tivaa.in.",
};

export default function PrivacyPolicyPage() {
    return (
        <div style={{ background: 'var(--gradient-bg)', minHeight: '100vh', padding: '30px 0 80px' }}>
            <div className="container animate-fade-in" style={{ maxWidth: '850px' }}>
                
                {/* Back button */}
                <Link href="/products" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                    <ArrowLeft size={16} /> Continue Shopping
                </Link>

                {/* Header section */}
                <div style={{ marginBottom: '36px' }}>
                    <h1 style={{ 
                        fontSize: 'clamp(2rem, 6vw, 3rem)', 
                        marginBottom: '12px', 
                        background: 'var(--gradient-logo)', 
                        WebkitBackgroundClip: 'text', 
                        WebkitTextFillColor: 'transparent', 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '14px'
                    }}>
                        <Shield style={{ color: 'var(--accent)' }} size={36} /> Privacy Policy
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                        Last Updated: June 10, 2026
                    </p>
                </div>

                {/* Content Card */}
                <div className="card" style={{ 
                    padding: '40px', 
                    background: 'var(--bg-glass)', 
                    border: '1px solid var(--border)',
                    borderRadius: '24px',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '32px'
                }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                        Welcome to Tivaa.in (&ldquo;Tivaa&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We value your privacy and are committed to protecting your personal information.
                    </p>

                    {/* Section 1 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Information We Collect
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            When you use our website, we may collect:
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '8px' }}>
                            <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '16px', borderLeft: '3px solid var(--accent)' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--text-main)' }}>Personal Information</h3>
                                <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <li>Name</li>
                                    <li>Email address</li>
                                    <li>Phone number</li>
                                    <li>Shipping and billing address</li>
                                    <li>Payment information (processed securely through payment gateways)</li>
                                </ul>
                            </div>

                            <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '16px', borderLeft: '3px solid var(--accent-purple-soft)' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--text-main)' }}>Non-Personal Information</h3>
                                <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <li>Browser type</li>
                                    <li>Device information</li>
                                    <li>IP address</li>
                                    <li>Website usage data</li>
                                    <li>Cookies and tracking information</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            How We Use Your Information
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            We use your information to:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Process and deliver orders</li>
                            <li>Provide customer support</li>
                            <li>Improve our products and services</li>
                            <li>Send order updates and notifications</li>
                            <li>Share promotional offers (only if you opt in)</li>
                            <li>Prevent fraud and ensure website security</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Payment Security
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            We do not store your complete payment card details. Payments are processed securely through trusted, certified third-party payment providers and gateways.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Sharing of Information
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            We do not sell, rent, or trade your personal information. We may share information strictly as necessary with:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Shipping partners and couriers</li>
                            <li>Payment processors</li>
                            <li>Service providers necessary to operate our business</li>
                            <li>Government authorities when required by law</li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Cookies
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            Our website may use cookies to improve user experience, remember preferences, analyze website traffic, and support marketing activities. You can disable cookies at any time through your browser settings.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Data Security
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            We implement reasonable administrative, technical, and physical security measures to protect your information. However, no online transmission can be guaranteed to be 100% secure.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Your Rights
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            You may request:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Access to your personal information</li>
                            <li>Correction of inaccurate information</li>
                            <li>Deletion of your personal data</li>
                        </ul>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: '8px 0 0 0' }}>
                            For privacy-related requests or to exercise your rights, contact us at: <a href="mailto:tivaa2026@gmail.com" style={{ color: 'var(--accent)', fontWeight: 500, textDecoration: 'underline' }}>tivaa2026@gmail.com</a>
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(122, 56, 194, 0.03)', border: '1px solid var(--border)', padding: '24px', borderRadius: '16px' }}>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif", margin: '0 0 4px 0' }}>
                            Contact Us
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                            For any questions or concerns regarding this Privacy Policy:
                            <br />
                            <strong>Tivaa Elegance</strong>
                            <br />
                            Email: <a href="mailto:tivaa2026@gmail.com" style={{ color: 'var(--accent)', fontWeight: 500 }}>tivaa2026@gmail.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
