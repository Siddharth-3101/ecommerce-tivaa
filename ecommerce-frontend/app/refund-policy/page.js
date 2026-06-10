import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";

export const metadata = {
    title: "Refund & Return Policy | Tivaa Elegance",
    description: "Refund and return eligibility, timelines, and cancellation guidelines for Tivaa.in.",
};

export default function RefundPolicyPage() {
    return (
        <div style={{ background: 'var(--gradient-bg)', minHeight: '100vh', padding: '140px 0 80px' }}>
            <div className="container animate-fade-in" style={{ maxWidth: '850px' }}>
                
                {/* Back button */}
                <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', transition: 'color 0.2s', marginBottom: '24px' }}>
                    <ArrowLeft size={16} /> Continue Shopping
                </Link>

                {/* Header section */}
                <div style={{ marginBottom: '36px' }}>
                    <h1 style={{ 
                        fontSize: '3rem', 
                        marginBottom: '12px', 
                        background: 'var(--gradient-logo)', 
                        WebkitBackgroundClip: 'text', 
                        WebkitTextFillColor: 'transparent', 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '14px'
                    }}>
                        <RotateCcw style={{ color: 'var(--accent)' }} size={36} /> Refund & Return Policy
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
                        At Tivaa, customer satisfaction is important to us. Please read our guidelines below regarding returns, refunds, and order cancellations.
                    </p>

                    {/* Section 1 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Return Eligibility
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            You may request a return if:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: '0 0 12px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>The product was damaged during delivery.</li>
                            <li>The wrong product was delivered.</li>
                            <li>The item has a manufacturing defect.</li>
                        </ul>
                        
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            To be eligible for a return:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>The return request must be made within <strong>2 days</strong> of delivery.</li>
                            <li>The product must be unused and in its original packaging.</li>
                            <li>Proof of damage or issue (through photos or videos) may be required.</li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Non-Returnable Items
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            Due to hygiene and product safety reasons, the following cannot be returned:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Used accessories</li>
                            <li>Customized products</li>
                            <li>Clearance or sale items (unless defective)</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Refund Process
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            Once the returned item is inspected and approved:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Refunds will be processed within <strong>5–10 business days</strong>.</li>
                            <li>The refund amount will be credited to the original payment method used during checkout.</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(122, 56, 194, 0.03)', border: '1px solid var(--border)', padding: '24px', borderRadius: '16px' }}>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif", margin: '0 0 8px 0' }}>
                            Damaged or Incorrect Orders
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                            Please email us within <strong>48 hours</strong> of delivery with the following information:
                        </p>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', paddingLeft: '20px', margin: '0 0 12px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Order number</li>
                            <li>Photos or video of the product and its packaging</li>
                            <li>Description of the issue</li>
                        </ul>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                            Send details to: <a href="mailto:tivaa2026@gmail.com" style={{ color: 'var(--accent)', fontWeight: 600 }}>tivaa2026@gmail.com</a>
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Cancellation Policy
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            Orders may be cancelled before they are dispatched. Once shipped, cancellation requests cannot be guaranteed.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
