"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Backpack, Gem, Flame, Sparkles, ArrowRight, ChevronRight, ChevronLeft, ShoppingBag, Home, Truck, ShieldCheck, Award, Headphones } from "lucide-react";
import api from "@/lib/api";
import Heading from "@/components/Heading";
import Button from "@/components/Button";
import CategoryTitle from "@/components/CategoryTitle";

function CategoriesContent() {
    const [categories, setCategories] = useState([]);
    const [selectedParent, setSelectedParent] = useState(null);
    const [loading, setLoading] = useState(true);
    const carouselRef = useRef(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        api.get("/categories")
            .then(res => {
                if (res.data) {
                    setCategories(res.data);
                    
                    // Group and find parents
                    const parents = res.data.filter(c => !c.parent_id);
                    if (parents.length > 0) {
                        // Check if parent name is passed in URL query
                        const queryParent = searchParams.get("parent");
                        const initialParent = parents.find(p => 
                            p.name.toLowerCase() === queryParent?.toLowerCase() ||
                            Number(p.id) === Number(queryParent) ||
                            (queryParent && (
                                p.name.toLowerCase().includes(queryParent.toLowerCase()) ||
                                queryParent.toLowerCase().includes(p.name.toLowerCase())
                            ))
                        ) || parents[0];
                        setSelectedParent(initialParent);
                    }
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load categories:", err);
                setLoading(false);
            });
    }, [searchParams]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="search-loader" style={{ width: '40px', height: '40px', borderWidth: '3px', borderStyle: 'solid', borderColor: 'var(--text-main)', borderBottomColor: 'transparent', borderRadius: '50%' }}></div>
            </div>
        );
    }

    const parents = categories.filter(c => !c.parent_id);
    const subCategories = categories.filter(c => Number(c.parent_id) === Number(selectedParent?.id));

    const getCategoryIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes("school") || n.includes("supplies")) return <Backpack size={20} />;
        if (n.includes("jewel") || n.includes("gem")) return <Gem size={20} />;
        if (n.includes("pooja") || n.includes("flame") || n.includes("item")) return <Flame size={20} />;
        return <Sparkles size={20} />;
    };

    const getParentFallbackImage = (name) => {
        const n = name.toLowerCase();
        if (n.includes("school") || n.includes("supplies")) return "/school_supplies_bg.jpg";
        if (n.includes("jewel")) return "/jewellery_bg.jpg";
        return "/placeholder.png";
    };

    const handleParentSelect = (parent) => {
        setSelectedParent(parent);
        router.push(`/categories?parent=${encodeURIComponent(parent.name)}`, { scroll: false });
    };

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = 300;
            carouselRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };

    return (
        <main className="categories-page-container" style={{ padding: '12px 0', minHeight: '80vh', background: '#fcfdfe' }}>
            
            {/* Inner Wrapper */}
            <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
                

                {/* Section Title */}
                <Heading as="h2" variant="h2" style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px', fontFamily: 'var(--font-poppins)', letterSpacing: '0.5px' }}>
                    Shop by Category
                </Heading>

                {/* Categories Carousel Section */}
                <div style={{ position: 'relative', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                    {parents.length > 2 && (
                        <Button 
                            variant="ghost"
                            onClick={() => scrollCarousel("left")}
                            style={{ position: 'absolute', left: '-16px', zIndex: 10, background: '#ffffff', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', padding: 0 }}
                            className="carousel-nav-btn"
                        >
                            <ChevronLeft size={20} />
                        </Button>
                    )}

                    <div 
                        ref={carouselRef}
                        style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '4px 0', scrollbarWidth: 'none', msOverflowStyle: 'none', width: '100%' }}
                        className="hide-scrollbar"
                    >
                        {parents.map(parent => {
                            const isSelected = selectedParent?.id === parent.id;
                            const bgImage = parent.image_url || getParentFallbackImage(parent.name);
                            
                            return (
                                <div
                                    key={parent.id}
                                    onClick={() => handleParentSelect(parent)}
                                    style={{
                                        flexShrink: 0,
                                        width: '180px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    className="category-carousel-item"
                                >
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '110px',
                                            borderRadius: '16px',
                                            backgroundImage: `url(${bgImage})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            border: isSelected ? '2.5px solid #0d9488' : '1.5px solid var(--border)',
                                            boxShadow: isSelected ? '0 6px 12px rgba(13, 148, 136, 0.15)' : 'var(--shadow-sm)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        className={`category-carousel-card ${isSelected ? 'active' : ''}`}
                                    />
                                    <div style={{
                                        textAlign: 'center',
                                        marginTop: '8px',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        color: isSelected ? '#0d9488' : 'var(--text-main)',
                                        fontFamily: 'var(--font-poppins)',
                                        transition: 'all 0.3s ease'
                                    }} className="category-carousel-label">
                                        {parent.name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {parents.length > 2 && (
                        <Button 
                            variant="ghost"
                            onClick={() => scrollCarousel("right")}
                            style={{ position: 'absolute', right: '-16px', zIndex: 10, background: '#ffffff', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', padding: 0 }}
                            className="carousel-nav-btn"
                        >
                            <ChevronRight size={20} />
                        </Button>
                    )}
                </div>

                {/* Subcategories Heading Divider */}
                {selectedParent && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '16px 0 20px',
                        position: 'relative'
                    }}>
                        <div style={{ position: 'absolute', left: 0, right: 0, height: '1px', background: '#e2e8f0', zIndex: 1 }} />
                        <div style={{
                            position: 'relative',
                            zIndex: 2,
                            background: '#fcfdfe',
                            padding: '0 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: '#0d9488',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            fontFamily: 'var(--font-poppins)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488' }}>
                                {getCategoryIcon(selectedParent.name)}
                            </div>
                            Shop by {selectedParent.name}
                        </div>
                    </div>
                )}

                {/* Subcategories Grid */}
                {subCategories.length > 0 ? (
                    <div className="subcategory-grid">
                        {subCategories.map(sub => (
                            <Link 
                                key={sub.id} 
                                href={`/products?category=${encodeURIComponent(sub.name)}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="subcategory-card">
                                    <div className="subcategory-img-wrapper">
                                        <img 
                                            src={sub.image_url || "/placeholder.png"} 
                                            alt={sub.name} 
                                            className="subcategory-img"
                                        />
                                    </div>
                                    <div className="subcategory-info">
                                        <CategoryTitle className="subcategory-title">{sub.name}</CategoryTitle>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>No subcategories found for {selectedParent?.name}.</p>
                    </div>
                )}

                {/* Custom Request Banner */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f0fdfa',
                    border: '1px solid #ccfbf1',
                    borderRadius: '20px',
                    padding: '20px 24px',
                    marginTop: '32px',
                    gap: '16px'
                }} className="request-banner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: '#ccfbf1',
                            color: '#0d9488',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <ShoppingBag size={22} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <Heading as="h4" variant="h3" style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-poppins)' }}>
                                Can’t find what you’re looking for?
                            </Heading>
                            <p style={{ margin: '2px 0 0 0', color: '#0d9488', fontSize: '0.85rem', fontWeight: 500, fontFamily: 'var(--font-poppins)' }}>
                                Let us know, we’ll get it for you!
                            </p>
                        </div>
                    </div>
                    <Link href="/contact" style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#0d9488',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        boxShadow: '0 4px 10px rgba(13, 148, 136, 0.25)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0
                    }} className="request-arrow-btn">
                        <ArrowRight size={20} />
                    </Link>
                </div>

                {/* Features Row Section */}
                <div style={{ marginTop: '20px', marginBottom: '0px' }}>
                    <div className="features-info-container">
                        {/* Item 1 */}
                        <div className="feature-info-item">
                            <div className="feature-info-icon">
                                <Truck size={36} />
                            </div>
                            <div className="feature-info-content">
                                <Heading as="h4" variant="h3" className="feature-info-title">Fast Delivery</Heading>
                                <p className="feature-info-desc">Quick & reliable delivery at your doorstep</p>
                            </div>
                        </div>
                        {/* Divider */}
                        <div className="feature-info-divider"></div>
                        
                        {/* Item 2 */}
                        <div className="feature-info-item">
                            <div className="feature-info-icon">
                                <ShieldCheck size={36} />
                            </div>
                            <div className="feature-info-content">
                                <Heading as="h4" variant="h3" className="feature-info-title">Secure Payment</Heading>
                                <p className="feature-info-desc">100% secure transactions with trusted gateways</p>
                            </div>
                        </div>
                        {/* Divider */}
                        <div className="feature-info-divider"></div>

                        {/* Item 3 */}
                        <div className="feature-info-item">
                            <div className="feature-info-icon">
                                <Award size={36} />
                            </div>
                            <div className="feature-info-content">
                                <Heading as="h4" variant="h3" className="feature-info-title">Premium Quality</Heading>
                                <p className="feature-info-desc">Carefully chosen products you can trust</p>
                            </div>
                        </div>
                        {/* Divider */}
                        <div className="feature-info-divider"></div>

                        {/* Item 4 */}
                        <div className="feature-info-item">
                            <div className="feature-info-icon">
                                <Headphones size={36} />
                            </div>
                            <div className="feature-info-content">
                                <Heading as="h4" variant="h3" className="feature-info-title">Customer Support</Heading>
                                <p className="feature-info-desc">We're here to help you every step of the way</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Custom Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                .features-info-container {
                    background: #ffffff;
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    box-shadow: var(--shadow-sm);
                }
                .feature-info-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex: 1;
                }
                .feature-info-icon {
                    color: #0d9488;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .feature-info-content {
                    text-align: left;
                }
                .feature-info-title {
                    margin: 0;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: var(--text-main);
                    font-family: var(--font-poppins);
                }
                .feature-info-desc {
                    margin: 2px 0 0 0;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-family: var(--font-poppins);
                    line-height: 1.3;
                }
                .feature-info-divider {
                    width: 1px;
                    height: 48px;
                    background: rgba(0,0,0,0.06);
                    align-self: center;
                }
                @media (max-width: 991px) {
                    .features-info-container {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 24px;
                        padding: 24px;
                    }
                    .feature-info-divider {
                        display: none;
                    }
                }
                @media (max-width: 576px) {
                    .features-info-container {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                }

                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                .subcategory-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 20px;
                }
                
                .subcategory-card {
                    background: #ffffff;
                    border: 1px solid var(--border);
                    border-radius: 18px;
                    overflow: hidden;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.02);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .subcategory-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.06);
                    border-color: rgba(13, 148, 136, 0.2);
                }
                
                .subcategory-img-wrapper {
                    position: relative;
                    width: 100%;
                    padding-bottom: 100%; /* 1:1 Aspect Ratio */
                    overflow: hidden;
                    background: #f8fafc;
                }
                .subcategory-img {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                .subcategory-card:hover .subcategory-img {
                    transform: scale(1.08);
                }
                
                .subcategory-info {
                    padding: 7px 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-grow: 1;
                }
                
                .subcategory-title {
                    text-align: center;
                    line-height: 1.3;
                }
                

                
                .request-arrow-btn:hover {
                    transform: scale(1.08);
                }

                 @media (max-width: 1024px) {
                    .subcategory-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                    .category-carousel-item {
                        width: 150px !important;
                    }
                    .category-carousel-card {
                        height: 90px !important;
                    }
                }
                @media (max-width: 768px) {
                    .subcategory-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px;
                    }
                    .category-carousel-item {
                        width: 120px !important;
                    }
                    .category-carousel-card {
                        height: 75px !important;
                    }
                    .category-carousel-label {
                        font-size: 0.75rem !important;
                        margin-top: 6px !important;
                    }
                    .request-banner {
                        flex-direction: row !important;
                        padding: 16px !important;
                    }
                }
            `}} />

        </main>
    );
}

export default function CategoriesPage() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="search-loader" style={{ width: '40px', height: '40px', borderWidth: '3px', borderStyle: 'solid', borderColor: 'var(--text-main)', borderBottomColor: 'transparent', borderRadius: '50%' }}></div>
            </div>
        }>
            <CategoriesContent />
        </Suspense>
    );
}
