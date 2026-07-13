import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import HomeCategoryGrid from "@/components/HomeCategoryGrid";
import Heading from "@/components/Heading";
import CategoryTitle from "@/components/CategoryTitle";
import { ShoppingBag, ArrowRight, Truck, ShieldCheck, Award, Headphones } from "lucide-react";


export const revalidate = 10;

async function fetchLandingData() {
    const backendUrl = process.env.BACKEND_API_URL || "http://api.tivaa.in";
    
    try {
        const [prodRes, catRes] = await Promise.all([
            fetch(`${backendUrl}/api/products?limit=1000`, { cache: 'no-store' }),
            fetch(`${backendUrl}/api/categories`, { cache: 'no-store' })
        ]);

        let products = [];
        let categories = [];

        if (prodRes.ok) {
            const data = await prodRes.json();
            products = Array.isArray(data) ? data : (data.products || []);
        }

        if (catRes.ok) {
            categories = await catRes.json();
        }

        return { 
            products: products, 
            categories 
        };
    } catch (err) {
        console.error("Error fetching landing data concurrently:", err);
        return { products: [], categories: [] };
    }
}

export default async function Home() {
    const { products, categories } = await fetchLandingData();

    const getCategoryAndChildrenIds = (parentId, categoriesList) => {
        const ids = [parentId];
        const children = categoriesList.filter(c => c.parent_id === parentId);
        children.forEach(child => {
            ids.push(...getCategoryAndChildrenIds(child.id, categoriesList));
        });
        return ids;
    };

    const getProductsForParent = (parentId, categoriesList, productsList) => {
        const allowedIds = getCategoryAndChildrenIds(parentId, categoriesList);
        return productsList.filter(p => allowedIds.includes(p.category_id));
    };

    // Filter categories to show based on "Show in Home Page" flag, fallback to parent categories if empty
    const homepageCategories = categories.filter(c => c.show_in_homepage === 1 || c.show_in_homepage === true);
    const displayCategories = homepageCategories.length > 0 
        ? homepageCategories 
        : categories.filter(c => !c.parent_id);

    const parents = categories.filter(c => !c.parent_id);

    return (
        <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
            
            {/* Redesigned Wide Hero Banner */}
            <Hero />

            {/* Two Promo Banners */}
            <section style={{ width: '100%', padding: '0 24px 10px' }}>
                <div className="promo-banners-grid">
                    {/* Banner 1: School Supplies */}
                    <Link href="/products?category=School%20Supplies" style={{ textDecoration: 'none' }}>
                        <div className="promo-banner-card" style={{ background: '#E5F1FC', borderRadius: '18px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '198px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border)' }}>
                            <div style={{ flex: 1, zIndex: 2, paddingRight: '12px' }}>
                                <Heading as="h2" variant="HomeHeader2" style={{ fontWeight: 700, color: '#173B63', margin: '0 0 4px 0', fontFamily: 'var(--font-poppins)' }}>School Supplies</Heading>
                                <p style={{ fontSize: '0.88rem', color: '#5a6e85', margin: '0 0 20px 0', fontFamily: 'var(--font-poppins)', lineHeight: '1.4' }}>Everything kids need for school</p>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F9D94', fontFamily: 'var(--font-poppins)' }}>Shop Now</span>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                        <span style={{ color: '#0F9D94', fontWeight: 'bold', fontSize: '0.95rem' }}>→</span>
                                    </div>
                                </div>
                            </div>
                            <div className="promo-banner-img-container" style={{ width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <img 
                                    src="/school_supplies_bg.jpg" 
                                    alt="School Supplies" 
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px' }} 
                                
                                />
                            </div>
                        </div>
                    </Link>

                    {/* Banner 2: Fashion & Jewellery */}
                    <Link href="/products?category=Jewellery" style={{ textDecoration: 'none' }}>
                        <div className="promo-banner-card" style={{ background: '#EEF8F7', borderRadius: '18px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '198px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border)' }}>
                            <div style={{ flex: 1, zIndex: 2, paddingRight: '12px' }}>
                                <Heading as="h2" variant="HomeHeader2" style={{ fontWeight: 700, color: '#173B63', margin: '0 0 4px 0', fontFamily: 'var(--font-poppins)' }}>Fashion & Jewellery</Heading>
                                <p style={{ fontSize: '0.88rem', color: '#5a6e85', margin: '0 0 20px 0', fontFamily: 'var(--font-poppins)', lineHeight: '1.4' }}>Elevate your everyday style</p>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F9D94', fontFamily: 'var(--font-poppins)' }}>Shop Now</span>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                        <span style={{ color: '#0F9D94', fontWeight: 'bold', fontSize: '0.95rem' }}>→</span>
                                    </div>
                                </div>
                            </div>
                            <div className="promo-banner-img-container" style={{ width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <img 
                                    src="/jewellery_bg.jpg" 
                                    alt="Fashion & Jewellery" 
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px' }} 
                                />
                            </div>
                        </div>
                    </Link>
                </div>
            </section>

            {/* DYNAMIC CATEGORY SECTIONS */}
            {displayCategories.map(cat => {
                const catProducts = getProductsForParent(cat.id, categories, products);
                if (catProducts.length === 0) return null;

                return (
                    <section key={cat.id} style={{ width: '100%', padding: '10px 24px' }}>
                        {/* Section Header with Left Heading and Right View All Link */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <Heading as="h2" variant="HomeHeader2">
                                {cat.name}
                            </Heading>
                            <Link 
                                href={`/products?category=${encodeURIComponent(cat.name)}`} 
                                className="category-view-all"
                            >
                                View All <span>&gt;</span>
                            </Link>
                        </div>

                        {/* Horizontal Single-Row Product List */}
                        <div className="product-row-single-line">
                            {catProducts.map((p) => (
                                <div key={p.id} className="product-row-item">
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })}

            {/* New Arrivals Section */}
            {(() => {
                const newArrivals = [...products].sort((a, b) => b.id - a.id).slice(0, 10);
                if (newArrivals.length === 0) return null;

                return (
                    <section style={{ width: '100%', padding: '10px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <Heading as="h2" variant="HomeHeader2">
                                New Arrivals
                            </Heading>
                            <Link href="/products" className="category-view-all">
                                View All <span>&gt;</span>
                            </Link>
                        </div>
                        <div className="product-row-single-line">
                            {newArrivals.map((p) => (
                                <div key={p.id} className="product-row-item">
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })()}

            {/* View by Category Section */}
            <section style={{ width: '100%', padding: '10px 24px 20px' }}>
                <Heading as="h1" variant="HomeHeader1" style={{ marginBottom: '12px' }}>
                    View by Category
                </Heading>

                {parents.map(parent => {
                    const subcategories = categories.filter(c => c.parent_id === parent.id);
                    if (subcategories.length === 0) return null;

                    return (
                        <div key={parent.id} style={{ marginBottom: '16px' }}>
                            {/* Sub Heading with Left Title and Right View All Link */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <Heading as="h2" variant="HomeHeader2">
                                    {parent.name}
                                </Heading>
                                <Link 
                                    href={`/categories?parent=${encodeURIComponent(parent.name)}`} 
                                    className="category-view-all"
                                >
                                    View All <span>&gt;</span>
                                </Link>
                            </div>

                            {/* Subcategories Horizontal Scroll Row */}
                            <div className="product-row-single-line" style={{ gap: '20px' }}>
                                {subcategories.map(sub => {
                                    // Resolves subcategory image dynamically
                                    const getSubcategoryImage = (subcategory) => {
                                        if (subcategory.image_url && subcategory.image_url.trim()) {
                                            return subcategory.image_url.trim();
                                        }
                                        const fallbacks = {
                                            'hairbows': 'https://res.cloudinary.com/dft1i2ozo/image/upload/v1779700729/tivaa-products/dstpoqprasvcizdlox8n.jpg',
                                            'meenakaari bangles': 'https://res.cloudinary.com/dft1i2ozo/image/upload/v1779700873/tivaa-products/dr1hiyiwgdfhphf4f8cz.jpg',
                                            'general': '/placeholder.png'
                                        };
                                        const catNameLower = subcategory.name.trim().toLowerCase();
                                        const matchedProd = products.find(p => p.category_id === subcategory.id && p.image_url);
                                        if (matchedProd && matchedProd.image_url) {
                                            return matchedProd.image_url.split(",")[0].trim();
                                        }
                                        return fallbacks[catNameLower] || fallbacks['general'];
                                    };

                                    return (
                                        <Link 
                                            key={sub.id} 
                                            href={`/products?category=${encodeURIComponent(sub.name)}`} 
                                            className="category-card-container"
                                        >
                                            <div className="category-card-img-wrapper">
                                                <img 
                                                    src={getSubcategoryImage(sub)} 
                                                    alt={sub.name} 
                                                    className="category-card-img"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div style={{ textAlign: 'center', marginTop: '4px' }}>
                                                <CategoryTitle>
                                                    {sub.name}
                                                </CategoryTitle>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Bulk Order Banner */}
            <section style={{ width: '100%', padding: '0 24px 10px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f0fdfa',
                    border: '1px solid #ccfbf1',
                    borderRadius: '20px',
                    padding: '20px 24px',
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
                                Want to order in bulk?
                            </Heading>
                            <p style={{ margin: '2px 0 0 0', color: '#0d9488', fontSize: '0.85rem', fontWeight: 500, fontFamily: 'var(--font-poppins)' }}>
                                Let us know, we will get the best deal for you!
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
            </section>

            {/* Features Row Section */}
            <section style={{ width: '100%', padding: '0 24px 0' }}>
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
            </section>

            <style dangerouslySetInnerHTML={{ __html: `
                .request-arrow-btn:hover {
                    transform: scale(1.08);
                }
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
            `}} />
        </div>
    );
}
