import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export const metadata = {
    title: "Terms of Service | Tivaa Elegance",
    description: "Terms of service, website usage rules, and legal agreements for Tivaa.in.",
};

export default function TermsOfServicePage() {
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
                        <Scale style={{ color: 'var(--accent)' }} size={36} /> Terms of Service
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
                        By accessing or using Tivaa.in, you agree to be bound by the following Terms of Service. Please read them carefully.
                    </p>

                    {/* Section 1 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Website Usage
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            You agree:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Not to misuse the website or its services in any way.</li>
                            <li>Not to engage in fraudulent, unauthorized, or illegal activities.</li>
                            <li>Not to interfere with or disrupt the website operations, servers, or networks.</li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Product Information
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            We strive to display our products, specifications, and colors as accurately as possible. However:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Actual product colors may vary slightly due to your device screen settings.</li>
                            <li>Product dimensions and details may have minor variations.</li>
                            <li>Product availability is subject to stock and we reserve the right to limit quantities.</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Pricing
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            We reserve the right to:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Modify prices at any time without prior notice.</li>
                            <li>Correct any errors or inaccuracies in pricing or descriptions.</li>
                            <li>Cancel any orders affected by pricing errors or mistakes.</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Intellectual Property
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            All content available on Tivaa.in, including but not limited to:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: '0 0 8px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Logos, branding, and designs</li>
                            <li>Images, graphics, and visual media</li>
                            <li>Product descriptions, text, and layouts</li>
                        </ul>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            is the exclusive property of Tivaa and is protected by copyright laws. You may not copy, reproduce, distribute, or modify any content without our prior written permission.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Limitation of Liability
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            Tivaa shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products, services, or website.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Governing Law
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            These terms and any disputes arising out of the website or transactions are governed by and construed in accordance with the laws of India.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(122, 56, 194, 0.03)', border: '1px solid var(--border)', padding: '24px', borderRadius: '16px' }}>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif", margin: '0 0 4px 0' }}>
                            Contact
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                            For questions or concerns regarding these Terms:
                            <br />
                            Email: <a href="mailto:tivaa2026@gmail.com" style={{ color: 'var(--accent)', fontWeight: 500 }}>tivaa2026@gmail.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
