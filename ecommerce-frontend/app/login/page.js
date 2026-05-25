"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { saveUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGoogleLoginResponse = async (response) => {
        setLoading(true);
        setError("");
        try {
            const res = await api.post("/auth/google", {
                idToken: response.credential,
            });

            saveUser(res.data.user, res.data.token);
            window.dispatchEvent(new Event('cart-updated')); // Trick to force reload user on Navbar
            window.location.href = "/";
        } catch (err) {
            setError(err.response?.data?.message || "Google Sign-In failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

        // If user is already logged in, redirect away from login page immediately
        const user = getUser();
        if (user) {
            window.location.href = "/";
            return;
        }

        const initializeGoogle = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1032336302521-placeholder.apps.googleusercontent.com", // Fallback to prompt client setup
                    callback: handleGoogleLoginResponse,
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("google-login-button"),
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

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/auth/login", {
                email,
                password,
            });

            saveUser(res.data.user, res.data.token);
            window.dispatchEvent(new Event('cart-updated')); // Trick to force reload user on Navbar
            window.location.href = "/";
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container animate-fade-in" style={{ padding: '80px 24px' }}>
            <div className="auth-form">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Sign in to access your premium account</p>
                </div>

                {error && (
                    <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: 'var(--danger)', marginBottom: '24px', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password</label>
                            <Link href="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>Forgot password?</Link>
                        </div>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '8px', padding: '14px' }}>
                        {loading ? (
                            <span style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderRadius: '50%', borderTopColor: '#fff', animation: 'spin 1s ease-in-out infinite' }}></span>
                        ) : "Sign In"}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
                    <span style={{ padding: '0 16px' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
                </div>

                <div id="google-login-button" style={{ width: '100%', display: 'flex', justifyContent: 'center', height: '44px' }}></div>

                <div style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Don&apos;t have an account? <Link href="/register" style={{ color: 'var(--text-main)', fontWeight: 600 }}>Create one now</Link>
                </div>
            </div>
        </div>
    );
}
