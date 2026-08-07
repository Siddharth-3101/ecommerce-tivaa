"use client";

import Link from "next/link";
import { getUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCatalogOpen, setIsCatalogOpen] = useState(true);
    const [isSalesOpen, setIsSalesOpen] = useState(true);
    const [isConfigOpen, setIsConfigOpen] = useState(true);
    const [isMastersOpen, setIsMastersOpen] = useState(true);
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
                    overflowY: "auto",
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

                <div style={{ marginBottom: '8px' }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, paddingLeft: '12px', margin: '0 0 12px 0' }}>Management</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {/* 1. Dashboard Link */}
                    <Link
                        href="/admin"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px 16px",
                            borderRadius: "10px",
                            background: pathname === "/admin" ? "var(--accent-glow)" : "transparent",
                            color: pathname === "/admin" ? "var(--accent)" : "var(--text-main)",
                            fontWeight: pathname === "/admin" ? 600 : 500,
                            fontSize: "0.95rem",
                            transition: "all 0.2s"
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                        Dashboard
                    </Link>

                    {/* 2. Catalog Section */}
                    <button 
                        onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 16px",
                            borderRadius: "8px",
                            background: "transparent",
                            color: "var(--text-muted)",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginTop: "12px",
                            textAlign: "left"
                        }}
                    >
                        <span>Catalog</span>
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            style={{
                                transform: isCatalogOpen ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s ease"
                            }}
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    {isCatalogOpen && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingLeft: "12px" }}>
                            {[
                                { href: "/admin/products", label: "Products", active: pathname === "/admin/products" || (pathname?.startsWith("/admin/products") && !pathname?.startsWith("/admin/products/add")), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> },
                                { href: "/admin/products/add", label: "Add Product", active: pathname === "/admin/products/add", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> },
                                { href: "/admin/categories", label: "Categories", active: pathname?.startsWith("/admin/categories"), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> },
                                { href: "/admin/product-attributes", label: "Product Attributes", active: pathname?.startsWith("/admin/product-attributes"), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg> }
                            ].map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        padding: "8px 12px",
                                        borderRadius: "8px",
                                        background: item.active ? "var(--accent-glow)" : "transparent",
                                        color: item.active ? "var(--accent)" : "var(--text-main)",
                                        fontWeight: item.active ? 600 : 500,
                                        fontSize: "0.9rem",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* 3. Sales Section */}
                    <button 
                        onClick={() => setIsSalesOpen(!isSalesOpen)}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 16px",
                            borderRadius: "8px",
                            background: "transparent",
                            color: "var(--text-muted)",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginTop: "12px",
                            textAlign: "left"
                        }}
                    >
                        <span>Sales</span>
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            style={{
                                transform: isSalesOpen ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s ease"
                            }}
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    {isSalesOpen && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingLeft: "12px" }}>
                            {[
                                { href: "/admin/orders", label: "Orders", active: pathname?.startsWith("/admin/orders"), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg> },
                                { href: "/admin/coupons", label: "Coupons", active: pathname?.startsWith("/admin/coupons"), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg> },
                                { href: "/admin/queries", label: "Customer Queries", active: pathname?.startsWith("/admin/queries"), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> }
                            ].map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        padding: "8px 12px",
                                        borderRadius: "8px",
                                        background: item.active ? "var(--accent-glow)" : "transparent",
                                        color: item.active ? "var(--accent)" : "var(--text-main)",
                                        fontWeight: item.active ? 600 : 500,
                                        fontSize: "0.9rem",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* 4. Reports Link */}
                    <Link
                        href="/admin/reports"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px 16px",
                            borderRadius: "10px",
                            background: pathname?.startsWith("/admin/reports") ? "var(--accent-glow)" : "transparent",
                            color: pathname?.startsWith("/admin/reports") ? "var(--accent)" : "var(--text-main)",
                            fontWeight: pathname?.startsWith("/admin/reports") ? 600 : 500,
                            fontSize: "0.95rem",
                            marginTop: "12px",
                            transition: "all 0.2s"
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Reports
                    </Link>

                    {/* 5. Configuration Section */}
                    <button 
                        onClick={() => setIsConfigOpen(!isConfigOpen)}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 16px",
                            borderRadius: "8px",
                            background: "transparent",
                            color: "var(--text-muted)",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginTop: "12px",
                            textAlign: "left"
                        }}
                    >
                        <span>Configuration</span>
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            style={{
                                transform: isConfigOpen ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s ease"
                            }}
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    {isConfigOpen && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingLeft: "12px" }}>
                            {/* Nested Masters Section */}
                            <button
                                onClick={() => setIsMastersOpen(!isMastersOpen)}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    background: "transparent",
                                    color: "var(--text-main)",
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: "0.9rem",
                                    textAlign: "left"
                                }}
                            >
                                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M21 19c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14"></path><path d="M21 5v14"></path></svg>
                                    Masters
                                </span>
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    style={{
                                        transform: isMastersOpen ? "rotate(180deg)" : "rotate(0deg)",
                                        transition: "transform 0.2s ease"
                                    }}
                                >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                            {isMastersOpen && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingLeft: "24px" }}>
                                    {[
                                        { href: "/admin/attributes", label: "Attributes", active: pathname?.startsWith("/admin/attributes"), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> },
                                        { href: "/admin/attribute-values", label: "Attribute Values", active: pathname?.startsWith("/admin/attribute-values"), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v14"></path><path d="M21 5v14"></path><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path></svg> },
                                        { href: "/admin/hsn", label: "HSN", active: pathname?.startsWith("/admin/hsn"), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg> },
                                        { href: "/admin/gst-state", label: "GST States", active: pathname?.startsWith("/admin/gst-state"), icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> }
                                    ].map(subItem => (
                                        <Link
                                            key={subItem.href}
                                            href={subItem.href}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                background: subItem.active ? "var(--accent-glow)" : "transparent",
                                                color: subItem.active ? "var(--accent)" : "var(--text-muted)",
                                                fontWeight: subItem.active ? 600 : 500,
                                                fontSize: "0.85rem",
                                                transition: "all 0.2s"
                                            }}
                                        >
                                            {subItem.icon}
                                            {subItem.label}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Settings Link */}
                            <Link
                                href="/admin/settings"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    background: pathname?.startsWith("/admin/settings") ? "var(--accent-glow)" : "transparent",
                                    color: pathname?.startsWith("/admin/settings") ? "var(--accent)" : "var(--text-main)",
                                    fontWeight: pathname?.startsWith("/admin/settings") ? 600 : 500,
                                    fontSize: "0.9rem",
                                    transition: "all 0.2s"
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                Settings
                            </Link>
                        </div>
                    )}
                </div>
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
