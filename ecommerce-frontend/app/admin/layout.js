"use client";

import Link from "next/link";
import { getUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser || currentUser.role !== "admin") {
            router.push("/login");
            return;
        }
        setUser(currentUser);
        setLoading(false);
    }, [router]);

    // Automatically close sidebar when navigation path changes
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '120px', display: 'flex', justifyContent: 'center' }}>
                <span style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderRadius: '50%', borderTopColor: 'var(--accent)', animation: 'spin 1s ease-in-out infinite' }}></span>
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const isActive = (path) => pathname === path;

    return (
        <div className="admin-layout-container" style={{ minHeight: "100vh", position: 'relative', background: 'var(--bg)', paddingTop: '60px' }}>
            
            {/* Header Bar (Sticky/Fixed on all screens) */}
            <header className="admin-header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 24px',
                background: 'var(--bg)',
                borderBottom: '1px solid var(--border)',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '60px',
                zIndex: 999
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 8,
                            color: 'var(--text-main)',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        aria-label="Open Navigation Sidebar"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                    <span className="admin-title-text" style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Admin Console
                    </span>
                </div>
                <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <img src="/logo.png" alt="Tivaa Logo" style={{ height: '40px', width: 'auto', mixBlendMode: 'multiply' }} />
                </Link>
                <div style={{ width: '40px' }}></div>
            </header>

            {/* Sidebar backdrop for mobile overlay */}
            {isSidebarOpen && (
                <div 
                    className="sidebar-backdrop"
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.4)',
                        zIndex: 1000,
                    }}
                />
            )}

            {/* Sidebar */}
            <aside
                className="admin-sidebar"
                style={{
                    background: "var(--bg)",
                    borderRight: "1px solid var(--border)",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "100vh",
                    width: "260px",
                    transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.3s ease",
                    zIndex: 1001,
                    boxShadow: isSidebarOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none'
                }}
            >
                {/* Logo & Close Section */}
                <div style={{ padding: '8px 0 16px', marginBottom: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src="/logo.png" alt="Tivaa Logo" style={{ height: '50px', width: 'auto', mixBlendMode: 'multiply' }} />
                    </Link>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        aria-label="Close Navigation Sidebar"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: "12px", paddingLeft: '12px' }}>Management</p>
                </div>

                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                    {[
                        { href: "/admin", label: "Dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg> },
                        { href: "/admin/products", label: "Products", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> },
                        { href: "/admin/products/add", label: "Add Product", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> },
                        { href: "/admin/categories", label: "Categories", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> },
                        { href: "/admin/orders", label: "Orders", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg> },
                        { href: "/admin/queries", label: "Customer Queries", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> }
                    ].map((link) => {
                        const active = isActive(link.href) || (link.href !== "/admin" && pathname?.startsWith(link.href));
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        padding: "10px 16px",
                                        borderRadius: "10px",
                                        background: active ? "var(--accent-glow)" : "transparent",
                                        color: active ? "var(--accent)" : "var(--text-main)",
                                        fontWeight: active ? 600 : 500,
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </aside>

            {/* Main Content */}
            <main className="admin-main-content" style={{ padding: "40px" }}>
                {children}
            </main>

            <style jsx>{`
                @media (max-width: 768px) {
                    .admin-header {
                        padding: 12px 16px !important;
                    }
                    .admin-main-content {
                        padding: 32px 16px !important;
                    }
                }
                @media (max-width: 500px) {
                    .admin-title-text {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
