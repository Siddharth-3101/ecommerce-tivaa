"use client";

import { useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { HelpCircle, Send, ChevronDown, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

export default function FAQPage() {
    const [activeIndex, setActiveIndex] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const faqs = [
        {
            question: "How long does shipping take?",
            answer: "Orders are typically processed within 1–2 business days and delivered within 3–7 business days depending on location."
        },
        {
            question: "Do you offer Cash on Delivery (COD)?",
            answer: "No, COD is unavailable at this moment. We accept secure prepaid online payments via major credit/debit cards, net banking, UPI, and popular digital wallets."
        },
        {
            question: "How can I track my order?",
            answer: "Once your order is shipped, tracking details (including the courier service name and tracking ID) will be sent to you via email or SMS."
        },
        {
            question: "Can I cancel my order?",
            answer: "Yes, orders can be cancelled before they are dispatched. Once shipped, cancellation requests cannot be guaranteed."
        },
        {
            question: "What if I receive a damaged product?",
            answer: "If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos of the issue and your order number at tivaa2026@gmail.com."
        },
        {
            question: "Do you offer exchanges?",
            answer: "Yes, exchanges may be offered for defective or incorrectly delivered products, subject to stock availability. Please reach out to customer support to initiate an exchange."
        },
        {
            question: "Are your accessories suitable for gifting?",
            answer: "Absolutely. Tivaa products are thoughtfully designed and make wonderful gifts for birthdays, festivals, anniversaries, and special occasions."
        },
        {
            question: "How can I contact customer support?",
            answer: "You can email our customer support team at tivaa2026@gmail.com. Alternatively, you can submit a query using the contact form on this page."
        }
    ];

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

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
        <div className="animate-fade-in" style={{ padding: '120px 0 80px', minHeight: '90vh' }}>
            {/* Header section */}
            <div className="container" style={{ marginBottom: '48px' }}>
                <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', transition: 'color 0.2s', marginBottom: '24px' }}>
                    <ArrowLeft size={16} /> Continue Shopping
                </Link>
                <h1 style={{ fontSize: '3rem', marginBottom: '12px', background: 'var(--gradient-logo)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
                    Frequently Asked Questions
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px' }}>
                    Find instant answers to common questions about our premium jewelry, hallmarks, shipping, and return policies, or send us a query directly below.
                </p>
            </div>

            {/* Content grid */}
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 420px)', gap: '48px', alignItems: 'start' }}>
                
                {/* FAQ ACCORDIONS COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h2 style={{ fontSize: '1.6rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <HelpCircle size={24} style={{ color: 'var(--accent)' }} /> Store FAQ
                    </h2>

                    {faqs.map((faq, idx) => {
                        const isOpen = activeIndex === idx;
                        return (
                            <div 
                                key={idx} 
                                className="card" 
                                style={{ 
                                    padding: '0', 
                                    overflow: 'hidden', 
                                    background: 'var(--bg-glass)', 
                                    border: isOpen ? '1px solid var(--accent)' : '1px solid var(--border)',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <button
                                    onClick={() => toggleAccordion(idx)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '20px 24px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: isOpen ? 'var(--accent)' : 'var(--text-main)',
                                        fontSize: '1.05rem',
                                        fontWeight: 600,
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    <span>{faq.question}</span>
                                    <ChevronDown 
                                        size={18} 
                                        style={{ 
                                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            color: isOpen ? 'var(--accent)' : 'var(--text-muted)'
                                        }} 
                                    />
                                </button>
                                
                                <div 
                                    style={{ 
                                        maxHeight: isOpen ? '250px' : '0', 
                                        opacity: isOpen ? 1 : 0,
                                        overflow: 'hidden',
                                        transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                                        borderTop: isOpen ? '1px solid var(--glass-border)' : '1px solid transparent'
                                    }}
                                >
                                    <p style={{ padding: '20px 24px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CONTACT QUERY FORM COLUMN */}
                <div 
                    className="card animate-fade-in" 
                    style={{ 
                        padding: '32px', 
                        background: 'var(--bg-glass)', 
                        border: '1px solid var(--accent)', 
                        borderRadius: '24px',
                        boxShadow: '0 8px 30px rgba(229,147,116,0.06)'
                    }}
                >
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '8px', color: 'var(--text-main)' }}>Still Have Questions?</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
                        Submit your message below. The inquiry goes straight to our Admin Dashboard, and we will email you back personally.
                    </p>

                    {success ? (
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <div style={{ width: '56px', height: '56px', background: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <CheckCircle size={28} />
                            </div>
                            <h4 style={{ color: 'var(--success)', fontSize: '1.15rem', marginBottom: '8px' }}>Query Submitted!</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                                Your message has been received. Our support team will respond to your email address shortly.
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
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 500 }}>Full Name</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    placeholder="Enter your name" 
                                    className="input-field" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
                                    required 
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 500 }}>Email Address</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    placeholder="Enter your email" 
                                    className="input-field" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
                                    required 
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 500 }}>Subject</label>
                                <input 
                                    type="text" 
                                    name="subject" 
                                    value={formData.subject} 
                                    onChange={handleChange} 
                                    placeholder="What is your query about?" 
                                    className="input-field" 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
                                    required 
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 500 }}>Your Message</label>
                                <textarea 
                                    name="message" 
                                    value={formData.message} 
                                    onChange={handleChange} 
                                    placeholder="Write your detailed message here..." 
                                    className="input-field" 
                                    rows="4"
                                    style={{ width: '100%', resize: 'vertical', minHeight: '100px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}
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
                @media (max-width: 900px) {
                    div.container {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
