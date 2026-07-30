"use client";

import { useState, useEffect, Suspense } from "react";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, KeyRound, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(3);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password strength policy validator
    const isPasswordStrong = (pwd) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(pwd);
    };

    // Live password checklist flags
    const passwordChecks = {
        length: newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        lowercase: /[a-z]/.test(newPassword),
        number: /\d/.test(newPassword),
        special: /[@$!%*?&]/.test(newPassword)
    };

    // Sync query parameters on load
    useEffect(() => {
        const emailParam = searchParams.get("email");
        const otpParam = searchParams.get("otp");
        if (emailParam) setEmail(emailParam);
        if (otpParam) setOtp(otpParam);
    }, [searchParams]);

    // Handle auto redirection countdown
    useEffect(() => {
        if (success && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (success && countdown === 0) {
            router.push("/login");
        }
    }, [success, countdown, router]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!isPasswordStrong(newPassword)) {
            setError("Password does not meet the policy requirements.");
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            await api.post("/auth/reset-password", {
                email,
                otp,
                newPassword,
            });

            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password. Please verify your OTP and try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--success)', marginBottom: '24px' }}>
                    <CheckCircle2 size={64} style={{ animation: 'spin 0.5s ease-out 1' }} />
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '12px', background: 'var(--gradient-logo)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Password Reset!</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Your password has been successfully updated. You can now sign in using your new credentials.</p>
                <div style={{ padding: '16px', background: 'var(--accent-glow)', borderRadius: '12px', color: 'var(--accent)', fontWeight: '600', fontSize: '0.95rem' }}>
                    Redirecting to Sign In in {countdown}s...
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <Link href="/forgot-password" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}>
                    <ArrowLeft size={16} /> Change Email / Request New OTP
                </Link>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px', background: 'var(--gradient-logo)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Reset Password</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Enter the 6-digit OTP sent to your inbox and establish your new secure password.</p>
            </div>

            {error && (
                <div style={{ padding: '14px', background: 'rgba(179, 86, 111, 0.08)', border: '1px solid rgba(179, 86, 111, 0.2)', borderRadius: '12px', color: 'var(--danger)', marginBottom: '24px', fontSize: '0.9rem', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                            disabled={loading}
                        />
                        <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>6-Digit OTP Code</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            required
                            maxLength={6}
                            style={{ paddingLeft: '44px', letterSpacing: '4px', fontWeight: 'bold' }}
                            disabled={loading}
                        />
                        <KeyRound size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>New Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="input-field"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            style={{ paddingLeft: '44px', paddingRight: '44px', width: '100%' }}
                            disabled={loading}
                        />
                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Password Requirements Dynamic checklist */}
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

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>Confirm New Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="input-field"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{ paddingLeft: '44px', paddingRight: '44px', width: '100%' }}
                            disabled={loading}
                        />
                        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading} 
                    style={{ 
                        width: '100%', 
                        padding: '14px', 
                        marginTop: '8px',
                        opacity: loading ? 0.5 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? (
                        <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderRadius: '50%', borderTopColor: '#fff', animation: 'spin 1s ease-in-out infinite' }}></span>
                    ) : "Verify & Reset Password"}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="auth-container animate-fade-in" style={{ padding: '80px 24px' }}>
            <div className="auth-form">
                <Suspense fallback={
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '16px' }}>
                        <span style={{ display: 'inline-block', width: '32px', height: '32px', border: '4px solid rgba(229,147,116,0.2)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Initializing password reset form...</p>
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
