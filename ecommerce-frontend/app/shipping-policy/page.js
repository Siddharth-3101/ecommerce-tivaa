import Link from "next/link";
import { ArrowLeft, Truck } from "lucide-react";

export const metadata = {
    title: "Shipping Policy | Tivaa Elegance",
    description: "Shipping options, processing times, and delivery coverage details for Tivaa.in.",
};

export default function ShippingPolicyPage() {
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
                        <Truck style={{ color: 'var(--accent, #0F9D94)' }} size={36} /> Shipping Policy
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
                        At Tivaa, we are committed to delivering your orders safely and on time. This Shipping Policy explains how we process, ship, and deliver your purchases.
                    </p>

                    {/* Section 1 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Order Processing
                        </h2>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Orders are typically processed within <strong>1–2 business days</strong> after successful payment confirmation.</li>
                            <li>Orders placed on weekends or public holidays will be processed on the next business day.</li>
                            <li>Processing times may be extended during festivals, sales, or unforeseen circumstances.</li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Delivery Timeline
                        </h2>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Most orders are delivered within <strong>5–10 business days</strong>, depending on the delivery location.</li>
                            <li>Delivery timelines are estimates and may vary due to courier operations, weather conditions, public holidays, or other factors beyond our control.</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Shipping Charges
                        </h2>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Shipping charges, if applicable, will be displayed during checkout before payment.</li>
                            <li>Any promotional free shipping offers will be clearly communicated on the website.</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Order Tracking
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            Once your order has been shipped:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Your order status will be available under <strong>My Orders</strong> in your TIVAA account.</li>
                            <li>Tracking information will be updated as it becomes available.</li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Delivery Address
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            Customers are responsible for providing an accurate and complete shipping address. TIVAA is not responsible for delays or failed deliveries resulting from incorrect or incomplete address information provided by the customer.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Failed Delivery Attempts
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            If delivery cannot be completed because the customer is unavailable or the address is incorrect, the courier partner may make additional delivery attempts or return the shipment to us. Additional shipping charges may apply if re-shipment is required.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Order Cancellation
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            Orders cannot be cancelled once they have been placed through the website. In exceptional circumstances, cancellation requests may be reviewed by the TIVAA team at its sole discretion before the order is shipped.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Delivery Coverage
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            TIVAA currently ships to locations within India. Availability of delivery services may vary based on your PIN code.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(23, 59, 99, 0.03)', border: '1px solid var(--border, #E5E7EB)', padding: '24px', borderRadius: '16px' }}>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif", margin: '0 0 12px 0' }}>
                            Damaged or Lost Shipments
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                            If you receive a damaged package or believe your shipment has been lost or damaged in transit, please contact us within <strong>48 hours</strong> of delivery (or the expected delivery date for lost shipments).
                        </p>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 12px 0' }}>
                            Please include:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.9rem', lineHeight: '1.6', paddingLeft: '20px', margin: '0 0 12px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Order Number</li>
                            <li>Photos of the package (if damaged)</li>
                            <li>Description of the issue</li>
                        </ul>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                            We will investigate the matter with our logistics partner and provide an appropriate resolution.
                        </p>
                    </section>

                    {/* Contact Us Card */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(23, 59, 99, 0.03)', border: '1px solid var(--border, #E5E7EB)', padding: '24px', borderRadius: '16px' }}>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif", margin: '0 0 4px 0' }}>
                            Contact Us
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                            For shipping-related questions, please contact:
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
