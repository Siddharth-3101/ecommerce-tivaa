import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import HomeCategoryGrid from "@/components/HomeCategoryGrid";


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
            <section style={{ width: '100%', padding: '0 24px 20px' }}>
                <div className="promo-banners-grid">
                    {/* Banner 1: School Supplies */}
                    <Link href="/products?category=School Supplies" style={{ textDecoration: 'none' }}>
                        <div className="promo-banner-card" style={{ background: '#E5F1FC', borderRadius: '18px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '220px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border)' }}>
                            <div style={{ flex: 1, zIndex: 2, paddingRight: '12px' }}>
                                <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#173B63', margin: '0 0 4px 0', fontFamily: 'var(--font-poppins)' }}>School Supplies</h3>
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
                        <div className="promo-banner-card" style={{ background: '#EEF8F7', borderRadius: '18px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '220px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border)' }}>
                            <div style={{ flex: 1, zIndex: 2, paddingRight: '12px' }}>
                                <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#173B63', margin: '0 0 4px 0', fontFamily: 'var(--font-poppins)' }}>Fashion & Jewellery</h3>
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
                    <section key={cat.id} style={{ width: '100%', padding: '20px 24px' }}>
                        {/* Section Header with Left Heading and Right View All Link */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 className="section-heading-homepage">
                                {cat.name}
                            </h2>
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
                    <section style={{ width: '100%', padding: '20px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 className="section-heading-homepage">
                                New Arrivals
                            </h2>
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
            <section style={{ width: '100%', padding: '20px 24px 50px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '24px', fontFamily: 'var(--font-poppins)' }}>
                    View by Category
                </h2>

                {parents.map(parent => {
                    const subcategories = categories.filter(c => c.parent_id === parent.id);
                    if (subcategories.length === 0) return null;

                    return (
                        <div key={parent.id} style={{ marginBottom: '32px' }}>
                            {/* Sub Heading with Left Title and Right View All Link */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-poppins)' }}>
                                    {parent.name}
                                </h3>
                                <Link 
                                    href={`/products?category=${encodeURIComponent(parent.name)}`} 
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
                                            <div style={{ textAlign: 'center', marginTop: '8px' }}>
                                                <span 
                                                    style={{ 
                                                        fontSize: '0.85rem', 
                                                        fontWeight: 600, 
                                                        color: 'var(--text-main)', 
                                                        fontFamily: 'var(--font-poppins)',
                                                        textTransform: 'capitalize' 
                                                    }}
                                                >
                                                    {sub.name}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </section>
        </div>
    );
}
