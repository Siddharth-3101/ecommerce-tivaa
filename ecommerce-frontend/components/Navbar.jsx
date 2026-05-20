"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { getUser, logout } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { Search, Heart, ShoppingBag, Menu, X, ChevronRight } from "lucide-react";

export default function Navbar() {
    const [count, setCount] = useState(0);
    const [user, setUser] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [categories, setCategories] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Live Search
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);

    // Mobile Menu
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        Promise.resolve().then(() => setUser(getUser()));

        async function loadCart() {
            try {
                const res = await api.get("/cart");
                if (res.data) {
                    const numItems = res.data.items ? res.data.items.length : res.data.length;
                    setCount(numItems || 0);
                }
            } catch (err) { }
        }
        loadCart();

        async function loadCategories() {
            try {
                const res = await api.get("/categories");
                setCategories(res.data);
            } catch (err) { }
        }
        loadCategories();

        const handleScroll = () => setScrolled(window.scrollY > 20);
        const handleCartUpdate = () => loadCart();

        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchResults([]);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('cart-updated', handleCartUpdate);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('cart-updated', handleCartUpdate);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => {
            setMobileMenuOpen(false);
            setDropdownOpen(false);
            setSearchResults([]);
        });
    }, [pathname]);

    // Live search effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                setIsSearching(true);
                try {
                    const res = await fetch(`http://localhost:5000/api/products/search?q=${encodeURIComponent(searchQuery)}`);
                    const data = await res.json();
                    setSearchResults(Array.isArray(data) ? data.slice(0, 5) : []);
                } catch (err) {
                    setSearchResults([]);
                }
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleLogout = () => {
        logout();
        setUser(null);
        router.push("/login");
    };

    if (pathname?.startsWith("/admin")) return null;

    return (
        <header className="navbar" style={{ padding: scrolled ? "12px 0" : "20px 0", borderBottom: scrolled ? "1px solid var(--glass-border)" : "1px solid transparent", background: scrolled ? "var(--bg-glass)" : "transparent" }}>
            <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-only btn"
                    onClick={() => setMobileMenuOpen(true)}
                    style={{ padding: '8px', background: 'transparent', border: 'none' }}
                >
                    <Menu size={24} />
                </button>

                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center' }} className="nav-logo">
                    <img src="/logo.png" alt="Tivaa Elegance" style={{ height: '70px', width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                </Link>

                {/* DESKTOP NAV CENTER */}
                <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>

                    {/* Products Dropdown */}
                    <div
                        onMouseEnter={() => setDropdownOpen(true)}
                        onMouseLeave={() => setDropdownOpen(false)}
                        style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%' }}
                    >
                        <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '1rem' }}>
                            Collections
                            <ChevronRight size={16} style={{ transform: dropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </Link>

                        {dropdownOpen && (
                            <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', paddingTop: '20px', width: '220px', zIndex: 200 }}>
                                <div className="card" style={{ padding: '8px', display: 'flex', flexDirection: 'column', background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-md)' }}>
                                    <Link href="/products" className="dropdown-item" style={{ padding: '10px 16px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 500, display: 'block' }}>
                                        All Collections
                                    </Link>
                                    {categories.map(c => (
                                        <Link key={c.id} href={`/products?category=${encodeURIComponent(c.name)}`} className="dropdown-item" style={{ padding: '10px 16px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 500, display: 'block' }}>
                                            {c.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Live Search Bar */}
                    <div ref={searchRef} style={{ position: "relative" }}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (searchQuery.trim()) {
                                    router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
                                    setSearchResults([]);
                                }
                            }}
                            style={{ display: "flex", alignItems: "center", position: "relative" }}
                        >
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for perfection..."
                                className="input-field"
                                style={{ width: "300px", padding: "10px 16px 10px 40px", borderRadius: "20px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", height: '42px' }}
                            />
                            <Search size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                            {isSearching && <span className="loader" style={{ position: 'absolute', right: '14px' }}></span>}
                        </form>

                        {searchResults.length > 0 && (
                            <div className="card" style={{ position: 'absolute', top: 'calc(100% + 10px)', left: 0, width: '100%', padding: '8px', zIndex: 200, background: 'var(--bg-glass)', backdropFilter: 'blur(20px)' }}>
                                {searchResults.map(item => (
                                    <Link key={item.id} href={`/product/${item.id}`} onClick={() => setSearchResults([])} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px' }}>
                                        <img src={item.image_url || "/placeholder.png"} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{item.price}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Area */}
                <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    {/* User Actions */}
                    <div className="desktop-only" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        {user ? (
                            <>
                                <Link href="/wishlist" style={{ color: 'var(--text-main)' }}>
                                    <Heart size={20} />
                                </Link>
                                {user.role === 'admin' && (
                                    <Link href="/admin" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Dashboard</Link>
                                )}
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Hi, <strong style={{ color: 'var(--text-main)' }}>{user.name}</strong></span>
                                <button onClick={handleLogout} className="btn" style={{ padding: '6px 12px', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'transparent' }}>Logout</button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="btn btn-secondary" style={{ padding: '8px 16px' }}>Sign in</Link>
                                <Link href="/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>Create Account</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Only Wishlist (if logged in) */}
                    <Link href="/wishlist" className="mobile-only" style={{ color: 'var(--text-main)' }}>
                        {user && <Heart size={20} />}
                    </Link>

                    {/* Cart */}
                    <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                        <ShoppingBag size={20} />
                        <span style={{ background: 'var(--accent)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                            {count}
                        </span>
                    </Link>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}>
                    <div
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', cursor: 'pointer' }}
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="card" style={{ position: 'relative', width: '300px', height: '100%', background: 'var(--bg)', borderRadius: 0, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', animation: 'slideRight 0.3s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <img src="/logo.png" style={{ height: '50px', mixBlendMode: 'multiply' }} />
                            <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); router.push(`/products?q=${encodeURIComponent(searchQuery)}`); setMobileMenuOpen(false); }}>
                            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="input-field" style={{ width: '100%' }} />
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                            <Link href="/products" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>All Collections</Link>
                            {categories.map(c => (
                                <Link key={c.id} href={`/products?category=${c.name}`} className="btn" style={{ justifyContent: 'flex-start', background: 'transparent' }}>{c.name}</Link>
                            ))}
                        </div>

                        {user ? (
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <p style={{ margin: 0 }}>Logged in as <strong>{user.name}</strong></p>
                                {user.role === 'admin' && <Link href="/admin" className="btn btn-primary" style={{ textAlign: 'center' }}>Dashboard</Link>}
                                <button onClick={handleLogout} className="btn btn-danger">Logout</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <Link href="/login" className="btn btn-secondary">Sign In</Link>
                                <Link href="/register" className="btn btn-primary">Create Account</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx global>{`
                .loader { width: 14px; height: 14px; border: 2px solid var(--text-muted); border-bottom-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
                
                @media (min-width: 900px) {
                    .mobile-only { display: none !important; }
                }
                @media (max-width: 899px) {
                    .desktop-only { display: none !important; }
                    .nav-logo { flex: 1; justify-content: center; }
                }
            `}</style>
        </header>
    );
}
