"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, ShieldAlert } from "lucide-react";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [devOtp, setDevOtp] = useState("");

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");
        setDevOtp("");

        try {
            const res = await api.post("/auth/forgot-password", { email });
            setMessage(res.data.message || "OTP has been successfully sent to your email!");
            
            // Check if backend returned a development fallback OTP
            if (res.data.dev_fallback_otp) {
                setDevOtp(res.data.dev_fallback_otp);
                // In dev mode, don't auto-redirect immediately so they can see the OTP!
            } else {
                // Wait 2.5 seconds, then redirect to verify page
                setTimeout(() => {
                    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
                }, 2500);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please check your email and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container animate-fade-in" style={{ padding: '80px 24px' }}>
            <div className="auth-form" style={{ position: 'relative' }}>
                <div style={{ marginBottom: '24px' }}>
                    <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}>
                        <ArrowLeft size={16} /> Back to Sign In
                    </Link>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px', background: 'var(--gradient-logo)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Forgot Password</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Enter your email address and we will send you a 6-digit OTP to reset your password.</p>
                </div>

                {error && (
                    <div style={{ padding: '14px', background: 'rgba(179, 86, 111, 0.08)', border: '1px solid rgba(179, 86, 111, 0.2)', borderRadius: '12px', color: 'var(--danger)', marginBottom: '24px', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {message && (
                    <div style={{ padding: '14px', background: 'rgba(117, 163, 99, 0.08)', border: '1px solid rgba(117, 163, 99, 0.2)', borderRadius: '12px', color: 'var(--success)', marginBottom: '24px', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' }}>
                        {message}
                    </div>
                )}

                {devOtp && (
                    <div style={{ padding: '16px', background: 'rgba(220, 163, 83, 0.08)', border: '2px dashed rgba(220, 163, 83, 0.3)', borderRadius: '16px', color: 'var(--text-main)', marginBottom: '24px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--accent-yellow)', fontWeight: 'bold', marginBottom: '8px' }}>
                            <ShieldAlert size={20} /> Developer Sandbox Fallback
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Email delivery is unconfigured or failed on server. We generated this OTP for you:</p>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '4px', color: 'var(--accent-yellow)', margin: '8px 0' }}>
                            {devOtp}
                        </div>
                        <Link href={`/reset-password?email=${encodeURIComponent(email)}&otp=${devOtp}`} className="btn btn-secondary" style={{ width: '100%', padding: '10px', marginTop: '12px', fontSize: '0.85rem' }}>
                            Verify OTP Now
                        </Link>
                    </div>
                )}

                <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ paddingLeft: '44px' }}
                                disabled={loading || !!message}
                            />
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading || !!message} style={{ width: '100%', padding: '14px', marginTop: '8px' }}>
                        {loading ? (
                            <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderRadius: '50%', borderTopColor: '#fff', animation: 'spin 1s ease-in-out infinite' }}></span>
                        ) : "Send OTP"}
                    </button>
                </form>
            </div>
        </div>
    );
}
