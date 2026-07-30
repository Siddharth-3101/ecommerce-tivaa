"use client";

import { useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Send, CheckCircle, AlertCircle, Phone, Mail, Store, ArrowLeft } from "lucide-react";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            setError("Please fill out all fields.");
            return;
        }

        setLoading(true);
        try {
            await api.post("/queries", formData);
            setSuccess(true);
            setFormData({ name: "", email: "", subject: "", message: "" });
        } catch (err) {
            console.error("Failed to submit query:", err);
            setError(err.response?.data?.message || "Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ padding: '30px 0 80px', minHeight: '90vh', background: 'var(--bg, #F8FAFC)' }}>
            
            {/* Header section */}
            <div className="container" style={{ marginBottom: '48px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <Link href="/" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={16} /> Back
                    </Link>
                </div>
                <h1 className="contact-title" style={{ marginBottom: '12px', color: 'var(--text-main, #173B63)', display: 'block' }}>
                    We&apos;re here to help!
                </h1>
                <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '1.1rem', maxWidth: '700px' }}>
                    If you have any questions about your order, products, shipping, returns, or any other queries, our support team is happy to assist you.
                </p>
            </div>

            {/* Content grid */}
            <div className="container contact-grid">
                
                {/* CONTACT INFORMATION COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ 
                        padding: '32px', 
                        borderRadius: '24px',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px'
                    }}>


                        {/* Section 2: Contact Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main, #173B63)', margin: 0 }}>Customer Support</h3>
                            
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-glow, rgba(15, 157, 148, 0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent, #0F9D94)', flexShrink: 0 }}>
                                    <Store size={16} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', fontWeight: 600 }}>TIVAA Elegance</h4>
                                    <p style={{ margin: 0, color: 'var(--text-muted, #6B7280)', fontSize: '0.85rem' }}>Hyderabad, Telangana</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-glow, rgba(15, 157, 148, 0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent, #0F9D94)', flexShrink: 0 }}>
                                    <Mail size={16} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', fontWeight: 600 }}>Email</h4>
                                    <a href="mailto:tivaa2026@gmail.com" style={{ color: 'var(--accent, #0F9D94)', fontWeight: 600, fontSize: '0.9rem' }}>
                                        tivaa2026@gmail.com
                                    </a>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-glow, rgba(15, 157, 148, 0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent, #0F9D94)', flexShrink: 0 }}>
                                    <Phone size={16} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', fontWeight: 600 }}>Mobile</h4>
                                    <a href="tel:7397266439" style={{ color: 'var(--accent, #0F9D94)', fontWeight: 600, fontSize: '0.9rem' }}>
                                        +91 73972 66439
                                    </a>
                                </div>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border, #E5E7EB)', margin: 0 }} />

                        {/* Section 3: Business Hours */}
                        <div>
                            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main, #173B63)', marginBottom: '8px' }}>Business Hours</h3>
                            <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.9rem', margin: '0 0 4px 0', fontWeight: '500' }}>
                                Monday &ndash; Saturday
                            </p>
                            <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.9rem', margin: 0 }}>
                                9:30 AM &ndash; 6:30 PM IST
                            </p>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border, #E5E7EB)', margin: 0 }} />

                        {/* Section 4: Need Help */}
                        <div>
                            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main, #173B63)', marginBottom: '8px' }}>Need Help?</h3>
                            <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.9rem', margin: '0 0 10px 0' }}>
                                Please contact us for:
                            </p>
                            <ul style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.88rem', lineHeight: '1.6', paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <li>Order-related queries</li>
                                <li>Shipping and delivery assistance</li>
                                <li>Returns and refunds</li>
                                <li>Product information</li>
                                <li>Payment-related issues</li>
                                <li>Website support</li>
                                <li>Privacy-related requests</li>
                            </ul>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border, #E5E7EB)', margin: 0 }} />

                        {/* Section 5: Response Time */}
                        <div style={{ padding: '12px 16px', background: 'rgba(23, 59, 99, 0.03)', borderRadius: '12px', border: '1px solid var(--border, #E5E7EB)' }}>
                            <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.85rem', lineHeight: '1.4', margin: 0, textAlign: 'center', fontWeight: '500' }}>
                                We aim to respond to all customer enquiries within 2-5 business days.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CONTACT QUERY FORM COLUMN */}
                <div 
                    className="card animate-fade-in" 
                    style={{ 
                        padding: '32px', 
                        borderRadius: '24px',
                        border: '1px solid var(--border, #E5E7EB)',
                        boxShadow: '0 8px 30px rgba(23, 59, 99, 0.04)'
                    }}
                >
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '8px', color: 'var(--text-main, #173B63)', fontFamily: "'Playfair Display', Georgia, serif" }}>Send us a Message</h3>
                    <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
                        If you have any questions or feedback, fill out the form below. The inquiry goes straight to our Admin Dashboard, and we will email you back personally.
                    </p>

                    {success ? (
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <div style={{ width: '56px', height: '56px', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <CheckCircle size={28} />
                            </div>
                            <h4 style={{ color: 'var(--success)', fontSize: '1.15rem', marginBottom: '8px' }}>Query Submitted!</h4>
                            <p style={{ color: 'var(--text-muted, #6B7280)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                                Thank you for contacting TIVAA. Your enquiry has been received. We&apos;ll get back to you within 2-5 business days.
                            </p>
                            <button 
                                onClick={() => setSuccess(false)} 
                                className="btn btn-secondary" 
                                style={{ marginTop: '20px', width: '100%', padding: '10px' }}
                            >
                                Send Another Query
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {error && (
                                <div style={{ padding: '10px 14px', background: 'rgba(179, 86, 111, 0.08)', border: '1px solid rgba(179, 86, 111, 0.2)', borderRadius: '10px', color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted, #6B7280)', marginBottom: '6px', fontWeight: 500 }}>Full Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    placeholder="Enter your name" 
                                    className="input-field" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border, #E5E7EB)' }}
                                    required 
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted, #6B7280)', marginBottom: '6px', fontWeight: 500 }}>Email Address</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    placeholder="Enter your email" 
                                    className="input-field" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border, #E5E7EB)' }}
                                    required 
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted, #6B7280)', marginBottom: '6px', fontWeight: 500 }}>Subject</label>
                                <input 
                                    type="text" 
                                    name="subject" 
                                    value={formData.subject} 
                                    onChange={handleChange} 
                                    placeholder="What is your query about?" 
                                    className="input-field" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border, #E5E7EB)' }}
                                    required 
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted, #6B7280)', marginBottom: '6px', fontWeight: 500 }}>Your Message</label>
                                <textarea 
                                    name="message" 
                                    value={formData.message} 
                                    onChange={handleChange} 
                                    placeholder="Write your detailed message here..." 
                                    className="input-field" 
                                    rows="4"
                                    style={{ width: '100%', resize: 'vertical', minHeight: '100px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border, #E5E7EB)' }}
                                    required 
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loader"></span> Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} /> Send Query
                                    </>
                                )}
                            </button>

                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted, #6B7280)', lineHeight: '1.4', margin: '8px 0 0 0', textAlign: 'center' }}>
                                By submitting this form, you agree that TIVAA may use the information provided to respond to your enquiry. Please review our <Link href="/privacy" style={{ color: 'var(--accent, #0F9D94)', fontWeight: 500, textDecoration: 'underline' }}>Privacy Policy</Link> for more information.
                            </p>
                        </form>
                    )}
                </div>

            </div>

            <style jsx>{`
                .loader {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-bottom-color: #fff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    display: inline-block;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .contact-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1.8fr);
                    gap: 48px;
                    align-items: start;
                }
                .contact-title {
                    font-size: 3rem;
                }
                @media (max-width: 900px) {
                    .contact-grid {
                        grid-template-columns: 1fr;
                        gap: 32px;
                    }
                }
                @media (max-width: 768px) {
                    .contact-title {
                        font-size: 2.2rem;
                    }
                }
            `}</style>
        </div>
    );
}
