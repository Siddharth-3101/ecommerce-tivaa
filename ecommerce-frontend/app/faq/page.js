"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, ArrowLeft } from "lucide-react";

export default function FAQPage() {
    const [activeIndex, setActiveIndex] = useState(null);

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
            answer: "You can email our customer support team at tivaa2026@gmail.com. Alternatively, you can submit a query using the contact form on our Contact Us page."
        }
    ];

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="animate-fade-in" style={{ padding: '120px 0 80px', minHeight: '90vh' }}>
            {/* Header section */}
            <div className="container" style={{ marginBottom: '48px' }}>
                <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', transition: 'color 0.2s', marginBottom: '24px' }}>
                    <ArrowLeft size={16} /> Continue Shopping
                </Link>
                <h1 className="faq-title" style={{ marginBottom: '12px', background: 'var(--gradient-logo)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
                    Frequently Asked Questions
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px' }}>
                    Find answers to common questions about our premium jewelry, shipping, and return policies, or send us a query directly on our Contact Us page.
                </p>
            </div>

            {/* Content grid */}
            <div className="container faq-grid">
                
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

                {/* CONTACT CTA COLUMN */}
                <div 
                    className="card animate-fade-in" 
                    style={{ 
                        padding: '32px', 
                        background: 'var(--bg-glass)', 
                        border: '1px solid var(--accent)', 
                        borderRadius: '24px',
                        boxShadow: '0 8px 30px rgba(122,56,194,0.06)',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '20px'
                    }}
                >
                    <HelpCircle size={48} style={{ color: 'var(--accent)' }} />
                    <h3 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--text-main)' }}>Still Have Questions?</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                        If you couldn't find the answers you were looking for, feel free to send us a message or get our direct support contact details.
                    </p>
                    <Link href="/contact" className="btn btn-primary" style={{ width: '100%', padding: '14px', display: 'inline-flex', justifyContent: 'center' }}>
                        Contact Us
                    </Link>
                </div>

            </div>

            <style jsx>{`
                .faq-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) minmax(0, 420px);
                    gap: 48px;
                    align-items: start;
                }
                .faq-title {
                    font-size: 3rem;
                }
                @media (max-width: 900px) {
                    .faq-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                }
                @media (max-width: 768px) {
                    .faq-title {
                        font-size: 2rem;
                    }
                }
            `}</style>
        </div>
    );
}
