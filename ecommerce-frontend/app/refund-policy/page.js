import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";

export const metadata = {
    title: "Refund & Cancellation Policy | Tivaa Elegance",
    description: "Refund and return eligibility, timelines, and cancellation guidelines for Tivaa.in.",
};

export default function RefundPolicyPage() {
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
                        <RotateCcw style={{ color: 'var(--accent, #0F9D94)' }} size={36} /> Refund &amp; Cancellation Policy
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
                        At Tivaa, customer satisfaction is important to us. We strive to ensure that every order reaches you in perfect condition. If you receive a damaged, defective, incorrect, or incomplete product, we are here to help.
                    </p>

                    {/* Section 1 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Order Cancellation
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            Once an order has been shipped, it cannot be cancelled. However, you may be eligible for a return in accordance with this Refund &amp; Cancellation Policy.
                        </p>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            To request an order cancellation, please contact us as soon as possible with your order details.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Return Eligibility
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            You may request a return if:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>You received a damaged product.</li>
                            <li>You received the wrong product.</li>
                            <li>The product has a manufacturing defect.</li>
                            <li>You received an incomplete order.</li>
                        </ul>
                        
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '8px 0 0 0' }}>
                            To be eligible for a return:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>The return request must be submitted within <strong>2 days</strong> of delivery.</li>
                            <li>The product must be unused and in its original condition.</li>
                            <li>Original packaging, labels, and accessories must be included.</li>
                            <li>Proof of the issue (photos or videos) may be required.</li>
                            <li>The product must include all original accessories, tags, manuals (if any), and packaging.</li>
                            <li>Return shipping shall be managed by the customer.</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Non-Returnable Items
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            The following items cannot be returned unless they are damaged or defective upon delivery:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Used products</li>
                            <li>Customized or personalized products</li>
                            <li>Clearance or sale items</li>
                            <li>Products damaged due to misuse or improper handling</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Return Approval
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            All return requests are reviewed after the required information is received. Tivaa reserves the right to approve or reject a return request if it does not meet the eligibility criteria described in this policy.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Refund Process
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            After the returned product is received and successfully inspected:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Approved refunds will be processed within <strong>5–10 business days</strong>.</li>
                            <li>Refunds will be credited to the original payment method used for the purchase.</li>
                            <li>Depending on your bank or payment provider, it may take additional time for the refund to appear in your account.</li>
                        </ul>
                    </section>

                    {/* Section 6 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Replacement
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            Tivaa currently follows a refund-only policy for approved return requests. Replacement products are generally not provided. If a return request is approved, the applicable refund will be processed in accordance with this policy.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Return Shipping
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            If the return is due to an error by Tivaa (wrong product, damaged product, or manufacturing defect), return shipping charges, if any, will be borne by Tivaa.
                        </p>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            For returns not caused by an error on our part (where accepted), the customer may be responsible for return shipping charges.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Fraud Prevention
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            To protect our customers and business, Tivaa reserves the right to refuse returns or refunds in cases of suspected misuse, fraudulent claims, repeated abuse of the return policy, or violations of these Terms.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(23, 59, 99, 0.03)', border: '1px solid var(--border, #E5E7EB)', padding: '24px', borderRadius: '16px' }}>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif", margin: '0 0 12px 0' }}>
                            Damaged or Incorrect Orders
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                            If your order arrives damaged, defective, or incorrect, please contact us within <strong>48 hours</strong> of delivery.
                        </p>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                            Please include:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.9rem', lineHeight: '1.6', paddingLeft: '20px', margin: '0 0 12px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Order Number</li>
                            <li>Photos or video of the product opening and damage if any</li>
                            <li>Photos of the packaging</li>
                            <li>Brief description of the issue</li>
                        </ul>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                            Send details to: <a href="mailto:tivaa2026@gmail.com" style={{ color: 'var(--accent, #0F9D94)', fontWeight: 600 }}>tivaa2026@gmail.com</a>
                        </p>
                    </section>

                    {/* Contact Us Card */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(23, 59, 99, 0.03)', border: '1px solid var(--border, #E5E7EB)', padding: '24px', borderRadius: '16px' }}>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif", margin: '0 0 4px 0' }}>
                            Contact Us
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                            For return, refund, or cancellation requests, please contact us:
                            <br />
                            <br />
                            <strong>Tivaa Elegance</strong>
                            <br />
                            Email: <a href="mailto:tivaa2026@gmail.com" style={{ color: 'var(--accent, #0F9D94)', fontWeight: 500 }}>tivaa2026@gmail.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
