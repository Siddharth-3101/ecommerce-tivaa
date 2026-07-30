"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { saveUser, getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [devOtp, setDevOtp] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [marketingConsent, setMarketingConsent] = useState(false);

    // Password strength evaluator regex
    const isPasswordStrong = (pwd) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(pwd);
    };

    // Live password check flags
    const passwordChecks = {
        length: form.password.length >= 8,
        uppercase: /[A-Z]/.test(form.password),
        lowercase: /[a-z]/.test(form.password),
        number: /\d/.test(form.password),
        special: /[@$!%*?&]/.test(form.password)
    };

    const handleGoogleLoginResponse = async (response) => {
        setLoading(true);
        setError("");
        try {
            const res = await api.post("/auth/google", {
                idToken: response.credential,
            });

            saveUser(res.data.user, res.data.token);
            window.dispatchEvent(new Event('cart-updated')); // Force reload user on Navbar
            window.location.href = "/";
        } catch (err) {
            setError(err.response?.data?.message || "Google Sign-In failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // If user is already logged in, redirect away immediately
        const user = getUser();
        if (user) {
            window.location.href = "/";
            return;
        }

        const initializeGoogle = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1032336302521-placeholder.apps.googleusercontent.com",
                    callback: handleGoogleLoginResponse,
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("google-register-button"),
                    { theme: "outline", size: "large", width: "100%" }
                );
            }
        };

        if (typeof window !== "undefined") {
            if (window.google) {
                initializeGoogle();
            } else {
                const checkInterval = setInterval(() => {
                    if (window.google) {
                        initializeGoogle();
                        clearInterval(checkInterval);
                    }
                }, 100);
                return () => clearInterval(checkInterval);
            }
        }
    }, []);

    const handleRegister = async (e) => {
        if (e) e.preventDefault();
        
        setError("");

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(form.phone)) {
            setError("Mobile number must be exactly 10 digits.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!isPasswordStrong(form.password)) {
            setError("Password does not meet the policy requirements.");
            return;
        }

        if (!privacyAccepted) {
            setError("You must accept the Privacy Policy and Terms & Conditions to proceed.");
            return;
        }

        try {
            setLoading(true);

            const res = await api.post("/auth/register", {
                name: form.name,
                phone: form.phone || null,
                email: form.email,
                password: form.password,
                privacyAccepted: true,
                termsAccepted: true,
                marketingConsent: marketingConsent
            });

            if (res.data.otpSent) {
                setOtpSent(true);
                if (res.data.dev_fallback_otp) {
                    setDevOtp(res.data.dev_fallback_otp);
                } else {
                    setDevOtp("");
                }
            } else {
                router.push("/login");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");

            await api.post("/auth/verify-register", {
                email: form.email,
                otp: otp
            });

            alert("Account verified successfully! You can now log in.");
            router.push("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Verification failed. Please check your OTP and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container animate-fade-in" style={{ padding: '80px 24px' }}>
            <div className="auth-form" style={{ maxWidth: '480px' }}>
                {!otpSent ? (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-main, #173B63)' }}>Create Account</h1>
                            <p style={{ color: 'var(--text-muted, #6B7280)' }}>Join us to experience exclusive premium collections</p>
                        </div>

                        {error && (
                            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: 'var(--danger)', marginBottom: '24px', fontSize: '0.9rem', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Full Name */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted, #6B7280)' }}>Full Name</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Mobile Number */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted, #6B7280)' }}>Mobile Number</label>
                                <input
                                    type="tel"
                                    className="input-field"
                                    placeholder="e.g. 7397266439"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                                    maxLength={10}
                                    required
                                />
                            </div>

                            {/* Email Address */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted, #6B7280)' }}>Email Address</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    autoComplete="new-email"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted, #6B7280)' }}>Password</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="input-field"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        style={{ width: '100%', paddingRight: '44px' }}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #6B7280)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Password Policy Checklist */}
                                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-main, #173B63)' }}>Password Requirements:</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                        <span style={{ fontSize: '0.75rem', color: passwordChecks.length ? 'var(--success, #10B981)' : 'var(--text-muted, #6B7280)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {passwordChecks.length ? "✓" : "•"} Min. 8 characters
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: passwordChecks.uppercase ? 'var(--success, #10B981)' : 'var(--text-muted, #6B7280)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {passwordChecks.uppercase ? "✓" : "•"} Uppercase letter
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: passwordChecks.lowercase ? 'var(--success, #10B981)' : 'var(--text-muted, #6B7280)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {passwordChecks.lowercase ? "✓" : "•"} Lowercase letter
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: passwordChecks.number ? 'var(--success, #10B981)' : 'var(--text-muted, #6B7280)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {passwordChecks.number ? "✓" : "•"} One number
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: passwordChecks.special ? 'var(--success, #10B981)' : 'var(--text-muted, #6B7280)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {passwordChecks.special ? "✓" : "•"} Special character
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted, #6B7280)' }}>Confirm Password</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="input-field"
                                        placeholder="••••••••"
                                        value={form.confirmPassword}
                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                        style={{ width: '100%', paddingRight: '44px' }}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #6B7280)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Consent Checkboxes */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted, #6B7280)' }}>
                                    <input
                                        type="checkbox"
                                        checked={privacyAccepted}
                                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                                        style={{ marginTop: '3px', cursor: 'pointer' }}
                                        required
                                    />
                                    <span>
                                        I have read and agree to the <Link href="/privacy" target="_blank" style={{ color: 'var(--accent, #0F9D94)', textDecoration: 'underline', fontWeight: 500 }}>Privacy Policy</Link> and <Link href="/terms" target="_blank" style={{ color: 'var(--accent, #0F9D94)', textDecoration: 'underline', fontWeight: 500 }}>Terms &amp; Conditions</Link>.
                                    </span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted, #6B7280)' }}>
                                    <input
                                        type="checkbox"
                                        checked={marketingConsent}
                                        onChange={(e) => setMarketingConsent(e.target.checked)}
                                        style={{ marginTop: '3px', cursor: 'pointer' }}
                                    />
                                    <span>
                                        I&apos;d like to receive offers, new arrivals, and promotions from TIVAA.
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={loading || !privacyAccepted} 
                                style={{ 
                                    width: '100%', 
                                    marginTop: '8px', 
                                    padding: '14px',
                                    opacity: (loading || !privacyAccepted) ? 0.5 : 1,
                                    cursor: (loading || !privacyAccepted) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? (
                                    <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderRadius: '50%', borderTopColor: '#fff', animation: 'spin 1s ease-in-out infinite' }}></span>
                                ) : "Create Account"}
                            </button>

                            {/* Privacy Note */}
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #6B7280)', lineHeight: '1.4', margin: '0', textAlign: 'center' }}>
                                By creating an account, your information will be handled in accordance with our <Link href="/privacy" target="_blank" style={{ color: 'var(--accent, #0F9D94)', textDecoration: 'underline' }}>Privacy Policy</Link>.
                            </p>
                        </form>

                        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: 'var(--text-muted, #6B7280)', fontSize: '0.85rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(0, 0, 0, 0.08)' }}></div>
                            <span style={{ padding: '0 16px' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(0, 0, 0, 0.08)' }}></div>
                        </div>

                        <div id="google-register-button" style={{ width: '100%', display: 'flex', justifyContent: 'center', height: '44px' }}></div>

                        <div style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-muted, #6B7280)', fontSize: '0.9rem' }}>
                            Already have an account? <Link href="/login" style={{ color: 'var(--text-main, #173B63)', fontWeight: 600 }}>Sign in</Link>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--text-main, #173B63)' }}>Verify Your Email</h1>
                            <p style={{ color: 'var(--text-muted, #6B7280)' }}>We have sent a 6-digit verification code to <strong>{form.email}</strong></p>
                        </div>

                        {error && (
                            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: 'var(--danger)', marginBottom: '24px', fontSize: '0.9rem', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        {devOtp && (
                            <div style={{ padding: '16px', background: 'rgba(220, 163, 83, 0.08)', border: '2px dashed rgba(220, 163, 83, 0.3)', borderRadius: '16px', color: 'var(--text-main, #173B63)', marginBottom: '24px', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #6B7280)', marginBottom: '4px' }}>Development Sandbox OTP Fallback:</p>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-yellow)', letterSpacing: '4px' }}>
                                    {devOtp}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted, #6B7280)' }}>Enter OTP Code</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. 123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    maxLength={6}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px' }}>
                                {loading ? "Verifying..." : "Verify Code"}
                            </button>
                            
                            <button type="button" onClick={() => handleRegister()} className="btn btn-secondary" style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--border, #E5E7EB)' }}>
                                Resend OTP Code
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
