import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export const metadata = {
    title: "Terms & Conditions | Tivaa Elegance",
    description: "Terms & Conditions, website usage rules, and legal agreements for Tivaa.in.",
};

export default function TermsOfServicePage() {
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
                        <Scale style={{ color: 'var(--accent, #0F9D94)' }} size={36} /> Terms &amp; Conditions
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
                    gap: '32px'
                }}>
                    <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                        Welcome to Tivaa.in (&ldquo;Tivaa&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). These Terms &amp; Conditions govern your access to and use of our website, products, and services. By accessing, browsing, registering an account, or placing an order through Tivaa.in, you acknowledge that you have read, understood, and agree to be bound by these Terms &amp; Conditions and our Privacy Policy.
                    </p>
                    <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                        If you do not agree with these Terms, please do not use our website.
                    </p>

                    {/* Section 1 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Eligibility
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            By using Tivaa.in, you confirm that:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>You are at least 18 years of age or are using the website under the supervision of a parent or legal guardian.</li>
                            <li>The information you provide is accurate and complete.</li>
                            <li>You will use the website only for lawful purposes.</li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            User Accounts
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            If you create an account with Tivaa.in:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                            <li>You agree to provide accurate and up-to-date information.</li>
                            <li>You are responsible for all activities carried out through your account.</li>
                            <li>Notify us immediately if you suspect unauthorized access to your account.</li>
                        </ul>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '8px 0 0 0' }}>
                            We reserve the right to suspend or terminate accounts that violate these Terms.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Website Usage
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            You agree:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Not to misuse the website or its services.</li>
                            <li>Not to engage in fraudulent, illegal, or unauthorized activities.</li>
                            <li>Not to interfere with website security or operations.</li>
                            <li>Not to upload malicious software or harmful content.</li>
                            <li>Not to attempt unauthorized access to our systems.</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Product Information
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            We strive to ensure all product information is accurate. However:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Product colors may vary depending on your display.</li>
                            <li>Product dimensions may have minor manufacturing variations.</li>
                            <li>Product availability is subject to stock.</li>
                            <li>Images are for illustration purposes where applicable.</li>
                        </ul>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '8px 0 0 0' }}>
                            We reserve the right to modify product information without prior notice.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Pricing
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            All prices displayed on Tivaa.in are in Indian Rupees (INR) unless otherwise specified. We reserve the right to:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Modify prices without prior notice.</li>
                            <li>Correct pricing or typographical errors.</li>
                            <li>Cancel orders affected by pricing inaccuracies.</li>
                        </ul>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '8px 0 0 0' }}>
                            Applicable taxes and shipping charges will be displayed during checkout.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Orders &amp; Acceptance
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            Placing an order does not constitute acceptance by Tivaa. An order is considered accepted only after:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: '0 0 8px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Successful payment (where applicable)</li>
                            <li>Stock verification</li>
                            <li>Order confirmation by Tivaa</li>
                        </ul>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            We reserve the right to cancel or refuse any order due to:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Product unavailability</li>
                            <li>Pricing errors</li>
                            <li>Suspected fraudulent activity</li>
                            <li>Incorrect customer information</li>
                        </ul>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '8px 0 0 0' }}>
                            If payment has already been collected for a cancelled order, an appropriate refund will be initiated.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Payment Terms
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            Payments are processed securely through trusted third-party payment gateways. Tivaa does not store complete debit or credit card information. Orders will be processed only after successful payment confirmation unless Cash on Delivery is offered.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Shipping
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            Shipping and delivery timelines are provided in our Shipping Policy. Estimated delivery dates are indicative and may vary due to factors beyond our control. Shipping charges, if applicable, will be displayed before order confirmation.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Returns, Refunds &amp; Cancellations
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            Returns, refunds, and cancellations are governed by our Refund &amp; Cancellation Policy. Please review the policy before placing an order.
                        </p>
                    </section>

                    {/* Section 10 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Intellectual Property
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            All content available on Tivaa.in, including:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: '0 0 8px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Logos</li>
                            <li>Brand names</li>
                            <li>Images</li>
                            <li>Product photographs</li>
                            <li>Product descriptions</li>
                            <li>Graphics</li>
                            <li>Website design</li>
                            <li>Software</li>
                            <li>Text</li>
                        </ul>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            is owned by or licensed to Tivaa and is protected under applicable intellectual property laws. No content may be copied, reproduced, distributed, or used without prior written permission.
                        </p>
                    </section>

                    {/* Section 11 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            User Responsibilities
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            You agree:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>To provide accurate information.</li>
                            <li>Not to misuse promotional offers.</li>
                            <li>Not to impersonate another person.</li>
                            <li>Not to place fraudulent orders.</li>
                            <li>Not to violate applicable laws while using the website.</li>
                        </ul>
                    </section>

                    {/* Section 12 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Privacy
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            Your use of Tivaa.in is also governed by our Privacy Policy, which explains how we collect, use, store, and protect your personal information.
                        </p>
                    </section>

                    {/* Section 13 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Disclaimer
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            The website and all products and services are provided on an &ldquo;as available&rdquo; and &ldquo;as is&rdquo; basis. While we strive for accuracy, Tivaa does not guarantee:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Continuous availability</li>
                            <li>Error-free operation</li>
                            <li>Uninterrupted access</li>
                            <li>Complete accuracy of all content</li>
                        </ul>
                    </section>

                    {/* Section 14 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Limitation of Liability
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '0 0 8px 0' }}>
                            To the maximum extent permitted by applicable law, Tivaa shall not be liable for any indirect, incidental, consequential, special, or punitive damages arising from:
                        </p>
                        <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Use of the website</li>
                            <li>Product usage</li>
                            <li>Delayed deliveries</li>
                            <li>Service interruptions</li>
                            <li>Technical failures</li>
                        </ul>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: '8px 0 0 0' }}>
                            Our total liability shall not exceed the amount paid for the affected order.
                        </p>
                    </section>

                    {/* Section 15 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Indemnification
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            You agree to indemnify and hold harmless Tivaa, its employees, partners, and affiliates from any claims, damages, liabilities, losses, or expenses arising from your misuse of the website or violation of these Terms.
                        </p>
                    </section>

                    {/* Section 16 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Force Majeure
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            Tivaa shall not be liable for delays or failure to perform its obligations due to events beyond its reasonable control, including natural disasters, pandemics, government actions, strikes, transportation disruptions, internet outages, or other unforeseen events.
                        </p>
                    </section>

                    {/* Section 17 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Changes to Terms
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            We may revise these Terms &amp; Conditions from time to time. Updated versions will be published on this page along with the revised &ldquo;Last Updated&rdquo; date. Continued use of the website constitutes acceptance of the updated Terms.
                        </p>
                    </section>

                    {/* Section 18 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Severability
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
                        </p>
                    </section>

                    {/* Section 19 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border, #E5E7EB)', paddingBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            Governing Law
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                            These Terms &amp; Conditions shall be governed by and interpreted in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the competent courts in Hyderabad, Telangana.
                        </p>
                    </section>

                    {/* Section 20 */}
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(23, 59, 99, 0.03)', border: '1px solid var(--border, #E5E7EB)', padding: '24px', borderRadius: '16px' }}>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif", margin: '0 0 4px 0' }}>
                            Contact Us
                        </h2>
                        <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                            If you have any questions regarding these Terms &amp; Conditions, please contact us:
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
