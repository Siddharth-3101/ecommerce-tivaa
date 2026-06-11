"use client";

import { useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Send, CheckCircle, AlertCircle, Phone, Mail, Store, Tag, ArrowLeft } from "lucide-react";

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
        <div className="animate-fade-in" style={{ padding: '120px 0 80px', minHeight: '90vh', background: 'var(--gradient-bg)' }}>
            
            {/* Header section */}
            <div className="container" style={{ marginBottom: '48px' }}>
                <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', transition: 'color 0.2s', marginBottom: '24px' }}>
                    <ArrowLeft size={16} /> Continue Shopping
                </Link>
                <h1 style={{ fontSize: '3rem', marginBottom: '12px', background: 'var(--gradient-logo)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
                    Contact Us
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px' }}>
                    Get in touch with Tivaa Elegance. Whether you have inquiries, custom orders, or customer support questions, we are here to assist you.
                </p>
            </div>

            {/* Content grid */}
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.8fr)', gap: '48px', alignItems: 'start' }}>
                
                {/* CONTACT INFORMATION COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card" style={{ padding: '32px', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: '24px' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                            <Store size={22} style={{ color: 'var(--accent)' }} /> Store Details
                        </h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                                    <Store size={18} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Tivaa Elegance</h4>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tivaa Elegance Jewellery Store</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                                    <Tag size={18} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Category & Niche</h4>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Shopping and Retail</p>
                                    <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Specialist in Fashion Jewellery</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Phone</h4>
                                    <a href="tel:7397266439" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }} className="footer-link">
                                        +91 73972 66439
                                    </a>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Email</h4>
                                    <a href="mailto:tivaa2026@gmail.com" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }} className="footer-link">
                                        tivaa2026@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTACT QUERY FORM COLUMN */}
                <div 
                    className="card animate-fade-in" 
                    style={{ 
                        padding: '32px', 
                        background: 'var(--bg-glass)', 
                        border: '1px solid var(--accent)', 
                        borderRadius: '24px',
                        boxShadow: '0 8px 30px rgba(122,56,194,0.06)'
                    }}
                >
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '8px', color: 'var(--text-main)', fontFamily: "'Playfair Display', Georgia, serif" }}>Send us a Message</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
                        If you have any questions or feedback, fill out the form below. The inquiry goes straight to our Admin Dashboard, and we will email you back personally.
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
