import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
    title: "Privacy Policy | Tivaa Elegance",
    description: "Privacy Policy and data protection details for Tivaa.in.",
};

export default function PrivacyPolicyPage() {
    return (
        <div style={{ background: 'var(--bg, #F8FAFC)', minHeight: '100vh', padding: '30px 0 80px' }}>
            <div className="container animate-fade-in" style={{ maxWidth: '850px' }}>
                
                {/* Back button */}
                <Link href="/" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                    <ArrowLeft size={16} /> Back
                </Link>

                {/* Header section */}
                <div style={{ marginBottom: '36px' }}>
                    <h1 style={{ 
                        fontSize: 'clamp(2rem, 6vw, 3rem)', 
                        marginBottom: '12px', 
                        color: 'var(--text-main, #173B63)', 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '14px'
                    }}>
                        <Shield style={{ color: 'var(--accent, #0F9D94)' }} size={36} /> Privacy Policy
                    </h1>
                    <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', margin: 0 }}>
                        Last Updated: July 30, 2026
                    </p>
                </div>

                {/* Content Card */}
                <div className="card" style={{ 
                    padding: '40px', 
                    borderRadius: '24px',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '32px',
                    textAlign: 'justify'
                }}>
                    <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                        Welcome to Tivaa.in (&ldquo;Tivaa&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We value your privacy and are committed to protecting your personal information.
                    </p>

                    {/* Section 1 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Information We Collect
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            When you use our website, we may collect:
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '8px' }}>
                            <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '16px', borderLeft: '3px solid var(--accent, #0F9D94)' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--text-main, #173B63)' }}>Personal Information</h3>
                                <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.9rem', lineHeight: '1.6', paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <li>Name</li>
                                    <li>Email address</li>
                                    <li>Phone number</li>
                                    <li>Shipping and billing address</li>
                                    <li>Payment information (processed securely through payment gateways)</li>
                                </ul>
                            </div>

                            <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '16px', borderLeft: '3px solid var(--text-main, #173B63)' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--text-main, #173B63)' }}>Non-Personal Information</h3>
                                <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.9rem', lineHeight: '1.6', paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            How We Use Your Information
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            We use your information to:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Consent
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            By using Tivaa.in, creating an account, placing an order, or otherwise providing your personal information, you consent to the collection, use, storage, and processing of your information as described in this Privacy Policy. Where required by applicable law, we will obtain your explicit consent before collecting or processing your personal data. You may withdraw your consent at any time by contacting us. Withdrawal of consent may affect our ability to provide certain services.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Payment Security
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            We do not store your complete payment card details. Payments are processed securely through trusted, certified third-party payment providers and gateways.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Sharing of Information
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            We do not sell, rent, or trade your personal information. We may share information strictly as necessary with:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Shipping partners and couriers</li>
                            <li>Payment processors</li>
                            <li>Service providers necessary to operate our business</li>
                            <li>Government authorities when required by law</li>
                        </ul>
                    </section>

                    {/* Section 6 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Cookies
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            Our website uses cookies and similar technologies to improve your browsing experience, remember your preferences, analyze website traffic, and enhance our services.
                        </p>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            We may use:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: '0 0 8px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li><strong>Essential cookies</strong> required for the website to function properly.</li>
                            <li><strong>Analytics cookies</strong> to understand visitor behaviour and improve website performance.</li>
                            <li><strong>Marketing cookies</strong> (where applicable) to measure the effectiveness of advertising campaigns.</li>
                        </ul>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            You can manage or disable cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of the website.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Data Security
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            We implement reasonable administrative, technical, and physical security measures to protect your personal information. While we take appropriate steps to safeguard your information, no method of electronic transmission or storage is completely secure.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Data Retention
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            We retain your personal information only for as long as necessary to provide our services, process orders, comply with applicable legal and regulatory requirements, resolve disputes, and enforce our agreements. When your personal information is no longer required, we will securely delete or anonymize it in accordance with applicable laws.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Third-Party Services
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            To operate our business efficiently, we use trusted third-party service providers, including payment gateways, shipping partners, website analytics providers, and marketing platforms. These providers receive only the information necessary to perform their services on our behalf and are required to protect your information in accordance with applicable laws and their own privacy practices.
                        </p>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            Our website may use services such as:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Payment gateways for secure payment processing.</li>
                            <li>Shipping and logistics partners for order delivery.</li>
                            <li>Google Analytics to understand website usage and improve user experience.</li>
                            <li>Meta Pixel (if enabled) to measure advertising performance and improve marketing campaigns.</li>
                        </ul>
                    </section>

                    {/* Section 10 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Your Rights
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            Subject to applicable law, you may request:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Access to the personal information we hold about you.</li>
                            <li>Correction or updating of inaccurate or incomplete information.</li>
                            <li>Deletion of your personal information, where applicable.</li>
                            <li>Withdrawal of consent for the processing of your personal information, subject to legal or contractual requirements.</li>
                        </ul>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '8px 0 0 0' }}>
                            To exercise any of these rights or raise a privacy-related concern, please contact us at <a href="mailto:tivaa2026@gmail.com" style={{ color: 'var(--accent, #0F9D94)', fontWeight: 500, textDecoration: 'underline' }}>tivaa2026@gmail.com</a>
                        </p>
                    </section>

                    {/* Section 11 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Children&apos;s Privacy
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            Tivaa.in is intended for general audiences. We do not knowingly collect personal information from children without appropriate parental or guardian involvement. If you believe that a child has provided personal information to us, please contact us so that we can take appropriate action.
                        </p>
                    </section>

                    {/* Section 12 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Changes to this Privacy Policy
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            We may update this Privacy Policy from time to time to reflect changes in our business practices, legal requirements, or services. Any updates will be published on this page along with the revised &ldquo;Last Updated&rdquo; date. We encourage you to review this Privacy Policy periodically.
                        </p>
                    </section>

                    {/* Section 13 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(23, 59, 99, 0.03)', border: '1px solid var(--border, #E5E7EB)', padding: '24px', borderRadius: '16px' }}>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif", margin: '0 0 4px 0' }}>
                            Contact Us
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                            If you have any questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
                            <br />
                            <br />
                            <strong>Tivaa Elegance</strong>
                            <br />
                            Email: <a href="mailto:tivaa2026@gmail.com" style={{ color: 'var(--accent, #0F9D94)', fontWeight: 500 }}>tivaa2026@gmail.com</a>
                            <br />
                            <br />
                            We will make reasonable efforts to acknowledge and respond to privacy-related requests in accordance with applicable laws.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
