"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { getUser, logout } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { Search, Heart, ShoppingCart, Menu, X, ChevronRight, User, ChevronDown, Shield, LogOut, Package } from "lucide-react";

// Recreated premium line-art vector icons from the theme assets
const CustomSearchIcon = ({ size = 20, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="6" />
        <line x1="15.5" y1="15.5" x2="20.5" y2="20.5" />
        <path d="M8.5 8.5 A 3.5 3.5 0 0 1 12 7.5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const CustomHeartIcon = ({ size = 20, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 20.5 C12 20.5 3.5 14.5 3.5 8.5 C3.5 5.5 5.5 3.5 8.5 3.5 C10.2 3.5 11.3 4.5 12 5.5 C12.7 4.5 13.8 3.5 15.5 3.5 C18.5 3.5 20.5 5.5 20.5 8.5 C20.5 14.5 12 20.5 12 20.5 Z" />
    </svg>
);

const CustomUserIcon = ({ size = 20, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="7" r="4.2" />
        <path d="M4.5 19.5 C5.5 15.5 8.5 13.5 12 13.5 C15.5 13.5 18.5 15.5 19.5 19.5" />
    </svg>
);

const CustomCartIcon = ({ size = 20, ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
);

export default function Navbar() {
    const [count, setCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [user, setUser] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [categories, setCategories] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const profileTimeoutRef = useRef(null);
    const categoriesTimeoutRef = useRef(null);

    const handleProfileMouseEnter = () => {
        if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
        setProfileOpen(true);
    };

    const handleProfileMouseLeave = () => {
        profileTimeoutRef.current = setTimeout(() => {
            setProfileOpen(false);
        }, 300); // 300ms grace period
    };

    const handleCategoriesMouseEnter = () => {
        if (categoriesTimeoutRef.current) clearTimeout(categoriesTimeoutRef.current);
        setDropdownOpen(true);
    };

    const handleCategoriesMouseLeave = () => {
        categoriesTimeoutRef.current = setTimeout(() => {
            setDropdownOpen(false);
        }, 300); // 300ms grace period
    };

    const getInitials = (name) => {
        if (!name) return "";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Live Search
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);

    // Mobile Menu
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    const loadWishlist = () => {
        import("@/lib/auth").then(({ getToken }) => {
            if (!getToken()) return;
            api.get("/wishlist").then((res) => {
                if (res.data) {
                    setWishlistCount(res.data.length || 0);
                }
            }).catch(() => {});
        });
    };

    useEffect(() => {
        Promise.resolve().then(() => setUser(getUser()));

        async function loadCart() {
            // Only query cart if authenticated token exists to prevent 401 response loop
            import("@/lib/auth").then(({ getToken }) => {
                if (!getToken()) return;
                
                api.get("/cart").then((res) => {
                    if (res.data) {
                        const cartItems = Array.isArray(res.data) ? res.data : res.data.items || [];
                        setCount(cartItems.length || 0);
                        localStorage.setItem('tivaa-cart-items', JSON.stringify(cartItems));
                        window.dispatchEvent(new Event('cart-items-loaded'));
                    }
                }).catch(() => {});
            });
        }
        loadCart();
        loadWishlist();

        async function loadCategories() {
            try {
                const res = await api.get("/categories");
                setCategories(res.data);
            } catch (err) { }
        }
        loadCategories();

        const handleScroll = () => setScrolled(window.scrollY > 20);
        const handleCartUpdate = () => loadCart();
        const handleWishlistUpdate = () => loadWishlist();

        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchResults([]);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('cart-updated', handleCartUpdate);
        window.addEventListener('wishlist-updated', handleWishlistUpdate);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('cart-updated', handleCartUpdate);
            window.removeEventListener('wishlist-updated', handleWishlistUpdate);
            document.removeEventListener('mousedown', handleClickOutside);
            if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
            if (categoriesTimeoutRef.current) clearTimeout(categoriesTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => {
            setMobileMenuOpen(false);
            setDropdownOpen(false);
            setSearchOpen(false);
            setSearchResults([]);
            setSearchQuery("");
        });
    }, [pathname]);

    // Live search effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                setIsSearching(true);
                try {
                    const res = await api.get(`/products/search?q=${encodeURIComponent(searchQuery)}`);
                    const data = res.data;
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
        localStorage.removeItem('tivaa-cart-items');
        window.location.href = "/login";
    };

    if (pathname?.startsWith("/admin")) return null;

    return (
        <header 
            className="navbar" 
            style={{ 
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                background: "var(--bg-glass)", 
                borderBottom: "1px solid var(--border)",
                boxShadow: scrolled ? "var(--shadow-sm)" : "none",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                transition: "all 0.3s ease",
                zIndex: 1000
            }}
        >
            {/* Announcement Top Bar */}
            <div 
                style={{ 
                    background: "var(--accent)", 
                    color: "#ffffff", 
                    height: "36px", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "0 24px", 
                    fontSize: "0.78rem", 
                    fontWeight: 500,
                    fontFamily: "var(--font-poppins)"
                }}
            >
                <div>Free Shipping on orders above ₹499</div>
                <div style={{ display: "flex", gap: "16px" }}>
                    <Link href="/faq" style={{ color: "#ffffff", textDecoration: "none" }}>Help Center</Link>
                    <Link href="/orders" style={{ color: "#ffffff", textDecoration: "none" }}>Track Order</Link>
                </div>
            </div>

            {/* Header Main Bar */}
            <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "var(--nav-height, 72px)", padding: "0 24px" }}>

                {/* LEFT: Hamburger Menu Toggle & Brand Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}
                        aria-label="Open menu"
                    >
                        <Menu size={24} />
                    </button>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                        <img 
                            src="/logo.png" 
                            alt="Tivaa Elegance" 
                            style={{ 
                                height: '42px', 
                                width: 'auto', 
                                objectFit: 'contain',
                                mixBlendMode: 'multiply'
                            }} 
                        />
                    </Link>
                </div>

                {/* CENTER: Persistent Search Bar (Desktop Only) */}
                <div className="desktop-only" style={{ flex: 1, maxWidth: "500px", margin: "0 32px" }}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (searchQuery.trim()) {
                                router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
                                setSearchOpen(false);
                                setSearchResults([]);
                            }
                        }}
                        style={{ display: "flex", alignItems: "center", position: "relative" }}
                    >
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products, categories..."
                            className="input-field"
                            style={{ 
                                width: "100%", 
                                padding: "10px 16px 10px 44px", 
                                borderRadius: "var(--radius-input, 12px)", 
                                border: "1px solid var(--border)", 
                                height: '48px',
                                fontSize: '0.9rem'
                            }}
                        />
                        <Search size={18} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
                        {isSearching && <span className="search-loader"></span>}

                        {/* Live Search dropdown overlay */}
                        {searchResults.length > 0 && (
                            <div className="card" style={{ position: 'absolute', top: '54px', left: 0, width: '100%', padding: '8px', zIndex: 1200, background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-card, 18px)', boxShadow: 'var(--shadow-md)' }}>
                                {searchResults.map(item => (
                                    <Link 
                                        key={item.id} 
                                        href={`/product/${item.id}`} 
                                        onClick={() => { setSearchResults([]); setSearchQuery(""); }} 
                                        className="dropdown-item" 
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px' }}
                                    >
                                        <img src={item.image_url ? item.image_url.split(",")[0].trim() : "/placeholder.png"} style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px' }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{item.price}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </form>
                </div>

                {/* RIGHT: Utility Icons (Wishlist, Orders, Profile) */}
                <div style={{ display: "flex", gap: "24px", alignItems: "center", justifyContent: "flex-end" }}>
                    
                    {/* Search Icon (Mobile Only) */}
                    <button
                        onClick={() => setSearchOpen(!searchOpen)}
                        className="mobile-only"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)', padding: '6px' }}
                        aria-label="Search Toggle"
                    >
                        {searchOpen ? <X size={22} /> : <Search size={22} />}
                    </button>

                    {/* Wishlist Link */}
                    <Link 
                        href="/wishlist" 
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textDecoration: 'none', color: 'var(--text-main)' }}
                    >
                        <div style={{ position: 'relative', display: 'inline-flex' }}>
                            <Heart size={22} />
                            {wishlistCount > 0 && (
                                <span className="nav-badge">
                                    {wishlistCount}
                                </span>
                            )}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 500, fontFamily: 'var(--font-poppins)', color: 'var(--text-muted)' }}>Wishlist</span>
                    </Link>

                    {/* Orders (Cart Shopping Bag) */}
                    <Link 
                        href="/cart" 
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textDecoration: 'none', color: 'var(--text-main)' }}
                    >
                        <div style={{ position: 'relative', display: 'inline-flex' }}>
                            <Package size={22} />
                            {count > 0 && (
                                <span className="nav-badge">
                                    {count}
                                </span>
                            )}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 500, fontFamily: 'var(--font-poppins)', color: 'var(--text-muted)' }}>Orders</span>
                    </Link>

                    {/* Profile Dropdown / Login */}
                    <div style={{ position: 'relative' }}>
                        {user ? (
                            <div
                                onMouseEnter={handleProfileMouseEnter}
                                onMouseLeave={handleProfileMouseLeave}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
                            >
                                <div style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    borderRadius: '50%', 
                                    background: 'var(--text-main)', 
                                    color: '#ffffff', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    fontWeight: 700, 
                                    fontSize: '0.65rem'
                                }}>
                                    {getInitials(user.name)}
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 500, fontFamily: 'var(--font-poppins)', color: 'var(--text-muted)' }}>Profile</span>

                                {profileOpen && (
                                    <div style={{ position: 'absolute', top: '38px', right: 0, width: '220px', zIndex: 1100 }}>
                                        <div className="card animate-slide-down" style={{ padding: '8px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-card, 18px)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                                            </div>
                                            <Link href="/orders" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '6px' }}>
                                                My Orders
                                            </Link>
                                            <Link href="/wishlist" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '6px' }}>
                                                My Wishlist
                                            </Link>
                                            {user.role === 'admin' && (
                                                <Link href="/admin" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent)', borderRadius: '6px' }}>
                                                    Admin Panel
                                                </Link>
                                            )}
                                            <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}></div>
                                            <button 
                                                onClick={handleLogout} 
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#ff4d4d', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link 
                                href="/login" 
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textDecoration: 'none', color: 'var(--text-main)' }}
                            >
                                <User size={22} />
                                <span style={{ fontSize: '11px', fontWeight: 500, fontFamily: 'var(--font-poppins)', color: 'var(--text-muted)' }}>Profile</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Slide Down Search Panel (Mobile Only) */}
            {searchOpen && (
                <div 
                    ref={searchRef} 
                    className="mobile-only"
                    style={{ 
                        background: '#ffffff', 
                        borderBottom: '1px solid var(--border)',
                        padding: '16px 24px',
                        animation: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                        position: 'relative',
                        zIndex: 999
                    }}
                >
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (searchQuery.trim()) {
                                    router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
                                    setSearchOpen(false);
                                    setSearchQuery("");
                                    setSearchResults([]);
                                }
                            }}
                            style={{ display: "flex", alignItems: "center", position: "relative" }}
                        >
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="input-field"
                                autoFocus
                                style={{ 
                                    width: "100%", 
                                    padding: "12px 16px 12px 44px", 
                                    borderRadius: "var(--radius-input, 12px)", 
                                    border: "1px solid var(--border)", 
                                    height: '46px',
                                    fontSize: '0.95rem'
                                }}
                            />
                            <Search size={20} style={{ position: 'absolute', left: '16px', color: 'var(--accent)' }} />
                            {isSearching && <span className="search-loader"></span>}
                        </form>

                        {/* Live Search dropdown overlay */}
                        {searchResults.length > 0 && (
                            <div className="card" style={{ position: 'absolute', top: '52px', left: 0, width: '100%', padding: '8px', zIndex: 1200, background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-card, 18px)', boxShadow: 'var(--shadow-md)' }}>
                                {searchResults.map(item => (
                                    <Link 
                                        key={item.id} 
                                        href={`/product/${item.id}`} 
                                        onClick={() => { setSearchResults([]); setSearchOpen(false); setSearchQuery(""); }} 
                                        className="dropdown-item" 
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px' }}
                                    >
                                        <img src={item.image_url ? item.image_url.split(",")[0].trim() : "/placeholder.png"} style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px' }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{item.price}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Mobile Sidebar Navigation Drawer */}
            {mobileMenuOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex' }}>
                    {/* Drawer Backdrop */}
                    <div
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    
                    {/* Drawer Content */}
                    <div className="animate-slide-right" style={{ position: 'relative', width: '300px', height: '100dvh', minHeight: '100vh', background: '#ffffff', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', zIndex: 2001, boxShadow: '4px 0 24px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img src="/logo.png" style={{ height: '54px', objectFit: 'contain' }} alt="Tivaa Logo" />
                                <span style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1.1rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Tivaa Elegance</span>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer', color: 'var(--text-main)' }}><X size={24} /></button>
                        </div>

                        {/* Search in Drawer */}
                        <form onSubmit={(e) => { e.preventDefault(); router.push(`/products?q=${encodeURIComponent(searchQuery)}`); setMobileMenuOpen(false); setSearchQuery(""); }}>
                            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="input-field" style={{ width: '100%', borderRadius: 'var(--radius-input, 12px)', borderColor: 'var(--border)', height: '38px', padding: '8px 12px', fontSize: '0.85rem' }} />
                        </form>

                        {/* Navigation links inside Mobile Drawer */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
                            <Link href="/" className="btn" style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--text-main)', borderBottom: '1px solid #f5f5f5', borderRadius: 0, padding: '12px 8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }} onClick={() => setMobileMenuOpen(false)}>Home</Link>
                            <Link href="/products" className="btn" style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--text-main)', borderBottom: '1px solid #f5f5f5', borderRadius: 0, padding: '12px 8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }} onClick={() => setMobileMenuOpen(false)}>All Products</Link>
                            
                            {(() => {
                                const parents = categories.filter(c => !c.parent_id);
                                const subs = categories.filter(c => c.parent_id);

                                return parents.map(parent => {
                                    const children = subs.filter(child => Number(child.parent_id) === Number(parent.id));
                                    
                                    return (
                                        <div key={parent.id} style={{ display: 'flex', flexDirection: 'column' }}>
                                            <Link 
                                                href={`/products?category=${encodeURIComponent(parent.name)}`} 
                                                className="btn" 
                                                style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--text-main)', borderBottom: '1px solid #f5f5f5', borderRadius: 0, padding: '10px 8px', fontSize: '0.88rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }} 
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {parent.name}
                                            </Link>
                                            
                                            {children.map(child => (
                                                <Link 
                                                    key={child.id} 
                                                    href={`/products?category=${encodeURIComponent(child.name)}`} 
                                                    className="btn" 
                                                    style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--text-muted)', borderBottom: '1px solid #fafafa', borderRadius: 0, padding: '6px 12px 6px 24px', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }} 
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    ↳ {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .nav-badge {
                    position: absolute;
                    top: -6px;
                    right: -8px;
                    background: var(--text-main);
                    color: #ffffff;
                    min-width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    font-size: 10px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2px;
                }
                .search-loader { 
                    position: absolute; 
                    right: 16px; 
                    width: 16px; 
                    height: 16px; 
                    border: 2px solid #1a1a1a; 
                    border-bottom-color: transparent; 
                    border-radius: 50%; 
                    animation: spin 0.8s linear infinite; 
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
                .animate-slide-right {
                    animation: slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-down {
                    animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                .dropdown-item {
                    transition: all 0.2s ease;
                }
                .dropdown-item:hover {
                    background: #f8f8f8 !important;
                    color: #1a1a1a !important;
                }

                @media (min-width: 900px) {
                    .mobile-only { display: none !important; }
                }
                @media (max-width: 899px) {
                    .desktop-only { display: none !important; }
                }
            `}</style>
        </header>
    );
}
